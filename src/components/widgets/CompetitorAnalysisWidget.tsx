
import { useState } from 'react';
import { Zap, TrendingUp, Eye, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface CompetitorAnalysisWidgetProps {
  timeframe?: '7d' | '30d' | '90d';
  showCharts?: boolean;
}

const CompetitorAnalysisWidget = ({ timeframe = '30d', showCharts = true }: CompetitorAnalysisWidgetProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const competitors = [
    {
      name: 'Competitor A',
      marketShare: 35,
      features: 85,
      pricing: 'Premium',
      status: 'threat',
      recentMove: 'Launched AI features'
    },
    {
      name: 'Competitor B',
      marketShare: 22,
      features: 78,
      pricing: 'Mid-range',
      status: 'watch',
      recentMove: 'Partnership with Microsoft'
    },
    {
      name: 'Competitor C',
      marketShare: 18,
      features: 65,
      pricing: 'Budget',
      status: 'opportunity',
      recentMove: 'Funding round announced'
    }
  ];

  const featureComparison = [
    { feature: 'User Experience', us: 88, competitorA: 82, competitorB: 75, competitorC: 70 },
    { feature: 'Feature Set', us: 85, competitorA: 90, competitorB: 78, competitorC: 65 },
    { feature: 'Pricing', us: 78, competitorA: 65, competitorB: 85, competitorC: 95 },
    { feature: 'Support', us: 92, competitorA: 78, competitorB: 82, competitorC: 68 },
    { feature: 'Integration', us: 80, competitorA: 88, competitorB: 75, competitorC: 60 },
    { feature: 'Scalability', us: 95, competitorA: 85, competitorB: 80, competitorC: 70 },
  ];

  const marketInsights = [
    { label: 'Market Position', value: '#2', change: '+1', trend: 'up', icon: TrendingUp },
    { label: 'Feature Gap Score', value: '12', change: '-3', trend: 'up', icon: Zap },
    { label: 'Competitive Alerts', value: '5', change: '+2', trend: 'neutral', icon: Eye },
    { label: 'Win Rate vs Top 3', value: '67%', change: '+8%', trend: 'up', icon: Users },
  ];

  const chartConfig = {
    us: { label: "Our Product", color: "#8b5cf6" },
    competitorA: { label: "Competitor A", color: "#ef4444" },
    competitorB: { label: "Competitor B", color: "#f59e0b" },
    competitorC: { label: "Competitor C", color: "#06b6d4" }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'threat': return 'bg-red-100 text-red-700';
      case 'watch': return 'bg-orange-100 text-orange-700';
      case 'opportunity': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'Premium': return 'bg-purple-100 text-purple-700';
      case 'Mid-range': return 'bg-blue-100 text-blue-700';
      case 'Budget': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="w-5 h-5 mr-2 text-orange-600" />
          Competitive Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-3">
              {competitors.map((comp, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-slate-900">{comp.name}</h4>
                    <div className="flex space-x-2">
                      <Badge className={getPricingColor(comp.pricing)}>
                        {comp.pricing}
                      </Badge>
                      <Badge className={getStatusColor(comp.status)}>
                        {comp.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <span className="text-sm font-medium">{comp.marketShare}%</span>
                      <span className="text-xs text-slate-600 ml-1">market share</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">{comp.features}/100</span>
                      <span className="text-xs text-slate-600 ml-1">feature score</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{comp.recentMove}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            {showCharts && (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={featureComparison}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="feature" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Our Product" dataKey="us" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <Radar name="Competitor A" dataKey="competitorA" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                    <Radar name="Competitor B" dataKey="competitorB" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="space-y-2">
              {featureComparison.map((item, index) => (
                <div key={index} className="p-2 bg-white rounded border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{item.feature}</span>
                    <span className="text-sm text-slate-600">Us: {item.us}/100</span>
                  </div>
                  <Progress value={item.us} className="h-1" />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {marketInsights.map((metric, index) => (
                <div key={index} className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="w-4 h-4 text-orange-600" />
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-orange-900">{metric.value}</p>
                  <p className="text-xs text-orange-700">{metric.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 mt-4">
              <h5 className="font-medium text-slate-900">Strategic Recommendations</h5>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-blue-900">Feature Opportunity</p>
                  <p className="text-xs text-blue-700">Focus on AI/ML features to match Competitor A</p>
                </div>
                <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                  <p className="text-sm font-medium text-green-900">Pricing Advantage</p>
                  <p className="text-xs text-green-700">Leverage superior support quality in messaging</p>
                </div>
                <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                  <p className="text-sm font-medium text-orange-900">Market Watch</p>
                  <p className="text-xs text-orange-700">Monitor Competitor B's Microsoft partnership impact</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CompetitorAnalysisWidget;
