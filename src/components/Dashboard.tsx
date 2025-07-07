import { useState } from 'react';
import { TrendingUp, Users, Calendar, Star, Settings, Plus, BarChart3, PieChart, LineChart, Target, DollarSign, Clock, AlertTriangle, Sparkles } from 'lucide-react';
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
import loomLogo from '@/assets/loom-logo.png';

interface DashboardProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

const Dashboard = ({ selectedProductId, onNavigate }: DashboardProps) => {
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState('users');

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

  const alerts = [
    { id: 1, type: 'warning', message: 'Sprint 24 is behind schedule', action: 'View Sprint' },
    { id: 2, type: 'info', message: '5 new customer feedback items', action: 'Review' },
    { id: 3, type: 'success', message: 'Dark mode feature completed', action: 'Deploy' },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber" />;
      case 'info': return <Star className="w-4 h-4 text-indigo" />;
      case 'success': return <Target className="w-4 h-4 text-accent" />;
      default: return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* SaaS Trend: Emotional Design - Success celebration */}
      <EmotionalFeedback 
        message="Welcome back! Your product metrics are looking fantastic today. 🚀"
        type="celebration"
        className="loom-slide-up"
      />

      {/* Header with Loom Branding */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 prism-bg p-6 loom-rounded-lg loom-hover-lift">
        <div className="flex items-center space-x-4">
          <img src={loomLogo} alt="Loom" className="w-12 h-12 hidden sm:block loom-hover-scale" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold gradient-intelligence bg-clip-text text-transparent mb-2 loom-fade-in">
              Your Creative Command Center
            </h2>
            <p className="text-muted-foreground font-body">
              {selectedProductId === 'main' ? 'Main Product — Where the magic happens' : 
               selectedProductId === 'beta' ? 'Beta Product — Innovation in progress' : 
               'Ready to turn complexity into clarity? Let\'s weave some product magic.'}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as '7d' | '30d' | '90d')}>
            <TabsList className="bg-background border border-border loom-glass">
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="loom-action" className="loom-hover-glow">
            <Sparkles className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* KPI Cards with Loom Brand Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-l-4 border-l-primary loom-hover-lift loom-shadow-md transition-all duration-200 loom-glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold font-headline">
                  {userMetricsLoading ? '...' : userMetrics?.activeUsers?.toLocaleString() || '2,847'}
                </p>
                <p className="text-xs text-accent font-medium">+12% from last week</p>
              </div>
              <div className="w-12 h-12 loom-rounded-full bg-primary/10 flex items-center justify-center loom-hover-scale">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-accent hover:loom-shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                <p className="text-2xl font-bold font-headline">
                  {userMetricsLoading ? '...' : `${userMetrics?.retentionRate || 87}%`}
                </p>
                <p className="text-xs text-accent font-medium">
                  {userMetrics?.retentionRate && userMetrics.retentionRate > 85 ? '+3% improvement' : '+8% from last month'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-coral hover:loom-shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                <p className="text-2xl font-bold font-headline">
                  {healthLoading ? '...' : `${productHealth?.overallHealth || 67}%`}
                </p>
                <p className="text-xs text-amber font-medium">-3% from target</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-coral" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-indigo hover:loom-shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Score</p>
                <p className="text-2xl font-bold font-headline">
                  {userMetricsLoading ? '...' : `${userMetrics?.engagementScore || 8.4}`}
                </p>
                <p className="text-xs text-accent font-medium">+15% improvement</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section with Loom Voice */}
      {aiInsights && aiInsights.length > 0 ? (
        <Card className="gradient-clarity border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center font-headline">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              AI-Powered Insights — Your Creative Partner at Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.slice(0, 3).map((insight, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-background/50 loom-rounded-lg border border-border/50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={
                        insight.type === 'opportunity' ? 'bg-accent/10 text-accent border-accent/20' :
                        insight.type === 'warning' ? 'bg-amber/10 text-amber border-amber/20' :
                        'bg-primary/10 text-primary border-primary/20'
                      }>
                        {insight.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                    <h4 className="font-medium font-headline">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                  {insight.actionable && (
                    <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                      Take Action
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <WelcomeMessage 
          title="AI Insights Coming Soon!"
          description="We're weaving your data into brilliant insights. Check back in a moment for your personalized recommendations."
        />
      )}

      {/* SaaS Trend: Interactive Demo Integration */}
      <InteractiveDemo
        title="Explore Loom's Intelligence"
        description="Take a guided tour through our AI-powered features"
        steps={[
          { id: '1', title: 'Dashboard Overview', description: 'Understand your key metrics at a glance', duration: 20 },
          { id: '2', title: 'AI Insights', description: 'Discover intelligent recommendations', duration: 25 },
          { id: '3', title: 'Strategic Planning', description: 'Learn how to align your roadmap', duration: 30 },
        ]}
        onComplete={() => {
          // Show achievement toast
        }}
        className="loom-fade-in"
      />

      {/* Real-time Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber" />
            Real-time Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-secondary/50 loom-rounded-lg">
                <div className="flex items-center space-x-3">
                  {getAlertIcon(alert.type)}
                  <span className="text-sm text-foreground font-body">{alert.message}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onNavigate?.(alert.action.toLowerCase().includes('sprint') ? 'sprints' : 'customer')}
                >
                  {alert.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-16 flex-col space-y-1 loom-rounded-lg"
          onClick={() => onNavigate?.('sprints')}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm">View Sprints</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-16 flex-col space-y-1 loom-rounded-lg"
          onClick={() => onNavigate?.('customer')}
        >
          <Users className="w-5 h-5" />
          <span className="text-sm">Customer Feedback</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-16 flex-col space-y-1 loom-rounded-lg"
          onClick={() => onNavigate?.('roadmap')}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-sm">Roadmap</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-16 flex-col space-y-1 loom-rounded-lg"
          onClick={() => onNavigate?.('strategy')}
        >
          <Target className="w-5 h-5" />
          <span className="text-sm">Strategy</span>
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              User Growth & Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area yAxisId="left" type="monotone" dataKey="users" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Line yAxisId="right" type="monotone" dataKey="retention" stroke="hsl(var(--accent))" strokeWidth={3} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Feature Adoption */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-coral" />
              Feature Adoption Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <BarChart data={featureAdoptionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="feature" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="adoption" fill="hsl(var(--coral))" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-amber" />
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    dataKey="count"
                    label={({ score, percentage }) => `${score}: ${percentage}%`}
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sprint Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo" />
              Sprint Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <BarChart data={sprintMetrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="sprint" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="committed" fill="hsl(var(--amber))" />
                <Bar dataKey="completed" fill="hsl(var(--indigo))" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
