
import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface ProductHealthWidgetProps {
  timeframe?: '7d' | '30d' | '90d';
  showCharts?: boolean;
}

const ProductHealthWidget = ({ timeframe = '30d', showCharts = true }: ProductHealthWidgetProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const healthScoreData = [
    { date: 'Week 1', score: 78, uptime: 99.2, bugs: 12 },
    { date: 'Week 2', score: 82, uptime: 99.7, bugs: 8 },
    { date: 'Week 3', score: 85, uptime: 99.9, bugs: 5 },
    { date: 'Week 4', score: 87, uptime: 99.8, bugs: 3 },
  ];

  const deploymentHealth = [
    { environment: 'Production', status: 'healthy', uptime: 99.9, lastDeploy: '2 hours ago' },
    { environment: 'Staging', status: 'warning', uptime: 98.5, lastDeploy: '30 minutes ago' },
    { environment: 'Development', status: 'healthy', uptime: 97.2, lastDeploy: '5 minutes ago' },
  ];

  const technicalDebt = [
    { category: 'Code Quality', score: 85, trend: 'up' },
    { category: 'Test Coverage', score: 78, trend: 'stable' },
    { category: 'Documentation', score: 65, trend: 'down' },
    { category: 'Security', score: 92, trend: 'up' },
  ];

  const chartConfig = {
    score: { label: "Health Score", color: "#10b981" },
    uptime: { label: "Uptime", color: "#06b6d4" },
    bugs: { label: "Bug Count", color: "#ef4444" }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'down': return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default: return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          Product Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="technical">Technical Debt</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    +9 pts
                  </span>
                </div>
                <p className="text-lg font-bold text-blue-900">87/100</p>
                <p className="text-xs text-blue-700">Health Score</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    99.8%
                  </span>
                </div>
                <p className="text-lg font-bold text-green-900">Excellent</p>
                <p className="text-xs text-green-700">System Uptime</p>
              </div>
            </div>
            {showCharts && (
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <LineChart data={healthScoreData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            )}
          </TabsContent>

          <TabsContent value="deployments" className="space-y-4">
            <div className="space-y-3">
              {deploymentHealth.map((env, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-slate-900">{env.environment}</h4>
                    <Badge className={getStatusColor(env.status)}>
                      {env.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-slate-900">{env.uptime}%</span>
                      <span className="text-xs text-slate-600 ml-1">uptime</span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">{env.lastDeploy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div className="space-y-3">
              {technicalDebt.map((item, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-slate-900">{item.category}</h4>
                    {getTrendIcon(item.trend)}
                  </div>
                  <div className="space-y-2">
                    <Progress value={item.score} className="h-2" />
                    <span className="text-sm text-slate-600">{item.score}/100</span>
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

export default ProductHealthWidget;
