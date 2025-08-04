import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'on_hold' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  health: 'healthy' | 'at_risk' | 'blocked';
  startDate: string;
  endDate: string;
  team: {
    id: string;
    name: string;
    memberCount: number;
  };
  budget: {
    allocated: number;
    spent: number;
    currency: string;
  };
  metrics: {
    velocity: number;
    burndown: number;
    completedStories: number;
    totalStories: number;
  };
  risks: string[];
  dependencies: string[];
}

interface PortfolioMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  atRiskProjects: number;
  totalBudget: number;
  spentBudget: number;
  averageProgress: number;
  teamUtilization: number;
}

export const PortfolioManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Customer Portal Redesign',
          description: 'Complete redesign of customer-facing portal with modern UI/UX',
          status: 'active',
          priority: 'high',
          progress: 75,
          health: 'healthy',
          startDate: '2024-01-01',
          endDate: '2024-03-15',
          team: {
            id: 'team-1',
            name: 'Frontend Team',
            memberCount: 6
          },
          budget: {
            allocated: 150000,
            spent: 112500,
            currency: 'USD'
          },
          metrics: {
            velocity: 28,
            burndown: 0.8,
            completedStories: 45,
            totalStories: 60
          },
          risks: ['Design approval delays'],
          dependencies: ['API v2 completion']
        },
        {
          id: '2',
          name: 'Mobile App Launch',
          description: 'Native mobile application for iOS and Android platforms',
          status: 'active',
          priority: 'critical',
          progress: 45,
          health: 'at_risk',
          startDate: '2023-11-15',
          endDate: '2024-02-28',
          team: {
            id: 'team-2',
            name: 'Mobile Team',
            memberCount: 8
          },
          budget: {
            allocated: 200000,
            spent: 140000,
            currency: 'USD'
          },
          metrics: {
            velocity: 22,
            burndown: 0.6,
            completedStories: 32,
            totalStories: 85
          },
          risks: ['App store approval timeline', 'Performance issues on older devices'],
          dependencies: ['Backend API completion', 'Design system finalization']
        },
        {
          id: '3',
          name: 'Analytics Dashboard',
          description: 'Real-time analytics and reporting dashboard for stakeholders',
          status: 'planning',
          priority: 'medium',
          progress: 15,
          health: 'healthy',
          startDate: '2024-02-01',
          endDate: '2024-05-15',
          team: {
            id: 'team-3',
            name: 'Data Team',
            memberCount: 4
          },
          budget: {
            allocated: 80000,
            spent: 12000,
            currency: 'USD'
          },
          metrics: {
            velocity: 0,
            burndown: 0,
            completedStories: 3,
            totalStories: 42
          },
          risks: [],
          dependencies: ['Data pipeline setup']
        },
        {
          id: '4',
          name: 'Security Compliance',
          description: 'SOC 2 compliance implementation and security hardening',
          status: 'active',
          priority: 'critical',
          progress: 60,
          health: 'blocked',
          startDate: '2023-12-01',
          endDate: '2024-03-31',
          team: {
            id: 'team-4',
            name: 'Security Team',
            memberCount: 3
          },
          budget: {
            allocated: 120000,
            spent: 72000,
            currency: 'USD'
          },
          metrics: {
            velocity: 15,
            burndown: 0.5,
            completedStories: 18,
            totalStories: 30
          },
          risks: ['Audit timeline delays', 'Resource constraints'],
          dependencies: ['External audit scheduling']
        }
      ];

      const mockMetrics: PortfolioMetrics = {
        totalProjects: 4,
        activeProjects: 3,
        completedProjects: 0,
        atRiskProjects: 2,
        totalBudget: 550000,
        spentBudget: 336500,
        averageProgress: 48.75,
        teamUtilization: 78
      };

      setProjects(mockProjects);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'planning': return 'secondary';
      case 'on_hold': return 'outline';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getHealthIcon = (health: Project['health']) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'at_risk': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const filteredProjects = projects.filter(project => {
    switch (selectedFilter) {
      case 'active': return project.status === 'active';
      case 'at_risk': return project.health === 'at_risk' || project.health === 'blocked';
      case 'high_priority': return project.priority === 'high' || project.priority === 'critical';
      default: return true;
    }
  });

  const calculateBudgetUtilization = (project: Project) => {
    return Math.round((project.budget.spent / project.budget.allocated) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading portfolio data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portfolio Management</h2>
          <p className="text-muted-foreground">
            Manage and monitor projects across your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="active">Active Projects</SelectItem>
              <SelectItem value="at_risk">At Risk Projects</SelectItem>
              <SelectItem value="high_priority">High Priority</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{metrics.totalProjects}</p>
                  <p className="text-sm text-muted-foreground">
                    {metrics.activeProjects} active
                  </p>
                </div>
                <Layers className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget Utilization</p>
                  <p className="text-2xl font-bold">
                    {Math.round((metrics.spentBudget / metrics.totalBudget) * 100)}%
                  </p>
                  <Progress 
                    value={(metrics.spentBudget / metrics.totalBudget) * 100} 
                    className="mt-2" 
                  />
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Progress</p>
                  <p className="text-2xl font-bold">{Math.round(metrics.averageProgress)}%</p>
                  <Progress value={metrics.averageProgress} className="mt-2" />
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                  <p className="text-2xl font-bold text-warning">{metrics.atRiskProjects}</p>
                  <p className="text-sm text-muted-foreground">Need attention</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Alerts */}
      {projects.some(p => p.health === 'at_risk' || p.health === 'blocked') && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {projects.filter(p => p.health === 'at_risk' || p.health === 'blocked').length} project(s) need immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Project Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="resources">Resource Allocation</TabsTrigger>
          <TabsTrigger value="financials">Financial Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="transition-colors hover:bg-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getHealthIcon(project.health)}
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <Badge variant={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(project.priority) as any}>
                          {project.priority} priority
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{project.description}</p>
                      
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Progress</p>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="flex-1" />
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">Budget</p>
                          <div className="flex items-center gap-2">
                            <Progress value={calculateBudgetUtilization(project)} className="flex-1" />
                            <span className="text-sm font-medium">
                              ${project.budget.spent.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">Team</p>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{project.team.name}</span>
                            <Badge variant="outline">{project.team.memberCount}</Badge>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">Timeline</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {project.risks.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Risks</p>
                          <div className="flex flex-wrap gap-2">
                            {project.risks.map((risk, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {risk}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {project.dependencies.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-2">Dependencies</p>
                          <div className="flex flex-wrap gap-2">
                            {project.dependencies.map((dependency, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                {dependency}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      Open Sprint Board
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-48">
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.team.name}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                        <span>→</span>
                        <span className="text-sm">
                          {new Date(project.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <Progress value={project.progress} />
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{project.team.name}</p>
                        <p className="text-sm text-muted-foreground">{project.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{project.team.memberCount} members</p>
                        <p className="text-sm text-muted-foreground">
                          Velocity: {project.metrics.velocity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacity Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Team Members</span>
                    <span className="font-bold">
                      {projects.reduce((sum, p) => sum + p.team.memberCount, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Utilization</span>
                    <span className="font-bold">{metrics?.teamUtilization}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Projects per Team</span>
                    <span className="font-bold">
                      {(projects.length / new Set(projects.map(p => p.team.id)).size).toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Allocated</span>
                    <span className="font-bold">${metrics?.totalBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent</span>
                    <span className="font-bold">${metrics?.spentBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining</span>
                    <span className="font-bold">
                      ${(metrics ? metrics.totalBudget - metrics.spentBudget : 0).toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={metrics ? (metrics.spentBudget / metrics.totalBudget) * 100 : 0} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Budgets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {calculateBudgetUtilization(project)}% utilized
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${project.budget.spent.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          of ${project.budget.allocated.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};