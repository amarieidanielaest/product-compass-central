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
import { analyticsService } from '@/services/api';
import { RealTimeDashboard } from '@/components/analytics/RealTimeDashboard';

interface DashboardProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

const Dashboard = ({ selectedProductId, onNavigate }: DashboardProps) => {
  console.log('Dashboard rendering with props:', { selectedProductId, onNavigate });
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch real analytics data
  const { data: dashboardData, loading, error } = useServiceCall(
    () => fetch('https://spubjrvuggyrozoawofp.supabase.co/functions/v1/analytics-api/dashboard-data', {
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdWJqcnZ1Z2d5cm96b2F3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzM1NTYsImV4cCI6MjA2NzIwOTU1Nn0.X4f0Ouq6evWVNwXBkTjnSXqHiwf7rc6LlgWN9HodCxM`
      }
    }).then(res => res.json()).then(data => ({ success: true, data: data.data })),
    [timeFilter]
  );

  // Use real data or fallback to defaults
  const userGrowthData = dashboardData?.userGrowthData || [
    { month: 'Jan', users: 1200, retention: 85 },
    { month: 'Feb', users: 1350, retention: 87 },
    { month: 'Mar', users: 1500, retention: 89 },
    { month: 'Apr', users: 1680, retention: 91 },
    { month: 'May', users: 1850, retention: 88 },
    { month: 'Jun', users: 2100, retention: 92 },
  ];

  const featureAdoptionData = dashboardData?.featureAdoptionData || [
    { feature: 'Dashboard', adoption: 95 },
    { feature: 'Sprints', adoption: 78 },
    { feature: 'Roadmap', adoption: 65 },
    { feature: 'Customer', adoption: 52 },
    { feature: 'PRD Gen', adoption: 34 },
  ];

  const keyMetrics = dashboardData?.keyMetrics || {
    totalUsers: 2847,
    revenue: '$125K',
    activeFeatures: 156,
    healthScore: '87%'
  };

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
      <Card className="relative overflow-hidden border-0 shadow-sm bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  {typeof value === 'number' ? formatNumber(value) : value}
                </p>
                <div className={`flex items-center space-x-1 text-xs ${
                  isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {isPositive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  <span className="font-medium">{change}</span>
                </div>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-lg ${colorMap[color] || colorMap.primary} flex items-center justify-center shadow-sm`}>
              <Icon className="w-5 h-5 text-white" />
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
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
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

      {/* Real-Time Analytics Dashboard */}
      <RealTimeDashboard className="mb-8" />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={keyMetrics.totalUsers}
          change="+12.5%"
          icon={Users}
          color="primary"
        />
        <MetricCard
          title="Revenue"
          value={keyMetrics.revenue}
          change="+8.2%"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Active Features"
          value={keyMetrics.activeFeatures}
          change="+5 this week"
          icon={Zap}
          color="blue"
        />
        <MetricCard
          title="Health Score"
          value={keyMetrics.healthScore}
          change="Good"
          icon={Target}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* User Growth Chart */}
        <Card className="xl:col-span-2 border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Monthly active users and retention rates
                </p>
              </div>
              <Badge variant="secondary" className="text-xs h-6">
                Last 6 months
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2.5}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="retention" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2.5}
                      dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature Adoption Chart */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Feature Adoption</CardTitle>
            <p className="text-xs text-muted-foreground">
              Usage rates across core features
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureAdoptionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="feature" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="adoption" 
                      fill="hsl(var(--primary))" 
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Navigate to your most used features
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 p-3 hover:bg-accent/50 transition-all group border-0 bg-background/50"
              onClick={() => onNavigate?.('sprints')}
            >
              <div className="w-8 h-8 rounded-md bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium">Sprint Board</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 p-3 hover:bg-accent/50 transition-all group border-0 bg-background/50"
              onClick={() => onNavigate?.('customer')}
            >
              <div className="w-8 h-8 rounded-md bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium">Customer Board</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 p-3 hover:bg-accent/50 transition-all group border-0 bg-background/50"
              onClick={() => onNavigate?.('roadmap')}
            >
              <div className="w-8 h-8 rounded-md bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium">Roadmap</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 p-3 hover:bg-accent/50 transition-all group border-0 bg-background/50"
              onClick={() => onNavigate?.('strategy')}
            >
              <div className="w-8 h-8 rounded-md bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium">Strategy</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;