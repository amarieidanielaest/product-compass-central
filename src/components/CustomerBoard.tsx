import { useState } from 'react';
import { 
  MessageSquare, User, Clock, AlertTriangle, CheckCircle, 
  ArrowRight, Filter, Search, Plus, ExternalLink 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomerBoardProps {
  selectedProductId: string;
  onNavigate: (module: string) => void;
}

const CustomerBoard = ({ selectedProductId, onNavigate }: CustomerBoardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const mockTickets = [
    {
      id: 'CUST-001',
      title: 'Feature request: Dark mode support',
      customer: 'Acme Corp',
      priority: 'high',
      status: 'open',
      created: '2024-06-15',
      description: 'Users are requesting dark mode for better accessibility',
      productId: 'main',
      linkedSprint: 'SPR-24',
      votes: 23
    },
    {
      id: 'CUST-002',
      title: 'Bug: Export functionality not working',
      customer: 'TechFlow Inc',
      priority: 'critical',
      status: 'in-progress',
      created: '2024-06-14',
      description: 'CSV export fails with large datasets',
      productId: 'main',
      linkedSprint: 'SPR-24',
      votes: 15
    },
    {
      id: 'CUST-003',
      title: 'Integration with Slack needed',
      customer: 'StartupXYZ',
      priority: 'medium',
      status: 'planned',
      created: '2024-06-13',
      description: 'Need real-time notifications in Slack',
      productId: 'beta',
      linkedSprint: null,
      votes: 8
    }
  ];

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || ticket.status === selectedFilter;
    const matchesProduct = !selectedProductId || selectedProductId === 'main' || ticket.productId === selectedProductId;
    return matchesSearch && matchesFilter && matchesProduct;
  });

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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const linkToSprint = (ticketId: string) => {
    // In a real app, this would create the actual link
    console.log(`Linking ticket ${ticketId} to sprint`);
    onNavigate('sprints');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Customer Insights
          </h2>
          <p className="text-slate-600">
            Direct customer feedback connected to your development process
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => onNavigate('strategy')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View Strategy
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Feedback
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical Issues</p>
                <p className="text-2xl font-bold text-slate-900">
                  {mockTickets.filter(t => t.priority === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-slate-900">
                  {mockTickets.filter(t => t.status === 'in-progress').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Resolved</p>
                <p className="text-2xl font-bold text-slate-900">
                  {mockTickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Votes</p>
                <p className="text-2xl font-bold text-slate-900">
                  {mockTickets.reduce((sum, t) => sum + t.votes, 0)}
                </p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search customer feedback..."
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

      {/* Customer Feedback List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">{ticket.title}</h3>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <p className="text-slate-600 text-sm mb-2">{ticket.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {ticket.customer}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {ticket.created}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {ticket.votes} votes
                    </span>
                    {ticket.linkedSprint && (
                      <span className="text-purple-600 font-medium">
                        Linked to {ticket.linkedSprint}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {!ticket.linkedSprint && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => linkToSprint(ticket.id)}
                      className="whitespace-nowrap"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Link to Sprint
                    </Button>
                  )}
                  {ticket.linkedSprint && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate('sprints')}
                      className="whitespace-nowrap"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Sprint
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No feedback found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Customer feedback will appear here'
              }
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add First Feedback
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerBoard;
