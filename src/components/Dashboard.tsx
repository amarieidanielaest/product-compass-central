
import { TrendingUp, Users, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const metrics = [
    {
      title: 'Monthly Active Users',
      value: '24,500',
      change: '+12%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Feature Adoption Rate',
      value: '68%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'Customer Satisfaction',
      value: '4.7',
      change: '+0.2',
      trend: 'up',
      icon: Star,
    },
    {
      title: 'Sprint Velocity',
      value: '42',
      change: '-3',
      trend: 'down',
      icon: Calendar,
    },
  ];

  const recentUpdates = [
    { id: 1, title: 'User Authentication Redesign', status: 'In Progress', priority: 'High' },
    { id: 2, title: 'Mobile App Performance', status: 'Completed', priority: 'Medium' },
    { id: 3, title: 'Analytics Dashboard', status: 'Planning', priority: 'High' },
    { id: 4, title: 'API Rate Limiting', status: 'In Review', priority: 'Low' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Product Dashboard</h2>
        <p className="text-slate-600">Overview of your product's key metrics and recent activities</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                <p className={`text-xs flex items-center ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="mr-1">{metric.change}</span>
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Feature Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUpdates.map((update) => (
                <div key={update.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">{update.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        update.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        update.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        update.status === 'In Review' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {update.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        update.priority === 'High' ? 'bg-red-100 text-red-700' :
                        update.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {update.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                <div className="font-medium text-blue-900">Create New Feature</div>
                <div className="text-sm text-blue-600">Add a new feature to your roadmap</div>
              </button>
              <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                <div className="font-medium text-green-900">Review Customer Feedback</div>
                <div className="text-sm text-green-600">Check latest user submissions</div>
              </button>
              <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
                <div className="font-medium text-purple-900">Update Strategy Goals</div>
                <div className="text-sm text-purple-600">Revise quarterly objectives</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
