import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { 
  Rocket, 
  Shield, 
  BarChart3, 
  TestTube, 
  Brain, 
  Monitor,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Zap,
  ArrowLeft,
  Settings,
  Globe,
  Users,
  Lock,
  Activity
} from 'lucide-react';
import ProductionReadinessDashboard from './enterprise/ProductionReadinessDashboard';
import AdvancedMonitoringDashboard from './enterprise/AdvancedMonitoringDashboard';
import AutomatedTestingSuite from './enterprise/AutomatedTestingSuite';
import PredictiveAnalyticsDashboard from './enterprise/PredictiveAnalyticsDashboard';

interface EnterpriseHubProps {
  onNavigateBack?: () => void;
}

interface EnterpriseFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    primary: { label: string; value: string | number; trend?: 'up' | 'down' | 'stable' };
    secondary: { label: string; value: string | number };
    tertiary: { label: string; value: string | number };
  };
  badge?: string;
}

const EnterpriseHub: React.FC<EnterpriseHubProps> = ({ onNavigateBack }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const enterpriseFeatures: EnterpriseFeature[] = [
    {
      id: 'production',
      title: 'Production Readiness',
      description: 'Comprehensive deployment health monitoring and readiness validation',
      icon: <Rocket className="w-5 h-5" />,
      status: 'healthy',
      metrics: {
        primary: { label: 'System Health', value: '94%', trend: 'up' },
        secondary: { label: 'Active Issues', value: 2 },
        tertiary: { label: 'Uptime', value: '99.9%' }
      }
    },
    {
      id: 'monitoring',
      title: 'Advanced Monitoring',
      description: 'Real-time system metrics, performance tracking, and intelligent alerting',
      icon: <Monitor className="w-5 h-5" />,
      status: 'healthy',
      metrics: {
        primary: { label: 'Response Time', value: '47ms', trend: 'stable' },
        secondary: { label: 'Active Alerts', value: 3 },
        tertiary: { label: 'Services', value: 4 }
      }
    },
    {
      id: 'testing',
      title: 'Automated Testing',
      description: 'Comprehensive test automation, quality gates, and coverage analytics',
      icon: <TestTube className="w-5 h-5" />,
      status: 'warning',
      metrics: {
        primary: { label: 'Coverage', value: '87.5%', trend: 'up' },
        secondary: { label: 'Test Suite', value: 246 },
        tertiary: { label: 'Pass Rate', value: '94%' }
      }
    },
    {
      id: 'predictive',
      title: 'Predictive Analytics',
      description: 'AI-powered forecasting, trend analysis, and business intelligence',
      icon: <Brain className="w-5 h-5" />,
      status: 'healthy',
      metrics: {
        primary: { label: 'Model Accuracy', value: '89%', trend: 'up' },
        secondary: { label: 'Predictions', value: 8 },
        tertiary: { label: 'Risk Alerts', value: 3 }
      },
      badge: 'AI'
    }
  ];

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'text-primary';
      case 'warning': return 'text-amber';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (!trend) return null;
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-primary" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-destructive rotate-180" />;
      case 'stable': return <Activity className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'production':
        return <ProductionReadinessDashboard />;
      case 'monitoring':
        return <AdvancedMonitoringDashboard />;
      case 'testing':
        return <AutomatedTestingSuite />;
      case 'predictive':
        return <PredictiveAnalyticsDashboard />;
      default:
        return (
          <div className="space-y-6">
            {/* Enterprise Overview Cards */}
            <Card className="loom-shadow-md gradient-clarity">
              <CardHeader>
                <CardTitle className="text-xl font-headline">Enterprise Production Readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Your unified product management ecosystem is now enterprise-ready with comprehensive 
                  monitoring, automated testing, predictive analytics, and advanced security features.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Overall Health', value: '94%', icon: CheckCircle, color: 'text-primary' },
                    { label: 'Security Score', value: '98%', icon: Shield, color: 'text-primary' },
                    { label: 'Performance', value: '92%', icon: Zap, color: 'text-primary' },
                    { label: 'Compliance', value: '100%', icon: Lock, color: 'text-primary' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center p-4 rounded-lg bg-card loom-shadow-sm">
                      <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                      <div className="text-2xl font-bold font-headline">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enterpriseFeatures.map((feature) => (
                <Card 
                  key={feature.id} 
                  className="loom-shadow-md loom-hover-lift cursor-pointer transition-all duration-200 border-l-4 border-l-primary"
                  onClick={() => setActiveSection(feature.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-accent ${getStatusColor(feature.status)}`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="font-headline text-lg">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground font-body">{feature.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {feature.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {feature.badge}
                          </Badge>
                        )}
                        <div className={`flex items-center space-x-1 ${getStatusColor(feature.status)}`}>
                          {getStatusIcon(feature.status)}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <span className="text-lg font-bold font-headline">
                            {feature.metrics.primary.value}
                          </span>
                          {getTrendIcon(feature.metrics.primary.trend)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {feature.metrics.primary.label}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold font-headline mb-1">
                          {feature.metrics.secondary.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {feature.metrics.secondary.label}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold font-headline mb-1">
                          {feature.metrics.tertiary.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {feature.metrics.tertiary.label}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="loom-shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-3 text-primary" />
                  Enterprise Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                    <Shield className="w-6 h-6 text-primary" />
                    <span className="font-headline">Security Settings</span>
                    <span className="text-xs text-muted-foreground">Configure access control & compliance</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                    <Globe className="w-6 h-6 text-primary" />
                    <span className="font-headline">Deployment Config</span>
                    <span className="text-xs text-muted-foreground">Manage environments & scaling</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                    <Users className="w-6 h-6 text-primary" />
                    <span className="font-headline">Team Management</span>
                    <span className="text-xs text-muted-foreground">User roles & permissions</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Breadcrumbs */}
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="#" 
                onClick={(e) => { e.preventDefault(); onNavigateBack?.(); }}
                className="flex items-center"
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Enterprise Hub</BreadcrumbPage>
            </BreadcrumbItem>
            {activeSection !== 'overview' && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize">
                    {enterpriseFeatures.find(f => f.id === activeSection)?.title || activeSection}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Enterprise Hub
            </h1>
            <p className="text-muted-foreground font-body">
              Advanced monitoring, automation, and intelligence for enterprise operations
            </p>
          </div>
          
          {activeSection !== 'overview' && (
            <Button 
              variant="outline" 
              onClick={() => setActiveSection('overview')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </Button>
          )}
        </div>
      </div>

      {/* Section Navigation */}
      {activeSection === 'overview' && (
        <Tabs value="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger value="overview" className="font-headline">Overview</TabsTrigger>
            {enterpriseFeatures.map((feature) => (
              <TabsTrigger 
                key={feature.id} 
                value={feature.id}
                onClick={() => setActiveSection(feature.id)}
                className="font-headline flex items-center space-x-1"
              >
                {feature.icon}
                <span className="hidden md:inline">{feature.title.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Section Content */}
      <div className="loom-fade-in">
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default EnterpriseHub;