import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, Target, GitBranch, Layers, Users, DollarSign, AlertTriangle, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const StrategicAnalyticsDashboard = ({ isOpen, onClose }: AnalyticsDashboardProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Q4 2024');
  const [selectedView, setSelectedView] = useState('overview');

  // Sample analytics data
  const strategicMetrics = {
    totalObjectives: 12,
    activeOKRs: 28,
    completedInitiatives: 15,
    averageAlignment: 87,
    portfolioHealth: 92,
    riskAlerts: 3
  };

  const progressData = [
    { month: 'Jan', objectives: 85, okrs: 72, initiatives: 68 },
    { month: 'Feb', objectives: 87, okrs: 75, initiatives: 71 },
    { month: 'Mar', objectives: 89, okrs: 78, initiatives: 75 },
    { month: 'Apr', objectives: 91, okrs: 81, initiatives: 78 },
    { month: 'May', objectives: 88, okrs: 83, initiatives: 82 },
    { month: 'Jun', objectives: 92, okrs: 85, initiatives: 85 }
  ];

  const alignmentData = [
    { quarter: 'Q1', strategic: 82, tactical: 75, operational: 88 },
    { quarter: 'Q2', strategic: 85, tactical: 78, operational: 91 },
    { quarter: 'Q3', strategic: 88, tactical: 82, operational: 89 },
    { quarter: 'Q4', strategic: 91, tactical: 85, operational: 92 }
  ];

  const investmentByPillar = [
    { pillar: 'Market Expansion', investment: 2800000, roi: 245, count: 8 },
    { pillar: 'Innovation', investment: 2200000, roi: 180, count: 6 },
    { pillar: 'Operational Excellence', investment: 1500000, roi: 320, count: 4 },
    { pillar: 'Customer Delight', investment: 1800000, roi: 280, count: 5 }
  ];

  const riskDistribution = [
    { risk: 'Low', count: 18, color: '#10B981' },
    { risk: 'Medium', count: 8, color: '#F59E0B' },
    { risk: 'High', count: 3, color: '#EF4444' }
  ];

  const velocityData = [
    { quarter: 'Q1 2023', planned: 12, delivered: 10, velocity: 83 },
    { quarter: 'Q2 2023', planned: 15, delivered: 14, velocity: 93 },
    { quarter: 'Q3 2023', planned: 18, delivered: 16, velocity: 89 },
    { quarter: 'Q4 2023', planned: 20, delivered: 18, velocity: 90 },
    { quarter: 'Q1 2024', planned: 16, delivered: 15, velocity: 94 },
    { quarter: 'Q2 2024', planned: 22, delivered: 20, velocity: 91 }
  ];

  const renderOverviewAnalytics = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Objectives</p>
                <p className="text-lg font-bold">{strategicMetrics.totalObjectives}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Active OKRs</p>
                <p className="text-lg font-bold">{strategicMetrics.activeOKRs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Initiatives</p>
                <p className="text-lg font-bold">{strategicMetrics.completedInitiatives}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Alignment</p>
                <p className="text-lg font-bold">{strategicMetrics.averageAlignment}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-600">Health</p>
                <p className="text-lg font-bold">{strategicMetrics.portfolioHealth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Risk Alerts</p>
                <p className="text-lg font-bold">{strategicMetrics.riskAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Progress Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="objectives" stroke="#8B5CF6" strokeWidth={2} name="Objectives" />
                <Line type="monotone" dataKey="okrs" stroke="#3B82F6" strokeWidth={2} name="OKRs" />
                <Line type="monotone" dataKey="initiatives" stroke="#10B981" strokeWidth={2} name="Initiatives" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Alignment */}
        <Card>
          <CardHeader>
            <CardTitle>Strategic Alignment by Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alignmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="strategic" fill="#8B5CF6" name="Strategic" />
                  <Bar dataKey="tactical" fill="#3B82F6" name="Tactical" />
                  <Bar dataKey="operational" fill="#10B981" name="Operational" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    dataKey="count"
                    nameKey="risk"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ risk, count }) => `${risk}: ${count}`}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderInvestmentAnalytics = () => (
    <div className="space-y-6">
      {/* Investment by Strategic Pillar */}
      <Card>
        <CardHeader>
          <CardTitle>Investment vs ROI by Strategic Pillar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={investmentByPillar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="investment" 
                  domain={[0, 3000000]}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  label={{ value: 'Investment ($M)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  dataKey="roi" 
                  label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ payload }) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{data.pillar}</p>
                          <p className="text-sm">Investment: ${(data.investment / 1000000).toFixed(1)}M</p>
                          <p className="text-sm">ROI: {data.roi}%</p>
                          <p className="text-sm">Initiatives: {data.count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter>
                  {investmentByPillar.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][index]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Investment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {investmentByPillar.map((pillar, index) => (
          <Card key={pillar.pillar}>
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">{pillar.pillar}</h4>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-blue-600">
                    ${(pillar.investment / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">
                    {pillar.roi}% ROI
                  </div>
                  <div className="text-xs text-gray-500">
                    {pillar.count} initiatives
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderVelocityAnalytics = () => (
    <div className="space-y-6">
      {/* Delivery Velocity */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Delivery Velocity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="planned" fill="#94A3B8" name="Planned" />
                <Bar dataKey="delivered" fill="#10B981" name="Delivered" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Velocity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Average Velocity</h3>
              <div className="text-2xl font-bold text-green-600 mt-2">89%</div>
              <p className="text-sm text-gray-600 mt-1">Last 6 quarters</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">On-Time Delivery</h3>
              <div className="text-2xl font-bold text-blue-600 mt-2">92%</div>
              <p className="text-sm text-gray-600 mt-1">Q4 2024</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Cycle Time</h3>
              <div className="text-2xl font-bold text-purple-600 mt-2">8.2</div>
              <p className="text-sm text-gray-600 mt-1">weeks average</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Strategic Analytics Dashboard</DialogTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                  <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                  <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                  <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                  <SelectItem value="2024">2024 Full Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filters
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
            <TabsTrigger value="velocity">Velocity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {renderOverviewAnalytics()}
          </TabsContent>

          <TabsContent value="investment" className="mt-6">
            {renderInvestmentAnalytics()}
          </TabsContent>

          <TabsContent value="velocity" className="mt-6">
            {renderVelocityAnalytics()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StrategicAnalyticsDashboard;