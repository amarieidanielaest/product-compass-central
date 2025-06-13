
import { useState } from 'react';
import { Plus, MoreHorizontal, Clock, User, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SprintBoard = () => {
  const [tasks, setTasks] = useState({
    backlog: [
      { id: 1, title: 'Implement user preferences', priority: 'medium', points: 5, assignee: 'Unassigned' },
      { id: 2, title: 'Add email templates', priority: 'low', points: 3, assignee: 'Unassigned' },
      { id: 3, title: 'Optimize database queries', priority: 'high', points: 8, assignee: 'Unassigned' },
      { id: 4, title: 'Create API documentation', priority: 'medium', points: 5, assignee: 'Unassigned' },
    ],
    todo: [
      { id: 5, title: 'Fix mobile responsive issues', priority: 'high', points: 3, assignee: 'Emily Rodriguez' },
      { id: 6, title: 'Update user profile UI', priority: 'medium', points: 5, assignee: 'Alex Chen' },
    ],
    inProgress: [
      { id: 7, title: 'Implement password reset flow', priority: 'high', points: 8, assignee: 'Sarah Kim' },
    ],
    inReview: [
      { id: 8, title: 'Add email notifications', priority: 'medium', points: 5, assignee: 'Mike Johnson' },
    ],
    done: [
      { id: 9, title: 'Setup CI/CD pipeline', priority: 'high', points: 8, assignee: 'David Park' },
      { id: 10, title: 'Design new dashboard layout', priority: 'medium', points: 5, assignee: 'Lisa Wong' },
    ],
  });

  const [activeSprint, setActiveSprint] = useState({
    name: 'Sprint 24',
    startDate: '2024-01-15',
    endDate: '2024-01-29',
    capacity: 40,
    committed: 26,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const TaskCard = ({ task }: { task: any }) => (
    <div className="bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-slate-900 text-sm">{task.title}</h4>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            <Flag className="w-3 h-3 mr-1" />
            {task.priority}
          </Badge>
          <span className="text-xs text-slate-500">{task.points} pts</span>
        </div>
        
        <div className="flex items-center text-xs text-slate-500">
          <User className="w-3 h-3 mr-1" />
          {task.assignee === 'Unassigned' ? 
            <span className="text-slate-400">Unassigned</span> : 
            <span>{task.assignee.split(' ')[0]}</span>
          }
        </div>
      </div>
    </div>
  );

  const Column = ({ title, tasks, color }: { title: string; tasks: any[]; color: string }) => (
    <div className="flex-1 min-w-72">
      <div className={`flex items-center justify-between p-3 rounded-t-lg ${color}`}>
        <h3 className="font-semibold text-white">{title}</h3>
        <Badge variant="secondary" className="bg-white/20 text-white">
          {tasks.length}
        </Badge>
      </div>
      <div className="bg-slate-50 p-3 rounded-b-lg min-h-96 space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        <Button variant="outline" className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-2" />
          Add task
        </Button>
      </div>
    </div>
  );

  const sprintProgress = Math.round((activeSprint.committed / activeSprint.capacity) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Sprint Board</h2>
        <p className="text-slate-600">Manage your sprints and backlog with kanban-style boards</p>
      </div>

      <Tabs defaultValue="active-sprint" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active-sprint">Active Sprint</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
        </TabsList>

        <TabsContent value="active-sprint">
          {/* Sprint Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  {activeSprint.name}
                </div>
                <Button variant="outline" size="sm">
                  Complete Sprint
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Start Date</label>
                  <p className="text-slate-900">{activeSprint.startDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">End Date</label>
                  <p className="text-slate-900">{activeSprint.endDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Capacity</label>
                  <p className="text-slate-900">{activeSprint.capacity} points</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Committed</label>
                  <p className="text-slate-900">{activeSprint.committed} points</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Sprint Progress</span>
                  <span className="text-sm text-slate-600">{sprintProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${sprintProgress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kanban Board */}
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex space-x-4 overflow-x-auto pb-4">
              <Column title="To Do" tasks={tasks.todo} color="bg-slate-600" />
              <Column title="In Progress" tasks={tasks.inProgress} color="bg-blue-600" />
              <Column title="In Review" tasks={tasks.inReview} color="bg-orange-600" />
              <Column title="Done" tasks={tasks.done} color="bg-green-600" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="backlog">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Backlog Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Product Backlog
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.backlog.map((task) => (
                      <div key={task.id} className="p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 mb-2">{task.title}</h4>
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                <Flag className="w-3 h-3 mr-1" />
                                {task.priority}
                              </Badge>
                              <span className="text-sm text-slate-600">{task.points} story points</span>
                              <span className="text-sm text-slate-500">{task.assignee}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Add to Sprint
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sprint Planning */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Sprint Planning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Next Sprint</label>
                    <p className="text-slate-900">Sprint 25</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-600">Planned Capacity</label>
                    <p className="text-slate-900">45 story points</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-600">Items Selected</label>
                    <p className="text-slate-900">0 items (0 points)</p>
                  </div>
                  
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Start New Sprint
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Backlog Items</span>
                    <span className="font-medium">{tasks.backlog.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">In Development</span>
                    <span className="font-medium">{tasks.todo.length + tasks.inProgress.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Completed This Sprint</span>
                    <span className="font-medium">{tasks.done.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SprintBoard;
