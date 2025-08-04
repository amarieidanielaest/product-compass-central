import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, Clock, Users, Target,
  Zap, CheckCircle, XCircle, Calendar, Activity, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { WorkItem, Sprint } from '@/services/api/SprintService';

interface SprintAnalyticsProps {
  sprint: Sprint;
  workItems: WorkItem[];
  onRefresh: () => void;
}

interface AnalyticsData {
  insights: any[];
  loading: boolean;
  error: string | null;
}

const SprintAnalytics = ({ sprint, workItems, onRefresh }: SprintAnalyticsProps) => {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    insights: [],
    loading: false,
    error: null
  });
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('overview');

  // Calculate sprint metrics
  const sprintMetrics = React.useMemo(() => {
    const totalItems = workItems.length;
    const completedItems = workItems.filter(item => item.status === 'done').length;
    const inProgressItems = workItems.filter(item => item.status === 'in-progress').length;
    const todoItems = workItems.filter(item => item.status === 'todo').length;
    const blockedItems = workItems.filter(item => item.status === 'blocked').length;

    const totalEffort = workItems.reduce((sum, item) => sum + (item.effort_estimate || 0), 0);
    const completedEffort = workItems
      .filter(item => item.status === 'done')
      .reduce((sum, item) => sum + (item.effort_estimate || 0), 0);

    const velocity = completedEffort;
    const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const effortCompletionRate = totalEffort > 0 ? (completedEffort / totalEffort) * 100 : 0;

    // Calculate burndown data
    const sprintDuration = sprint.end_date && sprint.start_date 
      ? Math.ceil((new Date(sprint.end_date).getTime() - new Date(sprint.start_date).getTime()) / (1000 * 60 * 60 * 24))
      : 14;
    
    const today = new Date();
    const sprintStart = new Date(sprint.start_date);
    const daysPassed = Math.ceil((today.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.min((daysPassed / sprintDuration) * 100, 100);

    return {
      totalItems,
      completedItems,
      inProgressItems,
      todoItems,
      blockedItems,
      totalEffort,
      completedEffort,
      velocity,
      completionRate,
      effortCompletionRate,
      sprintDuration,
      daysPassed,
      progressPercentage
    };
  }, [workItems, sprint]);

  // Generate AI insights
  const generateInsights = async (analysisType: string) => {
    setAnalyticsData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/sprint-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintData: {
            sprint,
            workItems,
            metrics: sprintMetrics
          },
          analysisType
        })
      });

      if (!response.ok) throw new Error('Failed to generate insights');
      
      const insights = await response.json();
      setAnalyticsData(prev => ({ ...prev, insights, loading: false }));
      
      toast({
        title: "Analytics updated",
        description: "AI insights generated successfully"
      });
    } catch (error) {
      setAnalyticsData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to generate insights' 
      }));
      toast({
        title: "Analytics error",
        description: "Failed to generate AI insights",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sprint Analytics</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered insights for {sprint.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedAnalysisType} onValueChange={setSelectedAnalysisType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="bottlenecks">Bottlenecks</SelectItem>
              <SelectItem value="velocity">Velocity Analysis</SelectItem>
              <SelectItem value="risks">Risk Assessment</SelectItem>
              <SelectItem value="optimization">Optimization</SelectItem>
              <SelectItem value="team_performance">Team Performance</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => generateInsights(selectedAnalysisType)}
            disabled={analyticsData.loading}
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {analyticsData.loading ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {sprintMetrics.completionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {sprintMetrics.completedItems} of {sprintMetrics.totalItems} items
                </p>
                <Progress value={sprintMetrics.completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Velocity</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {sprintMetrics.velocity}
                </div>
                <p className="text-xs text-muted-foreground">
                  Story points completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sprint Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {sprintMetrics.progressPercentage.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Day {sprintMetrics.daysPassed} of {sprintMetrics.sprintDuration}
                </p>
                <Progress value={sprintMetrics.progressPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {sprintMetrics.blockedItems}
                </div>
                <p className="text-xs text-muted-foreground">
                  Items need attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Work Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{sprintMetrics.todoItems}</div>
                  <Badge variant="secondary" className="mt-1">To Do</Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{sprintMetrics.inProgressItems}</div>
                  <Badge variant="default" className="mt-1">In Progress</Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{sprintMetrics.completedItems}</div>
                  <Badge variant="default" className="mt-1 bg-green-100 text-green-800">Done</Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{sprintMetrics.blockedItems}</div>
                  <Badge variant="destructive" className="mt-1">Blocked</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {analyticsData.loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">Generating AI insights...</span>
                </div>
              </CardContent>
            </Card>
          ) : analyticsData.error ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">{analyticsData.error}</p>
                <Button 
                  onClick={() => generateInsights(selectedAnalysisType)}
                  className="mt-2"
                  size="sm"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : analyticsData.insights.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.insights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      {insight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">{insight.description}</p>
                    {insight.recommendations && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recommendations:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {insight.recommendations.map((rec: string, recIndex: number) => (
                            <li key={recIndex} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Click "Generate Insights" to get AI-powered analysis
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Historical trend analysis will be available in future releases.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SprintAnalytics;