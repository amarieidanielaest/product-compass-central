import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  DollarSign, 
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { AnalyticsSetupCard } from './AnalyticsSetupCard';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

interface RealTimeDashboardProps {
  className?: string;
}

export const RealTimeDashboard = ({ className }: RealTimeDashboardProps) => {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const { metrics, loading, error, needsSetup, lastUpdate, refresh } = useRealTimeAnalytics(refreshInterval);

  const handleSetupClick = () => {
    // Open setup wizard or documentation
    window.open('https://docs.lovable.dev/features/analytics-setup', '_blank');
  };

  const chartConfig = {
    users: {
      label: "Active Users",
      color: "hsl(var(--primary))"
    },
    sessions: {
      label: "Sessions",
      color: "hsl(var(--accent))"
    },
    usage: {
      label: "Usage",
      color: "hsl(var(--primary))"
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    trend, 
    icon: Icon, 
    color = 'primary',
    suffix = '',
    isLive = false
  }: {
    title: string;
    value: number | string;
    trend?: number;
    icon: any;
    color?: string;
    suffix?: string;
    isLive?: boolean;
  }) => {
    const trendDirection = trend && trend > 0 ? 'up' : trend && trend < 0 ? 'down' : 'stable';
    const trendColor = trendDirection === 'up' ? 'text-emerald-600' : 
                      trendDirection === 'down' ? 'text-red-600' : 'text-muted-foreground';

    return (
      <Card className="relative overflow-hidden border-0 shadow-sm bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {title}
                </p>
                {isLive && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
                    LIVE
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </p>
                {trend !== undefined && (
                  <div className={`flex items-center space-x-1 text-xs ${trendColor}`}>
                    {trendDirection === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : trendDirection === 'down' ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : null}
                    <span className="font-medium">
                      {Math.abs(trend)}% vs last hour
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className={`w-10 h-10 rounded-lg bg-${color} flex items-center justify-center shadow-sm`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading && !metrics) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm bg-card/50">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className={`${className}`}>
        <AnalyticsSetupCard onSetupClick={handleSetupClick} />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">Failed to load real-time analytics</p>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-Time Analytics</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Clock className="w-4 h-4" />
            {lastUpdate ? (
              <span>Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}</span>
            ) : (
              <span>Loading...</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="10000" className="text-xs">10s</TabsTrigger>
              <TabsTrigger value="30000" className="text-xs">30s</TabsTrigger>
              <TabsTrigger value="60000" className="text-xs">1m</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Active Users"
          value={metrics?.activeUsers || 0}
          trend={12.5}
          icon={Users}
          color="primary"
          isLive
        />
        <MetricCard
          title="Live Sessions"
          value={metrics?.totalSessions || 0}
          trend={8.2}
          icon={Activity}
          color="emerald-500"
          isLive
        />
        <MetricCard
          title="Conversion Rate"
          value={metrics?.conversionRate || 0}
          trend={-2.1}
          icon={TrendingUp}
          color="blue-500"
          suffix="%"
          isLive
        />
        <MetricCard
          title="Revenue Today"
          value={`$${(metrics?.revenue || 0).toLocaleString()}`}
          trend={15.7}
          icon={DollarSign}
          color="amber-500"
          isLive
        />
      </div>

      {/* Real-Time Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Live User Activity
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time user engagement over the last hour
                </p>
              </div>
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
                LIVE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.userGrowth || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
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
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#userGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature Usage Chart */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Live Feature Usage</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time feature engagement rates
                </p>
              </div>
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
                LIVE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.featureUsage || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                      dataKey="usage" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Stream */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live Activity Stream
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time user actions and events
              </p>
            </div>
            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
              LIVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {metrics?.userBehavior?.slice(0, 10).map((event, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.count} users • {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            {(!metrics?.userBehavior || metrics.userBehavior.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Waiting for real-time activity...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};