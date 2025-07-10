import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Filter, Download, RefreshCw, AlertTriangle, DollarSign, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PortfolioProduct {
  id: string;
  name: string;
  lifecycle: 'Innovation' | 'Growth' | 'Mature' | 'Sunset';
  investment: number;
  roi: number;
  strategicAlignment: number;
  healthScore: number;
  revenue: number;
  users: number;
  businessUnit: string;
  riskLevel: 'low' | 'medium' | 'high';
  dependencies: string[];
}

interface PortfolioHealthDashboardProps {
  products?: PortfolioProduct[];
  filters?: {
    businessUnit?: string;
    lifecycle?: string;
    riskLevel?: string;
  };
}

const PortfolioHealthDashboard = ({ products: propProducts, filters }: PortfolioHealthDashboardProps) => {
  const [activeFilters, setActiveFilters] = useState(filters || {});
  const [selectedView, setSelectedView] = useState('overview');

  const products: PortfolioProduct[] = propProducts || [
    {
      id: 'prod-001',
      name: 'Core Platform',
      lifecycle: 'Mature',
      investment: 2500000,
      roi: 325,
      strategicAlignment: 95,
      healthScore: 88,
      revenue: 8125000,
      users: 15000,
      businessUnit: 'Platform',
      riskLevel: 'low',
      dependencies: ['prod-002', 'prod-003']
    },
    {
      id: 'prod-002',
      name: 'AI Copilot',
      lifecycle: 'Innovation',
      investment: 1800000,
      roi: 145,
      strategicAlignment: 92,
      healthScore: 72,
      revenue: 2610000,
      users: 3200,
      businessUnit: 'AI/ML',
      riskLevel: 'medium',
      dependencies: ['prod-001']
    },
    {
      id: 'prod-003',
      name: 'Mobile App',
      lifecycle: 'Growth',
      investment: 1200000,
      roi: 280,
      strategicAlignment: 78,
      healthScore: 85,
      revenue: 3360000,
      users: 8500,
      businessUnit: 'Mobile',
      riskLevel: 'low',
      dependencies: ['prod-001']
    },
    {
      id: 'prod-004',
      name: 'Legacy Analytics',
      lifecycle: 'Sunset',
      investment: 400000,
      roi: 120,
      strategicAlignment: 45,
      healthScore: 52,
      revenue: 480000,
      users: 1200,
      businessUnit: 'Analytics',
      riskLevel: 'high',
      dependencies: []
    },
    {
      id: 'prod-005',
      name: 'Enterprise API',
      lifecycle: 'Growth',
      investment: 900000,
      roi: 380,
      strategicAlignment: 88,
      healthScore: 91,
      revenue: 3420000,
      users: 850,
      businessUnit: 'Platform',
      riskLevel: 'low',
      dependencies: ['prod-001']
    }
  ];

  const filteredProducts = products.filter(product => {
    if (activeFilters.businessUnit && product.businessUnit !== activeFilters.businessUnit) return false;
    if (activeFilters.lifecycle && product.lifecycle !== activeFilters.lifecycle) return false;
    if (activeFilters.riskLevel && product.riskLevel !== activeFilters.riskLevel) return false;
    return true;
  });

  const getLifecycleColor = (lifecycle: string) => {
    switch (lifecycle) {
      case 'Innovation': return '#8B5CF6';
      case 'Growth': return '#10B981';
      case 'Mature': return '#3B82F6';
      case 'Sunset': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const portfolioMetrics = {
    totalInvestment: filteredProducts.reduce((sum, p) => sum + p.investment, 0),
    totalRevenue: filteredProducts.reduce((sum, p) => sum + p.revenue, 0),
    avgHealthScore: Math.round(filteredProducts.reduce((sum, p) => sum + p.healthScore, 0) / filteredProducts.length),
    avgAlignment: Math.round(filteredProducts.reduce((sum, p) => sum + p.strategicAlignment, 0) / filteredProducts.length)
  };

  const investmentByLifecycle = [
    { lifecycle: 'Innovation', investment: products.filter(p => p.lifecycle === 'Innovation').reduce((sum, p) => sum + p.investment, 0) },
    { lifecycle: 'Growth', investment: products.filter(p => p.lifecycle === 'Growth').reduce((sum, p) => sum + p.investment, 0) },
    { lifecycle: 'Mature', investment: products.filter(p => p.lifecycle === 'Mature').reduce((sum, p) => sum + p.investment, 0) },
    { lifecycle: 'Sunset', investment: products.filter(p => p.lifecycle === 'Sunset').reduce((sum, p) => sum + p.investment, 0) }
  ];

  const riskDistribution = [
    { risk: 'Low', count: products.filter(p => p.riskLevel === 'low').length, color: '#10B981' },
    { risk: 'Medium', count: products.filter(p => p.riskLevel === 'medium').length, color: '#F59E0B' },
    { risk: 'High', count: products.filter(p => p.riskLevel === 'high').length, color: '#EF4444' }
  ];

  const renderOverviewView = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Investment</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(portfolioMetrics.totalInvestment / 1000000).toFixed(1)}M
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
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(portfolioMetrics.totalRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Health Score</p>
                <p className="text-2xl font-bold text-gray-900">{portfolioMetrics.avgHealthScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Alignment</p>
                <p className="text-2xl font-bold text-gray-900">{portfolioMetrics.avgAlignment}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment vs Strategy Bubble Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Investment vs Strategic Alignment vs ROI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={filteredProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="strategicAlignment" 
                  domain={[0, 100]}
                  label={{ value: 'Strategic Alignment (%)', position: 'insideBottom', offset: -10 }}
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
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm">Strategic Alignment: {data.strategicAlignment}%</p>
                          <p className="text-sm">ROI: {data.roi}%</p>
                          <p className="text-sm">Investment: ${(data.investment / 1000000).toFixed(1)}M</p>
                          <p className="text-sm">Lifecycle: {data.lifecycle}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter>
                  {filteredProducts.map((product) => (
                    <Cell 
                      key={product.id} 
                      fill={getLifecycleColor(product.lifecycle)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            {['Innovation', 'Growth', 'Mature', 'Sunset'].map(lifecycle => (
              <div key={lifecycle} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getLifecycleColor(lifecycle) }}
                />
                <span className="text-sm text-gray-600">{lifecycle}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment by Lifecycle */}
        <Card>
          <CardHeader>
            <CardTitle>Investment by Product Lifecycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={investmentByLifecycle}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="lifecycle" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => [`$${(value / 1000000).toFixed(1)}M`, 'Investment']} />
                  <Bar dataKey="investment">
                    {investmentByLifecycle.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getLifecycleColor(entry.lifecycle)} />
                    ))}
                  </Bar>
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

  const renderHealthHeatmap = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.map(product => (
          <Card key={product.id} className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge style={{ backgroundColor: getLifecycleColor(product.lifecycle), color: 'white' }}>
                        {product.lifecycle}
                      </Badge>
                      <Badge variant="outline">{product.businessUnit}</Badge>
                      <Badge 
                        className={product.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 
                                  product.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-green-100 text-green-700'}
                      >
                        {product.riskLevel} risk
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{product.healthScore}%</div>
                  <div className="text-sm text-gray-500">Health Score</div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600">Revenue</div>
                  <div className="text-lg font-semibold text-blue-900">
                    ${(product.revenue / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-600">ROI</div>
                  <div className="text-lg font-semibold text-green-900">{product.roi}%</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-sm text-purple-600">Alignment</div>
                  <div className="text-lg font-semibold text-purple-900">{product.strategicAlignment}%</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm text-orange-600">Users</div>
                  <div className="text-lg font-semibold text-orange-900">
                    {product.users.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Health Score Breakdown */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Health</span>
                  <span>{product.healthScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      product.healthScore >= 80 ? 'bg-green-500' :
                      product.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${product.healthScore}%` }}
                  />
                </div>
              </div>
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
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Health Dashboard</h2>
          <p className="text-gray-600 mt-1">Real-time view of product portfolio performance and health</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={activeFilters.businessUnit || 'all'} onValueChange={(value) => 
            setActiveFilters(prev => ({ ...prev, businessUnit: value === 'all' ? undefined : value }))
          }>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Business Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              <SelectItem value="Platform">Platform</SelectItem>
              <SelectItem value="AI/ML">AI/ML</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
              <SelectItem value="Analytics">Analytics</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="health">Health Heatmap</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewView()}
        </TabsContent>

        <TabsContent value="health">
          {renderHealthHeatmap()}
        </TabsContent>

        <TabsContent value="dependencies">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Dependency Mapping</h3>
                <p className="text-gray-600">
                  Visualize cross-product dependencies and identify potential risks
                </p>
                <Button className="mt-4">
                  Build Dependency Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioHealthDashboard;