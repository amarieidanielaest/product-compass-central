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
    <div className="space-y-6 animate-fade-in">
      {/* AI-Powered Header with Personalization */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline gradient-text">
            Product Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground font-body">
            AI-powered insights for {selectedProductId === 'main' ? 'Main Product' : 'All Products'} • Last updated 2 minutes ago
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Tabs value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
            <TabsList className="loom-rounded">
              <TabsTrigger value="7d" className="loom-rounded">7D</TabsTrigger>
              <TabsTrigger value="30d" className="loom-rounded">30D</TabsTrigger>
              <TabsTrigger value="90d" className="loom-rounded">90D</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <WidgetManager onAddWidget={handleAddWidget} />
        </div>
      </div>


      {/* Core Metrics - Redesigned */}
      <BentoGrid>
        {/* Primary KPI Cards */}
        <BentoCard size="sm" variant="highlight" title="Total Users">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold font-headline text-primary">
                {formatNumber(2847)}
              </div>
              <div className="flex items-center space-x-1 text-sm text-emerald-600 mt-1">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 loom-rounded-full bg-primary/10 flex items-center justify-center loom-hover-scale">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </BentoCard>

        <BentoCard size="sm" variant="glass" title="Revenue">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold font-headline text-emerald-600">
                ${formatNumber(125000)}
              </div>
              <div className="flex items-center space-x-1 text-sm text-emerald-600 mt-1">
                <TrendingUp className="w-4 h-4" />
                <span>+8.2%</span>
              </div>
            </div>
            <div className="w-12 h-12 loom-rounded-full bg-emerald/10 flex items-center justify-center loom-hover-scale">
              <DollarSign className="w-6 h-6 text-emerald" />
            </div>
          </div>
        </BentoCard>

        <BentoCard size="sm" variant="clay" title="Active Features">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold font-headline text-indigo">
                {formatNumber(156)}
              </div>
              <div className="flex items-center space-x-1 text-sm text-indigo mt-1">
                <Activity className="w-4 h-4" />
                <span>+5 this week</span>
              </div>
            </div>
            <div className="w-12 h-12 loom-rounded-full bg-indigo/10 flex items-center justify-center loom-hover-scale">
              <Zap className="w-6 h-6 text-indigo" />
            </div>
          </div>
        </BentoCard>

        <BentoCard size="sm" variant="default" title="Health Score">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold font-headline text-amber">
                {formatNumber(87)}%
              </div>
              <div className="flex items-center space-x-1 text-sm text-amber mt-1">
                <Target className="w-4 h-4" />
                <span>Good</span>
              </div>
            </div>
            <div className="w-12 h-12 loom-rounded-full bg-amber/10 flex items-center justify-center loom-hover-scale">
              <Clock className="w-6 h-6 text-amber" />
            </div>
          </div>
        </BentoCard>

        {/* Enhanced Charts */}
        <BentoCard size="lg" variant="glass" title="User Growth Trend" 
          description="Monthly active users and retention rates over time">
          <div className="h-64">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={userGrowthData}>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="retention" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </BentoCard>

        {/* Feature Adoption */}
        <BentoCard size="md" variant="highlight" title="Feature Adoption" 
          description="Usage rates across core platform features">
          <div className="h-48">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureAdoptionData}>
                  <XAxis dataKey="feature" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="adoption" 
                    fill="hsl(var(--coral))" 
                    className="loom-rounded"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </BentoCard>

        {/* AI Insights Widget */}
        <BentoCard size="lg" variant="highlight" title="AI Intelligence Center" 
          description="Smart insights and recommendations powered by machine learning">
          <div className="space-y-4">
            {aiInsightsData.map((insight, index) => (
              <div key={index} className="p-4 loom-glass loom-rounded border border-border/30 loom-hover-lift">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      insight.impact === 'critical' ? 'destructive' :
                      insight.impact === 'high' ? 'default' : 'secondary'
                    }>
                      {insight.type}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Brain className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  {insight.actionable && (
                    <Button size="sm" variant="outline" className="loom-rounded text-xs">
                      Take Action
                    </Button>
                  )}
                </div>
                <h4 className="font-medium font-headline text-sm mb-1">{insight.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Interactive Demo Integration */}
        <BentoCard size="md" variant="clay" title="Interactive Learning">
          <InteractiveDemo
            title="Explore Features"
            description="Discover new capabilities with guided tutorials"
            steps={[
              { id: '1', title: 'Dashboard Tour', description: 'Learn the basics', duration: 15 },
              { id: '2', title: 'AI Features', description: 'Discover AI capabilities', duration: 20 },
            ]}
            onComplete={() => console.log('Demo completed')}
          />
        </BentoCard>

        {/* Custom Widgets */}
        {customWidgets.map((widget) => (
          <ConfigurableWidget
            key={widget.id}
            config={widget}
            onEdit={handleEditWidget}
            onDelete={handleDeleteWidget}
          />
        ))}
      </BentoGrid>

      {/* Emotional Feedback Integration */}
      <EmotionalFeedback 
        message="🎉 Great job! Your user engagement is up 23% this week. Keep up the amazing work!"
        type="celebration"
        className="animate-slide-in-right"
      />

      {/* Quick Navigation */}
      <Card className="loom-glass border border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center font-headline">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1 loom-rounded loom-hover-scale"
              onClick={() => onNavigate?.('sprints')}
            >
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="text-sm font-body">Sprint Board</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1 loom-rounded loom-hover-scale"
              onClick={() => onNavigate?.('customer')}
            >
              <Users className="w-5 h-5 text-accent" />
              <span className="text-sm font-body">Customer Portal</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1 loom-rounded loom-hover-scale"
              onClick={() => onNavigate?.('roadmap')}
            >
              <Calendar className="w-5 h-5 text-coral" />
              <span className="text-sm font-body">Roadmap</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1 loom-rounded loom-hover-scale"
              onClick={() => onNavigate?.('strategy')}
            >
              <Target className="w-5 h-5 text-indigo" />
              <span className="text-sm font-body">Strategy</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;