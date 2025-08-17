import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeUpdatesProps {
  boardId: string;
  onFeedbackUpdate?: () => void;
  onMemberUpdate?: () => void;
}

export const RealtimeUpdates: React.FC<RealtimeUpdatesProps> = ({
  boardId,
  onFeedbackUpdate,
  onMemberUpdate
}) => {
  const { toast } = useToast();

  useEffect(() => {
    // Real-time updates for feedback items
    const feedbackChannel = supabase
      .channel('feedback-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback_items',
          filter: `board_id=eq.${boardId}`
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              toast({
                title: "New Feedback",
                description: "A new feedback item was submitted",
              });
              break;
            case 'UPDATE':
              if (payload.new.status !== payload.old?.status) {
                toast({
                  title: "Feedback Updated",
                  description: `Feedback status changed to ${payload.new.status}`,
                });
              }
              break;
          }
          onFeedbackUpdate?.();
        }
      )
      .subscribe();

    // Real-time updates for board memberships
    const membersChannel = supabase
      .channel('members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'board_memberships',
          filter: `board_id=eq.${boardId}`
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              toast({
                title: "New Member",
                description: "A new member joined the board",
              });
              break;
            case 'DELETE':
              toast({
                title: "Member Removed",
                description: "A member was removed from the board",
              });
              break;
          }
          onMemberUpdate?.();
        }
      )
      .subscribe();

    // Real-time updates for comments
    const commentsChannel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback_comments'
        },
        (payload) => {
          toast({
            title: "New Comment",
            description: "Someone commented on a feedback item",
          });
          onFeedbackUpdate?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [boardId, onFeedbackUpdate, onMemberUpdate, toast]);

  return null; // This component doesn't render anything
};