import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Target, TrendingUp, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { portfolioManagementService } from '@/services/strategy/PortfolioManagementService';
import { okrManagementService } from '@/services/strategy/OKRManagementService';

interface StrategicDashboardProps {
  organizationId: string;
}

export const StrategicDashboard: React.FC<StrategicDashboardProps> = ({ organizationId }) => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [okrAlignment, setOkrAlignment] = useState<any>(null);
  const [resourceCapacity, setResourceCapacity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [portfolioData, alignmentData, capacityData] = await Promise.all([
          portfolioManagementService.getPortfolio(organizationId),
          okrManagementService.getOKRAlignment(organizationId),
          portfolioManagementService.getResourceCapacity(organizationId)
        ]);

        setPortfolio(portfolioData);
        setOkrAlignment(alignmentData);
        setResourceCapacity(capacityData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading strategic dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(portfolio?.healthScore || 0)}%</div>
            <Progress value={portfolio?.healthScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Initiatives</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio?.totals.activeItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              {portfolio?.totals.completedItems || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OKR Alignment</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(okrAlignment?.alignmentScore || 0)}%</div>
            <p className="text-xs text-muted-foreground">
              {okrAlignment?.alignedObjectives || 0} of {okrAlignment?.totalObjectives || 0} aligned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((resourceCapacity?.allocatedCapacity / resourceCapacity?.totalCapacity * 100) || 0)}%
            </div>
            <Progress 
              value={(resourceCapacity?.allocatedCapacity / resourceCapacity?.totalCapacity * 100) || 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="okrs">OKRs</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>Current initiatives and their progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio?.items.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                        <Badge variant={item.priority === 'high' ? 'destructive' : 'outline'}>
                          {item.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium">{Math.round(item.metrics.progress)}%</div>
                      <Progress value={item.metrics.progress} className="w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="okrs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OKR Alignment Analysis</CardTitle>
              <CardDescription>Strategic alignment across the organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Objectives</span>
                    <Badge>{okrAlignment?.totalObjectives || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Aligned Objectives</span>
                    <Badge variant="outline">{okrAlignment?.alignedObjectives || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cascading Levels</span>
                    <Badge variant="secondary">{okrAlignment?.cascadingLevels || 0}</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Alignment Gaps</h4>
                  {okrAlignment?.gaps.map((gap: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        gap.impact === 'high' ? 'text-destructive' : 
                        gap.impact === 'medium' ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <div>
                        <div className="font-medium text-sm">{gap.level}</div>
                        <div className="text-xs text-muted-foreground">{gap.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Capacity</CardTitle>
              <CardDescription>Team capacity and allocation overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{resourceCapacity?.totalCapacity || 0}h</div>
                    <div className="text-sm text-muted-foreground">Total Capacity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{resourceCapacity?.allocatedCapacity || 0}h</div>
                    <div className="text-sm text-muted-foreground">Allocated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{resourceCapacity?.availableCapacity || 0}h</div>
                    <div className="text-sm text-muted-foreground">Available</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Team Breakdown</h4>
                  {resourceCapacity?.teams.map((team: any) => (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(team.efficiency * 100)}% efficiency
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {team.allocated}h / {team.capacity}h
                        </div>
                        <Progress 
                          value={(team.allocated / team.capacity) * 100} 
                          className="w-24 mt-1" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Insights</CardTitle>
              <CardDescription>AI-powered recommendations and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Positive Trend</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Portfolio health has improved by 15% over the last quarter, with strong execution on high-priority initiatives.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Attention Needed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Resource allocation shows potential bottlenecks in Q4. Consider rebalancing team priorities.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Recommendation</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Focus on improving OKR alignment at the tactical level to enhance strategic execution.
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