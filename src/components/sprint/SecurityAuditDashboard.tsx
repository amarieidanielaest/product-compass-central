import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Lock,
  Users,
  Activity,
  Clock,
  TrendingUp,
  FileText,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'access_violation' | 'permission_change' | 'data_export' | 'login_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user: string;
  timestamp: string;
  resolved: boolean;
  details: Record<string, any>;
}

interface ComplianceCheck {
  id: string;
  name: string;
  category: 'data_protection' | 'access_control' | 'audit_trail' | 'encryption';
  status: 'passed' | 'failed' | 'warning';
  description: string;
  lastChecked: string;
  details: string;
}

interface AccessLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export const SecurityAuditDashboard: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAuditRun, setLastAuditRun] = useState<string>('');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'access_violation',
          severity: 'high',
          description: 'Attempted access to restricted sprint board',
          user: 'john.doe@company.com',
          timestamp: '2024-01-20T15:30:00Z',
          resolved: false,
          details: { boardId: 'board-123', attemptedAction: 'delete' }
        },
        {
          id: '2',
          type: 'permission_change',
          severity: 'medium',
          description: 'User permissions elevated to admin level',
          user: 'admin@company.com',
          timestamp: '2024-01-20T14:15:00Z',
          resolved: true,
          details: { targetUser: 'jane.smith@company.com', newRole: 'admin' }
        },
        {
          id: '3',
          type: 'data_export',
          severity: 'medium',
          description: 'Large dataset export performed',
          user: 'manager@company.com',
          timestamp: '2024-01-20T12:00:00Z',
          resolved: true,
          details: { recordCount: 1500, exportType: 'csv' }
        }
      ];

      const mockCompliance: ComplianceCheck[] = [
        {
          id: 'gdpr-1',
          name: 'GDPR Data Processing Consent',
          category: 'data_protection',
          status: 'passed',
          description: 'All user data processing has proper consent records',
          lastChecked: '2024-01-20T10:00:00Z',
          details: 'Consent records found for 100% of users'
        },
        {
          id: 'access-1',
          name: 'Role-Based Access Control',
          category: 'access_control',
          status: 'warning',
          description: 'Some users have overly broad permissions',
          lastChecked: '2024-01-20T10:00:00Z',
          details: '3 users found with admin access who may not need it'
        },
        {
          id: 'audit-1',
          name: 'Audit Trail Completeness',
          category: 'audit_trail',
          status: 'passed',
          description: 'All critical actions are being logged',
          lastChecked: '2024-01-20T10:00:00Z',
          details: '100% audit coverage for sensitive operations'
        },
        {
          id: 'encrypt-1',
          name: 'Data Encryption at Rest',
          category: 'encryption',
          status: 'failed',
          description: 'Some data stores are not encrypted',
          lastChecked: '2024-01-20T10:00:00Z',
          details: 'File attachments in 2 projects lack encryption'
        }
      ];

      const mockAccessLogs: AccessLog[] = [
        {
          id: '1',
          user: 'john.doe@company.com',
          action: 'VIEW_SPRINT_BOARD',
          resource: 'sprint-board-123',
          timestamp: '2024-01-20T16:45:00Z',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          success: true
        },
        {
          id: '2',
          user: 'jane.smith@company.com',
          action: 'UPDATE_WORK_ITEM',
          resource: 'work-item-456',
          timestamp: '2024-01-20T16:30:00Z',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          success: true
        },
        {
          id: '3',
          user: 'malicious@external.com',
          action: 'DELETE_PROJECT',
          resource: 'project-789',
          timestamp: '2024-01-20T16:15:00Z',
          ipAddress: '203.0.113.1',
          userAgent: 'curl/7.68.0',
          success: false
        }
      ];

      setSecurityEvents(mockEvents);
      setComplianceChecks(mockCompliance);
      setAccessLogs(mockAccessLogs);
      setLastAuditRun('2024-01-20T10:00:00Z');
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSecurityAudit = async () => {
    setLoading(true);
    try {
      // Simulate audit run
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastAuditRun(new Date().toISOString());
      await loadSecurityData();
    } catch (error) {
      console.error('Failed to run security audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveSecurityEvent = async (eventId: string) => {
    setSecurityEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, resolved: true }
          : event
      )
    );
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getComplianceIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const calculateSecurityScore = () => {
    const passed = complianceChecks.filter(check => check.status === 'passed').length;
    const total = complianceChecks.length;
    return Math.round((passed / total) * 100);
  };

  const unresolvedEvents = securityEvents.filter(event => !event.resolved);
  const criticalEvents = securityEvents.filter(event => event.severity === 'critical');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Audit Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor security events, compliance status, and access controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runSecurityAudit} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Audit
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold">{calculateSecurityScore()}%</p>
                <Progress value={calculateSecurityScore()} className="mt-2" />
              </div>
              <Shield className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-destructive">{unresolvedEvents.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-destructive">{criticalEvents.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Audit</p>
                <p className="text-sm font-medium">
                  {lastAuditRun ? new Date(lastAuditRun).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="access">Access Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {unresolvedEvents.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have {unresolvedEvents.length} unresolved security event{unresolvedEvents.length !== 1 ? 's' : ''} requiring attention.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {securityEvents.map((event) => (
              <Card key={event.id} className={`transition-colors ${!event.resolved ? 'border-destructive/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(event.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{event.description}</h4>
                          <Badge variant={getSeverityColor(event.severity) as any}>
                            {event.severity}
                          </Badge>
                          {event.resolved && (
                            <Badge variant="outline">Resolved</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>User: {event.user}</p>
                          <p>Time: {new Date(event.timestamp).toLocaleString()}</p>
                          <p>Type: {event.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>
                    
                    {!event.resolved && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => resolveSecurityEvent(event.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="space-y-3">
            {complianceChecks.map((check) => (
              <Card key={check.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getComplianceIcon(check.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{check.name}</h4>
                          <Badge variant="outline">{check.category.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{check.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Last checked: {new Date(check.lastChecked).toLocaleString()}
                        </p>
                        <p className="text-xs">{check.details}</p>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={
                        check.status === 'passed' ? 'default' :
                        check.status === 'warning' ? 'secondary' : 'destructive'
                      }
                    >
                      {check.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Access Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-success' : 'bg-destructive'}`} />
                      <div>
                        <p className="font-medium">{log.user}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.action} on {log.resource}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{new Date(log.timestamp).toLocaleString()}</p>
                      <p>{log.ipAddress}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Automatic Security Scans</h4>
                    <p className="text-sm text-muted-foreground">Run daily security audits</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Access Log Retention</h4>
                    <p className="text-sm text-muted-foreground">Keep logs for compliance</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Alert Notifications</h4>
                    <p className="text-sm text-muted-foreground">Security event notifications</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};