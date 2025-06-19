
import { useState } from 'react';
import { Users, TrendingUp, UserCheck, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface UserMetricsWidgetProps {
  timeframe?: '7d' | '30d' | '90d';
  showCharts?: boolean;
}

const UserMetricsWidget = ({ timeframe = '30d', showCharts = true }: UserMetricsWidgetProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const userGrowthData = [
    { date: '2024-01', new: 120, returning: 1080, total: 1200 },
    { date: '2024-02', new: 150, returning: 1200, total: 1350 },
    { date: '2024-03', new: 180, returning: 1320, total: 1500 },
    { date: '2024-04', new: 200, returning: 1480, total: 1680 },
    { date: '2024-05', new: 220, returning: 1630, total: 1850 },
    { date: '2024-06', new: 250, returning: 1850, total: 2100 },
  ];

  const retentionData = [
    { cohort: 'Jan 2024', day1: 85, day7: 68, day30: 45 },
    { cohort: 'Feb 2024', day1: 87, day7: 71, day30: 48 },
    { cohort: 'Mar 2024', day1: 89, day7: 74, day30: 52 },
    { cohort: 'Apr 2024', day1: 91, day7: 76, day30: 54 },
    { cohort: 'May 2024', day1: 88, day7: 73, day30: 51 },
    { cohort: 'Jun 2024', day1: 92, day7: 78, day30: 56 },
  ];

  const chartConfig = {
    new: { label: "New Users", color: "#8b5cf6" },
    returning: { label: "Returning Users", color: "#06b6d4" },
    total: { label: "Total Users", color: "#10b981" },
    day1: { label: "Day 1", color: "#ef4444" },
    day7: { label: "Day 7", color: "#f59e0b" },
    day30: { label: "Day 30", color: "#22c55e" }
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
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          User Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
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
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            {showCharts && (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <AreaChart data={userGrowthData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="new" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="returning" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                </AreaChart>
              </ChartContainer>
            )}
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            {showCharts && (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <LineChart data={retentionData}>
                  <XAxis dataKey="cohort" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="day1" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="day7" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="day30" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserMetricsWidget;
