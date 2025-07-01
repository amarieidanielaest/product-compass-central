
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Users, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useService } from '@/contexts/ServiceContext';
import { enterpriseSecurityService } from '@/services/enterprise/EnterpriseSecurityService';

const EnterpriseSecurityDashboard = () => {
  const [securityPolicies, setSecurityPolicies] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [ipWhitelist, setIpWhitelist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const [policiesRes, logsRes, ipRes] = await Promise.all([
        enterpriseSecurityService.getSecurityPolicies(),
        enterpriseSecurityService.getAuditLogs({ limit: 10 }),
        enterpriseSecurityService.getIPWhitelist()
      ]);

      if (policiesRes.success) setSecurityPolicies(policiesRes.data);
      if (logsRes.success) setAuditLogs(logsRes.data);
      if (ipRes.success) setIpWhitelist(ipRes.data);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyToggle = async (policyId: string, enabled: boolean) => {
    try {
      await enterpriseSecurityService.updateSecurityPolicy(policyId, { enabled });
      loadSecurityData();
    } catch (error) {
      console.error('Failed to update policy:', error);
    }
  };

  if (loading) return <div>Loading security dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Security</h1>
          <p className="text-gray-600">Manage security policies, compliance, and audit logs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Generate Compliance Report
          </Button>
          <Button>
            <Lock className="w-4 h-4 mr-2" />
            Security Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-2xl font-bold">94/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold">127</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Audit Events</p>
                <p className="text-2xl font-bold">1,243</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Policy Violations</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: '1', name: 'IP Whitelisting', type: 'ip-whitelist', enabled: true, description: 'Restrict access to approved IP addresses' },
                { id: '2', name: 'SSO Enforcement', type: 'sso-enforcement', enabled: true, description: 'Require SSO authentication for all users' },
                { id: '3', name: 'MFA Requirement', type: 'mfa-requirement', enabled: false, description: 'Require multi-factor authentication' },
                { id: '4', name: 'Session Timeout', type: 'session-timeout', enabled: true, description: 'Automatic session expiration after 8 hours' }
              ].map((policy) => (
                <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{policy.name}</h3>
                      <Badge variant={policy.enabled ? "default" : "secondary"}>
                        {policy.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                  </div>
                  <Switch
                    checked={policy.enabled}
                    onCheckedChange={(checked) => handlePolicyToggle(policy.id, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IP Whitelist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input placeholder="192.168.1.0/24" />
                  <Input placeholder="Description" />
                  <Button>Add IP Range</Button>
                </div>
                
                <div className="space-y-2">
                  {[
                    { ip: '192.168.1.0/24', description: 'Office Network', enabled: true },
                    { ip: '10.0.0.0/16', description: 'VPN Access', enabled: true },
                    { ip: '203.0.113.0/24', description: 'Remote Team', enabled: false }
                  ].map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-mono">{entry.ip}</p>
                        <p className="text-sm text-gray-600">{entry.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={entry.enabled} />
                        <Button variant="outline" size="sm">Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'User Login', user: 'john.doe@example.com', timestamp: '2024-01-15 14:30:22', ip: '192.168.1.100', status: 'success' },
                  { action: 'Policy Updated', user: 'admin@example.com', timestamp: '2024-01-15 14:25:15', ip: '192.168.1.50', status: 'success' },
                  { action: 'Failed Login', user: 'unknown@example.com', timestamp: '2024-01-15 14:20:10', ip: '203.0.113.100', status: 'failure' },
                  { action: 'Data Export', user: 'jane.smith@example.com', timestamp: '2024-01-15 14:15:05', ip: '192.168.1.75', status: 'success' }
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {log.status === 'success' ? 
                        <CheckCircle className="w-5 h-5 text-green-600" /> : 
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      }
                      <div>
                        <p className="font-semibold">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.user} • {log.ip}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{log.timestamp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { framework: 'SOC 2 Type II', status: 'Compliant', lastAudit: '2024-01-01', nextAudit: '2024-12-31' },
                { framework: 'GDPR', status: 'Compliant', lastAudit: '2024-01-15', nextAudit: '2024-04-15' },
                { framework: 'HIPAA', status: 'In Progress', lastAudit: null, nextAudit: '2024-03-01' },
                { framework: 'ISO 27001', status: 'Compliant', lastAudit: '2023-12-01', nextAudit: '2024-12-01' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{item.framework}</h3>
                    <p className="text-sm text-gray-600">
                      {item.lastAudit ? `Last audit: ${item.lastAudit}` : 'No previous audit'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.status === 'Compliant' ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">Next: {item.nextAudit}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseSecurityDashboard;
