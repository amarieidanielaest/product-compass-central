
import { useState } from 'react';
import { 
  MessageSquare, Plus, Filter, Search, ArrowUp, ArrowDown, Clock, 
  User, Tag, ExternalLink, Zap, Target, Calendar, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomerBoardProps {
  onNavigate?: (module: string) => void;
}

const CustomerBoard = ({ onNavigate }: CustomerBoardProps) => {
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);

  const tickets = [
    {
      id: 1,
      title: 'Mobile app crashes on login',
      customer: 'TechCorp Inc.',
      priority: 'high',
      status: 'open',
      created: '2024-01-15',
      category: 'bug',
      impact: 'enterprise',
      votes: 23,
      description: 'Users unable to login on mobile app, affecting enterprise deployment',
      linkedFeatures: ['Mobile Authentication', 'SSO Integration']
    },
    {
      id: 2,
      title: 'Need bulk data export feature',
      customer: 'DataFlow Solutions',
      priority: 'medium',
      status: 'in-review',
      created: '2024-01-12',
      category: 'feature',
      impact: 'high',
      votes: 45,
      description: 'Enterprise customers need ability to export large datasets',
      linkedFeatures: ['Data Export API', 'Enterprise Dashboard']
    },
    {
      id: 3,
      title: 'API rate limiting too restrictive',
      customer: 'ScaleUp Ltd.',
      priority: 'medium',
      status: 'planned',
      created: '2024-01-10',
      category: 'enhancement',
      impact: 'medium',
      votes: 12,
      description: 'Current API limits prevent integration with high-volume workflows',
      linkedFeatures: ['API Gateway Enhancement']
    },
    {
      id: 4,
      title: 'Dashboard loading too slow',
      customer: 'FastTrack Corp',
      priority: 'low',
      status: 'open',
      created: '2024-01-08',
      category: 'performance',
      impact: 'medium',
      votes: 8,
      description: 'Main dashboard takes 10+ seconds to load with large datasets',
      linkedFeatures: ['Performance Optimization', 'Caching Layer']
    },
    {
      id: 5,
      title: 'White-label customization options',
      customer: 'BrandCo',
      priority: 'high',
      status: 'open',
      created: '2024-01-05',
      category: 'feature',
      impact: 'enterprise',
      votes: 67,
      description: 'Need ability to customize UI with company branding for white-label solution',
      linkedFeatures: ['White-label Platform', 'Custom Theming']
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in-review': return 'bg-yellow-100 text-yellow-700';
      case 'planned': return 'bg-purple-100 text-purple-700';
      case 'closed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug': return '🐛';
      case 'feature': return '✨';
      case 'enhancement': return '🚀';
      case 'performance': return '⚡';
      default: return '💡';
    }
  };

  const handleCreateSprint = () => {
    if (selectedTickets.length > 0) {
      onNavigate?.('sprints');
    }
  };

  const handleCreatePRD = (ticketId: number) => {
    onNavigate?.('prd');
  };

  const TicketCard = ({ ticket }: { ticket: any }) => (
    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={selectedTickets.includes(ticket.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTickets([...selectedTickets, ticket.id]);
                } else {
                  setSelectedTickets(selectedTickets.filter(id => id !== ticket.id));
                }
              }}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getCategoryIcon(ticket.category)}</span>
                <CardTitle className="text-base">{ticket.title}</CardTitle>
              </div>
              <p className="text-sm text-slate-600 mb-3">{ticket.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-slate-600">
                <User className="w-4 h-4 mr-1" />
                {ticket.customer}
              </div>
              <div className="flex items-center text-slate-600">
                <Clock className="w-4 h-4 mr-1" />
                {ticket.created}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-slate-600">
                <ArrowUp className="w-4 h-4 mr-1" />
                {ticket.votes}
              </div>
              <Badge variant="outline" className="text-xs">
                {ticket.impact}
              </Badge>
            </div>
          </div>

          {ticket.linkedFeatures && ticket.linkedFeatures.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1">Linked Features:</div>
              <div className="flex flex-wrap gap-1">
                {ticket.linkedFeatures.map((feature: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleCreatePRD(ticket.id)}>
                <Target className="w-4 h-4 mr-1" />
                Create PRD
              </Button>
              <Button size="sm" variant="outline">
                <Send className="w-4 h-4 mr-1" />
                Reply
              </Button>
            </div>
            <Button size="sm" variant="ghost">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Customer Board
          </h2>
          <p className="text-slate-600">
            Direct customer feedback connected to your development workflow
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Quick Actions Bar */}
      {selectedTickets.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-blue-900">
                  {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleCreateSprint} className="bg-blue-600 hover:bg-blue-700">
                    <Zap className="w-4 h-4 mr-1" />
                    Create Sprint
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="w-4 h-4 mr-1" />
                    Add to Roadmap
                  </Button>
                  <Button size="sm" variant="outline">
                    <Target className="w-4 h-4 mr-1" />
                    Bulk PRD
                  </Button>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSelectedTickets([])}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="high-priority">High Priority</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
            <TabsTrigger value="feature-requests">Feature Requests</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="Search tickets..." className="pl-10 w-64" />
            </div>
            <Select>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="impact">Impact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="high-priority">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tickets.filter(t => t.priority === 'high').map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enterprise">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tickets.filter(t => t.impact === 'enterprise').map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feature-requests">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tickets.filter(t => t.category === 'feature').map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerBoard;
