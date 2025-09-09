import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, MessageSquare, Star, Brain, Download, Calendar, Target, Clock, Filter } from 'lucide-react';
import { CustomerBoard, EnhancedFeedbackItem } from '@/services/api/BoardService';
import { useServiceCall } from '@/hooks/useServiceIntegration';
import { analyticsService } from '@/services/api';

interface AnalyticsData {
  overview: {
    totalFeedback: number;
    totalVotes: number;
    activeUsers: number;
    avgResponseTime: number;
    completionRate: number;
    satisfactionScore: number;
  };
  feedbackTrends: Array<{
    date: string;
    submitted: number;
    completed: number;
    votes: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  priorityBreakdown: Array<{
    priority: string;
    count: number;
    avgVotes: number;
  }>;
  categoryInsights: Array<{
    category: string;
    count: number;
    avgImpact: number;
    completionRate: number;
  }>;
  userEngagement: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
  }>;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
    trends: Array<{
      date: string;
      positive: number;
      neutral: number;
      negative: number;
    }>;
  };
  performanceMetrics: {
    avgTimeToResponse: number;
    avgTimeToCompletion: number;
    userSatisfaction: number;
    featureAdoption: Array<{
      feature: string;
      usage: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
}

interface AdvancedBoardAnalyticsProps {
  board: CustomerBoard;
  feedback?: EnhancedFeedbackItem[];
}

export const AdvancedBoardAnalytics: React.FC<AdvancedBoardAnalyticsProps> = ({ 
  board, 
  feedback = [] 
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [board.id, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load analytics data - using mock data for now
      const mockData: AnalyticsData = {
        overview: {
          totalFeedback: feedback.length,
          totalVotes: feedback.reduce((sum, item) => sum + (item.votes_count || 0), 0),
          activeUsers: Math.floor(feedback.length * 0.7),
          avgResponseTime: 2.5,
          completionRate: 0.68,
          satisfactionScore: 4.2
        },
        feedbackTrends: generateTrendData(),
        statusDistribution: generateStatusData(),
        priorityBreakdown: generatePriorityData(),
        categoryInsights: generateCategoryData(),
        userEngagement: generateEngagementData(),
        sentimentAnalysis: {
          positive: 0.65,
          neutral: 0.25,
          negative: 0.10,
          trends: generateSentimentTrends()
        },
        performanceMetrics: {
          avgTimeToResponse: 1.2,
          avgTimeToCompletion: 8.5,
          userSatisfaction: 4.2,
          featureAdoption: [
            { feature: 'Voting', usage: 0.85, trend: 'up' },
            { feature: 'Comments', usage: 0.62, trend: 'stable' },
            { feature: 'Roadmap', usage: 0.43, trend: 'up' },
            { feature: 'Knowledge Base', usage: 0.38, trend: 'down' }
          ]
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        submitted: Math.floor(Math.random() * 10) + 1,
        completed: Math.floor(Math.random() * 5) + 1,
        votes: Math.floor(Math.random() * 25) + 5
      });
    }
    return data;
  };

  const generateStatusData = () => {
    const statuses = ['submitted', 'under_review', 'planned', 'in_progress', 'completed'];
    return statuses.map(status => {
      const count = feedback.filter(item => item.status === status).length;
      return {
        status,
        count,
        percentage: feedback.length > 0 ? (count / feedback.length) * 100 : 0
      };
    });
  };

  const generatePriorityData = () => {
    const priorities = ['low', 'medium', 'high', 'critical'];
    return priorities.map(priority => {
      const items = feedback.filter(item => item.priority === priority);
      return {
        priority,
        count: items.length,
        avgVotes: items.length > 0 ? items.reduce((sum, item) => sum + (item.votes_count || 0), 0) / items.length : 0
      };
    });
  };

  const generateCategoryData = () => {
    const categories = [...new Set(feedback.map(item => item.category).filter(Boolean))];
    return categories.map(category => {
      const items = feedback.filter(item => item.category === category);
      const completed = items.filter(item => item.status === 'completed').length;
      return {
        category: category!,
        count: items.length,
        avgImpact: items.reduce((sum, item) => sum + (item.impact_score || 0), 0) / items.length || 0,
        completionRate: items.length > 0 ? completed / items.length : 0
      };
    });
  };

  const generateEngagementData = () => {
    const days = Math.min(30, timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 30);
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        activeUsers: Math.floor(Math.random() * 50) + 20,
        newUsers: Math.floor(Math.random() * 15) + 5,
        returningUsers: Math.floor(Math.random() * 35) + 15
      });
    }
    return data;
  };

  const generateSentimentTrends = () => {
    const days = Math.min(30, timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 30);
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        positive: Math.random() * 0.4 + 0.4,
        neutral: Math.random() * 0.3 + 0.2,
        negative: Math.random() * 0.2 + 0.05
      });
    }
    return data;
  };

  const exportAnalytics = () => {
    if (!analyticsData) return;
    
    const data = JSON.stringify(analyticsData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${board.slug}-analytics-${timeRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !analyticsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Deep insights into your board performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalFeedback}</p>
              </div>
              <MessageSquare className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalVotes}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{analyticsData.overview.activeUsers}</p>
              </div>
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{analyticsData.overview.avgResponseTime}d</p>
              </div>
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{(analyticsData.overview.completionRate * 100).toFixed(0)}%</p>
              </div>
              <Target className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{analyticsData.overview.satisfactionScore}/5</p>
              </div>
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Trends</CardTitle>
              <CardDescription>Track feedback submission and completion over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.feedbackTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="submitted" stroke="#8884d8" name="Submitted" />
                  <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Completed" />
                  <Line type="monotone" dataKey="votes" stroke="#ffc658" name="Votes" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={(entry) => `${entry.status}: ${entry.count}`}
                    >
                      {analyticsData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData.priorityBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Count" />
                    <Bar dataKey="avgVotes" fill="#82ca9d" name="Avg Votes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Track user activity and retention</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.userEngagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#8884d8" fill="#8884d8" name="Active Users" />
                  <Area type="monotone" dataKey="newUsers" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="New Users" />
                  <Area type="monotone" dataKey="returningUsers" stackId="3" stroke="#ffc658" fill="#ffc658" name="Returning Users" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Positive</span>
                    <span className="text-sm text-green-600">{(analyticsData.sentimentAnalysis.positive * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analyticsData.sentimentAnalysis.positive * 100}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Neutral</span>
                    <span className="text-sm text-yellow-600">{(analyticsData.sentimentAnalysis.neutral * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${analyticsData.sentimentAnalysis.neutral * 100}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Negative</span>
                    <span className="text-sm text-red-600">{(analyticsData.sentimentAnalysis.negative * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${analyticsData.sentimentAnalysis.negative * 100}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analyticsData.sentimentAnalysis.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="positive" stroke="#22c55e" name="Positive" />
                    <Line type="monotone" dataKey="neutral" stroke="#eab308" name="Neutral" />
                    <Line type="monotone" dataKey="negative" stroke="#ef4444" name="Negative" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Avg. Time to Response</span>
                  <Badge variant="outline">{analyticsData.performanceMetrics.avgTimeToResponse} days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg. Time to Completion</span>
                  <Badge variant="outline">{analyticsData.performanceMetrics.avgTimeToCompletion} days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>User Satisfaction</span>
                  <Badge variant="outline">{analyticsData.performanceMetrics.userSatisfaction}/5</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Adoption</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.performanceMetrics.featureAdoption.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{feature.feature}</span>
                        {feature.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {feature.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                      </div>
                      <span className="text-sm text-muted-foreground">{(feature.usage * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>Automated insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Top Priority</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Focus on feature requests in the "UI/UX" category - they have 3x higher vote counts than average.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Positive Trend</h4>
                  <p className="text-sm text-green-700 mt-1">
                    User engagement has increased by 25% over the past month, with more users returning to vote on feedback.
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900">Opportunity</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Response time to new feedback could be improved - currently averaging {analyticsData.performanceMetrics.avgTimeToResponse} days.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900">User Sentiment</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Overall sentiment is positive ({(analyticsData.sentimentAnalysis.positive * 100).toFixed(0)}% positive), 
                    indicating users are satisfied with the product direction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};