import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  MessageCircle, 
  ExternalLink,
  Target,
  Users,
  Lightbulb,
  Book,
  Search
} from 'lucide-react';
import ProductionReadinessDashboard from './enterprise/ProductionReadinessDashboard';
import AdvancedMonitoringDashboard from './enterprise/AdvancedMonitoringDashboard';
import AutomatedTestingSuite from './enterprise/AutomatedTestingSuite';
import PredictiveAnalyticsDashboard from './enterprise/PredictiveAnalyticsDashboard';

interface Phase4DemoProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

const Phase5Demo = ({ selectedProductId, onNavigate }: Phase4DemoProps) => {
  const [activeDemo, setActiveDemo] = useState<string>('overview');

  const phase4Features = [
    {
      id: 'production',
      title: 'Production Readiness',
      description: 'Comprehensive production monitoring and health checks',
      icon: <Rocket className="w-6 h-6" />,
      status: 'completed',
      metrics: { readiness: 94, issues: 2, uptime: 99.9 }
    },
    {
      id: 'monitoring',
      title: 'Advanced Monitoring',
      description: 'Real-time system metrics and performance tracking',
      icon: <Monitor className="w-6 h-6" />,
      status: 'completed',
      metrics: { alerts: 3, services: 4, response: '47ms' }
    },
    {
      id: 'testing',
      title: 'Automated Testing',
      description: 'Comprehensive test automation and quality assurance',
      icon: <TestTube className="w-6 h-6" />,
      status: 'completed',
      metrics: { coverage: 87.5, tests: 246, passRate: 94 }
    },
    {
      id: 'predictive',
      title: 'Predictive Analytics',
      description: 'AI-powered predictions and trend forecasting',
      icon: <Brain className="w-6 h-6" />,
      status: 'completed',
      metrics: { accuracy: 89, predictions: 8, risks: 3 }
    }
  ];

  const renderFeatureDemo = () => {
    switch (activeDemo) {
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
            {/* Phase 4 Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Rocket className="w-6 h-6 mr-3 text-blue-600" />
                  Phase 4: Enterprise Production Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Phase 4 delivers enterprise-grade production readiness with comprehensive monitoring, 
                  automated testing, predictive analytics, and advanced system observability.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'System Health', value: '94%', icon: CheckCircle, color: 'text-green-600' },
                    { label: 'Test Coverage', value: '87.5%', icon: Shield, color: 'text-blue-600' },
                    { label: 'Model Accuracy', value: '89%', icon: Brain, color: 'text-purple-600' },
                    { label: 'Uptime', value: '99.9%', icon: TrendingUp, color: 'text-green-600' }
                  ].map((stat, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 text-center">
                        <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {phase4Features.map((feature) => (
                <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setActiveDemo(feature.id)}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        {feature.icon}
                        <span className="ml-3">{feature.title}</span>
                      </div>
                      <Badge variant={feature.status === 'completed' ? 'default' : 'secondary'}>
                        {feature.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {Object.entries(feature.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="font-bold text-lg">{value}</div>
                          <div className="text-muted-foreground capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Implementation Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-6 h-6 mr-3 text-yellow-600" />
                  Phase 4 Implementation Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      Production Features
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Real-time system health monitoring</li>
                      <li>• Automated deployment readiness checks</li>
                      <li>• Performance bottleneck detection</li>
                      <li>• Security vulnerability scanning</li>
                      <li>• Database migration management</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-600" />
                      AI-Powered Insights
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Predictive churn analysis</li>
                      <li>• Revenue growth forecasting</li>
                      <li>• Risk assessment automation</li>
                      <li>• Opportunity identification</li>
                      <li>• Performance optimization recommendations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
              <CardContent className="p-6 text-center">
                <Rocket className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">Ready for Production Deployment</h3>
                <p className="text-muted-foreground mb-4">
                  Your unified product management ecosystem is now enterprise-ready with comprehensive 
                  monitoring, testing, and predictive capabilities.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Deploy to Production
                  </Button>
                  <Button variant="outline">
                    View Documentation
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Phase 4: Enterprise Production Readiness
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced monitoring, testing, and predictive analytics for production deployment
          </p>
        </div>
        
        {activeDemo !== 'overview' && (
          <Button variant="outline" onClick={() => setActiveDemo('overview')}>
            ← Back to Overview
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      {activeDemo === 'overview' && (
        <Tabs value="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <Badge 
              className="cursor-pointer px-3 py-1" 
              onClick={() => setActiveDemo('production')}
            >
              Production
            </Badge>
            <Badge 
              className="cursor-pointer px-3 py-1" 
              onClick={() => setActiveDemo('monitoring')}
            >
              Monitoring
            </Badge>
            <Badge 
              className="cursor-pointer px-3 py-1" 
              onClick={() => setActiveDemo('testing')}
            >
              Testing
            </Badge>
            <Badge 
              className="cursor-pointer px-3 py-1" 
              onClick={() => setActiveDemo('predictive')}
            >
              Predictive
            </Badge>
          </TabsList>
        </Tabs>
      )}

      {renderFeatureDemo()}
    </div>
  );
};

export default Phase5Demo;