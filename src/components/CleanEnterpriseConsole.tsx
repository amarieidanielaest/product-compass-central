import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Monitor, 
  TestTube, 
  Brain, 
  Activity,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Settings,
  Globe,
  Users,
  Lock,
  ArrowLeft,
  BarChart3,
  Zap,
  Server,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductionReadinessDashboard from './enterprise/ProductionReadinessDashboard';
import AdvancedMonitoringDashboard from './enterprise/AdvancedMonitoringDashboard';
import AutomatedTestingSuite from './enterprise/AutomatedTestingSuite';
import PredictiveAnalyticsDashboard from './enterprise/PredictiveAnalyticsDashboard';

interface EnterpriseConsoleProps {
  onNavigateBack?: () => void;
}

interface SystemMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ReactNode;
}

interface FeatureModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    primary: { label: string; value: string; trend?: 'up' | 'down' | 'stable' };
    secondary: { label: string; value: string };
  };
  progress?: number;
}

export const CleanEnterpriseConsole: React.FC<EnterpriseConsoleProps> = ({ onNavigateBack }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  // System overview metrics
  const systemMetrics: SystemMetric[] = [
    {
      id: 'health',
      title: 'System Health',
      value: '98.5%',
      change: '+0.3%',
      trend: 'up',
      status: 'healthy',
      icon: <Activity className="h-4 w-4" />
    },
    {
      id: 'uptime',
      title: 'Uptime',
      value: '99.97%',
      change: '30 days',
      trend: 'stable',
      status: 'healthy',
      icon: <Server className="h-4 w-4" />
    },
    {
      id: 'performance',
      title: 'Avg Response',
      value: '47ms',
      change: '-12ms',
      trend: 'up',
      status: 'healthy',
      icon: <Zap className="h-4 w-4" />
    },
    {
      id: 'security',
      title: 'Security Score',
      value: '94/100',
      change: '+2',
      trend: 'up',
      status: 'healthy',
      icon: <Shield className="h-4 w-4" />
    }
  ];

  // Enterprise feature modules
  const enterpriseModules: FeatureModule[] = [
    {
      id: 'production',
      title: 'Production Monitoring',
      description: 'Real-time system health, deployment tracking, and performance monitoring',
      icon: <Monitor className="h-5 h-5" />,
      status: 'healthy',
      metrics: {
        primary: { label: 'Active Services', value: '12', trend: 'stable' },
        secondary: { label: 'Deployments Today', value: '3' }
      },
      progress: 94
    },
    {
      id: 'security',
      title: 'Security & Compliance',
      description: 'Access control, audit logs, compliance monitoring, and vulnerability scanning',
      icon: <Shield className="h-5 h-5" />,
      status: 'healthy',
      metrics: {
        primary: { label: 'Security Events', value: '2', trend: 'down' },
        secondary: { label: 'Compliance Score', value: '98%' }
      },
      progress: 98
    },
    {
      id: 'testing',
      title: 'Quality Assurance',
      description: 'Automated testing suites, coverage analysis, and quality gates',
      icon: <TestTube className="h-5 h-5" />,
      status: 'warning',
      metrics: {
        primary: { label: 'Test Coverage', value: '87%', trend: 'up' },
        secondary: { label: 'Tests Passing', value: '246/260' }
      },
      progress: 87
    },
    {
      id: 'analytics',
      title: 'Business Intelligence',
      description: 'Advanced analytics, predictive insights, and business intelligence dashboards',
      icon: <Brain className="h-5 h-5" />,
      status: 'healthy',
      metrics: {
        primary: { label: 'Data Models', value: '8', trend: 'stable' },
        secondary: { label: 'Accuracy', value: '92%' }
      },
      progress: 92
    }
  ];

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-emerald-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      case 'stable': return <Activity className="h-3 w-3 text-slate-500" />;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'production':
        return <ProductionReadinessDashboard />;
      case 'monitoring':
        return <AdvancedMonitoringDashboard />;
      case 'testing':
        return <AutomatedTestingSuite />;
      case 'analytics':
        return <PredictiveAnalyticsDashboard />;
      default:
        return (
          <div className="space-y-6">
            {/* System Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Overview
                </CardTitle>
                <CardDescription>
                  Real-time health and performance metrics across your enterprise platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {systemMetrics.map((metric) => (
                    <div key={metric.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-muted-foreground">
                          {metric.icon}
                        </div>
                        {getStatusIcon(metric.status)}
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <div className="text-sm text-muted-foreground">{metric.title}</div>
                        <div className="flex items-center gap-1 text-xs">
                          {getTrendIcon(metric.trend)}
                          <span className={cn(
                            metric.trend === 'up' ? 'text-emerald-600' : 
                            metric.trend === 'down' ? 'text-red-600' : 
                            'text-slate-600'
                          )}>
                            {metric.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enterpriseModules.map((module) => (
                <Card 
                  key={module.id} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary"
                  onClick={() => setActiveSection(module.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {module.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {module.description}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusIcon(module.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      {module.progress && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Health Score</span>
                            <span className="font-medium">{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-2" />
                        </div>
                      )}

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-semibold">
                              {module.metrics.primary.value}
                            </span>
                            {module.metrics.primary.trend && (
                              <div className="ml-1">
                                {getTrendIcon(module.metrics.primary.trend)}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {module.metrics.primary.label}
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            {module.metrics.secondary.value}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {module.metrics.secondary.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Enterprise Management
                </CardTitle>
                <CardDescription>
                  Quick access to enterprise configuration and management tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="font-medium">Security Center</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Manage access controls and security policies
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Globe className="h-6 w-6 text-primary" />
                    <span className="font-medium">Deployment Hub</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Configure environments and deployment settings
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    <span className="font-medium">Team Administration</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Manage users, roles, and organizational structure
                    </span>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Console</h1>
          <p className="text-muted-foreground">
            Monitor, manage, and optimize your enterprise platform operations
          </p>
        </div>
        
        {activeSection !== 'overview' && (
          <Button 
            variant="outline" 
            onClick={() => setActiveSection('overview')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      <div className="animate-fade-in">
        {renderContent()}
      </div>
    </div>
  );
};

export default CleanEnterpriseConsole;