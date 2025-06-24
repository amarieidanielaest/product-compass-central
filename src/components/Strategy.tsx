
import { Target, TrendingUp, Users, Calendar, Package, Globe, Eye, Layers, ExternalLink, Brain, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OKRAlignmentWidget from './widgets/OKRAlignmentWidget';

interface StrategyProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

const Strategy = ({ selectedProductId, onNavigate }: StrategyProps) => {
  // Strategic initiatives with OKR linkage
  const strategicInitiatives = [
    {
      id: 'si-001',
      title: 'Product-Led Growth Expansion',
      description: 'Scale self-service adoption across enterprise and SMB segments',
      progress: 72,
      deadline: 'Q4 2024',
      owner: 'Growth Team',
      linkedOKRs: ['okr-001', 'okr-002'],
      linkedDeliverables: 5,
      status: 'on-track',
      aiInsights: 'Strong momentum in user activation metrics'
    },
    {
      id: 'si-002', 
      title: 'Unified Customer Experience',
      description: 'Create seamless cross-product user journey with AI assistance',
      progress: 55,
      deadline: 'Q3 2024',
      owner: 'Product Team',
      linkedOKRs: ['okr-003'],
      linkedDeliverables: 8,
      status: 'needs-attention',
      aiInsights: 'Integration complexity higher than estimated'
    }
  ];

  // Delivery roadmap items linked to strategic initiatives
  const deliveryItems = [
    {
      id: 'del-001',
      title: 'Self-Service Onboarding v2',
      quarter: 'Q2 2024',
      status: 'in-progress',
      linkedStrategic: 'si-001',
      effort: '3 sprints',
      businessValue: 'high'
    },
    {
      id: 'del-002',  
      title: 'Cross-Product Navigation',
      quarter: 'Q3 2024',
      status: 'planned',
      linkedStrategic: 'si-002',
      effort: '2 sprints', 
      businessValue: 'medium'
    }
  ];

  const portfolioMetrics = [
    { metric: 'Strategic Alignment', current: '89%', target: '95%', trend: 'improving' },
    { metric: 'OKR Progress', current: '67%', target: '80%', trend: 'improving' },
    { metric: 'Initiative Velocity', current: '1.2x', target: '1.5x', trend: 'stable' },
    { metric: 'Cross-Product Synergy', current: '34%', target: '50%', trend: 'improving' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-700 border-green-200';
      case 'needs-attention': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'at-risk': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Strategic Overview
          </h2>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span className="flex items-center">
              <Target className="w-4 h-4 mr-1" />
              Portfolio Strategy & OKR Alignment
            </span>
            <span className="flex items-center">
              <Brain className="w-4 h-4 mr-1 text-purple-600" />
              AI-powered insights
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => onNavigate?.('roadmap')}>
            <Calendar className="w-4 h-4 mr-2" />
            Delivery Roadmap
          </Button>
          <Button variant="outline" onClick={() => onNavigate?.('customer')}>
            <Users className="w-4 h-4 mr-2" />
            Customer Insights
          </Button>
        </div>
      </div>

      <Tabs defaultValue="strategic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strategic" className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Strategic</span>
          </TabsTrigger>
          <TabsTrigger value="okrs" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">OKRs</span>
          </TabsTrigger>
          <TabsTrigger value="alignment" className="flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Alignment</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Portfolio</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategic" className="space-y-6">
          {/* Vision Statement with AI Enhancement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Strategic Vision & Initiatives
                </div>
                <Button variant="outline" size="sm" className="bg-purple-50 border-purple-200">
                  <Zap className="w-4 h-4 mr-1" />
                  AI Insights
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-lg mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3">
                  "Empowering product organizations through unified, AI-driven collaboration"
                </h3>
                <p className="text-slate-600 text-sm sm:text-base">
                  We create a seamless ecosystem where product strategy, customer feedback, and execution align perfectly, 
                  enhanced by intelligent automation that transforms complexity into clarity.
                </p>
              </div>

              {/* Strategic Initiatives */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900">Active Strategic Initiatives</h4>
                {strategicInitiatives.map((initiative) => (
                  <div key={initiative.id} className="p-4 bg-white border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold text-slate-900">{initiative.title}</h5>
                        <p className="text-sm text-slate-600 mt-1">{initiative.description}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(initiative.status)}`}>
                        {initiative.status.replace('-', ' ')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-slate-500">Progress</span>
                        <div className="flex items-center mt-1">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                              style={{ width: `${initiative.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{initiative.progress}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Linked OKRs</span>
                        <p className="text-sm font-medium mt-1">{initiative.linkedOKRs.length} objectives</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Deliverables</span>
                        <p className="text-sm font-medium mt-1">{initiative.linkedDeliverables} items</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Owner: {initiative.owner}</span>
                      <span>{initiative.deadline}</span>
                    </div>

                    {initiative.aiInsights && (
                      <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                        <span className="flex items-center text-purple-700">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Insight: {initiative.aiInsights}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PLG Strategy Enhancement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-emerald-600" />
                Product-Led Growth Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-emerald-900 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Acquisition
                  </h4>
                  <p className="text-emerald-700 text-sm mb-2">Self-service onboarding with immediate value</p>
                  <div className="text-xs text-emerald-600">Target: 40% activation rate</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    Activation
                  </h4>
                  <p className="text-blue-700 text-sm mb-2">Guide users to core value within first session</p>
                  <div className="text-xs text-blue-600">Target: <60s time-to-value</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Expansion
                  </h4>
                  <p className="text-purple-700 text-sm mb-2">Natural progression across product suite</p>
                  <div className="text-xs text-purple-600">Target: 50% cross-product usage</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="okrs" className="space-y-6">
          <OKRAlignmentWidget showCharts={true} />
        </TabsContent>

        <TabsContent value="alignment" className="space-y-6">
          {/* Strategic to Delivery Alignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="w-5 h-5 mr-2 text-blue-600" />
                Strategic ↔ Delivery Alignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-slate-600 mb-4">
                  Bidirectional linking between high-level strategy and execution details
                </div>
                
                {strategicInitiatives.map((initiative) => (
                  <div key={initiative.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-slate-900">{initiative.title}</h4>
                      <Button variant="outline" size="sm" onClick={() => onNavigate?.('roadmap')}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Delivery
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-slate-700 mb-2">Linked Deliverables</h5>
                        {deliveryItems
                          .filter(item => item.linkedStrategic === initiative.id)
                          .map(item => (
                            <div key={item.id} className="p-2 bg-slate-50 rounded text-sm">
                              <div className="flex justify-between">
                                <span>{item.title}</span>
                                <span className="text-slate-500">{item.quarter}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-700 mb-2">Success Metrics</h5>
                        <div className="space-y-1">
                          <div className="text-sm text-slate-600">Progress: {initiative.progress}%</div>
                          <div className="text-sm text-slate-600">Linked OKRs: {initiative.linkedOKRs.length}</div>
                          <div className="text-sm text-slate-600">Timeline: {initiative.deadline}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          {/* Portfolio-level metrics and insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-purple-600" />
                Portfolio Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioMetrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-slate-900">{metric.metric}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        metric.trend === 'improving' ? 'bg-emerald-100 text-emerald-700' :
                        metric.trend === 'declining' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {metric.trend}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xl font-bold text-slate-900">{metric.current}</span>
                        <span className="text-slate-500 text-sm ml-2">current</span>
                      </div>
                      <div>
                        <span className="text-purple-600 font-semibold">{metric.target}</span>
                        <span className="text-slate-500 text-sm ml-2">target</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Multi-product insights */}
          <Card>
            <CardHeader>
              <CardTitle>Multi-Product Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Cross-Product Strategy</h4>
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-slate-600 text-sm mb-3">
                  AI analysis shows strong potential for increased cross-product adoption through unified onboarding flows.
                </p>
                <div className="flex space-x-4 text-xs">
                  <span className="text-slate-500">Synergy Score: <strong className="text-purple-600">7.8/10</strong></span>
                  <span className="text-slate-500">Opportunity: <strong className="text-emerald-600">+23% ARR</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Strategy;
