import { useState } from 'react';
import { Plus, Filter, Search, MessageSquare, Star, Clock, User, TrendingUp, Brain, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CreateTicketDialog from './CreateTicketDialog';
import TicketDetail from './TicketDetail';
import AIInsightsPanel from './AIInsightsPanel';
import SmartFeedbackProcessor from './SmartFeedbackProcessor';
import { useServiceCall, useAsyncServiceCall } from '@/hooks/useServiceIntegration';
import { feedbackService, aiService } from '@/services/api';
import type { FeedbackItem, FeedbackFilters } from '@/services/api/FeedbackService';

interface Ticket {
  id: string;
  title: string;
  description: string;
  customer: string;
  customerId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'planned' | 'resolved' | 'closed';
  category: 'feature' | 'bug' | 'improvement' | 'integration';
  created: string;
  votes: number;
  comments: number;
  views: number;
  linkedSprint?: string;
  tags: string[];
  submittedBy: string;
  estimatedEffort?: string;
  businessValue?: 'low' | 'medium' | 'high';
}

interface CustomerBoardProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

const CustomerBoard = ({ selectedProductId, onNavigate }: CustomerBoardProps) => {
  const [activeView, setActiveView] = useState('board');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIProcessor, setShowAIProcessor] = useState(false);
  const [rawFeedbackText, setRawFeedbackText] = useState('');

  // Integrate Feedback Service
  const feedbackFilters: FeedbackFilters = {
    ...(filterStatus !== 'all' && { status: [filterStatus] }),
    ...(filterPriority !== 'all' && { priority: [filterPriority] }),
  };

  const { data: feedbackData, loading: feedbackLoading, error: feedbackError, refetch } = useServiceCall(
    () => feedbackService.getFeedback(feedbackFilters, { page: 1, limit: 20 }),
    [filterStatus, filterPriority]
  );

  const { data: feedbackInsights, loading: insightsLoading } = useServiceCall(
    () => feedbackService.getFeedbackInsights(),
    []
  );

  // AI Service Integration
  const { data: aiInsights } = useServiceCall(
    () => aiService.getInsights('feedback', { 
      filters: feedbackFilters, 
      productId: selectedProductId 
    }),
    [feedbackFilters, selectedProductId]
  );

  const { execute: processWithAI, loading: aiProcessing } = useAsyncServiceCall<FeedbackItem>();

  // Mock boards data for the CreateTicketDialog
  const mockBoards = [
    {
      id: 'board-1',
      name: 'Public Feature Requests',
      type: 'public' as const
    },
    {
      id: 'board-2',
      name: 'Enterprise Feedback',
      type: 'enterprise' as const,
      customerId: 'ent-001'
    },
    {
      id: 'board-3',
      name: 'Internal Product Board',
      type: 'enterprise' as const,
      customerId: 'internal'
    }
  ];

  const mockTickets: Ticket[] = [
    {
      id: 'FB-001',
      title: 'Export feature limited to 1000 rows',
      description: 'Our team regularly processes datasets with 10K+ rows. The current export limitation is blocking our monthly reporting workflow. This is critical for our operations.',
      customer: 'TechCorp Solutions',
      customerId: 'tc-001',
      priority: 'critical',
      status: 'open',
      category: 'feature',
      created: '2024-06-14',
      votes: 23,
      comments: 8,
      views: 156,
      tags: ['export', 'data', 'enterprise'],
      submittedBy: 'Sarah Tech',
      estimatedEffort: '2-3 sprints',
      businessValue: 'high',
      linkedSprint: 'Sprint 24'
    },
    {
      id: 'FB-002',
      title: 'Mobile app crashes on startup',
      description: 'The mobile app is consistently crashing on startup for our iOS users. This is preventing them from accessing critical features and impacting their overall experience.',
      customer: 'MobileFirst Innovations',
      customerId: 'mf-002',
      priority: 'high',
      status: 'in-progress',
      category: 'bug',
      created: '2024-06-12',
      votes: 15,
      comments: 5,
      views: 92,
      tags: ['mobile', 'ios', 'crash'],
      submittedBy: 'John Mobile',
      estimatedEffort: '1 sprint',
      businessValue: 'high'
    },
    {
      id: 'FB-003',
      title: 'Dark mode toggle missing',
      description: 'Many users have requested a dark mode option for the dashboard. This would improve usability in low-light environments and reduce eye strain.',
      customer: 'Visionary Designs',
      customerId: 'vd-003',
      priority: 'medium',
      status: 'planned',
      category: 'feature',
      created: '2024-06-10',
      votes: 8,
      comments: 3,
      views: 67,
      tags: ['dark mode', 'ux', 'accessibility'],
      submittedBy: 'Alice UX',
      estimatedEffort: '0.5 sprint',
      businessValue: 'medium'
    },
    {
      id: 'FB-004',
      title: 'Integrate with Slack for notifications',
      description: 'Users want to receive real-time notifications in Slack for important events, such as new feedback submissions and status updates.',
      customer: 'CommTech Solutions',
      customerId: 'ct-004',
      priority: 'medium',
      status: 'planned',
      category: 'integration',
      created: '2024-06-08',
      votes: 5,
      comments: 2,
      views: 41,
      tags: ['slack', 'integration', 'notifications'],
      submittedBy: 'Bob Integrations',
      estimatedEffort: '1 sprint',
      businessValue: 'medium'
    },
    {
      id: 'FB-005',
      title: 'Improve dashboard performance',
      description: 'The dashboard is slow to load and respond to user interactions. This is impacting user productivity and causing frustration.',
      customer: 'Speedy Solutions',
      customerId: 'ss-005',
      priority: 'high',
      status: 'open',
      category: 'improvement',
      created: '2024-06-06',
      votes: 3,
      comments: 1,
      views: 28,
      tags: ['performance', 'speed', 'ux'],
      submittedBy: 'Charlie Speed',
      estimatedEffort: '2 sprints',
      businessValue: 'high'
    }
  ];

  const handleAITaskCreation = (insight: any) => {
    console.log('Creating task from AI insight:', insight);
    setIsCreateDialogOpen(true);
  };

  const handleSmartFeedbackProcess = async (processed: any) => {
    console.log('Processed feedback:', processed);
    
    // Create feedback item using service
    const newFeedback = await processWithAI(() => 
      feedbackService.createFeedback({
        title: processed.originalText.substring(0, 50) + '...',
        description: processed.originalText,
        source: 'customer-portal',
        status: 'new',
        priority: processed.priorityScore > 80 ? 'critical' : 
                 processed.priorityScore > 60 ? 'high' : 'medium',
        customerInfo: {
          id: 'proc-' + Date.now(),
          name: 'AI Processed Customer',
          tier: processed.customerSegment,
          value: 10000
        }
      })
    );

    if (newFeedback) {
      refetch(); // Refresh the feedback list
      setShowAIProcessor(false);
      setRawFeedbackText('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'planned': return 'bg-cyan-100 text-cyan-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to map feedback status to ticket status
  const mapFeedbackStatusToTicketStatus = (feedbackStatus: string): Ticket['status'] => {
    switch (feedbackStatus) {
      case 'new': return 'open';
      case 'in-review': return 'in-progress';
      case 'planned': return 'planned';
      case 'in-progress': return 'in-progress';
      case 'completed': return 'resolved';
      case 'rejected': return 'closed';
      default: return 'open';
    }
  };

  // Use real feedback data if available, otherwise fall back to mock data
  const displayTickets = feedbackData?.data ? 
    feedbackData.data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      customer: item.customerInfo.name,
      customerId: item.customerInfo.id,
      priority: item.priority,
      status: mapFeedbackStatusToTicketStatus(item.status),
      category: 'feature' as const,
      created: new Date(item.createdAt).toLocaleDateString(),
      votes: 0,
      comments: 0,
      views: 0,
      tags: item.aiAnalysis?.themes || [],
      submittedBy: item.customerInfo.name,
      estimatedEffort: '1 sprint',
      businessValue: 'medium' as const
    })) : mockTickets;

  const filteredTickets = displayTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (selectedTicket) {
    return (
      <TicketDetail 
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
        onNavigate={onNavigate || (() => {})}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-slate-600">
            <span className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {feedbackLoading ? '...' : filteredTickets.length} feedback items
            </span>
            <span className="flex items-center">
              <Brain className="w-4 h-4 mr-1 text-purple-600" />
              AI-powered insights
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              onClick={() => setShowAIProcessor(true)}
              className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 w-full sm:w-auto"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Smart Process
            </Button>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Feedback
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <div className="flex flex-col gap-4 mb-6">
              <TabsList className="self-start">
                <TabsTrigger value="board">Board View</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
              </TabsList>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-36">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-full sm:w-36">
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <TabsContent value="board" className="space-y-3 sm:space-y-4">
              {feedbackLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-600">Loading feedback...</span>
                  </div>
                </div>
              )}
              
              {feedbackError && (
                <Card className="border-red-200">
                  <CardContent className="p-4">
                    <p className="text-red-600">Error loading feedback: {feedbackError}</p>
                    <Button onClick={refetch} variant="outline" className="mt-2">
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <div className="space-y-3 sm:space-y-4">
                {filteredTickets.map((ticket) => (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-2 flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg font-semibold leading-tight">{ticket.title}</CardTitle>
                          <p className="text-sm text-slate-600 line-clamp-2">{ticket.description.substring(0, 150)}...</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
                            <span className="flex items-center">
                              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="truncate">{ticket.customer}</span>
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              {ticket.created}
                            </span>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2">
                          <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights">
              <AIInsightsPanel 
                feedbackData={filteredTickets}
                onCreateTask={handleAITaskCreation}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* AI-Enhanced Sidebar - Hidden on mobile/tablet */}
        <div className="hidden xl:block space-y-4 lg:space-y-6">
          {/* Quick Stats with AI Enhancement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg flex items-center">
                <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-green-600" />
                AI-Powered Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Sentiment Score</span>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {insightsLoading ? '...' : '+8.2'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Priority Tickets</span>
                <span className="font-semibold text-red-600 text-sm">
                  {insightsLoading ? '...' : 
                   feedbackInsights?.byPriority?.critical + feedbackInsights?.byPriority?.high || 
                   filteredTickets.filter(t => t.priority === 'critical' || t.priority === 'high').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Auto-processed</span>
                <Badge className="bg-purple-100 text-purple-800 text-xs">67%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Themes Detected</span>
                <span className="font-semibold text-sm">
                  {insightsLoading ? '...' : feedbackInsights?.topThemes?.length || 12}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add New Feedback
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter Feedback
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                <Star className="w-4 h-4 mr-2" />
                View Prioritized
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Smart Feedback Processor Modal - Responsive */}
      {showAIProcessor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Smart Feedback Processing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Raw Feedback Text
                  </label>
                  <textarea
                    className="w-full p-3 border border-slate-300 rounded-md text-sm"
                    rows={4}
                    placeholder="Paste customer feedback here..."
                    value={rawFeedbackText}
                    onChange={(e) => setRawFeedbackText(e.target.value)}
                  />
                </div>
                {rawFeedbackText && (
                  <SmartFeedbackProcessor
                    rawFeedback={rawFeedbackText}
                    onProcessComplete={handleSmartFeedbackProcess}
                    customerInfo={{ tier: 'enterprise', value: 50000 }}
                  />
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowAIProcessor(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateDialogOpen && (
        <CreateTicketDialog 
          onClose={() => setIsCreateDialogOpen(false)}
          boards={mockBoards}
          boardId={null}
        />
      )}
    </div>
  );
};

export default CustomerBoard;
