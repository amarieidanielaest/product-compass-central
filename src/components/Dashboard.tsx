
import { useState } from 'react';
import { TrendingUp, Users, Calendar, Star, Settings, Plus, BarChart3, PieChart, LineChart, Target, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell, Pie, ResponsiveContainer, XAxis, YAxis, Area, AreaChart } from 'recharts';

const Dashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [dashboardLayout, setDashboardLayout] = useState('default');

  // Sample data for charts
  const userGrowthData = [
    { month: 'Jan', users: 4000, retention: 85 },
    { month: 'Feb', users: 4500, retention: 87 },
    { month: 'Mar', users: 5200, retention: 89 },
    { month: 'Apr', users: 5800, retention: 91 },
    { month: 'May', users: 6400, retention: 88 },
    { month: 'Jun', users: 7100, retention: 92 }
  ];

  const featureAdoptionData = [
    { feature: 'Analytics', adoption: 78, category: 'Core' },
    { feature: 'Reporting', adoption: 65, category: 'Core' },
    { feature: 'Integrations', adoption: 45, category: 'Advanced' },
    { feature: 'API Access', adoption: 32, category: 'Advanced' },
    { feature: 'Mobile App', adoption: 89, category: 'Core' }
  ];

  const satisfactionData = [
    { score: '5 Star', count: 245, percentage: 58 },
    { score: '4 Star', count: 98, percentage: 23 },
    { score: '3 Star', count: 45, percentage: 11 },
    { score: '2 Star', count: 22, percentage: 5 },
    { score: '1 Star', count: 12, percentage: 3 }
  ];

  const sprintMetrics = [
    { sprint: 'Sprint 21', velocity: 42, committed: 45, completed: 42 },
    { sprint: 'Sprint 22', velocity: 38, committed: 40, completed: 38 },
    { sprint: 'Sprint 23', velocity: 45, committed: 48, completed: 45 },
    { sprint: 'Sprint 24', velocity: 41, committed: 44, completed: 41 }
  ];

  const kpiMetrics = [
    {
      title: 'Monthly Active Users',
      value: '24,500',
      change: '+12%',
      trend: 'up',
      icon: Users,
      target: '25,000',
      progress: 98
    },
    {
      title: 'Feature Adoption Rate',
      value: '68%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
      target: '75%',
      progress: 91
    },
    {
      title: 'Customer Satisfaction',
      value: '4.7',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      target: '4.8',
      progress: 98
    },
    {
      title: 'Sprint Velocity',
      value: '42',
      change: '-3',
      trend: 'down',
      icon: Calendar,
      target: '45',
      progress: 93
    },
    {
      title: 'Revenue Growth',
      value: '$127k',
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      target: '$150k',
      progress: 85
    },
    {
      title: 'Time to Market',
      value: '3.2w',
      change: '-0.8w',
      trend: 'up',
      icon: Clock,
      target: '2.5w',
      progress: 78
    }
  ];

  const chartConfig = {
    users: { label: 'Users', color: '#8b5cf6' },
    retention: { label: 'Retention %', color: '#06b6d4' },
    adoption: { label: 'Adoption %', color: '#10b981' },
    velocity: { label: 'Velocity', color: '#f59e0b' },
    committed: { label: 'Committed', color: '#ef4444' },
    completed: { label: 'Completed', color: '#22c55e' }
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const recentAlerts = [
    { id: 1, type: 'critical', message: 'API response time increased by 200%', time: '5 min ago' },
    { id: 2, type: 'warning', message: 'Feature adoption rate below target', time: '1 hour ago' },
    { id: 3, type: 'info', message: 'New customer feedback received', time: '2 hours ago' }
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Product Analytics Dashboard
          </h2>
          <p className="text-slate-600">
            Comprehensive insights into your product's performance and user engagement
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <TabsList>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge className={getAlertColor(alert.type)}>
                    {alert.type}
                  </Badge>
                  <span className="text-sm text-slate-900">{alert.message}</span>
                </div>
                <span className="text-xs text-slate-500">{alert.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
                        <Badge className={metric.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {metric.change}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Target: {metric.target}</span>
                    <span className="text-slate-700">{metric.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metric.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-purple-600" />
              User Growth & Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area yAxisId="left" type="monotone" dataKey="users" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Line yAxisId="right" type="monotone" dataKey="retention" stroke="#06b6d4" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature Adoption Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Feature Adoption Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureAdoptionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="adoption" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-blue-600" />
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    dataKey="count"
                    label={({ score, percentage }) => `${score}: ${percentage}%`}
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sprint Velocity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-600" />
              Sprint Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sprintMetrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="sprint" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="committed" fill="#ef4444" />
                  <Bar dataKey="completed" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Plus className="w-6 h-6" />
              <span>Create Feature</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="w-6 h-6" />
              <span>Review Feedback</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="w-6 h-6" />
              <span>Plan Sprint</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <BarChart3 className="w-6 h-6" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
