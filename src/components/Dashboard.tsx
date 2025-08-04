import { useState } from 'react';
import { TrendingUp, Users, DollarSign, Activity, Target, Zap, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart,
  Line,
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from 'recharts';
import { useServiceCall } from '@/hooks/useServiceIntegration';
import { analyticsService, aiService } from '@/services/api';

interface DashboardProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

const Dashboard = ({ selectedProductId, onNavigate }: DashboardProps) => {
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data - replace with actual service calls
  const userGrowthData = [
    { month: 'Jan', users: 1200, retention: 85 },
    { month: 'Feb', users: 1350, retention: 87 },
    { month: 'Mar', users: 1500, retention: 89 },
    { month: 'Apr', users: 1680, retention: 91 },
    { month: 'May', users: 1850, retention: 88 },
    { month: 'Jun', users: 2100, retention: 92 },
  ];

  const featureAdoptionData = [
    { feature: 'Dashboard', adoption: 95 },
    { feature: 'Sprints', adoption: 78 },
    { feature: 'Roadmap', adoption: 65 },
    { feature: 'Customer', adoption: 52 },
    { feature: 'PRD Gen', adoption: 34 },
  ];

  const chartConfig = {
    users: {
      label: "Users",
      color: "hsl(var(--primary))"
    },
    retention: {
      label: "Retention", 
      color: "hsl(var(--accent))"
    },
    adoption: {
      label: "Adoption",
      color: "hsl(var(--primary))"
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend = 'up',
    color = 'primary' 
  }: {
    title: string;
    value: string | number;
    change: string;
    icon: any;
    trend?: 'up' | 'down';
    color?: string;
  }) => {
    const isPositive = trend === 'up';
    const colorMap = {
      primary: 'bg-primary',
      emerald: 'bg-emerald-500',
      blue: 'bg-blue-500',
      amber: 'bg-amber-500',
    };

    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground">
                  {typeof value === 'number' ? formatNumber(value) : value}
                </p>
                <div className={`flex items-center space-x-1 text-sm ${
                  isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span className="font-medium">{change}</span>
                </div>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl ${colorMap[color] || colorMap.primary} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your product.
          </p>
        </div>
        <Tabs value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="7d" className="text-sm">7D</TabsTrigger>
            <TabsTrigger value="30d" className="text-sm">30D</TabsTrigger>
            <TabsTrigger value="90d" className="text-sm">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={2847}
          change="+12.5%"
          icon={Users}
          color="primary"
        />
        <MetricCard
          title="Revenue"
          value="$125K"
          change="+8.2%"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Active Features"
          value={156}
          change="+5 this week"
          icon={Zap}
          color="blue"
        />
        <MetricCard
          title="Health Score"
          value="87%"
          change="Good"
          icon={Target}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">User Growth</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Monthly active users and retention rates
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Last 6 months
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="retention" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature Adoption Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Feature Adoption</CardTitle>
            <p className="text-sm text-muted-foreground">
              Usage rates across core features
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureAdoptionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="feature" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="adoption" 
                      fill="hsl(var(--primary))" 
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Navigate to your most used features
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-3 p-4 hover:bg-accent/50 transition-all group"
              onClick={() => onNavigate?.('sprints')}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">Sprint Board</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-3 p-4 hover:bg-accent/50 transition-all group"
              onClick={() => onNavigate?.('customer')}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">Customer Board</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-3 p-4 hover:bg-accent/50 transition-all group"
              onClick={() => onNavigate?.('roadmap')}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">Roadmap</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-3 p-4 hover:bg-accent/50 transition-all group"
              onClick={() => onNavigate?.('strategy')}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">Strategy</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;