
import { useState } from 'react';
import { 
  MessageSquare, User, Clock, AlertTriangle, CheckCircle, 
  ArrowRight, Filter, Search, Plus, ExternalLink, Building2,
  Globe, Lock, Users, ThumbsUp, MessageCircle, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TicketDetail from './TicketDetail';
import CreateTicketDialog from './CreateTicketDialog';

interface CustomerBoardProps {
  selectedProductId: string;
  onNavigate: (module: string) => void;
}

interface Board {
  id: string;
  name: string;
  type: 'public' | 'enterprise';
  customerId?: string;
  description: string;
  ticketCount: number;
  isActive: boolean;
}

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
  boardId: string;
  votes: number;
  comments: number;
  views: number;
  linkedSprint?: string;
  tags: string[];
  submittedBy: string;
  estimatedEffort?: string;
  businessValue?: 'low' | 'medium' | 'high';
}

const CustomerBoard = ({ selectedProductId, onNavigate }: CustomerBoardProps) => {
  const [activeTab, setActiveTab] = useState('all-boards');
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const mockBoards: Board[] = [
    {
      id: 'public-main',
      name: 'Public Feature Board',
      type: 'public',
      description: 'Community-driven feature requests and feedback',
      ticketCount: 47,
      isActive: true
    },
    {
      id: 'enterprise-acme',
      name: 'Acme Corp Board',
      type: 'enterprise',
      customerId: 'acme-corp',
      description: 'Private board for Acme Corp team collaboration',
      ticketCount: 12,
      isActive: true
    },
    {
      id: 'enterprise-techflow',
      name: 'TechFlow Inc Board',
      type: 'enterprise',
      customerId: 'techflow-inc',
      description: 'Dedicated board for TechFlow Inc feature requests',
      ticketCount: 8,
      isActive: true
    }
  ];

  const mockTickets: Ticket[] = [
    {
      id: 'FEAT-001',
      title: 'Dark mode support across all interfaces',
      description: 'Implement comprehensive dark mode theme with user preference persistence and automatic switching based on system settings.',
      customer: 'Community',
      priority: 'high',
      status: 'planned',
      category: 'feature',
      created: '2024-06-15',
      boardId: 'public-main',
      votes: 156,
      comments: 23,
      views: 890,
      tags: ['UI/UX', 'accessibility', 'theming'],
      submittedBy: 'john.doe@example.com',
      businessValue: 'high',
      estimatedEffort: '2-3 sprints'
    },
    {
      id: 'BUG-002',
      title: 'CSV export fails with large datasets',
      description: 'When exporting reports with more than 10,000 rows, the system times out and fails to generate the CSV file.',
      customer: 'TechFlow Inc',
      customerId: 'techflow-inc',
      priority: 'critical',
      status: 'in-progress',
      category: 'bug',
      created: '2024-06-14',
      boardId: 'enterprise-techflow',
      votes: 45,
      comments: 12,
      views: 234,
      linkedSprint: 'SPR-24',
      tags: ['export', 'performance', 'data'],
      submittedBy: 'sarah.tech@techflow.com',
      businessValue: 'high',
      estimatedEffort: '1 sprint'
    },
    {
      id: 'FEAT-003',
      title: 'Real-time Slack notifications integration',
      description: 'Connect with Slack workspace to send instant notifications for important events and updates.',
      customer: 'Acme Corp',
      customerId: 'acme-corp',
      priority: 'medium',
      status: 'open',
      category: 'integration',
      created: '2024-06-13',
      boardId: 'enterprise-acme',
      votes: 28,
      comments: 8,
      views: 156,
      tags: ['slack', 'notifications', 'integrations'],
      submittedBy: 'mike.manager@acme.com',
      businessValue: 'medium',
      estimatedEffort: '1-2 sprints'
    },
    {
      id: 'IMPR-004',
      title: 'Enhanced search functionality with filters',
      description: 'Improve search capabilities with advanced filters, sorting options, and real-time suggestions.',
      customer: 'Community',
      priority: 'medium',
      status: 'open',
      category: 'improvement',
      created: '2024-06-12',
      boardId: 'public-main',
      votes: 89,
      comments: 15,
      views: 445,
      tags: ['search', 'filters', 'UX'],
      submittedBy: 'community@example.com',
      businessValue: 'medium'
    }
  ];

  const getCurrentBoard = () => {
    if (!selectedBoard) return null;
    return mockBoards.find(board => board.id === selectedBoard) || null;
  };

  const getFilteredTickets = () => {
    let tickets = mockTickets;
    
    if (selectedBoard) {
      tickets = tickets.filter(ticket => ticket.boardId === selectedBoard);
    }
    
    if (searchTerm) {
      tickets = tickets.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedFilter !== 'all') {
      tickets = tickets.filter(ticket => ticket.status === selectedFilter);
    }
    
    return tickets.sort((a, b) => b.votes - a.votes);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'feature': return '✨';
      case 'bug': return '🐛';
      case 'improvement': return '🚀';
      case 'integration': return '🔌';
      default: return '📝';
    }
  };

  if (selectedTicket) {
    return (
      <TicketDetail
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Customer Feedback Hub
          </h2>
          <p className="text-slate-600">
            {selectedBoard 
              ? `Viewing ${getCurrentBoard()?.name || 'Board'}`
              : 'Manage public and enterprise customer feedback boards'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          {selectedBoard && (
            <Button variant="outline" onClick={() => setSelectedBoard(null)}>
              ← All Boards
            </Button>
          )}
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Feedback
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-boards">All Boards</TabsTrigger>
          <TabsTrigger value="public">Public Boards</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise Boards</TabsTrigger>
        </TabsList>

        <TabsContent value="all-boards" className="space-y-6">
          {!selectedBoard ? (
            // Board Overview
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockBoards.map((board) => (
                <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedBoard(board.id)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-lg">
                        {board.type === 'public' ? <Globe className="w-5 h-5 mr-2 text-blue-500" /> : <Lock className="w-5 h-5 mr-2 text-orange-500" />}
                        {board.name}
                      </CardTitle>
                      <Badge variant={board.type === 'public' ? 'default' : 'secondary'}>
                        {board.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm mb-4">{board.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{board.ticketCount} tickets</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Board Detail View
            <div className="space-y-6">
              {/* Board Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getCurrentBoard()?.type === 'public' ? 
                        <Globe className="w-8 h-8 text-blue-500" /> : 
                        <Building2 className="w-8 h-8 text-orange-500" />
                      }
                      <div>
                        <h3 className="text-xl font-semibold">{getCurrentBoard()?.name}</h3>
                        <p className="text-slate-600">{getCurrentBoard()?.description}</p>
                      </div>
                    </div>
                    <Badge variant={getCurrentBoard()?.type === 'public' ? 'default' : 'secondary'} className="text-sm">
                      {getCurrentBoard()?.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search feedback..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  {['all', 'open', 'in-progress', 'planned', 'resolved'].map((filter) => (
                    <Button
                      key={filter}
                      variant={selectedFilter === filter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFilter(filter)}
                      className="capitalize"
                    >
                      {filter === 'all' ? 'All' : filter.replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-4">
                {getFilteredTickets().map((ticket) => (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getCategoryIcon(ticket.category)}</span>
                              <h3 className="font-semibold text-slate-900 hover:text-purple-600 transition-colors">
                                {ticket.title}
                              </h3>
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            <p className="text-slate-600 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {ticket.customer}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {ticket.created}
                              </span>
                              {ticket.estimatedEffort && (
                                <span className="text-purple-600 font-medium">
                                  Est: {ticket.estimatedEffort}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-slate-600">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{ticket.votes}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-slate-600">
                              <MessageCircle className="w-4 h-4" />
                              <span>{ticket.comments}</span>
                            </Button>
                            <span className="flex items-center space-x-1 text-slate-500 text-sm">
                              <Eye className="w-4 h-4" />
                              <span>{ticket.views}</span>
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {ticket.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {getFilteredTickets().length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No feedback found</h3>
                    <p className="text-slate-600 mb-4">
                      {searchTerm || selectedFilter !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Be the first to add feedback to this board'
                      }
                    </p>
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feedback
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public">
          {/* Public boards content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBoards.filter(board => board.type === 'public').map((board) => (
              <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedBoard(board.id)}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Globe className="w-5 h-5 mr-2 text-blue-500" />
                    {board.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm mb-4">{board.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{board.ticketCount} tickets</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enterprise">
          {/* Enterprise boards content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBoards.filter(board => board.type === 'enterprise').map((board) => (
              <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedBoard(board.id)}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Building2 className="w-5 h-5 mr-2 text-orange-500" />
                    {board.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm mb-4">{board.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{board.ticketCount} tickets</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showCreateDialog && (
        <CreateTicketDialog
          onClose={() => setShowCreateDialog(false)}
          boardId={selectedBoard}
          boards={mockBoards}
        />
      )}
    </div>
  );
};

export default CustomerBoard;
