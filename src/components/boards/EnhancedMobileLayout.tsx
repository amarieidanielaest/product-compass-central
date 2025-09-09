import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Menu, 
  Search, 
  Filter, 
  Plus, 
  ChevronUp, 
  MessageSquare, 
  Calendar, 
  Flag,
  Settings,
  Bell,
  User,
  ArrowUp,
  Eye,
  TrendingUp,
  RefreshCw,
  Share
} from 'lucide-react';

import { EnhancedFeedbackItem } from '@/services/api/BoardService';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';
import { LoadingGrid } from './LoadingStates';

type BadgeVariant = "destructive" | "default" | "secondary" | "outline" | "loom-coral" | "loom-accent" | "loom-amber" | "loom-indigo";

interface EnhancedMobileLayoutProps {
  feedback: EnhancedFeedbackItem[];
  loading: boolean;
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
  boardName?: string;
  onRefresh?: () => void;
  onShare?: () => void;
}

const EnhancedMobileLayout: React.FC<EnhancedMobileLayoutProps> = ({
  feedback,
  loading,
  onFeedbackClick,
  onVote,
  onCreateFeedback,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  boardName = "Feedback Board",
  onRefresh,
  onShare
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');
  const { unreadCount } = useNotifications();

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const getPriorityColor = (priority: string): BadgeVariant => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'loom-coral';
      case 'medium': return 'loom-amber';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string): BadgeVariant => {
    switch (status) {
      case 'completed': return 'loom-accent';
      case 'in_progress': return 'loom-amber';
      case 'planned': return 'secondary';
      case 'under_review': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'New';
      case 'under_review': return 'Review';
      case 'planned': return 'Planned';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Done';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const sortedFeedback = [...feedback].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.votes_count || 0) - (a.votes_count || 0);
      case 'trending':
        // Simple trending algorithm: recent feedback with votes
        const aTrending = (a.votes_count || 0) + (Date.now() - new Date(a.created_at).getTime() < 7 * 24 * 60 * 60 * 1000 ? 10 : 0);
        const bTrending = (b.votes_count || 0) + (Date.now() - new Date(b.created_at).getTime() < 7 * 24 * 60 * 60 * 1000 ? 10 : 0);
        return bTrending - aTrending;
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (loading) {
    return <LoadingGrid count={6} component="feedback" />;
  }

  return (
    <div className="lg:hidden min-h-screen bg-gray-50">
      {/* Enhanced Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Menu className="h-5 w-5 text-gray-600" />
              <h1 className="text-lg font-semibold text-gray-900 truncate">{boardName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="h-8 w-8 p-0"
              >
                <Share className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Bell className="h-4 w-4" />
                </Button>
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          {/* Filter Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-3 w-3 mr-1" />
                    Filters
                    {(statusFilter !== 'all' || categoryFilter !== 'all') && (
                      <Badge className="ml-1 h-4 w-4 p-0 text-xs">!</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Filter Feedback</SheetTitle>
                    <SheetDescription>
                      Refine your feedback view with filters
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-6 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sort By</label>
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="trending">Trending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <Button 
                      variant="outline" 
                      onClick={() => {
                        onStatusFilterChange('all');
                        onCategoryFilterChange('all');
                        setSortBy('newest');
                      }}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Button variant="outline" size="sm" className="h-8">
                <TrendingUp className="h-3 w-3 mr-1" />
                {sortBy === 'newest' ? 'Newest' : sortBy === 'popular' ? 'Popular' : 'Trending'}
              </Button>
            </div>

            <Button 
              onClick={onCreateFeedback}
              size="sm" 
              className="h-8 px-3"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Feedback List */}
      <div className="p-4 space-y-3">
        {sortedFeedback.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <MessageSquare className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-sm text-gray-500 mb-4">
                Be the first to submit feedback for this board
              </p>
              <Button onClick={onCreateFeedback} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedFeedback.map((item) => (
            <EnhancedMobileFeedbackCard
              key={item.id}
              feedback={item}
              onClick={() => onFeedbackClick(item)}
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

interface EnhancedMobileFeedbackCardProps {
  feedback: EnhancedFeedbackItem;
  onClick: () => void;
  onVote: (feedbackId: string, voteType: 'upvote' | 'downvote') => void;
  getPriorityColor: (priority: string) => BadgeVariant;
  getStatusColor: (status: string) => BadgeVariant;
  getStatusLabel: (status: string) => string;
}

const EnhancedMobileFeedbackCard: React.FC<EnhancedMobileFeedbackCardProps> = ({
  feedback,
  onClick,
  onVote,
  getPriorityColor,
  getStatusColor,
  getStatusLabel
}) => {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (e: React.MouseEvent, voteType: 'upvote' | 'downvote') => {
    e.stopPropagation();
    setIsVoting(true);
    try {
      await onVote(feedback.id, voteType);
    } finally {
      setTimeout(() => setIsVoting(false), 500);
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-all duration-200" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
              {feedback.title}
            </h3>
            {feedback.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {feedback.description}
              </p>
            )}
          </div>
          
          <div className="ml-3 flex flex-col items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleVote(e, 'upvote')}
              disabled={isVoting}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className={`h-4 w-4 ${isVoting ? 'animate-pulse' : ''}`} />
            </Button>
            <span className="text-sm font-medium text-gray-700">
              {feedback.votes_count || 0}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-wrap mb-3">
          <Badge variant={getStatusColor(feedback.status) as BadgeVariant} className="text-xs">
            {getStatusLabel(feedback.status)}
          </Badge>
          
          {feedback.priority && (
            <Badge variant={getPriorityColor(feedback.priority) as BadgeVariant} className="text-xs">
              <Flag className="h-2 w-2 mr-1" />
              {feedback.priority}
            </Badge>
          )}

          {feedback.category && (
            <Badge variant="outline" className="text-xs">
              {feedback.category}
            </Badge>
          )}
        </div>

        {feedback.tags && feedback.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {feedback.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {feedback.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{feedback.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {feedback.comments_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {Math.floor(Math.random() * 100)} {/* Mock view count */}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedMobileLayout;