import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { boardService, EnhancedFeedbackItem, FeedbackComment } from '@/services/api';
import { ArrowUp, MessageCircle, Calendar, CheckCircle2, Clock, AlertCircle, Send, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeedbackDetailDialogProps {
  feedback: EnhancedFeedbackItem | null;
  open: boolean;
  onClose: () => void;
  onVote?: (feedbackId: string, voteType: 'upvote' | 'downvote') => void;
}

export const FeedbackDetailDialog = ({ feedback, open, onClose, onVote }: FeedbackDetailDialogProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (feedback && open) {
      loadComments();
    }
  }, [feedback, open]);

  const loadComments = async () => {
    if (!feedback) return;
    
    try {
      setLoadingComments(true);
      const response = await boardService.getFeedbackComments(feedback.id);
      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!feedback || !newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const response = await boardService.createComment(feedback.id, newComment.trim());

      if (response.success) {
        setNewComment('');
        loadComments(); // Reload comments
        toast({
          title: 'Success',
          description: 'Comment added successfully',
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleVote = async () => {
    if (!feedback || !onVote) return;
    onVote(feedback.id, 'upvote');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'planned':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'under_review':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-orange-100 text-orange-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!feedback) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold mb-2">{feedback.title}</DialogTitle>
              <div className="flex items-center gap-2 mb-3">
                {getStatusIcon(feedback.status)}
                <Badge className={getStatusColor(feedback.status)}>
                  {feedback.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(feedback.priority)}>
                  {feedback.priority}
                </Badge>
                {feedback.category && (
                  <Badge variant="outline">{feedback.category}</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVote}
                className="flex items-center gap-1"
              >
                <ArrowUp className="h-4 w-4" />
                {feedback.votes_count}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Feedback Description */}
          {feedback.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feedback.description}</p>
            </div>
          )}

          {/* Tags */}
          {feedback.tags && feedback.tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {feedback.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Customer Info */}
          {feedback.customer_info && Object.keys(feedback.customer_info).length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Customer Information</h3>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                {Object.entries(feedback.customer_info).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-gray-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Comments ({comments.length})</h3>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {loadingComments ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm text-gray-600">
                        {comment.author_id || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <p className="text-sm text-gray-800">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};