import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WorkItem, Sprint } from '@/services/api/SprintService';

interface RealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: any;
  old?: any;
  table: string;
}

interface RealtimeCollaborationProps {
  sprintId: string;
  onWorkItemUpdate: (workItem: WorkItem) => void;
  onWorkItemCreate: (workItem: WorkItem) => void;
  onWorkItemDelete: (workItemId: string) => void;
  onSprintUpdate: (sprint: Sprint) => void;
  onUserJoined: (userId: string, userInfo: any) => void;
  onUserLeft: (userId: string) => void;
  onUserCursorMove: (userId: string, position: { x: number; y: number; elementId?: string }) => void;
  children: React.ReactNode;
}

interface CollaborationUser {
  id: string;
  name: string;
  avatar_url?: string;
  cursor_position?: { x: number; y: number; elementId?: string };
  last_seen: Date;
}

const RealtimeCollaboration: React.FC<RealtimeCollaborationProps> = ({
  sprintId,
  onWorkItemUpdate,
  onWorkItemCreate,
  onWorkItemDelete,
  onSprintUpdate,
  onUserJoined,
  onUserLeft,
  onUserCursorMove,
  children
}) => {
  const { toast } = useToast();
  const [connectedUsers, setConnectedUsers] = useState<Map<string, CollaborationUser>>(new Map());
  const channelRef = useRef<any>(null);
  const heartbeatRef = useRef<NodeJS.Timeout>();
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!sprintId) return;

    // Create a channel for this sprint
    const channel = supabase.channel(`sprint_${sprintId}`, {
      config: {
        presence: {
          key: sprintId,
        },
      },
    });

    channelRef.current = channel;

    // Subscribe to database changes
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_items',
          filter: `sprint_id=eq.${sprintId}`,
        },
        (payload) => {
          console.log('Work item change:', payload);
          handleWorkItemChange(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sprints',
          filter: `id=eq.${sprintId}`,
        },
        (payload) => {
          console.log('Sprint change:', payload);
          if (payload.new) {
            onSprintUpdate(payload.new as Sprint);
            showChangeNotification('Sprint updated');
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        console.log('Syncing presence state');
        const newState = channel.presenceState();
        handlePresenceSync(newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        handleUserJoin(newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        handleUserLeave(leftPresences);
      })
      .on('broadcast', { event: 'cursor_move' }, (payload) => {
        handleCursorMove(payload);
      })
      .on('broadcast', { event: 'item_focus' }, (payload) => {
        handleItemFocus(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to sprint channel');
          await trackPresence();
          startHeartbeat();
        }
      });

    // Track mouse movements for cursor sharing
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }

      mouseMoveTimeoutRef.current = setTimeout(() => {
        const elementId = (e.target as Element)?.closest('[data-work-item-id]')?.getAttribute('data-work-item-id');
        
        channel.send({
          type: 'broadcast',
          event: 'cursor_move',
          payload: {
            x: e.clientX,
            y: e.clientY,
            elementId,
            timestamp: Date.now(),
          },
        });
      }, 50); // Throttle cursor updates
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
      channel.unsubscribe();
    };
  }, [sprintId]);

  const trackPresence = async () => {
    if (!channelRef.current) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile for additional info
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', user.id)
        .single();

      await channelRef.current.track({
        user_id: user.id,
        name: profile ? `${profile.first_name} ${profile.last_name}` : user.email?.split('@')[0] || 'Anonymous',
        avatar_url: profile?.avatar_url,
        online_at: new Date().toISOString(),
        sprint_id: sprintId,
      });
    } catch (error) {
      console.error('Error tracking presence:', error);
    }
  };

  const startHeartbeat = () => {
    heartbeatRef.current = setInterval(() => {
      if (channelRef.current) {
        trackPresence(); // Update presence every 30 seconds
      }
    }, 30000);
  };

  const handleWorkItemChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        if (newRecord) {
          onWorkItemCreate(newRecord as WorkItem);
          showChangeNotification(`New work item created: ${newRecord.title}`);
        }
        break;
      case 'UPDATE':
        if (newRecord) {
          onWorkItemUpdate(newRecord as WorkItem);
          showChangeNotification(`Work item updated: ${newRecord.title}`);
        }
        break;
      case 'DELETE':
        if (oldRecord) {
          onWorkItemDelete(oldRecord.id);
          showChangeNotification(`Work item deleted: ${oldRecord.title}`);
        }
        break;
    }
  };

  const handlePresenceSync = (state: Record<string, any[]>) => {
    const users = new Map<string, CollaborationUser>();
    
    Object.values(state).flat().forEach((presence: any) => {
      if (presence.user_id) {
        users.set(presence.user_id, {
          id: presence.user_id,
          name: presence.name,
          avatar_url: presence.avatar_url,
          last_seen: new Date(presence.online_at),
        });
      }
    });

    setConnectedUsers(users);
  };

  const handleUserJoin = (newPresences: any[]) => {
    newPresences.forEach((presence) => {
      if (presence.user_id) {
        const userInfo = {
          id: presence.user_id,
          name: presence.name,
          avatar_url: presence.avatar_url,
        };
        onUserJoined(presence.user_id, userInfo);
        
        // Don't show notification for current user
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user && presence.user_id !== user.id) {
            toast({
              title: "User joined",
              description: `${presence.name} joined the sprint`,
              duration: 3000,
            });
          }
        });
      }
    });
  };

  const handleUserLeave = (leftPresences: any[]) => {
    leftPresences.forEach((presence) => {
      if (presence.user_id) {
        onUserLeft(presence.user_id);
        toast({
          title: "User left",
          description: `${presence.name} left the sprint`,
          duration: 3000,
        });
      }
    });
  };

  const handleCursorMove = (payload: any) => {
    const { x, y, elementId, user_id } = payload.payload;
    if (user_id) {
      onUserCursorMove(user_id, { x, y, elementId });
      
      // Update connected users with cursor position
      setConnectedUsers(prev => {
        const updated = new Map(prev);
        const user = updated.get(user_id);
        if (user) {
          updated.set(user_id, {
            ...user,
            cursor_position: { x, y, elementId },
          });
        }
        return updated;
      });
    }
  };

  const handleItemFocus = (payload: any) => {
    const { item_id, user_id, action } = payload.payload;
    // Handle item focus events (e.g., show who's editing what)
    console.log(`User ${user_id} ${action} item ${item_id}`);
  };

  const showChangeNotification = (message: string) => {
    // Only show notifications for changes made by other users
    supabase.auth.getUser().then(({ data: { user } }) => {
      toast({
        title: "Live Update",
        description: message,
        duration: 4000,
      });
    });
  };

  // Broadcast that user is focusing on a specific item
  const broadcastItemFocus = (itemId: string, action: 'focus' | 'blur') => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'item_focus',
        payload: {
          item_id: itemId,
          action,
          timestamp: Date.now(),
        },
      });
    }
  };

  // Render children with collaboration context
  return (
    <div className="relative">
      {children}
      
      {/* Live Cursors */}
      {Array.from(connectedUsers.values()).map((user) => {
        if (!user.cursor_position) return null;
        
        return (
          <div
            key={`cursor-${user.id}`}
            className="fixed pointer-events-none z-50 transition-all duration-100"
            style={{
              left: user.cursor_position.x,
              top: user.cursor_position.y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg" />
              <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {user.name}
              </div>
            </div>
          </div>
        );
      })}

      {/* Connected Users Indicator */}
      {connectedUsers.size > 1 && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-background border rounded-lg shadow-lg p-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">
                {connectedUsers.size} user{connectedUsers.size !== 1 ? 's' : ''} online
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeCollaboration;