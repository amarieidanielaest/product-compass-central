import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  MousePointer, 
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight 
} from 'lucide-react';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';

interface LiveMetric {
  label: string;
  value: number | string;
  trend?: number;
  icon: React.ComponentType<any>;
  color: string;
  unit?: string;
}

export const LiveMetricsWidget = () => {
  const { metrics, loading, lastUpdate } = useRealTimeAnalytics(15000); // 15 second updates
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([]);

  useEffect(() => {
    if (metrics) {
      const currentMetrics: LiveMetric[] = [
        {
          label: 'Active Users',
          value: metrics.activeUsers,
          trend: 8.2,
          icon: Users,
          color: 'bg-blue-500',
          unit: 'online now'
        },
        {
          label: 'Page Views',
          value: metrics.totalSessions * 3.4, // Estimated page views
          trend: 12.5,
          icon: MousePointer,
          color: 'bg-emerald-500',
          unit: 'views/min'
        },
        {
          label: 'Avg Session',
          value: '4.2m',
          trend: -2.1,
          icon: Clock,
          color: 'bg-amber-500',
          unit: 'duration'
        },
        {
          label: 'Conversion',
          value: `${metrics.conversionRate}%`,
          trend: 5.8,
          icon: TrendingUp,
          color: 'bg-purple-500',
          unit: 'live rate'
        }
      ];
      setLiveMetrics(currentMetrics);
    }
  }, [metrics]);

  if (loading && liveMetrics.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Metrics
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {liveMetrics.map((metric, index) => {
            const TrendIcon = metric.trend && metric.trend > 0 ? ArrowUpRight : ArrowDownRight;
            const trendColor = metric.trend && metric.trend > 0 ? 'text-emerald-600' : 'text-red-600';
            
            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-background/50 border hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-md ${metric.color} flex items-center justify-center`}>
                    <metric.icon className="w-4 h-4 text-white" />
                  </div>
                  {metric.trend && (
                    <div className={`flex items-center text-xs ${trendColor}`}>
                      <TrendIcon className="w-3 h-3 mr-1" />
                      {Math.abs(metric.trend)}%
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.label}
                  </p>
                  {metric.unit && (
                    <p className="text-xs text-muted-foreground/80">
                      {metric.unit}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {lastUpdate && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};