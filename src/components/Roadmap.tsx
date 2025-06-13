
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Roadmap = () => {
  const quarters = [
    {
      name: 'Q1 2024',
      features: [
        { title: 'User Authentication v2', status: 'completed', assignee: 'Alex Chen', priority: 'high' },
        { title: 'Mobile App MVP', status: 'in-progress', assignee: 'Sarah Kim', priority: 'high' },
        { title: 'API Rate Limiting', status: 'completed', assignee: 'Mike Johnson', priority: 'medium' },
      ],
    },
    {
      name: 'Q2 2024',
      features: [
        { title: 'Advanced Analytics Dashboard', status: 'in-progress', assignee: 'Emily Rodriguez', priority: 'high' },
        { title: 'Team Collaboration Tools', status: 'planned', assignee: 'David Park', priority: 'medium' },
        { title: 'Third-party Integrations', status: 'planned', assignee: 'Lisa Wong', priority: 'low' },
      ],
    },
    {
      name: 'Q3 2024',
      features: [
        { title: 'AI-Powered Insights', status: 'planned', assignee: 'TBD', priority: 'high' },
        { title: 'Enterprise Security Features', status: 'planned', assignee: 'TBD', priority: 'high' },
        { title: 'White-label Solutions', status: 'planned', assignee: 'TBD', priority: 'medium' },
      ],
    },
  ];

  const currentSprint = {
    name: 'Sprint 24',
    startDate: '2024-01-15',
    endDate: '2024-01-29',
    progress: 65,
    tasks: [
      { id: 1, title: 'Update user profile UI', status: 'completed', assignee: 'Alex' },
      { id: 2, title: 'Implement password reset flow', status: 'in-progress', assignee: 'Sarah' },
      { id: 3, title: 'Add email notifications', status: 'in-progress', assignee: 'Mike' },
      { id: 4, title: 'Fix mobile responsive issues', status: 'todo', assignee: 'Emily' },
      { id: 5, title: 'Optimize database queries', status: 'todo', assignee: 'David' },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'planned':
        return 'bg-gray-100 text-gray-700';
      case 'todo':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Product Roadmap & Sprints</h2>
        <p className="text-slate-600">Plan, track, and execute your product development timeline</p>
      </div>

      {/* Current Sprint */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Current Sprint: {currentSprint.name}
            </div>
            <div className="text-sm text-slate-600">
              {currentSprint.startDate} - {currentSprint.endDate}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Sprint Progress</span>
              <span className="text-sm text-slate-600">{currentSprint.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${currentSprint.progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentSprint.tasks.map((task) => (
              <div key={task.id} className="p-3 bg-slate-50 rounded-lg border">
                <h4 className="font-medium text-slate-900 mb-2">{task.title}</h4>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <div className="flex items-center text-xs text-slate-500">
                    <User className="w-3 h-3 mr-1" />
                    {task.assignee}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      {/* Quarterly Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Quarterly Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quarters.map((quarter, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">{quarter.name}</h3>
                {quarter.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <h4 className="font-medium text-slate-900 mb-2">{feature.title}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                        {feature.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feature.priority)}`}>
                        {feature.priority}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <User className="w-3 h-3 mr-1" />
                      {feature.assignee}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Roadmap;
