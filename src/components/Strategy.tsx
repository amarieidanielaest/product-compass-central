
import { Target, TrendingUp, Users, Calendar, Package, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StrategyProps {
  selectedProductId?: string;
}

const Strategy = ({ selectedProductId }: StrategyProps) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {selectedProductId === 'all' ? 'Portfolio Strategy' : 'Product Strategy'}
        </h2>
        <p className="text-slate-600">
          {selectedProductId === 'all' 
            ? 'Unified strategy across your product portfolio with PLG focus'
            : 'Define and track your product vision, goals, and key metrics'
          }
        </p>
      </div>

      {/* Vision Statement */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600" />
            {selectedProductId === 'all' ? 'Portfolio Vision' : 'Product Vision'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              {selectedProductId === 'all' 
                ? '"Building an ecosystem of interconnected products that scale through user-driven growth"'
                : '"Empowering teams to build better products through unified collaboration and data-driven insights"'
              }
            </h3>
            <p className="text-slate-600">
              {selectedProductId === 'all'
                ? 'We create a portfolio of products that work together seamlessly, where each product drives growth for the others through natural user progression and cross-product value creation.'
                : 'We envision a world where product teams can seamlessly collaborate, make informed decisions based on real user data, and deliver exceptional experiences that drive business growth and customer satisfaction.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* PLG Strategy Card (shown for portfolio view) */}
      {selectedProductId === 'all' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-emerald-600" />
              Product-Led Growth Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      )}

      {/* Strategic Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {selectedProductId === 'all' ? (
                <Package className="w-5 h-5 mr-2 text-purple-600" />
              ) : (
                <Target className="w-5 h-5 mr-2 text-purple-600" />
              )}
              {selectedProductId === 'all' ? 'Portfolio Objectives' : 'Strategic Objectives'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Show global objectives for portfolio view, product objectives for single product */}
              {(selectedProductId === 'all' ? globalObjectives : productObjectives).map((objective, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-900">{objective.title}</h4>
                    <span className="text-sm text-slate-500">{objective.deadline}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{objective.description}</p>
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
              
              {/* Show both global and product objectives for single product view */}
              {selectedProductId !== 'all' && (
                <>
                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium text-slate-900 mb-4 flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-emerald-600" />
                      Portfolio-Wide Objectives
                    </h5>
                    {globalObjectives.map((objective, index) => (
                      <div key={`global-${index}`} className="border-l-4 border-emerald-500 pl-4 mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900 text-sm">{objective.title}</h4>
                          <span className="text-xs text-slate-500">{objective.deadline}</span>
                        </div>
                        <p className="text-slate-600 text-xs mb-2">{objective.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${objective.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-slate-700">{objective.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Add New Objective
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(selectedProductId === 'all' ? globalMetrics : productMetrics).map((kpi, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-slate-900">{kpi.metric}</h4>
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
      </div>
    </div>
  );
};

export default Strategy;
