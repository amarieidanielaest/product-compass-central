
import { useState, useEffect } from 'react';
import { Users, TrendingUp, UserCheck, UserPlus, Brain, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { portfolioAnalyticsService } from '@/services/analytics/PortfolioAnalyticsService';

interface AdvancedUserMetricsWidgetProps {
  timeframe?: '7d' | '30d' | '90d';
  showPredictions?: boolean;
}

const AdvancedUserMetricsWidget = ({ timeframe = '30d', showPredictions = true }: AdvancedUserMetricsWidgetProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [predictions, setPredictions] = useState<any>(null);

  const userGrowthData = [
    { date: '2024-01', new: 120, returning: 1080, total: 1200, predicted: 1180 },
    { date: '2024-02', new: 150, returning: 1200, total: 1350, predicted: 1330 },
    { date: '2024-03', new: 180, returning: 1320, total: 1500, predicted: 1520 },
    { date: '2024-04', new: 200, returning: 1480, total: 1680, predicted: 1700 },
    { date: '2024-05', new: 220, returning: 1630, total: 1850, predicted: 1890 },
    { date: '2024-06', new: 250, returning: 1850, total: 2100, predicted: 2080 },
    { date: '2024-07', new: null, returning: null, total: null, predicted: 2250 },
    { date: '2024-08', new: null, returning: null, total: null, predicted: 2420 },
  ];

  const cohortAnalysisData = [
    { cohort: 'Jan 2024', day1: 85, day7: 68, day30: 45, day90: 32 },
    { cohort: 'Feb 2024', day1: 87, day7: 71, day30: 48, day90: 35 },
    { cohort: 'Mar 2024', day1: 89, day7: 74, day30: 52, day90: 38 },
    { cohort: 'Apr 2024', day1: 91, day7: 76, day30: 54, day90: 41 },
    { cohort: 'May 2024', day1: 88, day7: 73, day30: 51, day90: 37 },
    { cohort: 'Jun 2024', day1: 92, day7: 78, day30: 56, day90: 42 },
  ];

  const segmentAnalysisData = [
    { segment: 'Enterprise', users: 450, growth: 12.5, revenue: 18500, satisfaction: 4.2 },
    { segment: 'SMB', users: 1200, growth: 8.3, revenue: 8900, satisfaction: 4.0 },
    { segment: 'Startup', users: 2100, growth: 15.7, revenue: 2100, satisfaction: 4.1 },
    { segment: 'Individual', users: 890, growth: -2.1, revenue: 450, satisfaction: 3.8 },
  ];

  const chartConfig = {
    new: { label: "New Users", color: "#8b5cf6" },
    returning: { label: "Returning Users", color: "#06b6d4" },
    total: { label: "Total Users", color: "#10b981" },
    predicted: { label: "Predicted", color: "#f59e0b" },
    day1: { label: "Day 1", color: "#ef4444" },
    day7: { label: "Day 7", color: "#f59e0b" },
    day30: { label: "Day 30", color: "#22c55e" },
    day90: { label: "Day 90", color: "#8b5cf6" },
    users: { label: "Users", color: "#06b6d4" },
    growth: { label: "Growth", color: "#10b981" }
  };

  useEffect(() => {
    if (showPredictions) {
      loadPredictions();
    }
  }, [showPredictions]);

  const loadPredictions = async () => {
    try {
      const response = await portfolioAnalyticsService.getPredictiveAnalytics();
      if (response.data) {
        setPredictions(response.data);
      }
    } catch (error) {
      console.error('Failed to load predictions:', error);
    }
  };

  const metrics = [
    { label: 'Monthly Active Users', value: '12,847', change: '+8.2%', trend: 'up', icon: Users },
    { label: 'New User Signups', value: '1,234', change: '+15.3%', trend: 'up', icon: UserPlus },
    { label: 'User Retention (30d)', value: '56%', change: '+2.1%', trend: 'up', icon: UserCheck },
    { label: 'Avg Session Duration', value: '8m 32s', change: '-1.2%', trend: 'down', icon: TrendingUp },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Advanced User Analytics
          </div>
          {showPredictions && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Brain className="w-3 h-3 mr-1" />
              AI Predictions
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="w-4 h-4 text-slate-600" />
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      metric.trend === 'up' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{metric.value}</p>
                  <p className="text-xs text-slate-600">{metric.label}</p>
                </div>
              ))}
            </div>

            {predictions && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <Brain className="w-4 h-4 mr-2 text-purple-600" />
                  <h4 className="font-medium text-purple-900">AI Predictions</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700">Predicted Churn:</span>
                    <span className="font-medium ml-2 text-red-600">
                      {(predictions.churnPrediction.predictedChurnRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-700">Growth Forecast:</span>
                    <span className="font-medium ml-2 text-green-600">
                      +{(predictions.growthForecast.predictedGrowth * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={userGrowthData}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="new" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="returning" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                {showPredictions && (
                  <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
                )}
              </AreaChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="cohorts" className="space-y-4">
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <LineChart data={cohortAnalysisData}>
                <XAxis dataKey="cohort" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="day1" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="day7" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="day30" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="day90" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="segments" className="space-y-4">
            <div className="space-y-3">
              {segmentAnalysisData.map((segment, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{segment.segment}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={segment.growth > 0 ? "default" : "destructive"}>
                        {segment.growth > 0 ? '+' : ''}{segment.growth}%
                      </Badge>
                      <Target className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Users:</span>
                      <span className="font-medium ml-2">{segment.users.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Revenue:</span>
                      <span className="font-medium ml-2">${segment.revenue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Satisfaction:</span>
                      <span className="font-medium ml-2">{segment.satisfaction}/5.0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedUserMetricsWidget;
