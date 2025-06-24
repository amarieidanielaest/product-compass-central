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
    // In real implementation, this would create a new ticket based on AI suggestions
    setIsCreateDialogOpen(true);
  };

  const handleSmartFeedbackProcess = (processed: any) => {
    console.log('Processed feedback:', processed);
    setShowAIProcessor(false);
    setIsCreateDialogOpen(true);
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

  const filteredTickets = mockTickets.filter(ticket => {
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
    <div className="space-y-6">
      {/* Header with AI Enhancement */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Customer Feedback Board
          </h2>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {filteredTickets.length} feedback items
            </span>
            <span className="flex items-center">
              <Brain className="w-4 h-4 mr-1 text-purple-600" />
              AI-powered insights
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowAIProcessor(true)}
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
          >
            <Zap className="w-4 h-4 mr-2" />
            Smart Process
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Feedback
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="board">Board View</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
              </TabsList>

              {/* Filters */}
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
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
                  <SelectTrigger className="w-32">
                    <SelectValue />
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

            <TabsContent value="board" className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold">{ticket.title}</CardTitle>
                        <p className="text-sm text-slate-600">{ticket.description.substring(0, 100)}...</p>
                      </div>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 text-slate-500">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {ticket.customer}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {ticket.created}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="insights">
              <AIInsightsPanel 
                feedbackData={filteredTickets}
                onCreateTask={handleAITaskCreation}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* AI-Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats with AI Enhancement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                AI-Powered Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Sentiment Score</span>
                <Badge className="bg-green-100 text-green-800">+8.2</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Priority Tickets</span>
                <span className="font-semibold text-red-600">
                  {filteredTickets.filter(t => t.priority === 'critical' || t.priority === 'high').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Auto-processed</span>
                <Badge className="bg-purple-100 text-purple-800">67%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Themes Detected</span>
                <span className="font-semibold">12</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add New Feedback
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="w-4 h-4 mr-2" />
                Filter Feedback
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Star className="w-4 h-4 mr-2" />
                View Prioritized
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Smart Feedback Processor Modal */}
      {showAIProcessor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Smart Feedback Processing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Raw Feedback Text
                  </label>
                  <textarea
                    className="w-full p-3 border border-slate-300 rounded-md"
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
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowAIProcessor(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateTicketDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        selectedProductId={selectedProductId}
      />
    </div>
  );
};

export default CustomerBoard;
