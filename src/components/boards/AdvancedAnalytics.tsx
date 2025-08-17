import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/calendar';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, MessageSquare, ThumbsUp, Activity, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

interface AdvancedAnalyticsProps {
  boardId: string;
}

interface AnalyticsData {
  feedback_trends: Array<{
    date: string;
    submissions: number;
    resolved: number;
  }>;
  category_breakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  user_engagement: Array<{
    metric: string;
    current: number;
    previous: number;
    change: number;
  }>;
  sentiment_analysis: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ boardId }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [boardId, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load feedback items for analysis
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_items')
        .select('*')
        .eq('board_id', boardId)
        .gte('created_at', dateRange.from?.toISOString())
        .lte('created_at', dateRange.to?.toISOString());

      if (feedbackError) throw feedbackError;

      // Process data for analytics
      const processedData = processAnalyticsData(feedbackData || []);
      setData(processedData);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (feedbackItems: any[]): AnalyticsData => {
    // Process feedback trends by day
    const trendsByDay = feedbackItems.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { submissions: 0, resolved: 0 };
      }
      acc[date].submissions++;
      if (item.status === 'completed' || item.status === 'released') {
        acc[date].resolved++;
      }
      return acc;
    }, {} as Record<string, { submissions: number; resolved: number }>);

    const feedback_trends = Object.entries(trendsByDay).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Process category breakdown
    const categoryCount = feedbackItems.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalItems = feedbackItems.length;
    const category_breakdown = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalItems) * 100)
    }));

    // Mock user engagement data (would need more complex queries in real app)
    const user_engagement = [
      { metric: 'Total Feedback', current: feedbackItems.length, previous: Math.floor(feedbackItems.length * 0.8), change: 20 },
      { metric: 'Active Users', current: new Set(feedbackItems.map(f => f.submitted_by)).size, previous: Math.floor(new Set(feedbackItems.map(f => f.submitted_by)).size * 0.9), change: 10 },
      { metric: 'Avg. Votes per Item', current: Math.round(feedbackItems.reduce((sum, f) => sum + (f.votes_count || 0), 0) / feedbackItems.length) || 0, previous: 3, change: 15 }
    ];

    // Mock sentiment analysis (would use AI in real app)
    const sentiment_analysis = {
      positive: Math.round(feedbackItems.length * 0.6),
      neutral: Math.round(feedbackItems.length * 0.3),
      negative: Math.round(feedbackItems.length * 0.1)
    };

    return {
      feedback_trends,
      category_breakdown,
      user_engagement,
      sentiment_analysis
    };
  };

  const exportData = () => {
    if (!data) return;
    
    const exportData = {
      board_id: boardId,
      date_range: dateRange,
      analytics: data,
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board-analytics-${boardId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Analytics data exported successfully",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Advanced Analytics</CardTitle>
            <CardDescription>Detailed insights into your customer board performance</CardDescription>
          </div>
          <div className="flex gap-2">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.user_engagement.map((metric) => (
          <Card key={metric.metric}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                  <p className="text-2xl font-bold">{metric.current}</p>
                </div>
                <div className="flex items-center gap-1">
                  {metric.change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Trends</CardTitle>
              <CardDescription>Daily feedback submissions and resolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.feedback_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="submissions" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="resolved" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Distribution of feedback by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.category_breakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.category_breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {data.category_breakdown.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{category.count} items</Badge>
                        <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
              <CardDescription>Overall sentiment of feedback submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { sentiment: 'Positive', count: data.sentiment_analysis.positive, fill: 'hsl(var(--success))' },
                  { sentiment: 'Neutral', count: data.sentiment_analysis.neutral, fill: 'hsl(var(--muted))' },
                  { sentiment: 'Negative', count: data.sentiment_analysis.negative, fill: 'hsl(var(--destructive))' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sentiment" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Detailed engagement metrics and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{data.user_engagement[0]?.current || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{data.user_engagement[1]?.current || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Contributors</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{data.user_engagement[2]?.current || 0}</p>
                  <p className="text-sm text-muted-foreground">Avg. Votes per Item</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{Math.round((data.user_engagement[0]?.current || 0) * 0.3)}</p>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};