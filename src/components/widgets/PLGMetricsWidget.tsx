
import { useState } from 'react';
import { Target, Zap, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';

interface PLGMetricsWidgetProps {
  timeframe?: '7d' | '30d' | '90d';
  showCharts?: boolean;
}

const PLGMetricsWidget = ({ timeframe = '30d', showCharts = true }: PLGMetricsWidgetProps) => {
  const [activeTab, setActiveTab] = useState('funnel');

  const activationFunnel = [
    { stage: 'Sign Up', users: 1000, percentage: 100 },
    { stage: 'Email Verified', users: 850, percentage: 85 },
    { stage: 'Profile Completed', users: 680, percentage: 68 },
    { stage: 'First Action', users: 540, percentage: 54 },
    { stage: 'Activated', users: 432, percentage: 43.2 },
  ];

  const timeToValue = [
    { segment: 'Power Users', avgTime: '2.3 min', conversion: 78 },
    { segment: 'Regular Users', avgTime: '8.7 min', conversion: 45 },
    { segment: 'Casual Users', avgTime: '23.1 min', conversion: 23 },
  ];

  const virality = [
    { month: 'Jan', invites: 234, signups: 47, k_factor: 0.20 },
    { month: 'Feb', invites: 287, signups: 63, k_factor: 0.22 },
    { month: 'Mar', invites: 345, signups: 86, k_factor: 0.25 },
    { month: 'Apr', invites: 398, signups: 103, k_factor: 0.26 },
    { month: 'May', invites: 456, signups: 125, k_factor: 0.27 },
    { month: 'Jun', invites: 523, signups: 152, k_factor: 0.29 },
  ];

  const chartConfig = {
    users: { label: "Users", color: "#8b5cf6" },
    invites: { label: "Invites Sent", color: "#06b6d4" },
    signups: { label: "Signups from Invites", color: "#10b981" },
    conversion: { label: "Conversion Rate", color: "#f59e0b" }
  };

  const plgMetrics = [
    { label: 'Activation Rate', value: '43.2%', change: '+3.1%', trend: 'up', icon: Target },
    { label: 'Time to Value', value: '8.7 min', change: '-12%', trend: 'up', icon: Zap },
    { label: 'Viral Coefficient', value: '0.29', change: '+0.04', trend: 'up', icon: TrendingUp },
    { label: 'Product Qualified Leads', value: '156', change: '+23%', trend: 'up', icon: Users },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="w-5 h-5 mr-2 text-emerald-600" />
          Product-Led Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="funnel">Activation</TabsTrigger>
            <TabsTrigger value="value">Time to Value</TabsTrigger>
            <TabsTrigger value="viral">Virality</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {plgMetrics.slice(0, 2).map((metric, index) => (
                <div key={index} className="p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-emerald-900">{metric.value}</p>
                  <p className="text-xs text-emerald-700">{metric.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {activationFunnel.map((step, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm font-medium">{step.stage}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">{step.users}</span>
                    <span className="text-xs text-slate-500">({step.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="value" className="space-y-4">
            <div className="space-y-3">
              {timeToValue.map((segment, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-blue-900">{segment.segment}</h4>
                    <span className="text-sm text-blue-600">{segment.conversion}% convert</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-blue-900">{segment.avgTime}</span>
                    <span className="text-sm text-blue-600 ml-2">avg time to value</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="viral" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {plgMetrics.slice(2).map((metric, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="w-4 h-4 text-purple-600" />
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-purple-900">{metric.value}</p>
                  <p className="text-xs text-purple-700">{metric.label}</p>
                </div>
              ))}
            </div>
            {showCharts && (
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <BarChart data={virality}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="invites" fill="#06b6d4" />
                  <Bar dataKey="signups" fill="#10b981" />
                </BarChart>
              </ChartContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PLGMetricsWidget;
