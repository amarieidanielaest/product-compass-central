import { useState } from 'react';
import { TrendingUp, Users, Calendar, Star, Settings, Plus, BarChart3, PieChart, LineChart, Target, DollarSign, Clock, AlertTriangle, Sparkles, Zap, Activity, Brain, Kanban, MessageSquare, Map } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-headline text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground font-body">Monitor your product performance and key metrics</p>
          </div>
        </div>
        
        {/* Dashboard Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
            <TabsList className="loom-rounded h-9 w-full sm:w-auto">
              <TabsTrigger value="7d" className="loom-rounded-sm text-xs px-3">7 Days</TabsTrigger>
              <TabsTrigger value="30d" className="loom-rounded-sm text-xs px-3">30 Days</TabsTrigger>
              <TabsTrigger value="90d" className="loom-rounded-sm text-xs px-3">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <WidgetManager onAddWidget={handleAddWidget} />
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="loom-glass border border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground font-body">Total Users</p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold font-headline text-foreground">
                    {formatNumber(2847)}
                  </p>
                  <div className="flex items-center space-x-1 text-sm text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">+12.5%</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="loom-glass border border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground font-body">Revenue</p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold font-headline text-foreground">
                    ${formatNumber(125000)}
                  </p>
                  <div className="flex items-center space-x-1 text-sm text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">+8.2%</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="loom-glass border border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground font-body">Active Features</p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold font-headline text-foreground">
                    {formatNumber(156)}
                  </p>
                  <div className="flex items-center space-x-1 text-sm text-blue-600">
                    <Activity className="w-4 h-4" />
                    <span className="font-medium">+5 this week</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="loom-glass border border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground font-body">Health Score</p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold font-headline text-foreground">
                    {formatNumber(87)}%
                  </p>
                  <div className="flex items-center space-x-1 text-sm text-amber-600">
                    <Target className="w-4 h-4" />
                    <span className="font-medium">Good</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Growth Chart - Takes 2 columns on large screens */}
        <Card className="xl:col-span-2 loom-glass border border-border/30">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-xl font-headline text-foreground">User Growth Trend</CardTitle>
            <p className="text-sm text-muted-foreground font-body">
              Monthly active users and retention rates over time
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-80">
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
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="retention" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 5 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature Adoption Chart */}
        <Card className="loom-glass border border-border/30">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-xl font-headline text-foreground">Feature Adoption</CardTitle>
            <p className="text-sm text-muted-foreground font-body">
              Usage rates across core features
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-80">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureAdoptionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="feature" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
        <CardHeader className="p-6 pb-4">
          <CardTitle className="flex items-center text-xl font-headline text-foreground">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            Quick Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground font-body">
            Navigate to your most used features
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 loom-rounded border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              onClick={() => onNavigate?.('sprints')}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Kanban className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium font-body">Sprint Board</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 loom-rounded border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              onClick={() => onNavigate?.('customer')}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium font-body">Customer Board</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 loom-rounded border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              onClick={() => onNavigate?.('roadmap')}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Map className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium font-body">Roadmap</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 loom-rounded border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              onClick={() => onNavigate?.('strategy')}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium font-body">Strategy</span>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default Dashboard;