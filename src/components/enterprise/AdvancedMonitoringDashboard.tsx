import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, BarChart3, Clock, Database, Globe, Server, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface SystemMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  service: string;
  message: string;
  stackTrace?: string;
  count: number;
}

interface ServiceMetric {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  errorRate: number;
  requestsPerMinute: number;
  uptime: number;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'triggered' | 'resolved';
  lastTriggered?: string;
}

const AdvancedMonitoringDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetric[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMonitoringData();
    
    let interval: NodeJS.Timeout;
    if (realTimeEnabled) {
      interval = setInterval(loadMonitoringData, 5000); // Update every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeEnabled]);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);

      // Generate mock real-time data
      const now = new Date();
      const metrics: SystemMetric[] = [];
      
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60000).toISOString(); // Last 24 minutes
        metrics.push({
          timestamp,
          cpu: Math.random() * 100,
          memory: 60 + Math.random() * 30,
          disk: 40 + Math.random() * 20,
          network: Math.random() * 1000
        });
      }
      setSystemMetrics(metrics);

      // Mock service metrics
      const services: ServiceMetric[] = [
        {
          name: 'API Gateway',
          status: 'healthy',
          responseTime: 45 + Math.random() * 20,
          errorRate: Math.random() * 2,
          requestsPerMinute: 1200 + Math.random() * 300,
          uptime: 99.9
        },
        {
          name: 'Database',
          status: 'healthy',
          responseTime: 12 + Math.random() * 8,
          errorRate: Math.random() * 0.5,
          requestsPerMinute: 800 + Math.random() * 200,
          uptime: 99.95
        },
        {
          name: 'Authentication',
          status: Math.random() > 0.8 ? 'degraded' : 'healthy',
          responseTime: 89 + Math.random() * 50,
          errorRate: Math.random() * 3,
          requestsPerMinute: 450 + Math.random() * 150,
          uptime: 99.7
        },
        {
          name: 'Email Service',
          status: 'healthy',
          responseTime: 156 + Math.random() * 100,
          errorRate: Math.random() * 1,
          requestsPerMinute: 120 + Math.random() * 50,
          uptime: 99.8
        }
      ];
      setServiceMetrics(services);

      // Mock error logs
      const logs: ErrorLog[] = [
        {
          id: '1',
          timestamp: new Date(now.getTime() - 300000).toISOString(),
          level: 'error',
          service: 'API Gateway',
          message: 'Database connection timeout',
          count: 3
        },
        {
          id: '2',
          timestamp: new Date(now.getTime() - 600000).toISOString(),
          level: 'warning',
          service: 'Authentication',
          message: 'High response time detected',
          count: 12
        },
        {
          id: '3',
          timestamp: new Date(now.getTime() - 900000).toISOString(),
          level: 'info',
          service: 'Email Service',
          message: 'Queue processing completed',
          count: 1
        }
      ];
      setErrorLogs(logs);

      // Mock alert rules
      const alerts: AlertRule[] = [
        {
          id: '1',
          name: 'High CPU Usage',
          condition: 'cpu > 80%',
          threshold: 80,
          severity: 'high',
          status: 'active'
        },
        {
          id: '2',
          name: 'API Error Rate',
          condition: 'error_rate > 5%',
          threshold: 5,
          severity: 'critical',
          status: 'active'
        },
        {
          id: '3',
          name: 'Database Response Time',
          condition: 'response_time > 100ms',
          threshold: 100,
          severity: 'medium',
          status: 'resolved',
          lastTriggered: new Date(now.getTime() - 7200000).toISOString()
        }
      ];
      setAlertRules(alerts);

    } catch (error) {
      console.error('Failed to load monitoring data:', error);
      toast({
        title: "Error loading monitoring data",
        description: "Failed to fetch system metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Advanced Monitoring Dashboard
          </h2>
          <p className="text-muted-foreground">Real-time system metrics and performance monitoring</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={realTimeEnabled ? "default" : "outline"}
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
          >
            <Activity className="w-4 h-4 mr-2" />
            {realTimeEnabled ? 'Live' : 'Paused'}
          </Button>
        </div>
      </div>

      {/* Overall System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">System Status</p>
                <p className="text-lg font-bold text-green-600">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-lg font-bold">99.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Avg Response</p>
                <p className="text-lg font-bold">47ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Active Alerts</p>
                <p className="text-lg font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="logs">Error Logs</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  CPU & Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={systemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cpu" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      name="CPU %"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="memory" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      name="Memory %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-green-600" />
                  Disk & Network Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={systemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="disk" 
                      stroke="hsl(var(--chart-3))" 
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.6}
                      name="Disk %"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="network" 
                      stroke="hsl(var(--chart-4))" 
                      fill="hsl(var(--chart-4))"
                      fillOpacity={0.6}
                      name="Network MB/s"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceMetrics.map((service, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{service.name}</h3>
                    <Badge className={getServiceStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Response Time:</span>
                      <div className="font-medium">{Math.round(service.responseTime)}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Error Rate:</span>
                      <div className="font-medium">{service.errorRate.toFixed(2)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Requests/min:</span>
                      <div className="font-medium">{Math.round(service.requestsPerMinute)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Uptime:</span>
                      <div className="font-medium">{service.uptime}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="space-y-3">
            {errorLogs.map((log) => (
              <Alert key={log.id}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getLogLevelColor(log.level)}>
                          {log.level}
                        </Badge>
                        <Badge variant="outline">{log.service}</Badge>
                        {log.count > 1 && (
                          <Badge variant="secondary">{log.count}x</Badge>
                        )}
                      </div>
                      <p className="font-medium mb-1">{log.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            {alertRules.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{alert.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant={alert.status === 'active' ? 'default' : 'secondary'}>
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Condition: {alert.condition}
                  </p>
                  {alert.lastTriggered && (
                    <p className="text-xs text-muted-foreground">
                      Last triggered: {new Date(alert.lastTriggered).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedMonitoringDashboard;