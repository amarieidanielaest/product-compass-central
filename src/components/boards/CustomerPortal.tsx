import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { boardService, CustomerBoard, EnhancedFeedbackItem } from '@/services/api';
import { ArrowUp, MessageCircle, Calendar, CheckCircle2, Clock, AlertCircle, Plus, Search, Filter } from 'lucide-react';
import { FeedbackDetailDialog } from './FeedbackDetailDialog';
import { RoadmapView } from './RoadmapView';
import { ChangelogView } from './ChangelogView';

export const CustomerPortal = () => {
  const { organization, boardSlug } = useParams();
  const { toast } = useToast();
  
  const [board, setBoard] = useState<CustomerBoard | null>(null);
  const [feedback, setFeedback] = useState<EnhancedFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<EnhancedFeedbackItem | null>(null);
  const [isFeedbackDetailOpen, setIsFeedbackDetailOpen] = useState(false);

  // Form state for new feedback
  const [newFeedback, setNewFeedback] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });

  useEffect(() => {
    loadBoardData();
  }, [organization, boardSlug]);

  const loadBoardData = async () => {
    try {
      setLoading(true);
      
      // Load board by slug
      const boardsResponse = await boardService.getBoards({ slug: boardSlug });
      if (boardsResponse.success && boardsResponse.data && boardsResponse.data.length > 0) {
        const boardData = boardsResponse.data[0];
        setBoard(boardData);
        
        // Load feedback for this board
        const feedbackResponse = await boardService.getBoardFeedback(boardData.id);
        if (feedbackResponse.success && feedbackResponse.data) {
          setFeedback(feedbackResponse.data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading board data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load board data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!board || !newFeedback.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in the required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await boardService.createFeedback(board.id, {
        ...newFeedback,
        status: 'submitted',
        votes_count: 0,
        comments_count: 0,
        impact_score: 0,
        effort_estimate: 0,
        tags: [],
        customer_info: {}
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Your feedback has been submitted!',
        });
        setIsSubmitDialogOpen(false);
        setNewFeedback({ title: '', description: '', category: '', priority: 'medium' });
        loadBoardData(); // Refresh the feedback list
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    }
  };

  const handleVote = async (feedbackId: string, voteType: 'upvote' | 'downvote' = 'upvote') => {
    try {
      const response = await boardService.voteFeedback(feedbackId, voteType);
      if (response.success) {
        // Update the feedback item locally
        setFeedback(prev => prev.map(item => 
          item.id === feedbackId 
            ? { ...item, votes_count: item.votes_count + (voteType === 'upvote' ? 1 : -1) }
            : item
        ));
        toast({
          title: 'Success',
          description: 'Vote recorded!',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record vote',
        variant: 'destructive',
      });
    }
  };

  const handleFeedbackClick = (feedback: EnhancedFeedbackItem) => {
    setSelectedFeedback(feedback);
    setIsFeedbackDetailOpen(true);
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

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Board Not Found</h1>
        <p className="text-gray-600 mt-2">The requested board could not be found.</p>
      </div>
    );
  }

  const categories = [...new Set(feedback.map(item => item.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
              {board.description && (
                <p className="text-gray-600 mt-2">{board.description}</p>
              )}
            </div>
            
            <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Submit Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Submit New Feedback</DialogTitle>
                  <DialogDescription>
                    Share your ideas, feature requests, or report issues.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      value={newFeedback.title}
                      onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                      placeholder="Brief description of your feedback"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newFeedback.description}
                      onChange={(e) => setNewFeedback({ ...newFeedback, description: e.target.value })}
                      placeholder="Provide more details about your feedback"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={newFeedback.category}
                      onChange={(e) => setNewFeedback({ ...newFeedback, category: e.target.value })}
                      placeholder="e.g., Feature Request, Bug Report"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select 
                      value={newFeedback.priority} 
                      onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                        setNewFeedback({ ...newFeedback, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6">
        <Tabs defaultValue="feedback" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="changelog">Changelog</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category!}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Feedback List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredFeedback.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
                    <p className="text-gray-600 text-center mb-4">
                      {feedback.length === 0 
                        ? "Be the first to share your feedback!"
                        : "Try adjusting your filters or search term."
                      }
                    </p>
                    {feedback.length === 0 && (
                      <Button onClick={() => setIsSubmitDialogOpen(true)}>
                        Submit First Feedback
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredFeedback.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6" onClick={() => handleFeedbackClick(item)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(item.status)}
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                          )}
                          {item.category && (
                            <Badge variant="outline" className="mb-3">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(item.id);
                            }}
                            className="flex items-center gap-1"
                          >
                            <ArrowUp className="h-4 w-4" />
                            {item.votes_count}
                          </Button>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MessageCircle className="h-4 w-4" />
                            {item.comments_count}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="roadmap">
            <RoadmapView boardId={board.id} />
          </TabsContent>

          <TabsContent value="changelog">
            <ChangelogView boardId={board.id} />
          </TabsContent>
        </Tabs>
        
        <RealtimeUpdates 
          boardId={board.id} 
          onFeedbackUpdate={loadBoardData}
        />
      </div>

      {/* Feedback Detail Dialog */}
      <FeedbackDetailDialog
        feedback={selectedFeedback}
        open={isFeedbackDetailOpen}
        onClose={() => {
          setIsFeedbackDetailOpen(false);
          setSelectedFeedback(null);
        }}
        onVote={handleVote}
      />
    </div>
  );
};