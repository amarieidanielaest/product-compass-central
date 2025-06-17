
import { useState } from 'react';
import { 
  Calendar, Users, Target, Clock, Plus, Filter, 
  ArrowRight, CheckCircle, AlertCircle, MoreHorizontal,
  ExternalLink, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SprintBoardProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

const SprintBoard = ({ selectedProductId, onNavigate }: SprintBoardProps) => {
  const [selectedSprint, setSelectedSprint] = useState('current');

  const mockSprints = [
    {
      id: 'SPR-24',
      name: 'Sprint 24 - Dark Mode & Performance',
      status: 'active',
      startDate: '2024-06-10',
      endDate: '2024-06-24',
      progress: 65,
      productId: 'main',
      tasks: [
        {
          id: 'TASK-001',
          title: 'Implement dark mode toggle',
          status: 'in-progress',
          assignee: 'John Doe',
          priority: 'high',
          linkedCustomerTicket: 'CUST-001',
          storyPoints: 8
        },
        {
          id: 'TASK-002',
          title: 'Fix CSV export performance',
          status: 'in-progress',
          assignee: 'Jane Smith',
          priority: 'critical',
          linkedCustomerTicket: 'CUST-002',
          storyPoints: 5
        },
        {
          id: 'TASK-003',
          title: 'Update UI color schemes',
          status: 'todo',
          assignee: 'Mike Johnson',
          priority: 'medium',
          linkedCustomerTicket: null,
          storyPoints: 3
        }
      ]
    },
    {
      id: 'SPR-25',
      name: 'Sprint 25 - Integration Features',
      status: 'planned',
      startDate: '2024-06-24',
      endDate: '2024-07-08',
      progress: 0,
      productId: 'beta',
      tasks: [
        {
          id: 'TASK-004',
          title: 'Slack integration setup',
          status: 'todo',
          assignee: 'Sarah Wilson',
          priority: 'high',
          linkedCustomerTicket: 'CUST-003',
          storyPoints: 13
        }
      ]
    }
  ];

  const filteredSprints = mockSprints.filter(sprint => 
    !selectedProductId || selectedProductId === 'main' || sprint.productId === selectedProductId
  );

  const currentSprint = filteredSprints.find(s => s.status === 'active') || filteredSprints[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const viewCustomerTicket = (ticketId: string) => {
    console.log(`Viewing customer ticket: ${ticketId}`);
    onNavigate?.('customer');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Sprint Board
          </h2>
          <p className="text-slate-600">
            Agile development with direct customer feedback integration
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => onNavigate?.('customer')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Customer Feedback
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            New Sprint
          </Button>
        </div>
      </div>

      {/* Sprint Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Sprints</p>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredSprints.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                <p className="text-2xl font-bold text-slate-900">
                  {currentSprint?.tasks.length || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Progress</p>
                <p className="text-2xl font-bold text-slate-900">
                  {currentSprint?.progress || 0}%
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Customer Links</p>
                <p className="text-2xl font-bold text-slate-900">
                  {currentSprint?.tasks.filter(t => t.linkedCustomerTicket).length || 0}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedSprint} onValueChange={setSelectedSprint} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Sprint</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {currentSprint && (
            <>
              {/* Sprint Header */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        {currentSprint.name}
                      </CardTitle>
                      <p className="text-slate-600 mt-1">
                        {currentSprint.startDate} - {currentSprint.endDate}
                      </p>
                    </div>
                    <Badge className={
                      currentSprint.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {currentSprint.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sprint Progress</span>
                      <span className="font-medium">{currentSprint.progress}%</span>
                    </div>
                    <Progress value={currentSprint.progress} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Task Board */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['todo', 'in-progress', 'done'].map((status) => (
                  <div key={status} className="space-y-4">
                    <h3 className="font-semibold text-slate-900 capitalize flex items-center">
                      {status === 'todo' && <Clock className="w-4 h-4 mr-2 text-gray-500" />}
                      {status === 'in-progress' && <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />}
                      {status === 'done' && <CheckCircle className="w-4 h-4 mr-2 text-green-500" />}
                      {status.replace('-', ' ')} ({currentSprint.tasks.filter(t => t.status === status).length})
                    </h3>
                    
                    <div className="space-y-3">
                      {currentSprint.tasks
                        .filter(task => task.status === status)
                        .map((task) => (
                          <Card key={task.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-slate-900 text-sm">{task.title}</h4>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                <div className="flex flex-wrap gap-1">
                                  <Badge className={getPriorityColor(task.priority)} variant="outline">
                                    {task.priority}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {task.storyPoints} pts
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {task.assignee}
                                  </span>
                                </div>
                                
                                {task.linkedCustomerTicket && (
                                  <div className="pt-2 border-t border-slate-100">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => viewCustomerTicket(task.linkedCustomerTicket!)}
                                      className="h-6 p-0 text-xs text-purple-600 hover:text-purple-800"
                                    >
                                      <MessageSquare className="w-3 h-3 mr-1" />
                                      {task.linkedCustomerTicket}
                                      <ExternalLink className="w-3 h-3 ml-1" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      
                      {currentSprint.tasks.filter(t => t.status === status).length === 0 && (
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                          <p className="text-slate-500 text-sm">No tasks in {status.replace('-', ' ')}</p>
                          <Button variant="ghost" size="sm" className="mt-2">
                            <Plus className="w-4 h-4 mr-1" />
                            Add Task
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Upcoming Sprints</h3>
              <p className="text-slate-600 mb-4">Plan your next sprints based on customer feedback and strategy</p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Plan Next Sprint
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Completed Sprints</h3>
              <p className="text-slate-600 mb-4">Review past sprints and their customer impact</p>
              <Button variant="outline">
                View Sprint History
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SprintBoard;
