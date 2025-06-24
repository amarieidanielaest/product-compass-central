
import { useState } from 'react';
import { Target, Calendar, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis } from 'recharts';

interface OKRAlignmentWidgetProps {
  timeframe?: '7d' | '30d' | '90d';
  showCharts?: boolean;
}

const OKRAlignmentWidget = ({ timeframe = '30d', showCharts = true }: OKRAlignmentWidgetProps) => {
  const [activeTab, setActiveTab] = useState('objectives');

  const objectives = [
    {
      title: 'Increase User Activation Rate',
      progress: 73,
      target: 80,
      quarter: 'Q1 2024',
      owner: 'Product Team',
      status: 'on-track',
      keyResults: [
        { metric: 'Onboarding completion', current: 68, target: 75 },
        { metric: 'Time to first value', current: 8.2, target: 6.0 },
        { metric: 'Feature adoption', current: 45, target: 60 },
      ]
    },
    {
      title: 'Expand Enterprise Market Share',
      progress: 45,
      target: 70,
      quarter: 'Q1 2024',
      owner: 'Sales Team',
      status: 'at-risk',
      keyResults: [
        { metric: 'Enterprise deals closed', current: 12, target: 20 },
        { metric: 'Average deal size', current: 25000, target: 35000 },
        { metric: 'Sales cycle reduction', current: 45, target: 35 },
      ]
    },
    {
      title: 'Improve Product Quality',
      progress: 82,
      target: 85,
      quarter: 'Q1 2024',
      owner: 'Engineering',
      status: 'on-track',
      keyResults: [
        { metric: 'Bug resolution time', current: 2.1, target: 1.5 },
        { metric: 'System uptime', current: 99.8, target: 99.9 },
        { metric: 'Test coverage', current: 78, target: 85 },
      ]
    }
  ];

  const quarterlyProgress = [
    { month: 'Jan', overall: 45, product: 52, sales: 23, engineering: 67 },
    { month: 'Feb', overall: 58, product: 64, sales: 34, engineering: 76 },
    { month: 'Mar', overall: 67, product: 73, sales: 45, engineering: 82 },
  ];

  const alignmentMetrics = [
    { label: 'Overall Progress', value: '67%', change: '+12%', trend: 'up', icon: Target },
    { label: 'On-Track OKRs', value: '7/9', change: '+2', trend: 'up', icon: TrendingUp },
    { label: 'Team Alignment', value: '89%', change: '+5%', trend: 'up', icon: Users },
    { label: 'Days to Quarter End', value: '23', change: '-7', trend: 'neutral', icon: Calendar },
  ];

  const chartConfig = {
    overall: { label: "Overall Progress", color: "#8b5cf6" },
    product: { label: "Product Team", color: "#10b981" },
    sales: { label: "Sales Team", color: "#06b6d4" },
    engineering: { label: "Engineering", color: "#f59e0b" }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-700';
      case 'at-risk': return 'bg-orange-100 text-orange-700';
      case 'behind': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          OKR Alignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="objectives">Objectives</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="alignment">Alignment</TabsTrigger>
          </TabsList>

          <TabsContent value="objectives" className="space-y-4">
            <div className="space-y-4">
              {objectives.map((obj, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-slate-900">{obj.title}</h4>
                    <Badge className={getStatusColor(obj.status)}>
                      {obj.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {obj.progress}%</span>
                      <span>Target: {obj.target}%</span>
                    </div>
                    <Progress value={(obj.progress / obj.target) * 100} className="h-2" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{obj.quarter}</span>
                    <span>Owner: {obj.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {alignmentMetrics.slice(0, 2).map((metric, index) => (
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
                <AreaChart data={quarterlyProgress}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="overall" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="product" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="sales" stackId="3" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                </AreaChart>
              </ChartContainer>
            )}
          </TabsContent>

          <TabsContent value="alignment" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {alignmentMetrics.slice(2).map((metric, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="w-4 h-4 text-blue-600" />
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">{metric.value}</p>
                  <p className="text-xs text-blue-700">{metric.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 mt-4">
              <h5 className="font-medium text-slate-900">Key Results Summary</h5>
              {objectives.map((obj, objIndex) => (
                <div key={objIndex} className="space-y-2">
                  <h6 className="text-sm font-medium text-slate-700">{obj.title}</h6>
                  {obj.keyResults.map((kr, krIndex) => (
                    <div key={krIndex} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm text-slate-600">{kr.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{kr.current}</span>
                        <span className="text-xs text-slate-500">/ {kr.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OKRAlignmentWidget;
