
import { MessageSquare, ThumbsUp, ThumbsDown, Star, Filter, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CustomerBoard = () => {
  const feedbackItems = [
    {
      id: 1,
      title: 'Add dark mode theme option',
      description: 'It would be great to have a dark mode option for better usability during night hours.',
      author: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      type: 'feature',
      priority: 'medium',
      status: 'open',
      votes: 47,
      sentiment: 'positive',
      createdAt: '2024-01-10',
    },
    {
      id: 2,
      title: 'Mobile app crashes on login',
      description: 'The mobile app consistently crashes when I try to log in using my Google account.',
      author: 'Mike Chen',
      email: 'mike.chen@example.com',
      type: 'bug',
      priority: 'high',
      status: 'in-progress',
      votes: 23,
      sentiment: 'negative',
      createdAt: '2024-01-12',
    },
    {
      id: 3,
      title: 'Export data to CSV functionality',
      description: 'Please add the ability to export all dashboard data to CSV format for external analysis.',
      author: 'Emily Rodriguez',
      email: 'emily.r@example.com',
      type: 'feature',
      priority: 'low',
      status: 'planned',
      votes: 31,
      sentiment: 'neutral',
      createdAt: '2024-01-08',
    },
    {
      id: 4,
      title: 'Love the new analytics dashboard!',
      description: 'The new analytics dashboard is fantastic. Very intuitive and provides great insights.',
      author: 'David Park',
      email: 'david.park@example.com',
      type: 'feedback',
      priority: 'low',
      status: 'closed',
      votes: 15,
      sentiment: 'positive',
      createdAt: '2024-01-05',
    },
    {
      id: 5,
      title: 'Integration with Slack',
      description: 'Would be awesome to have Slack integration for notifications and quick updates.',
      author: 'Lisa Wong',
      email: 'lisa.wong@example.com',
      type: 'feature',
      priority: 'medium',
      status: 'open',
      votes: 38,
      sentiment: 'positive',
      createdAt: '2024-01-14',
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug':
        return 'bg-red-100 text-red-700';
      case 'feature':
        return 'bg-blue-100 text-blue-700';
      case 'feedback':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'planned':
        return 'bg-purple-100 text-purple-700';
      case 'closed':
        return 'bg-green-100 text-green-700';
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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <ThumbsDown className="w-4 h-4 text-red-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const stats = [
    { label: 'Total Feedback', value: '156', change: '+12' },
    { label: 'Open Issues', value: '23', change: '-3' },
    { label: 'Avg Response Time', value: '2.4h', change: '-0.3h' },
    { label: 'Customer Satisfaction', value: '4.6', change: '+0.2' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Customer Feedback Board</h2>
        <p className="text-slate-600">Track and manage customer feedback, feature requests, and support tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className="text-sm text-green-600">
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option>All Types</option>
            <option>Bug Reports</option>
            <option>Feature Requests</option>
            <option>General Feedback</option>
          </select>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option>All Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Planned</option>
            <option>Closed</option>
          </select>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Feedback
        </Button>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbackItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-slate-600 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span>{item.author}</span>
                      <span>{item.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {getSentimentIcon(item.sentiment)}
                        <span className="text-sm text-slate-600">{item.votes} votes</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerBoard;
