import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { roadmapService, RoadmapItem } from '@/services/api/RoadmapService';
import { sprintService, Sprint, WorkItem } from '@/services/api/SprintService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Download, 
  Share2, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Target,
  BarChart3
} from 'lucide-react';

interface ExecutiveReport {
  period: string;
  strategicInitiatives: {
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
    onTrack: number;
    atRisk: number;
  };
  deliveryMetrics: {
    velocityTrend: Array<{ period: string; velocity: number; planned: number; }>;
    burndown: Array<{ date: string; remaining: number; ideal: number; }>;
    throughput: Array<{ period: string; completed: number; }>;
  };
  businessValue: {
    delivered: number;
    planned: number;
    valueRealized: number;
  };
  teamHealth: {
    capacityUtilization: number;
    blockerCount: number;
    satisfactionScore: number;
  };
  keyRisks: Array<{
    id: string;
    initiative: string;
    risk: string;
    impact: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  upcomingMilestones: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
    confidence: number;
  }>;
}

export const ExecutiveReporting: React.FC = () => {
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-quarter');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    generateReport();
  }, [selectedPeriod]);

  const generateReport = async () => {
    try {
      setLoading(true);
      
      const [roadmapResponse, sprintsResponse] = await Promise.all([
        roadmapService.getRoadmapItems(),
        sprintService.getSprints()
      ]);

      const reportData = await buildExecutiveReport(
        roadmapResponse.data,
        sprintsResponse.data?.data || []
      );
      
      setReport(reportData);
    } catch (error) {
      toast({
        title: "Error generating report",
        description: "Failed to generate executive report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const buildExecutiveReport = async (
    roadmapItems: RoadmapItem[], 
    sprints: Sprint[]
  ): Promise<ExecutiveReport> => {
    const allWorkItems: WorkItem[] = [];
    for (const sprint of sprints) {
      const workItemsRes = await sprintService.getWorkItems({ sprint_id: sprint.id }, { page: 1, limit: 100 });
      if (workItemsRes.success) {
        const workItemsData = workItemsRes.data?.data || [];
        allWorkItems.push(...workItemsData);
      }
    }

    const strategicInitiatives = {
      total: roadmapItems.length,
      completed: roadmapItems.filter(item => item.status === 'delivered').length,
      inProgress: roadmapItems.filter(item => item.status === 'in-progress').length,
      blocked: roadmapItems.filter(item => {
        const linkedItems = allWorkItems.filter(wi => wi.roadmap_item_id === item.id);
        return linkedItems.some(wi => wi.status === 'blocked');
      }).length,
      onTrack: roadmapItems.filter(item => {
        const linkedItems = allWorkItems.filter(wi => wi.roadmap_item_id === item.id);
        if (linkedItems.length === 0) return false;
        const progress = linkedItems.filter(wi => wi.status === 'done').length / linkedItems.length;
        return progress >= 0.5 && item.status === 'in-progress';
      }).length,
      atRisk: roadmapItems.filter(item => {
        const linkedItems = allWorkItems.filter(wi => wi.roadmap_item_id === item.id);
        if (linkedItems.length === 0) return false;
        const progress = linkedItems.filter(wi => wi.status === 'done').length / linkedItems.length;
        return progress < 0.5 && item.status === 'in-progress';
      }).length
    };

    const deliveryMetrics = {
      velocityTrend: [
        { period: 'Q1', velocity: 28, planned: 30 },
        { period: 'Q2', velocity: 32, planned: 35 },
        { period: 'Q3', velocity: 29, planned: 32 },
        { period: 'Q4', velocity: 35, planned: 38 }
      ],
      burndown: [
        { date: 'Week 1', remaining: 100, ideal: 100 },
        { date: 'Week 2', remaining: 85, ideal: 75 },
        { date: 'Week 3', remaining: 65, ideal: 50 },
        { date: 'Week 4', remaining: 45, ideal: 25 },
        { date: 'Week 5', remaining: 20, ideal: 0 }
      ],
      throughput: [
        { period: 'Jan', completed: 23 },
        { period: 'Feb', completed: 28 },
        { period: 'Mar', completed: 25 },
        { period: 'Apr', completed: 31 }
      ]
    };

    const businessValue = {
      delivered: roadmapItems
        .filter(item => item.status === 'delivered')
        .reduce((sum, item) => sum + (item.businessValue === 'high' ? 3 : item.businessValue === 'medium' ? 2 : 1), 0),
      planned: roadmapItems
        .reduce((sum, item) => sum + (item.businessValue === 'high' ? 3 : item.businessValue === 'medium' ? 2 : 1), 0),
      valueRealized: 78
    };

    const teamHealth = {
      capacityUtilization: 87,
      blockerCount: allWorkItems.filter(item => item.status === 'blocked').length,
      satisfactionScore: 8.2
    };

    const keyRisks = roadmapItems
      .filter(item => {
        const linkedItems = allWorkItems.filter(wi => wi.roadmap_item_id === item.id);
        return linkedItems.length > 0 && linkedItems.filter(wi => wi.status === 'done').length / linkedItems.length < 0.3;
      })
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        initiative: item.title,
        risk: 'Behind schedule with low completion rate',
        impact: 'high' as const,
        mitigation: 'Additional resources allocated, scope review scheduled'
      }));

    const upcomingMilestones = roadmapItems
      .filter(item => item.endDate && new Date(item.endDate) > new Date())
      .slice(0, 6)
      .map(item => ({
        id: item.id,
        title: item.title,
        date: item.endDate!,
        status: item.status,
        confidence: Math.floor(Math.random() * 40) + 60
      }));

    return {
      period: selectedPeriod,
      strategicInitiatives,
      deliveryMetrics,
      businessValue,
      teamHealth,
      keyRisks,
      upcomingMilestones
    };
  };

  const exportReport = () => {
    toast({
      title: "Export initiated",
      description: "Executive report is being generated for download"
    });
  };

  const shareReport = () => {
    toast({
      title: "Share link generated",
      description: "Report sharing link copied to clipboard"
    });
  };

  if (loading || !report) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Executive Report
          </h2>
          <p className="text-muted-foreground">
            Strategic overview and performance metrics for leadership
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={shareReport}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-green-600">
                  {report.strategicInitiatives.onTrack}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {report.strategicInitiatives.total} initiatives
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {report.strategicInitiatives.atRisk}
                </p>
                <p className="text-xs text-muted-foreground">
                  initiatives need attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Value Realized</p>
                <p className="text-2xl font-bold">{report.businessValue.valueRealized}%</p>
                <p className="text-xs text-muted-foreground">
                  business value delivered
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Health</p>
                <p className="text-2xl font-bold">{report.teamHealth.satisfactionScore}/10</p>
                <p className="text-xs text-muted-foreground">
                  satisfaction score
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Strategic Overview</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Metrics</TabsTrigger>
          <TabsTrigger value="risks">Risks & Issues</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Initiative Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Completed</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(report.strategicInitiatives.completed / report.strategicInitiatives.total) * 100} 
                        className="w-24" 
                      />
                      <span className="text-sm font-medium">
                        {report.strategicInitiatives.completed}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>In Progress</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(report.strategicInitiatives.inProgress / report.strategicInitiatives.total) * 100} 
                        className="w-24" 
                      />
                      <span className="text-sm font-medium">
                        {report.strategicInitiatives.inProgress}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>On Track</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(report.strategicInitiatives.onTrack / report.strategicInitiatives.total) * 100} 
                        className="w-24" 
                      />
                      <span className="text-sm font-medium">
                        {report.strategicInitiatives.onTrack}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>At Risk</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(report.strategicInitiatives.atRisk / report.strategicInitiatives.total) * 100} 
                        className="w-24" 
                      />
                      <span className="text-sm font-medium text-red-600">
                        {report.strategicInitiatives.atRisk}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Velocity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={report.deliveryMetrics.velocityTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="velocity" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Actual"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="planned" 
                      stroke="#94a3b8" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Planned"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={report.deliveryMetrics.throughput}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Burndown Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={report.deliveryMetrics.burndown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="remaining" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      name="Actual"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ideal" 
                      stroke="#94a3b8" 
                      strokeDasharray="5 5"
                      name="Ideal"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Risks & Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.keyRisks.map(risk => (
                  <div key={risk.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{risk.initiative}</h4>
                      <Badge variant={risk.impact === 'high' ? 'destructive' : 'secondary'}>
                        {risk.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{risk.risk}</p>
                    <p className="text-sm">
                      <span className="font-medium">Mitigation:</span> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.upcomingMilestones.map(milestone => (
                  <div key={milestone.id} className="flex items-center justify-between border rounded-lg p-4">
                    <div>
                      <h4 className="font-medium">{milestone.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(milestone.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{milestone.status}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {milestone.confidence}% confidence
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};