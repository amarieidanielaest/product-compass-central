import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Menu, Search, Filter, Plus, ChevronUp, MessageSquare, Calendar, Flag } from 'lucide-react';
import { EnhancedFeedbackItem } from '@/services/api/BoardService';
import { formatDistanceToNow } from 'date-fns';

interface MobileResponsiveProps {
  feedback: EnhancedFeedbackItem[];
  onFeedbackClick: (feedback: EnhancedFeedbackItem) => void;
  onVote: (feedbackId: string, voteType: 'upvote' | 'downvote') => void;
  onCreateFeedback: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  categories: string[];
}

export const MobileResponsive: React.FC<MobileResponsiveProps> = ({
  feedback,
  onFeedbackClick,
  onVote,
  onCreateFeedback,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'default';
      case 'planned': return 'secondary';
      case 'under_review': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'New';
      case 'under_review': return 'Review';
      case 'planned': return 'Planned';
      case 'in_progress': return 'Progress';
      case 'completed': return 'Done';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 h-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Filter feedback by status and category
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="submitted">New</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      onStatusFilterChange('all');
                      onCategoryFilterChange('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Button size="sm" onClick={onCreateFeedback} className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Feedback List */}
      <div className="p-4 space-y-3">
        {feedback.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-600 text-center mb-4">
                Be the first to share your feedback!
              </p>
              <Button onClick={onCreateFeedback}>
                Submit First Feedback
              </Button>
            </CardContent>
          </Card>
        ) : (
          feedback.map((item) => (
            <MobileFeedbackCard
              key={item.id}
              feedback={item}
              onFeedbackClick={onFeedbackClick}
              onVote={onVote}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface MobileFeedbackCardProps {
  feedback: EnhancedFeedbackItem;
  onFeedbackClick: (feedback: EnhancedFeedbackItem) => void;
  onVote: (feedbackId: string, voteType: 'upvote' | 'downvote') => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

const MobileFeedbackCard: React.FC<MobileFeedbackCardProps> = ({
  feedback,
  onFeedbackClick,
  onVote,
  getPriorityColor,
  getStatusColor,
  getStatusLabel
}) => {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-12 w-12 p-1 border"
            onClick={(e) => {
              e.stopPropagation();
              onVote(feedback.id, 'upvote');
            }}
          >
            <ChevronUp className="h-4 w-4" />
            <span className="text-xs font-medium">{feedback.votes_count}</span>
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 
                className="font-medium text-sm line-clamp-2 cursor-pointer"
                onClick={() => onFeedbackClick(feedback)}
              >
                {feedback.title}
              </h3>
            </div>
            
            {feedback.description && (
              <p 
                className="text-xs text-muted-foreground line-clamp-3 mb-3 cursor-pointer"
                onClick={() => onFeedbackClick(feedback)}
              >
                {feedback.description}
              </p>
            )}
            
            <div className="flex items-center gap-1 flex-wrap mb-3">
              <Badge variant={getStatusColor(feedback.status)} className="text-xs">
                {getStatusLabel(feedback.status)}
              </Badge>
              
              <Badge variant={getPriorityColor(feedback.priority)} className="text-xs">
                <Flag className="h-2 w-2 mr-1" />
                {feedback.priority}
              </Badge>

              {feedback.category && (
                <Badge variant="outline" className="text-xs">
                  {feedback.category}
                </Badge>
              )}
            </div>

            {feedback.tags && feedback.tags.length > 0 && (
              <div className="flex items-center gap-1 mb-3 flex-wrap">
                {feedback.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {feedback.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{feedback.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{feedback.comments_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};