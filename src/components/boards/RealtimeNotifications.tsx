import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Check, MessageSquare, Users, Star, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface RealtimeNotification {
  id: string;
  type: 'feedback_created' | 'feedback_updated' | 'feedback_voted' | 'feedback_commented' | 'member_added' | 'status_changed';
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

interface RealtimeNotificationsProps {
  boardId: string;
  userId?: string;
}

export const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({ 
  boardId, 
  userId 
}) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!boardId) return;

    // Subscribe to real-time notifications
    const channel = supabase
      .channel(`board-notifications-${boardId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback_items',
          filter: `board_id=eq.${boardId}`
        },
        (payload) => {
          const newNotification: RealtimeNotification = {
            id: `feedback-${payload.new.id}`,
            type: 'feedback_created',
            title: 'New Feedback Submitted',
            message: `"${payload.new.title}" has been submitted`,
            data: payload.new,
            read: false,
            created_at: new Date().toISOString(),
            priority: 'medium'
          };
          
          addNotification(newNotification);
          showToastNotification(newNotification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'feedback_items',
          filter: `board_id=eq.${boardId}`
        },
        (payload) => {
          // Check if status changed
          if (payload.old.status !== payload.new.status) {
            const newNotification: RealtimeNotification = {
              id: `status-${payload.new.id}-${Date.now()}`,
              type: 'status_changed',
              title: 'Feedback Status Updated',
              message: `"${payload.new.title}" moved to ${payload.new.status.replace('_', ' ')}`,
              data: payload.new,
              read: false,
              created_at: new Date().toISOString(),
              priority: 'medium'
            };
            
            addNotification(newNotification);
            showToastNotification(newNotification);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback_votes',
          filter: `feedback_id=in.(${getFilterString()})`
        },
        (payload) => {
          const newNotification: RealtimeNotification = {
            id: `vote-${payload.new.id}`,
            type: 'feedback_voted',
            title: 'New Vote Received',
            message: `Someone ${payload.new.vote_type}d your feedback`,
            data: payload.new,
            read: false,
            created_at: new Date().toISOString(),
            priority: 'low'
          };
          
          addNotification(newNotification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback_comments'
        },
        (payload) => {
          const newNotification: RealtimeNotification = {
            id: `comment-${payload.new.id}`,
            type: 'feedback_commented',
            title: 'New Comment Added',
            message: `Someone commented on a feedback item`,
            data: payload.new,
            read: false,
            created_at: new Date().toISOString(),
            priority: 'medium'
          };
          
          addNotification(newNotification);
        }
      )
      .subscribe();

    // Load existing notifications
    loadNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId]);

  const getFilterString = () => {
    // This would need to be populated with actual feedback IDs from the board
    // For now, return empty string which won't match anything
    return '';
  };

  const loadNotifications = async () => {
    try {
      // Mock notifications for demo
      const mockNotifications: RealtimeNotification[] = [
        {
          id: '1',
          type: 'feedback_created',
          title: 'New Feedback Submitted',
          message: '"Dark Mode Support" has been submitted',
          data: {},
          read: false,
          created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          priority: 'medium'
        },
        {
          id: '2',
          type: 'status_changed',
          title: 'Feedback Status Updated',
          message: '"Mobile App Performance" moved to in progress',
          data: {},
          read: false,
          created_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          priority: 'high'
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const addNotification = (notification: RealtimeNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20
    setUnreadCount(prev => prev + 1);
  };

  const showToastNotification = (notification: RealtimeNotification) => {
    const priority = notification.priority;
    const variant = priority === 'high' ? 'destructive' : 'default';
    
    toast({
      title: notification.title,
      description: notification.message,
      variant,
      duration: priority === 'high' ? 8000 : 5000
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'feedback_created':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'feedback_voted':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'feedback_commented':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'status_changed':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'member_added':
        return <Users className="h-4 w-4 text-indigo-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="shadow-lg border">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      <Check className="h-4 w-4 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium line-clamp-1">
                                {notification.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNotification(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t p-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setNotifications([]);
                    setUnreadCount(0);
                  }}
                >
                  Clear all notifications
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};