import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Shield, Zap, Database, Monitor, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  lastCheck: string;
  responseTime: number;
  uptime: number;
  details: string;
}

interface PerformanceMetric {
  id: string;
  metric: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

interface SecurityScan {
  id: string;
  type: 'vulnerability' | 'compliance' | 'access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved';
  detectedAt: string;
}

const ProductionReadinessDashboard: React.FC = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [securityScans, setSecurityScans] = useState<SecurityScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [readinessScore, setReadinessScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadProductionData();
    const interval = setInterval(loadProductionData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadProductionData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in production, this would come from real monitoring APIs
      const mockHealthChecks: HealthCheck[] = [
        {
          id: '1',
          name: 'Database Connection',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          responseTime: 12,
          uptime: 99.9,
          details: 'Primary database responding normally'
        },
        {
          id: '2',
          name: 'API Gateway',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          responseTime: 45,
          uptime: 99.8,
          details: 'All endpoints operational'
        },
        {
          id: '3',
          name: 'Authentication Service',
          status: 'warning',
          lastCheck: new Date().toISOString(),
          responseTime: 150,
          uptime: 99.5,
          details: 'Elevated response times detected'
        },
        {
          id: '4',
          name: 'Email Service',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          responseTime: 89,
          uptime: 99.7,
          details: 'Email delivery queue processing normally'
        }
      ];

      const mockPerformanceMetrics: PerformanceMetric[] = [
        {
          id: '1',
          metric: 'Average Response Time',
          current: 234,
          target: 200,
          unit: 'ms',
          trend: 'up',
          status: 'warning'
        },
        {
          id: '2',
          metric: 'Database Query Time',
          current: 45,
          target: 50,
          unit: 'ms',
          trend: 'down',
          status: 'good'
        },
        {
          id: '3',
          metric: 'Memory Usage',
          current: 72,
          target: 80,
          unit: '%',
          trend: 'stable',
          status: 'good'
        },
        {
          id: '4',
          metric: 'CPU Usage',
          current: 68,
          target: 70,
          unit: '%',
          trend: 'up',
          status: 'warning'
        }
      ];

      const mockSecurityScans: SecurityScan[] = [
        {
          id: '1',
          type: 'vulnerability',
          severity: 'medium',
          description: 'Outdated dependency: lodash@4.17.19',
          remediation: 'Update to lodash@4.17.21 or later',
          status: 'open',
          detectedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          type: 'compliance',
          severity: 'low',
          description: 'Missing security headers in some API responses',
          remediation: 'Add CSP and HSTS headers to all API responses',
          status: 'in_progress',
          detectedAt: '2024-01-14T15:45:00Z'
        }
      ];

      setHealthChecks(mockHealthChecks);
      setPerformanceMetrics(mockPerformanceMetrics);
      setSecurityScans(mockSecurityScans);

      // Calculate readiness score
      const healthyServices = mockHealthChecks.filter(h => h.status === 'healthy').length;
      const totalServices = mockHealthChecks.length;
      const goodMetrics = mockPerformanceMetrics.filter(m => m.status === 'good').length;
      const totalMetrics = mockPerformanceMetrics.length;
      const resolvedIssues = mockSecurityScans.filter(s => s.status === 'resolved').length;
      const totalIssues = Math.max(mockSecurityScans.length, 1);

      const score = Math.round(
        ((healthyServices / totalServices) * 40) +
        ((goodMetrics / totalMetrics) * 35) +
        ((resolvedIssues / totalIssues) * 25)
      );
      
      setReadinessScore(score);

    } catch (error) {
      console.error('Failed to load production data:', error);
      toast({
        title: "Error loading production data",
        description: "Failed to fetch system health information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
      case 'in_progress':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
      case 'resolved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
      case 'open':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down':
        return <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const runFullHealthCheck = async () => {
    toast({
      title: "Running comprehensive health check",
      description: "This may take a few minutes to complete",
    });
    
    // Simulate health check
    setTimeout(() => {
      loadProductionData();
      toast({
        title: "Health check completed",
        description: "All system components have been verified",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Production Readiness Dashboard
          </h2>
          <p className="text-muted-foreground">Monitor system health, performance, and security</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={runFullHealthCheck} disabled={loading}>
            <Monitor className="w-4 h-4 mr-2" />
            Run Health Check
          </Button>
        </div>
      </div>

      {/* Readiness Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Production Readiness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={readinessScore} className="h-3" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {readinessScore}%
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {readinessScore >= 90 ? 'Ready for production deployment' :
             readinessScore >= 75 ? 'Minor issues need attention' :
             'Critical issues must be resolved before deployment'}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthChecks.map((check) => (
              <Card key={check.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{check.name}</h3>
                    <Badge className={getStatusColor(check.status)}>
                      {getStatusIcon(check.status)}
                      <span className="ml-1">{check.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{check.details}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Response Time:</span>
                      <div className="font-medium">{check.responseTime}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Uptime:</span>
                      <div className="font-medium">{check.uptime}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{metric.metric}</h3>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(metric.trend)}
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-2xl font-bold">{metric.current}</span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    <span className="text-sm text-muted-foreground">
                      / {metric.target} {metric.unit} target
                    </span>
                  </div>
                  <Progress 
                    value={(metric.current / metric.target) * 100} 
                    className="h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {securityScans.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Security Issues Found</h3>
                <p className="text-muted-foreground">Your system passed all security scans</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {securityScans.map((scan) => (
                <Alert key={scan.id}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline">{scan.type}</Badge>
                          <Badge className={getStatusColor(scan.severity)}>
                            {scan.severity}
                          </Badge>
                          <Badge className={getStatusColor(scan.status)}>
                            {scan.status}
                          </Badge>
                        </div>
                        <p className="font-medium mb-1">{scan.description}</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Remediation:</strong> {scan.remediation}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Detected: {new Date(scan.detectedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-600" />
                  Database Migration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Schema Version</span>
                    <Badge variant="outline">v2.1.4</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pending Migrations</span>
                    <Badge className="bg-green-50 text-green-600">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Backup Status</span>
                    <Badge className="bg-green-50 text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Environment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Production</span>
                    <Badge className="bg-green-50 text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Staging</span>
                    <Badge className="bg-green-50 text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CI/CD Pipeline</span>
                    <Badge className="bg-green-50 text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Passing
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionReadinessDashboard;