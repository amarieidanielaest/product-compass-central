import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  ChevronUp, 
  MessageSquare, 
  Calendar, 
  User, 
  Flag,
  Target,
  Clock,
  Send,
  Reply,
  MoreHorizontal,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedFeedbackItem, FeedbackComment, boardService } from '@/services/api/BoardService';
import { useToast } from '@/hooks/use-toast';

interface FeedbackDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: EnhancedFeedbackItem;
  currentUserVote?: 'upvote' | 'downvote' | null;
  onVote: (feedbackId: string, voteType: 'upvote' | 'downvote') => void;
  onRemoveVote: (feedbackId: string) => void;
  onStatusChange?: (feedbackId: string, status: string) => void;
}

export function FeedbackDetailDialog({
  open,
  onOpenChange,
  feedback,
  currentUserVote,
  onVote,
  onRemoveVote,
  onStatusChange,
}: FeedbackDetailDialogProps) {
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && feedback.id) {
      loadComments();
    }
  }, [open, feedback.id]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const result = await boardService.getFeedbackComments(feedback.id);
      if (result.success) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const result = await boardService.createComment(
        feedback.id, 
        newComment, 
        replyTo || undefined
      );
      if (result.success) {
        setNewComment('');
        setReplyTo(null);
        await loadComments();
        toast({
          title: "Comment added",
          description: "Your comment has been posted",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await boardService.deleteComment(commentId);
      await loadComments();
      toast({
        title: "Comment deleted",
        description: "The comment has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'default';
      case 'planned':
        return 'secondary';
      case 'under_review':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'New';
      case 'under_review':
        return 'Under Review';
      case 'planned':
        return 'Planned';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getCommentLevel = (comment: FeedbackComment, allComments: FeedbackComment[]): number => {
    if (!comment.parent_id) return 0;
    const parent = allComments.find(c => c.id === comment.parent_id);
    return parent ? getCommentLevel(parent, allComments) + 1 : 0;
  };

  const threaded = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);

  const getCommentReplies = (commentId: string): FeedbackComment[] => {
    return replies.filter(r => r.parent_id === commentId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl line-clamp-2 pr-4">
                {feedback.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant={getStatusColor(feedback.status)}>
                  {getStatusLabel(feedback.status)}
                </Badge>
                <Badge variant={getPriorityColor(feedback.priority)}>
                  <Flag className="h-3 w-3 mr-1" />
                  {feedback.priority}
                </Badge>
                {feedback.category && (
                  <Badge variant="outline">{feedback.category}</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={currentUserVote === 'upvote' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (currentUserVote === 'upvote') {
                    onRemoveVote(feedback.id);
                  } else {
                    onVote(feedback.id, 'upvote');
                  }
                }}
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                {feedback.votes_count}
              </Button>
              
              {onStatusChange && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onStatusChange(feedback.id, 'under_review')}>
                      Mark as Under Review
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(feedback.id, 'planned')}>
                      Mark as Planned
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(feedback.id, 'in_progress')}>
                      Mark as In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(feedback.id, 'completed')}>
                      Mark as Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Feedback Description */}
          {feedback.description && (
            <div className="px-1">
              <p className="text-muted-foreground">{feedback.description}</p>
              
              {/* Metadata */}
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{feedback.comments_count} comments</span>
                </div>
                {feedback.impact_score > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>Impact: {feedback.impact_score}</span>
                  </div>
                )}
                {feedback.effort_estimate > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Effort: {feedback.effort_estimate}</span>
                  </div>
                )}
              </div>
              
              {/* Tags */}
              {feedback.tags && feedback.tags.length > 0 && (
                <div className="flex items-center gap-1 mt-3 flex-wrap">
                  {feedback.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Comments Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="font-medium mb-3">Comments ({comments.length})</h3>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  threaded.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      {/* Main Comment */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.author_id.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              User {comment.author_id.slice(0, 8)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyTo(comment.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Reply className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Replies */}
                      {getCommentReplies(comment.id).map((reply) => (
                        <div key={reply.id} className="ml-11 flex items-start gap-3">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {reply.author_id.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-xs">
                                User {reply.author_id.slice(0, 8)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Comment Input */}
            <div className="mt-4 space-y-3">
              {replyTo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Reply className="h-4 w-4" />
                  <span>Replying to comment</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(null)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}