import { useState } from 'react';
import { TrendingUp, Users, Calendar, Star, Settings, Plus, BarChart3, PieChart, LineChart, Target, DollarSign, Clock, AlertTriangle, Sparkles, Zap, Activity, Brain } from 'lucide-react';
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from 'recharts';
import { useServiceCall } from '@/hooks/useServiceIntegration';
import { analyticsService, aiService } from '@/services/api';
import { WelcomeMessage, EmptyState } from './BrandVoice';
import { EmotionalFeedback, AchievementToast } from './EmotionalFeedback';
import { InteractiveDemo } from './InteractiveDemo';
import { BentoGrid, BentoCard } from './BentoGrid';
import { WidgetManager } from './WidgetManager';
import { ConfigurableWidget } from './widgets/ConfigurableWidget';
import loomLogo from '@/assets/loom-logo.png';

interface DashboardProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

interface WidgetConfig {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'ai-insight';
  title: string;
  dataSource: string;
  visualization: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  filters?: Record<string, any>;
  customOptions?: Record<string, any>;
}

const Dashboard = ({ selectedProductId, onNavigate }: DashboardProps) => {
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [customWidgets, setCustomWidgets] = useState<WidgetConfig[]>([]);

  // Integrate Analytics Service
  const { data: userMetrics, loading: userMetricsLoading, error: userMetricsError } = useServiceCall(
    () => analyticsService.getUserMetrics(timeFilter),
    [timeFilter]
  );

  const { data: featureAdoption, loading: featureLoading } = useServiceCall(
    () => analyticsService.getFeatureAdoption(),
    []
  );

  const { data: productHealth, loading: healthLoading } = useServiceCall(
    () => analyticsService.getProductHealth(),
    []
  );

  // Integrate AI Service for insights
  const { data: aiInsights, loading: insightsLoading } = useServiceCall(
    () => aiService.getInsights('product', { timeRange: timeFilter, productId: selectedProductId }),
    [timeFilter, selectedProductId]
  );

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
      color: "hsl(var(--coral))"
    },
    committed: {
      label: "Committed",
      color: "hsl(var(--amber))"
    },
    completed: {
      label: "Completed", 
      color: "hsl(var(--indigo))"
    }
  };

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

  const satisfactionData = [
    { score: '5 Stars', count: 45, percentage: 45 },
    { score: '4 Stars', count: 30, percentage: 30 },
    { score: '3 Stars', count: 15, percentage: 15 },
    { score: '2 Stars', count: 7, percentage: 7 },
    { score: '1 Star', count: 3, percentage: 3 },
  ];

  const sprintMetrics = [
    { sprint: 'Sprint 20', committed: 23, completed: 21 },
    { sprint: 'Sprint 21', committed: 25, completed: 24 },
    { sprint: 'Sprint 22', committed: 22, completed: 22 },
    { sprint: 'Sprint 23', committed: 27, completed: 25 },
    { sprint: 'Sprint 24', committed: 24, completed: 16 },
  ];

  const COLORS = [
    'hsl(var(--primary))', 
    'hsl(var(--accent))', 
    'hsl(var(--coral))', 
    'hsl(var(--amber))', 
    'hsl(var(--indigo))'
  ];

  const aiInsightsData = [
    {
      type: 'trend',
      title: 'User Engagement Surge',
      description: 'User engagement increased 23% this week, driven by new onboarding flow',
      confidence: 92,
      actionable: true,
      impact: 'high'
    },
    {
      type: 'recommendation',
      title: 'Feature Adoption Opportunity',
      description: 'Only 34% of users are using the PRD Generator. Consider adding guided tutorials',
      confidence: 87,
      actionable: true,
      impact: 'medium'
    },
    {
      type: 'alert',
      title: 'Churn Risk Detected',
      description: '15 enterprise customers showing decreased activity patterns',
      confidence: 95,
      actionable: true,
      impact: 'critical'
    }
  ];

  const handleAddWidget = (config: WidgetConfig) => {
    setCustomWidgets(prev => [...prev, config]);
  };

  const handleEditWidget = (config: WidgetConfig) => {
    setCustomWidgets(prev => prev.map(w => w.id === config.id ? config : w));
  };

  const handleDeleteWidget = (id: string) => {
    setCustomWidgets(prev => prev.filter(w => w.id !== id));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6 lg:p-8">
      {/* Dashboard Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Tabs value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
            <TabsList className="loom-rounded h-10 w-full sm:w-auto">
              <TabsTrigger value="7d" className="loom-rounded flex-1 sm:flex-none">7D</TabsTrigger>
              <TabsTrigger value="30d" className="loom-rounded flex-1 sm:flex-none">30D</TabsTrigger>
              <TabsTrigger value="90d" className="loom-rounded flex-1 sm:flex-none">90D</TabsTrigger>
            </TabsList>
          </Tabs>
          <WidgetManager onAddWidget={handleAddWidget} />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <Card className="loom-glass border border-border/30 p-4 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2 min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground font-body">Total Users</p>
              <p className="text-2xl lg:text-3xl font-bold font-headline text-foreground">
                {formatNumber(2847)}
              </p>
              <div className="flex items-center space-x-1 text-sm text-emerald-600">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="font-medium">+12.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 loom-rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="loom-glass border border-border/30 p-4 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2 min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground font-body">Revenue</p>
              <p className="text-2xl lg:text-3xl font-bold font-headline text-foreground">
                ${formatNumber(125000)}
              </p>
              <div className="flex items-center space-x-1 text-sm text-emerald-600">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="font-medium">+8.2%</span>
              </div>
            </div>
            <div className="w-12 h-12 loom-rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </Card>

        <Card className="loom-glass border border-border/30 p-4 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2 min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground font-body">Active Features</p>
              <p className="text-2xl lg:text-3xl font-bold font-headline text-foreground">
                {formatNumber(156)}
              </p>
              <div className="flex items-center space-x-1 text-sm text-blue-600">
                <Activity className="w-4 h-4 shrink-0" />
                <span className="font-medium">+5 this week</span>
              </div>
            </div>
            <div className="w-12 h-12 loom-rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="loom-glass border border-border/30 p-4 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2 min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground font-body">Health Score</p>
              <p className="text-2xl lg:text-3xl font-bold font-headline text-foreground">
                {formatNumber(87)}%
              </p>
              <div className="flex items-center space-x-1 text-sm text-amber-600">
                <Target className="w-4 h-4 shrink-0" />
                <span className="font-medium">Good</span>
              </div>
            </div>
            <div className="w-12 h-12 loom-rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* User Growth Chart - Takes 2 columns on large screens */}
        <Card className="lg:col-span-2 loom-glass border border-border/30">
          <CardHeader className="p-4 lg:p-6 pb-3">
            <CardTitle className="text-lg lg:text-xl font-headline text-foreground">User Growth Trend</CardTitle>
            <p className="text-sm text-muted-foreground font-body">
              Monthly active users and retention rates over time
            </p>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="h-64 lg:h-72">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="retention" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature Adoption Chart */}
        <Card className="loom-glass border border-border/30">
          <CardHeader className="p-4 lg:p-6 pb-3">
            <CardTitle className="text-lg lg:text-xl font-headline text-foreground">Feature Adoption</CardTitle>
            <p className="text-sm text-muted-foreground font-body">
              Usage rates across core features
            </p>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="h-64 lg:h-72">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureAdoptionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="feature" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="adoption" 
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


      {/* Custom Widgets */}
      {customWidgets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl lg:text-2xl font-bold font-headline text-foreground">Custom Widgets</h2>
          <BentoGrid>
            {customWidgets.map((widget) => (
              <ConfigurableWidget
                key={widget.id}
                config={widget}
                onEdit={handleEditWidget}
                onDelete={handleDeleteWidget}
              />
            ))}
          </BentoGrid>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="loom-glass border border-border/30">
        <CardHeader className="p-4 lg:p-6 pb-3">
          <CardTitle className="flex items-center text-lg lg:text-xl font-headline text-foreground">
            <Sparkles className="w-5 h-5 mr-2 text-primary shrink-0" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-16 lg:h-20 flex-col space-y-2 loom-rounded border-border/30 hover:border-primary/30 transition-colors"
              onClick={() => onNavigate?.('sprints')}
            >
              <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-primary shrink-0" />
              <span className="text-xs lg:text-sm font-medium font-body text-center">Sprint Board</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 lg:h-20 flex-col space-y-2 loom-rounded border-border/30 hover:border-primary/30 transition-colors"
              onClick={() => onNavigate?.('customer')}
            >
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-primary shrink-0" />
              <span className="text-xs lg:text-sm font-medium font-body text-center">Customer Portal</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 lg:h-20 flex-col space-y-2 loom-rounded border-border/30 hover:border-primary/30 transition-colors"
              onClick={() => onNavigate?.('roadmap')}
            >
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-primary shrink-0" />
              <span className="text-xs lg:text-sm font-medium font-body text-center">Roadmap</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 lg:h-20 flex-col space-y-2 loom-rounded border-border/30 hover:border-primary/30 transition-colors"
              onClick={() => onNavigate?.('strategy')}
            >
              <Target className="w-5 h-5 lg:w-6 lg:h-6 text-primary shrink-0" />
              <span className="text-xs lg:text-sm font-medium font-body text-center">Strategy</span>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default Dashboard;