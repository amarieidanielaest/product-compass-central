import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Activity
} from 'lucide-react';

interface PortfolioMetrics {
  totalInitiatives: number;
  completedInitiatives: number;
  inProgressInitiatives: number;
  plannedInitiatives: number;
  atRiskInitiatives: number;
  totalWorkItems: number;
  completedWorkItems: number;
  overallProgress: number;
  velocityTrend: Array<{ period: string; velocity: number; }>;
  initiativesByStatus: Array<{ name: string; value: number; color: string; }>;
  teamPerformance: Array<{ team: string; completion: number; velocity: number; }>;
}

export const PortfolioHealthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const [roadmapResponse, sprintsResponse] = await Promise.all([
        roadmapService.getRoadmapItems(),
        sprintService.getSprints()
      ]);

      if (roadmapResponse.success) {
        setRoadmapItems(roadmapResponse.data);
      }
      if (sprintsResponse.success) {
        const sprintsData = sprintsResponse.data?.data || [];
        setSprints(sprintsData);
        
        // Load work items for all sprints
        const allWorkItems: WorkItem[] = [];
        for (const sprint of sprintsData) {
          const workItemsRes = await sprintService.getWorkItems({ sprint_id: sprint.id }, { page: 1, limit: 100 });
          if (workItemsRes.success) {
            const workItemsData = workItemsRes.data?.data || [];
            allWorkItems.push(...workItemsData);
          }
        }
        setWorkItems(allWorkItems);
        calculateMetrics(roadmapResponse.data, sprintsData, allWorkItems);
      }
    } catch (error) {
      toast({
        title: "Error loading portfolio data",
        description: "Failed to load portfolio metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (roadmapData: RoadmapItem[], sprintData: Sprint[], workItemData: WorkItem[]) => {
    const totalInitiatives = roadmapData.length;
    const completedInitiatives = roadmapData.filter(item => item.status === 'delivered').length;
    const inProgressInitiatives = roadmapData.filter(item => item.status === 'in-progress').length;
    const plannedInitiatives = roadmapData.filter(item => item.status === 'planned').length;
    
    // Calculate at-risk initiatives
    const atRiskInitiatives = roadmapData.filter(roadmapItem => {
      const linkedItems = workItemData.filter(wi => wi.roadmap_item_id === roadmapItem.id);
      if (linkedItems.length === 0) return false;
      const progress = linkedItems.filter(wi => wi.status === 'done').length / linkedItems.length;
      return progress < 0.5 && roadmapItem.status === 'in-progress';
    }).length;

    const totalWorkItems = workItemData.length;
    const completedWorkItems = workItemData.filter(item => item.status === 'done').length;
    const overallProgress = totalWorkItems > 0 ? Math.round((completedWorkItems / totalWorkItems) * 100) : 0;

    const velocityTrend = [
      { period: 'Sprint 1', velocity: 23 },
      { period: 'Sprint 2', velocity: 28 },
      { period: 'Sprint 3', velocity: 25 },
      { period: 'Sprint 4', velocity: 31 },
      { period: 'Sprint 5', velocity: 29 },
    ];

    const initiativesByStatus = [
      { name: 'Completed', value: completedInitiatives, color: '#22c55e' },
      { name: 'In Progress', value: inProgressInitiatives, color: '#f59e0b' },
      { name: 'Planned', value: plannedInitiatives, color: '#3b82f6' },
      { name: 'At Risk', value: atRiskInitiatives, color: '#ef4444' },
    ];

    const teamPerformance = [
      { team: 'Frontend Team', completion: 85, velocity: 28 },
      { team: 'Backend Team', completion: 78, velocity: 32 },
      { team: 'DevOps Team', completion: 92, velocity: 15 },
      { team: 'Design Team', completion: 88, velocity: 22 },
    ];

    setMetrics({
      totalInitiatives,
      completedInitiatives,
      inProgressInitiatives,
      plannedInitiatives,
      atRiskInitiatives,
      totalWorkItems,
      completedWorkItems,
      overallProgress,
      velocityTrend,
      initiativesByStatus,
      teamPerformance
    });
  };

  if (loading || !metrics) {
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
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Portfolio Health Dashboard
        </h2>
        <p className="text-muted-foreground">
          Strategic overview of all initiatives and team performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Initiatives</p>
                <p className="text-2xl font-bold">{metrics.totalInitiatives}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{metrics.overallProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-red-500">{metrics.atRiskInitiatives}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Work Items</p>
                <p className="text-2xl font-bold">{metrics.completedWorkItems}/{metrics.totalWorkItems}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Initiative Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.initiativesByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {metrics.initiativesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Completion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.teamPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completion" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="initiatives" className="space-y-4">
          <div className="grid gap-4">
            {roadmapItems.map(item => {
              const linkedWorkItems = workItems.filter(wi => wi.roadmap_item_id === item.id);
              const progress = linkedWorkItems.length > 0 
                ? Math.round((linkedWorkItems.filter(wi => wi.status === 'done').length / linkedWorkItems.length) * 100)
                : 0;
              
              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Badge variant={item.status === 'delivered' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} />
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{linkedWorkItems.length} work items</span>
                        <span>Priority: {item.priority}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.teamPerformance.map(team => (
                  <div key={team.team} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{team.team}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Completion: {team.completion}%</span>
                        <span>Velocity: {team.velocity}</span>
                      </div>
                    </div>
                    <Progress value={team.completion} />
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