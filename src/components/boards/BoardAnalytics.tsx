import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, Calendar, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomerBoard, boardService } from '@/services/api/BoardService';

interface BoardAnalyticsProps {
  board: CustomerBoard;
}

interface AnalyticsData {
  totalFeedback: number;
  totalVotes: number;
  totalComments: number;
  activeUsers: number;
  feedbackByStatus: Record<string, number>;
  feedbackByPriority: Record<string, number>;
  monthlyTrends: Array<{ month: string; feedback: number; votes: number; comments: number }>;
  topContributors: Array<{ userId: string; contributions: number }>;
  responseTime: { average: number; median: number };
}

export function BoardAnalytics({ board }: BoardAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [board.id, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Mock analytics data - in real implementation, this would come from the API
      const mockAnalytics: AnalyticsData = {
        totalFeedback: 124,
        totalVotes: 856,
        totalComments: 342,
        activeUsers: 67,
        feedbackByStatus: {
          'submitted': 45,
          'under_review': 23,
          'planned': 18,
          'in_progress': 15,
          'completed': 20,
          'rejected': 3,
        },
        feedbackByPriority: {
          'critical': 8,
          'high': 31,
          'medium': 65,
          'low': 20,
        },
        monthlyTrends: [
          { month: 'Jan', feedback: 15, votes: 124, comments: 45 },
          { month: 'Feb', feedback: 23, votes: 156, comments: 67 },
          { month: 'Mar', feedback: 18, votes: 134, comments: 52 },
          { month: 'Apr', feedback: 31, votes: 198, comments: 89 },
          { month: 'May', feedback: 27, votes: 187, comments: 76 },
          { month: 'Jun', feedback: 10, votes: 57, comments: 13 },
        ],
        topContributors: [
          { userId: 'user-001', contributions: 23 },
          { userId: 'user-002', contributions: 18 },
          { userId: 'user-003', contributions: 15 },
          { userId: 'user-004', contributions: 12 },
          { userId: 'user-005', contributions: 9 },
        ],
        responseTime: { average: 2.3, median: 1.8 },
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Mock export functionality
    const csvData = `Board Analytics Export - ${board.name}\n` +
      `Generated: ${new Date().toLocaleDateString()}\n\n` +
      `Total Feedback,Total Votes,Total Comments,Active Users\n` +
      `${analytics?.totalFeedback},${analytics?.totalVotes},${analytics?.totalComments},${analytics?.activeUsers}\n\n` +
      `Feedback by Status\n` +
      Object.entries(analytics?.feedbackByStatus || {}).map(([status, count]) => `${status},${count}`).join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${board.slug}-analytics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8 text-muted-foreground">No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold">Board Analytics</h2>
          <p className="text-muted-foreground">Insights for {board.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalFeedback}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVotes}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.responseTime.average}d</div>
            <p className="text-xs text-muted-foreground">
              -0.5d from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feedback by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.feedbackByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(count / analytics.totalFeedback) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feedback by Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.feedbackByPriority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={priority === 'critical' || priority === 'high' ? 'destructive' : 'secondary'}
                          className="capitalize"
                        >
                          {priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(count / analytics.totalFeedback) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyTrends.map((trend) => (
                  <div key={trend.month} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{trend.month}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{trend.feedback} feedback</span>
                      <span>{trend.votes} votes</span>
                      <span>{trend.comments} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topContributors.map((contributor, index) => (
                  <div key={contributor.userId} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span>User {contributor.userId.slice(-3)}</span>
                    </div>
                    <span className="font-medium">{contributor.contributions} contributions</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}