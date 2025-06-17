import { Target, TrendingUp, Users, Calendar, Package, Globe, Eye, Layers, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StrategyProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

const Strategy = ({ selectedProductId, onNavigate }: StrategyProps) => {
  // Global objectives that apply to all products
  const globalObjectives = [
    {
      title: 'Product-Led Growth Strategy',
      description: 'Achieve 40% user activation rate across all products',
      progress: 72,
      deadline: 'Q4 2024',
      owner: 'Growth Team',
      scope: 'global'
    },
    {
      title: 'Unified Customer Experience',
      description: 'Create seamless cross-product user journey',
      progress: 55,
      deadline: 'Q3 2024',
      owner: 'Product Team',
      scope: 'global'
    }
  ];

  // Product-specific objectives
  const productObjectives = [
    {
      title: 'Increase User Engagement',
      description: 'Improve daily active user retention by 25%',
      progress: 68,
      deadline: 'Q2 2024',
      owner: 'Product Team',
      scope: 'product'
    },
    {
      title: 'Feature Adoption',
      description: 'Drive 60% adoption of new AI features',
      progress: 45,
      deadline: 'Q3 2024',
      owner: 'Product Team',
      scope: 'product'
    }
  ];

  const globalMetrics = [
    { metric: 'Portfolio CAC', current: '$35', target: '$25', trend: 'improving' },
    { metric: 'Total ARR', current: '$1.2M', target: '$2M', trend: 'improving' },
    { metric: 'Cross-Product Usage', current: '23%', target: '40%', trend: 'improving' },
    { metric: 'Overall NPS', current: '45', target: '65', trend: 'stable' },
  ];

  const productMetrics = [
    { metric: 'Product CAC', current: '$45', target: '$35', trend: 'improving' },
    { metric: 'Monthly Active Users', current: '12.5K', target: '20K', trend: 'improving' },
    { metric: 'Feature Adoption Rate', current: '67%', target: '80%', trend: 'improving' },
    { metric: 'Product NPS', current: '42', target: '60', trend: 'improving' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Strategic Overview
          </h2>
          <p className="text-slate-600">
            Unified strategy across your product portfolio with Product-Led Growth focus
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => onNavigate?.('roadmap')}>
            <Calendar className="w-4 h-4 mr-2" />
            View Roadmap
          </Button>
          <Button variant="outline" onClick={() => onNavigate?.('customer')}>
            <Users className="w-4 h-4 mr-2" />
            Customer Insights
          </Button>
        </div>
      </div>

      <Tabs defaultValue="unified" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unified" className="flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Unified View</span>
            <span className="sm:hidden">Unified</span>
          </TabsTrigger>
          <TabsTrigger value="product" className="flex items-center">
            <Package className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Product Focus</span>
            <span className="sm:hidden">Product</span>
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Detailed View</span>
            <span className="sm:hidden">Details</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unified" className="space-y-6">
          {/* Vision Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Portfolio Vision
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigate?.('prd')}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Create PRD
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3">
                  "Building an ecosystem of interconnected products that scale through user-driven growth"
                </h3>
                <p className="text-slate-600 text-sm sm:text-base">
                  We create a portfolio of products that work together seamlessly, where each product drives growth for the others through natural user progression and cross-product value creation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* PLG Strategy Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-emerald-600" />
                Product-Led Growth Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-emerald-900 mb-2">Acquisition</h4>
                  <p className="text-emerald-700 text-sm">Self-service onboarding with immediate value demonstration</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Activation</h4>
                  <p className="text-blue-700 text-sm">Guide users to core value within first session</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Expansion</h4>
                  <p className="text-purple-700 text-sm">Natural progression across product suite</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* High-level metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                  Portfolio KPIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {globalMetrics.map((kpi, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-slate-900 text-sm sm:text-base">{kpi.metric}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          kpi.trend === 'improving' ? 'bg-emerald-100 text-emerald-700' :
                          kpi.trend === 'declining' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {kpi.trend}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-bold text-slate-900">{kpi.current}</span>
                          <span className="text-slate-500 text-sm ml-2">current</span>
                        </div>
                        <div>
                          <span className="text-purple-600 font-semibold">{kpi.target}</span>
                          <span className="text-slate-500 text-sm ml-2">target</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Global Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {globalObjectives.map((objective, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-900 text-sm sm:text-base">{objective.title}</h4>
                        <span className="text-xs sm:text-sm text-slate-500">{objective.deadline}</span>
                      </div>
                      <p className="text-slate-600 text-xs sm:text-sm mb-3">{objective.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${objective.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-slate-700">{objective.progress}%</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Owner: {objective.owner}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="product" className="space-y-6">
          {/* Product-specific view with both product and global objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-600" />
                  Product Strategy: {selectedProductId === 'main' ? 'Main Product' : 'Beta Product'}
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigate?.('sprints')}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Sprints
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3">
                  "Empowering teams to build better products through unified collaboration and data-driven insights"
                </h3>
                <p className="text-slate-600 text-sm sm:text-base">
                  We envision a world where product teams can seamlessly collaborate, make informed decisions based on real user data, and deliver exceptional experiences that drive business growth and customer satisfaction.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Product objectives content */}
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-medium text-blue-900">Increase User Engagement</h4>
                    <p className="text-blue-700 text-sm">Improve daily active user retention by 25%</p>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { metric: 'Product CAC', current: '$45', target: '$35' },
                    { metric: 'Monthly Active Users', current: '12.5K', target: '20K' },
                  ].map((metric, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">{metric.current}</div>
                        <div className="text-xs text-slate-500">Target: {metric.target}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Strategic Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                This view provides comprehensive details about all strategic initiatives, detailed metrics, and cross-product dependencies.
              </p>
              <div className="flex space-x-4">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Explore Detailed Analytics
                </Button>
                <Button variant="outline" onClick={() => onNavigate?.('roadmap')}>
                  Strategic Roadmap
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Strategy;
