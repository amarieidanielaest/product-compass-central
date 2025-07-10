import React, { useState } from 'react';
import { DollarSign, Users, Calendar, TrendingUp, Calculator, ArrowUpDown, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ResourceAllocation {
  id: string;
  name: string;
  type: 'strategic' | 'initiative' | 'epic';
  allocatedBudget: number;
  spentBudget: number;
  allocatedFTEs: number;
  timeframe: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'planned' | 'completed';
  expectedROI: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ScenarioModel {
  id: string;
  name: string;
  description: string;
  allocations: Array<{
    resourceId: string;
    budgetChange: number;
    fteChange: number;
    impactOnTimeline: number;
    impactOnROI: number;
  }>;
  totalBudgetChange: number;
  totalFTEChange: number;
  projectedImpact: string;
}

interface ResourceManagementProps {
  allocations?: ResourceAllocation[];
  onAllocationUpdate?: (allocations: ResourceAllocation[]) => void;
}

const ResourceManagement = ({ allocations: propAllocations, onAllocationUpdate }: ResourceManagementProps) => {
  const [allocations, setAllocations] = useState<ResourceAllocation[]>(propAllocations || [
    {
      id: 'res-001',
      name: 'AI Copilot Development',
      type: 'strategic',
      allocatedBudget: 2500000,
      spentBudget: 850000,
      allocatedFTEs: 12,
      timeframe: 'Q1-Q4 2024',
      priority: 'high',
      status: 'active',
      expectedROI: 350,
      riskLevel: 'medium'
    },
    {
      id: 'res-002',
      name: 'Enterprise Security Enhancement',
      type: 'initiative',
      allocatedBudget: 800000,
      spentBudget: 320000,
      allocatedFTEs: 6,
      timeframe: 'Q2-Q3 2024',
      priority: 'high',
      status: 'active',
      expectedROI: 180,
      riskLevel: 'low'
    },
    {
      id: 'res-003',
      name: 'Mobile App Redesign',
      type: 'initiative',
      allocatedBudget: 450000,
      spentBudget: 180000,
      allocatedFTEs: 4,
      timeframe: 'Q3 2024',
      priority: 'medium',
      status: 'active',
      expectedROI: 220,
      riskLevel: 'low'
    },
    {
      id: 'res-004',
      name: 'International Expansion Platform',
      type: 'strategic',
      allocatedBudget: 1200000,
      spentBudget: 0,
      allocatedFTEs: 8,
      timeframe: 'Q4 2024-Q2 2025',
      priority: 'medium',
      status: 'planned',
      expectedROI: 280,
      riskLevel: 'high'
    }
  ]);

  const [scenarios, setScenarios] = useState<ScenarioModel[]>([
    {
      id: 'scenario-001',
      name: 'Accelerate AI Development',
      description: 'Increase AI Copilot budget by 30% and add 3 FTEs to accelerate delivery',
      allocations: [
        {
          resourceId: 'res-001',
          budgetChange: 750000,
          fteChange: 3,
          impactOnTimeline: -8,
          impactOnROI: 15
        }
      ],
      totalBudgetChange: 750000,
      totalFTEChange: 3,
      projectedImpact: 'Deliver AI features 8 weeks earlier, increase ROI by 15%'
    },
    {
      id: 'scenario-002',
      name: 'Delay International Expansion',
      description: 'Postpone international expansion and reallocate resources to core platform',
      allocations: [
        {
          resourceId: 'res-004',
          budgetChange: -600000,
          fteChange: -4,
          impactOnTimeline: 12,
          impactOnROI: -10
        },
        {
          resourceId: 'res-001',
          budgetChange: 400000,
          fteChange: 2,
          impactOnTimeline: -4,
          impactOnROI: 8
        }
      ],
      totalBudgetChange: -200000,
      totalFTEChange: -2,
      projectedImpact: 'Focus on core platform strength, delay international revenue'
    }
  ]);

  const [showScenarioDialog, setShowScenarioDialog] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const totalBudget = allocations.reduce((sum, a) => sum + a.allocatedBudget, 0);
  const totalSpent = allocations.reduce((sum, a) => sum + a.spentBudget, 0);
  const totalFTEs = allocations.reduce((sum, a) => sum + a.allocatedFTEs, 0);
  const avgROI = allocations.reduce((sum, a) => sum + a.expectedROI, 0) / allocations.length;

  const getBudgetUtilization = (allocation: ResourceAllocation) => {
    return (allocation.spentBudget / allocation.allocatedBudget) * 100;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const budgetData = allocations.map(a => ({
    name: a.name.substring(0, 15) + '...',
    allocated: a.allocatedBudget / 1000,
    spent: a.spentBudget / 1000,
    remaining: (a.allocatedBudget - a.spentBudget) / 1000
  }));

  const roiProjection = [
    { quarter: 'Q1 2024', expectedROI: 180, actualROI: 165 },
    { quarter: 'Q2 2024', expectedROI: 220, actualROI: 210 },
    { quarter: 'Q3 2024', expectedROI: 260, actualROI: null },
    { quarter: 'Q4 2024', expectedROI: 310, actualROI: null }
  ];

  const renderBudgetAllocation = () => (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(totalBudget / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(totalSpent / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total FTEs</p>
                <p className="text-2xl font-bold text-gray-900">{totalFTEs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calculator className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Expected ROI</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(avgROI)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Allocation Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Allocation by Initiative</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}k`} />
                <Tooltip formatter={(value) => [`$${value}k`, '']} />
                <Bar dataKey="allocated" fill="#3B82F6" name="Allocated" />
                <Bar dataKey="spent" fill="#10B981" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Allocations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Resource Allocations</h3>
        {allocations.map(allocation => (
          <Card key={allocation.id} className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{allocation.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getPriorityColor(allocation.priority)}>
                      {allocation.priority} priority
                    </Badge>
                    <Badge className={getRiskColor(allocation.riskLevel)}>
                      {allocation.riskLevel} risk
                    </Badge>
                    <Badge variant="outline">{allocation.timeframe}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {allocation.expectedROI}% ROI
                  </div>
                  <div className="text-sm text-gray-500">{allocation.allocatedFTEs} FTEs</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">Allocated Budget</div>
                  <div className="text-xl font-bold text-blue-900">
                    ${(allocation.allocatedBudget / 1000).toLocaleString()}k
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600">Spent</div>
                  <div className="text-xl font-bold text-green-900">
                    ${(allocation.spentBudget / 1000).toLocaleString()}k
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600">Utilization</div>
                  <div className="text-xl font-bold text-purple-900">
                    {getBudgetUtilization(allocation).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Budget Utilization Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Budget Utilization</span>
                  <span>{getBudgetUtilization(allocation).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${getBudgetUtilization(allocation)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderScenarioPlanning = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Scenario Planning</h3>
          <p className="text-gray-600">Model different resource allocation scenarios</p>
        </div>
        <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
          <DialogTrigger asChild>
            <Button>
              <Calculator className="w-4 h-4 mr-2" />
              Create Scenario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Scenario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Scenario planning functionality would allow modeling of different resource allocation options.
              </p>
              <Button onClick={() => setShowScenarioDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ROI Projection */}
      <Card>
        <CardHeader>
          <CardTitle>ROI Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roiProjection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="expectedROI" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Expected ROI"
                />
                <Line 
                  type="monotone" 
                  dataKey="actualROI" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Actual ROI"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scenarios.map(scenario => (
          <Card key={scenario.id} className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{scenario.name}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedScenario(selectedScenario === scenario.id ? null : scenario.id)}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Run
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{scenario.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Budget Impact</span>
                  <span className={`font-medium ${scenario.totalBudgetChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {scenario.totalBudgetChange >= 0 ? '+' : ''}${(scenario.totalBudgetChange / 1000).toLocaleString()}k
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">FTE Impact</span>
                  <span className={`font-medium ${scenario.totalFTEChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {scenario.totalFTEChange >= 0 ? '+' : ''}{scenario.totalFTEChange} FTEs
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mt-4">
                  <div className="text-sm text-gray-600">Projected Impact</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {scenario.projectedImpact}
                  </div>
                </div>
              </div>

              {selectedScenario === scenario.id && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700 font-medium">Scenario Active</div>
                  <div className="text-sm text-blue-600 mt-1">
                    This scenario is currently being modeled. Actual implementation would require approval.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Strategic Resource Management</h2>
          <p className="text-gray-600 mt-1">Budget allocation, team capacity, and scenario planning</p>
        </div>
      </div>

      <Tabs defaultValue="budget" className="w-full">
        <TabsList>
          <TabsTrigger value="budget" className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Budget Allocation
          </TabsTrigger>
          <TabsTrigger value="capacity" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Team Capacity
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Scenario Planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budget">
          {renderBudgetAllocation()}
        </TabsContent>

        <TabsContent value="capacity">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Team Capacity Planning</h3>
                <p className="text-gray-600">
                  Visualize team allocation and capacity across all strategic initiatives
                </p>
                <Button className="mt-4">
                  Build Capacity View
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios">
          {renderScenarioPlanning()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceManagement;