
import { Target, TrendingUp, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Strategy = () => {
  const objectives = [
    {
      title: 'Increase User Engagement',
      description: 'Improve daily active user retention by 25%',
      progress: 68,
      deadline: 'Q2 2024',
      owner: 'Product Team',
    },
    {
      title: 'Expand Market Reach',
      description: 'Launch in 3 new geographic markets',
      progress: 40,
      deadline: 'Q3 2024',
      owner: 'Growth Team',
    },
    {
      title: 'Platform Modernization',
      description: 'Migrate 80% of services to cloud-native architecture',
      progress: 85,
      deadline: 'Q1 2024',
      owner: 'Engineering',
    },
  ];

  const keyMetrics = [
    { metric: 'Customer Acquisition Cost', current: '$45', target: '$35', trend: 'improving' },
    { metric: 'Monthly Recurring Revenue', current: '$125K', target: '$200K', trend: 'improving' },
    { metric: 'Churn Rate', current: '3.2%', target: '2.5%', trend: 'stable' },
    { metric: 'Net Promoter Score', current: '42', target: '60', trend: 'improving' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Product Strategy</h2>
        <p className="text-slate-600">Define and track your product vision, goals, and key metrics</p>
      </div>

      {/* Vision Statement */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Product Vision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              "Empowering teams to build better products through unified collaboration and data-driven insights"
            </h3>
            <p className="text-slate-600">
              We envision a world where product teams can seamlessly collaborate, make informed decisions based on real user data, 
              and deliver exceptional experiences that drive business growth and customer satisfaction.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Strategic Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {objectives.map((objective, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-900">{objective.title}</h4>
                    <span className="text-sm text-slate-500">{objective.deadline}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{objective.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              Add New Objective
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keyMetrics.map((kpi, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-slate-900">{kpi.metric}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      kpi.trend === 'improving' ? 'bg-green-100 text-green-700' :
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
                      <span className="text-blue-600 font-semibold">{kpi.target}</span>
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
