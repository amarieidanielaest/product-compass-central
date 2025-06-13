
import { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Star, Filter, Plus, Search, Users, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Eye, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CustomerBoard = () => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const feedbackItems = [
    {
      id: 1,
      title: 'Dark Mode Implementation',
      description: 'We need a comprehensive dark mode that works across all components and maintains accessibility standards.',
      author: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      avatar: 'SJ',
      type: 'feature',
      category: 'ui-ux',
      priority: 'high',
      status: 'planned',
      votes: 127,
      comments: 23,
      followers: 45,
      sentiment: 'positive',
      effort: 'large',
      createdAt: '2024-01-10',
      tags: ['accessibility', 'ui', 'theme'],
      roadmapQuarter: 'Q2 2024',
    },
    {
      id: 2,
      title: 'Mobile App Login Issues',
      description: 'Users consistently report crashes during Google OAuth login on mobile devices. This affects user onboarding significantly.',
      author: 'Mike Chen',
      email: 'mike.chen@example.com',
      avatar: 'MC',
      type: 'bug',
      category: 'authentication',
      priority: 'critical',
      status: 'in-progress',
      votes: 89,
      comments: 34,
      followers: 67,
      sentiment: 'negative',
      effort: 'medium',
      createdAt: '2024-01-12',
      tags: ['mobile', 'oauth', 'critical'],
      assignee: 'Dev Team Alpha',
    },
    {
      id: 3,
      title: 'Advanced Analytics Dashboard',
      description: 'Request for more detailed analytics including user behavior patterns, conversion funnels, and custom reporting.',
      author: 'Emily Rodriguez',
      email: 'emily.r@example.com',
      avatar: 'ER',
      type: 'feature',
      category: 'analytics',
      priority: 'medium',
      status: 'under-review',
      votes: 156,
      comments: 18,
      followers: 78,
      sentiment: 'positive',
      effort: 'large',
      createdAt: '2024-01-08',
      tags: ['analytics', 'reporting', 'insights'],
      roadmapQuarter: 'Q3 2024',
    },
    {
      id: 4,
      title: 'Slack Integration',
      description: 'Seamless Slack integration for notifications, quick updates, and team collaboration features.',
      author: 'David Park',
      email: 'david.park@example.com',
      avatar: 'DP',
      type: 'integration',
      category: 'integrations',
      priority: 'low',
      status: 'open',
      votes: 91,
      comments: 12,
      followers: 34,
      sentiment: 'positive',
      effort: 'medium',
      createdAt: '2024-01-05',
      tags: ['slack', 'notifications', 'collaboration'],
    },
    {
      id: 5,
      title: 'Bulk Export Functionality',
      description: 'Need ability to export large datasets in multiple formats (CSV, Excel, JSON) with filtering options.',
      author: 'Lisa Wong',
      email: 'lisa.wong@example.com',
      avatar: 'LW',
      type: 'feature',
      category: 'data-export',
      priority: 'medium',
      status: 'completed',
      votes: 73,
      comments: 8,
      followers: 29,
      sentiment: 'positive',
      effort: 'small',
      createdAt: '2024-01-14',
      tags: ['export', 'data', 'csv'],
    },
  ];

  const categories = [
    { id: 'all', name: 'All Categories', count: feedbackItems.length },
    { id: 'ui-ux', name: 'UI/UX', count: 15 },
    { id: 'authentication', name: 'Authentication', count: 8 },
    { id: 'analytics', name: 'Analytics', count: 12 },
    { id: 'integrations', name: 'Integrations', count: 6 },
    { id: 'data-export', name: 'Data Export', count: 4 },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'feature':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'integration':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'feedback':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'planned':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'under-review':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
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
    { label: 'Total Feedback', value: '284', change: '+23', trend: 'up' },
    { label: 'Open Items', value: '47', change: '-5', trend: 'down' },
    { label: 'Avg Response Time', value: '1.8h', change: '-0.4h', trend: 'down' },
    { label: 'Satisfaction Score', value: '4.7/5', change: '+0.3', trend: 'up' },
  ];

  const roadmapItems = [
    { quarter: 'Q2 2024', items: 12, status: 'active' },
    { quarter: 'Q3 2024', items: 8, status: 'planned' },
    { quarter: 'Q4 2024', items: 5, status: 'draft' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gradient-bg min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Customer Feedback Hub</h2>
        <p className="text-slate-600">Centralized feedback management with roadmap integration and community voting</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className={`w-4 h-4 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="feedback" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Feedback Board
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Public Roadmap
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-6">
          {/* Controls and Filters */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search feedback..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                  <Button className="gradient-primary text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Sidebar + Feedback List */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-xs opacity-75">{category.count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Items */}
            <div className="lg:col-span-3 space-y-4">
              {feedbackItems.map((item) => (
                <Card key={item.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/30">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 hover:text-primary cursor-pointer">
                              {item.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={getTypeColor(item.type)}>
                                {item.type}
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                              <div className="flex items-center">
                                {getPriorityIcon(item.priority)}
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-600 mb-3 leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {item.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">{item.author}</p>
                              <p className="text-xs text-slate-500">{item.createdAt}</p>
                            </div>
                          </div>
                          {item.roadmapQuarter && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {item.roadmapQuarter}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3 text-sm text-slate-500">
                            <div className="flex items-center space-x-1">
                              {getSentimentIcon(item.sentiment)}
                              <span>{item.votes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{item.comments}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{item.followers}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Heart className="w-4 h-4 mr-1" />
                              Vote
                            </Button>
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
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Public Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {roadmapItems.map((quarter, index) => (
                  <div key={index} className="border-l-4 border-l-primary/30 pl-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold">{quarter.quarter}</h3>
                      <Badge variant="outline" className={getStatusColor(quarter.status)}>
                        {quarter.status}
                      </Badge>
                    </div>
                    <p className="text-slate-600">{quarter.items} planned features</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Feedback Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Advanced analytics and insights coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerBoard;
