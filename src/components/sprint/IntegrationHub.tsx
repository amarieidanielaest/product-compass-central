import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plug, 
  Check, 
  X, 
  Settings, 
  Plus,
  ExternalLink,
  Zap,
  GitBranch,
  MessageSquare,
  Calendar,
  BarChart3,
  Shield,
  Webhook,
  Database,
  Cloud,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'communication' | 'analytics' | 'productivity' | 'security';
  provider: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  configuredAt?: string;
  lastSync?: string;
  syncStatus: 'success' | 'error' | 'syncing' | 'never';
  features: string[];
  webhookUrl?: string;
  config?: Record<string, any>;
}

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  authenticated: boolean;
  rateLimit: string;
  lastUsed?: string;
  usageCount: number;
}

export const IntegrationHub: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIntegrationData();
  }, []);

  const loadIntegrationData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockIntegrations: Integration[] = [
        {
          id: 'github',
          name: 'GitHub',
          description: 'Sync commits, PRs, and issues with work items',
          category: 'development',
          provider: 'GitHub Inc.',
          icon: <GitBranch className="h-5 w-5" />,
          status: 'connected',
          configuredAt: '2024-01-15T10:00:00Z',
          lastSync: '2024-01-20T16:30:00Z',
          syncStatus: 'success',
          features: ['Commit linking', 'PR status sync', 'Issue import'],
          webhookUrl: 'https://api.example.com/webhooks/github',
          config: { repository: 'company/project', branch: 'main' }
        },
        {
          id: 'slack',
          name: 'Slack',
          description: 'Send notifications and updates to Slack channels',
          category: 'communication',
          provider: 'Slack Technologies',
          icon: <MessageSquare className="h-5 w-5" />,
          status: 'connected',
          configuredAt: '2024-01-10T14:00:00Z',
          lastSync: '2024-01-20T16:25:00Z',
          syncStatus: 'success',
          features: ['Sprint notifications', 'Daily standups', 'Alert routing'],
          config: { channel: '#development', webhookUrl: 'https://hooks.slack.com/...' }
        },
        {
          id: 'jira',
          name: 'Jira',
          description: 'Import issues and sync status updates',
          category: 'development',
          provider: 'Atlassian',
          icon: <Webhook className="h-5 w-5" />,
          status: 'error',
          configuredAt: '2024-01-08T09:00:00Z',
          lastSync: '2024-01-19T12:00:00Z',
          syncStatus: 'error',
          features: ['Issue import', 'Status sync', 'Comment sync'],
          config: { server: 'company.atlassian.net', project: 'PROJ' }
        },
        {
          id: 'analytics',
          name: 'Google Analytics',
          description: 'Track user engagement and feature usage',
          category: 'analytics',
          provider: 'Google',
          icon: <BarChart3 className="h-5 w-5" />,
          status: 'disconnected',
          syncStatus: 'never',
          features: ['Usage tracking', 'Feature analytics', 'User flows'],
        },
        {
          id: 'calendar',
          name: 'Google Calendar',
          description: 'Sync sprint events and deadlines',
          category: 'productivity',
          provider: 'Google',
          icon: <Calendar className="h-5 w-5" />,
          status: 'pending',
          syncStatus: 'never',
          features: ['Sprint planning', 'Deadline reminders', 'Meeting sync'],
        }
      ];

      const mockApiEndpoints: ApiEndpoint[] = [
        {
          id: 'work-items',
          name: 'Work Items API',
          method: 'GET',
          path: '/api/v1/work-items',
          description: 'List and filter work items',
          authenticated: true,
          rateLimit: '100/hour',
          lastUsed: '2024-01-20T16:30:00Z',
          usageCount: 1247
        },
        {
          id: 'sprints',
          name: 'Sprints API',
          method: 'GET',
          path: '/api/v1/sprints',
          description: 'Manage sprint data',
          authenticated: true,
          rateLimit: '50/hour',
          lastUsed: '2024-01-20T15:45:00Z',
          usageCount: 856
        },
        {
          id: 'webhooks',
          name: 'Webhooks',
          method: 'POST',
          path: '/api/v1/webhooks',
          description: 'Receive real-time updates',
          authenticated: true,
          rateLimit: '1000/hour',
          lastUsed: '2024-01-20T16:32:00Z',
          usageCount: 5632
        }
      ];

      setIntegrations(mockIntegrations);
      setApiEndpoints(mockApiEndpoints);
    } catch (error) {
      console.error('Failed to load integration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            status: integration.status === 'connected' ? 'disconnected' : 'connected'
          }
        : integration
    ));
  };

  const syncIntegration = async (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            syncStatus: 'syncing',
            lastSync: new Date().toISOString()
          }
        : integration
    ));

    // Simulate sync
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, syncStatus: 'success' }
          : integration
      ));
    }, 2000);
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Check className="h-4 w-4 text-success" />;
      case 'error':
        return <X className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case 'disconnected':
        return <X className="h-4 w-4 text-muted-foreground" />;
      default:
        return <X className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSyncStatusBadge = (syncStatus: Integration['syncStatus']) => {
    switch (syncStatus) {
      case 'success':
        return <Badge variant="default">Synced</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'syncing':
        return <Badge variant="secondary">Syncing...</Badge>;
      case 'never':
        return <Badge variant="outline">Never</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: Integration['category']) => {
    switch (category) {
      case 'development':
        return <GitBranch className="h-4 w-4" />;
      case 'communication':
        return <MessageSquare className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'productivity':
        return <Calendar className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      default:
        return <Plug className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: ApiEndpoint['method']) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const connectedIntegrations = integrations.filter(i => i.status === 'connected').length;
  const errorIntegrations = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Integration Hub</h2>
          <p className="text-muted-foreground">
            Connect your tools and automate workflows
          </p>
        </div>
        <Button onClick={() => setIsConfigDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold">{connectedIntegrations}</p>
              </div>
              <Plug className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-destructive">{errorIntegrations}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Calls</p>
                <p className="text-2xl font-bold">
                  {apiEndpoints.reduce((sum, endpoint) => sum + endpoint.usageCount, 0)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Webhooks</p>
                <p className="text-2xl font-bold">
                  {integrations.filter(i => i.webhookUrl).length}
                </p>
              </div>
              <Webhook className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {errorIntegrations > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorIntegrations} integration{errorIntegrations !== 1 ? 's' : ''} {errorIntegrations === 1 ? 'has' : 'have'} errors and need attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="api">API Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <Card key={integration.id} className="transition-colors hover:bg-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {integration.icon}
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.provider}</p>
                      </div>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      {getSyncStatusBadge(integration.syncStatus)}
                    </div>

                    {integration.lastSync && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last sync</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(integration.lastSync).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Switch
                        checked={integration.status === 'connected'}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                        disabled={integration.status === 'pending'}
                      />
                      <span className="text-sm">
                        {integration.status === 'connected' ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setIsConfigDialogOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      {integration.status === 'connected' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => syncIntegration(integration.id)}
                          disabled={integration.syncStatus === 'syncing'}
                        >
                          <RefreshCw className={`h-4 w-4 ${integration.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiEndpoints.map((endpoint) => (
                  <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{endpoint.name}</h4>
                        <p className="text-sm text-muted-foreground font-mono">{endpoint.path}</p>
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Rate limit: {endpoint.rateLimit}</p>
                      <p>Calls: {endpoint.usageCount.toLocaleString()}</p>
                      {endpoint.lastUsed && (
                        <p>Last used: {new Date(endpoint.lastUsed).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.filter(i => i.webhookUrl).map((integration) => (
                  <div key={integration.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{integration.name}</h4>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono mb-2">
                      {integration.webhookUrl}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedIntegration ? `Configure ${selectedIntegration.name}` : 'Add Integration'}
            </DialogTitle>
          </DialogHeader>
          <IntegrationConfigForm 
            integration={selectedIntegration}
            onSave={() => setIsConfigDialogOpen(false)}
            onCancel={() => setIsConfigDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const IntegrationConfigForm: React.FC<{
  integration: Integration | null;
  onSave: () => void;
  onCancel: () => void;
}> = ({ integration, onSave, onCancel }) => {
  const [config, setConfig] = useState(integration?.config || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save configuration
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {integration ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            {integration.icon}
            <div>
              <h3 className="font-semibold">{integration.name}</h3>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </div>
          </div>

          {integration.id === 'github' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="repository">Repository</Label>
                <Input
                  id="repository"
                  placeholder="owner/repository"
                  value={config.repository || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, repository: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Default Branch</Label>
                <Input
                  id="branch"
                  placeholder="main"
                  value={config.branch || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, branch: e.target.value }))}
                />
              </div>
            </>
          )}

          {integration.id === 'slack' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Input
                  id="channel"
                  placeholder="#development"
                  value={config.channel || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, channel: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input
                  id="webhook"
                  placeholder="https://hooks.slack.com/..."
                  value={config.webhookUrl || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                />
              </div>
            </>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Features</h4>
            <div className="space-y-2">
              {integration.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Select an integration to configure</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {integration && (
          <Button type="submit">
            Save Configuration
          </Button>
        )}
      </div>
    </form>
  );
};