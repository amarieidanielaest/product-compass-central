
import { useState } from 'react';
import { MessageSquare, Star, TrendingUp, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface FeedbackInsightsWidgetProps {
  timeframe?: '7d' | '30d' | '90d';
  showCharts?: boolean;
}

const FeedbackInsightsWidget = ({ timeframe = '30d', showCharts = true }: FeedbackInsightsWidgetProps) => {
  const [activeTab, setActiveTab] = useState('sentiment');

  const sentimentData = [
    { category: 'Positive', count: 145, percentage: 58 },
    { category: 'Neutral', count: 67, percentage: 27 },
    { category: 'Negative', count: 38, percentage: 15 },
  ];

  const featureRequests = [
    { feature: 'Dark Mode', votes: 89, priority: 'high', status: 'in-progress' },
    { feature: 'Mobile App', votes: 76, priority: 'high', status: 'planned' },
    { feature: 'API Access', votes: 45, priority: 'medium', status: 'planned' },
    { feature: 'Integrations', votes: 34, priority: 'medium', status: 'research' },
    { feature: 'Advanced Analytics', votes: 28, priority: 'low', status: 'research' },
  ];

  const feedbackSources = [
    { source: 'In-App Widget', count: 89 },
    { source: 'Support Tickets', count: 67 },
    { source: 'User Interviews', count: 45 },
    { source: 'Public Board', count: 34 },
    { source: 'Beta Program', count: 15 },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const chartConfig = {
    positive: { label: "Positive", color: "#10b981" },
    neutral: { label: "Neutral", color: "#f59e0b" },
    negative: { label: "Negative", color: "#ef4444" },
    count: { label: "Count", color: "#8b5cf6" }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'planned': return 'bg-purple-100 text-purple-700';
      case 'research': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const feedbackMetrics = [
    { label: 'Total Feedback', value: '250', change: '+18%', trend: 'up', icon: MessageSquare },
    { label: 'Avg Response Time', value: '2.4h', change: '-12%', trend: 'up', icon: TrendingUp },
    { label: 'Resolution Rate', value: '89%', change: '+5%', trend: 'up', icon: Star },
    { label: 'AI Insights', value: '34', change: '+45%', trend: 'up', icon: Brain },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
          Feedback Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="sentiment" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {feedbackMetrics.slice(0, 2).map((metric, index) => (
                <div key={index} className="p-3 bg-indigo-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-indigo-900">{metric.value}</p>
                  <p className="text-xs text-indigo-700">{metric.label}</p>
                </div>
              ))}
            </div>
            {showCharts && (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      dataKey="count"
                      label={({ category, percentage }) => `${category}: ${percentage}%`}
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <div className="space-y-3">
              {featureRequests.map((request, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-slate-900">{request.feature}</h4>
                    <div className="flex space-x-2">
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-slate-600">{request.votes} votes</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            {showCharts && (
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <BarChart data={feedbackSources}>
                  <XAxis dataKey="source" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ChartContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FeedbackInsightsWidget;
