import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  ChevronUp, 
  MessageSquare, 
  Calendar, 
  User, 
  MoreHorizontal,
  Flag,
  Target,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EnhancedFeedbackItem } from '@/services/api/BoardService';

interface FeedbackCardProps {
  feedback: EnhancedFeedbackItem;
  currentUserVote?: 'upvote' | 'downvote' | null;
  onVote: (feedbackId: string, voteType: 'upvote' | 'downvote') => void;
  onRemoveVote: (feedbackId: string) => void;
  onViewDetails: (feedback: EnhancedFeedbackItem) => void;
  onEdit?: (feedback: EnhancedFeedbackItem) => void;
  onDelete?: (feedbackId: string) => void;
  onStatusChange?: (feedbackId: string, status: string) => void;
}

export function FeedbackCard({
  feedback,
  currentUserVote,
  onVote,
  onRemoveVote,
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
}: FeedbackCardProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      if (currentUserVote === voteType) {
        await onRemoveVote(feedback.id);
      } else {
        await onVote(feedback.id, voteType);
      }
    } finally {
      setIsVoting(false);
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

  return (
    <Card className="group hover:shadow-md transition-shadow">{/* Removed cursor-pointer since it's now on specific elements */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-medium line-clamp-2 text-foreground group-hover:text-primary cursor-pointer"
              onClick={() => onViewDetails(feedback)}
            >
              {feedback.title}
            </h3>
            {feedback.description && (
              <p 
                className="text-sm text-muted-foreground mt-1 line-clamp-2 cursor-pointer"
                onClick={() => onViewDetails(feedback)}
              >
                {feedback.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-3">
            <Button
              variant={currentUserVote === 'upvote' ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center gap-1 h-8"
              onClick={(e) => {
                e.stopPropagation();
                handleVote('upvote');
              }}
              disabled={isVoting}
            >
              <ChevronUp className="h-4 w-4" />
              <span className="text-xs">{feedback.votes_count}</span>
            </Button>

            {(onEdit || onDelete || onStatusChange) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onStatusChange && (
                    <>
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
                    </>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(feedback)}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(feedback.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">{/* Removed onClick since we moved it to specific elements */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getStatusColor(feedback.status)}>
              {getStatusLabel(feedback.status)}
            </Badge>
            
            <Badge variant={getPriorityColor(feedback.priority)}>
              <Flag className="h-3 w-3 mr-1" />
              {feedback.priority}
            </Badge>

            {feedback.category && (
              <Badge variant="outline">
                {feedback.category}
              </Badge>
            )}

            {feedback.impact_score > 0 && (
              <Badge variant="secondary">
                <Target className="h-3 w-3 mr-1" />
                Impact: {feedback.impact_score}
              </Badge>
            )}

            {feedback.effort_estimate > 0 && (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Effort: {feedback.effort_estimate}
              </Badge>
            )}
          </div>
        </div>

        {feedback.tags && feedback.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {feedback.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {feedback.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{feedback.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{feedback.comments_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</span>
            </div>
          </div>
          
          {feedback.submitted_by && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Submitted by user</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}