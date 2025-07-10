import React, { useState } from 'react';
import { 
  ExternalLink, 
  Plus, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Zap,
  Database,
  MessageSquare,
  Mail,
  Calendar,
  Workflow
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  category: 'development' | 'communication' | 'analytics' | 'automation' | 'crm';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  description: string;
  icon: React.ReactNode;
  lastSync?: string;
  syncedItems?: number;
  errors?: number;
  configurable: boolean;
  credentials?: {
    apiKey?: string;
    webhookUrl?: string;
    clientId?: string;
  };
  features: string[];
  isEnabled: boolean;
}

const IntegrationsManager = () => {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'jira',
      name: 'Jira Software',
      category: 'development',
      status: 'connected',
      description: 'Sync roadmap items with Jira epics, stories, and tasks',
      icon: <Database className="w-5 h-5" />,
      lastSync: '2 minutes ago',
      syncedItems: 45,
      errors: 0,
      configurable: true,
      credentials: {
        apiKey: 'xxxxxxxxxxxxxxxx'
      },
      features: ['Two-way sync', 'Progress tracking', 'Task management', 'Sprint integration'],
      isEnabled: true
    },
    {
      id: 'azure-devops',
      name: 'Azure DevOps',
      category: 'development',
      status: 'connected',
      description: 'Connect with Azure DevOps work items and boards',
      icon: <Database className="w-5 h-5" />,
      lastSync: '5 minutes ago',
      syncedItems: 23,
      errors: 0,
      configurable: true,
      credentials: {
        apiKey: 'xxxxxxxxxxxxxxxx'
      },
      features: ['Work item sync', 'Board integration', 'Release tracking'],
      isEnabled: true
    },
    {
      id: 'github',
      name: 'GitHub',
      category: 'development',
      status: 'disconnected',
      description: 'Sync issues and pull requests with roadmap items',
      icon: <Database className="w-5 h-5" />,
      configurable: true,
      features: ['Issue tracking', 'PR linking', 'Repository insights'],
      isEnabled: false
    },
    {
      id: 'slack',
      name: 'Slack',
      category: 'communication',
      status: 'disconnected',
      description: 'Send roadmap updates and notifications to Slack channels',
      icon: <MessageSquare className="w-5 h-5" />,
      configurable: true,
      features: ['Progress notifications', 'Update alerts', 'Team collaboration'],
      isEnabled: false
    },
    {
      id: 'zapier',
      name: 'Zapier',
      category: 'automation',
      status: 'disconnected',
      description: 'Automate workflows and connect with 5000+ apps',
      icon: <Zap className="w-5 h-5" />,
      configurable: true,
      credentials: {
        webhookUrl: ''
      },
      features: ['Workflow automation', 'Custom triggers', 'Multi-app connections'],
      isEnabled: false
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      category: 'analytics',
      status: 'disconnected',
      description: 'Sync roadmap milestones with calendar events',
      icon: <Calendar className="w-5 h-5" />,
      configurable: true,
      features: ['Milestone tracking', 'Event sync', 'Timeline management'],
      isEnabled: false
    }
  ]);

  const availableIntegrations = [
    {
      id: 'trello',
      name: 'Trello',
      category: 'development',
      description: 'Sync cards and boards with roadmap items',
      icon: <Database className="w-5 h-5" />,
      features: ['Card sync', 'Board integration', 'Progress tracking']
    },
    {
      id: 'asana',
      name: 'Asana',
      category: 'development',
      description: 'Connect tasks and projects with roadmap features',
      icon: <Database className="w-5 h-5" />,
      features: ['Task sync', 'Project integration', 'Timeline view']
    },
    {
      id: 'linear',
      name: 'Linear',
      category: 'development',
      description: 'Sync issues and cycles with product roadmap',
      icon: <Database className="w-5 h-5" />,
      features: ['Issue tracking', 'Cycle integration', 'Progress sync']
    },
    {
      id: 'notion',
      name: 'Notion',
      category: 'communication',
      description: 'Sync roadmap data with Notion databases',
      icon: <Database className="w-5 h-5" />,
      features: ['Database sync', 'Documentation', 'Team collaboration']
    },
    {
      id: 'microsoft-teams',
      name: 'Microsoft Teams',
      category: 'communication',
      description: 'Send updates and notifications to Teams channels',
      icon: <MessageSquare className="w-5 h-5" />,
      features: ['Channel notifications', 'Update alerts', 'Team integration']
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      category: 'crm',
      description: 'Connect customer requests with product features',
      icon: <Database className="w-5 h-5" />,
      features: ['Customer feedback', 'Feature requests', 'Opportunity tracking']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'syncing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'disconnected':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'disconnected':
        return <ExternalLink className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, isEnabled: !integration.isEnabled }
          : integration
      )
    );
    toast({
      title: "Integration Updated",
      description: "Integration status has been updated successfully.",
    });
  };

  const handleSyncNow = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, status: 'syncing' as const }
          : integration
      )
    );
    
    // Simulate sync completion
    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === id 
            ? { 
                ...integration, 
                status: 'connected' as const,
                lastSync: 'Just now',
                syncedItems: (integration.syncedItems || 0) + Math.floor(Math.random() * 5)
              }
            : integration
        )
      );
      toast({
        title: "Sync Complete",
        description: "Integration has been synchronized successfully.",
      });
    }, 2000);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { 
              ...integration, 
              status: 'disconnected' as const,
              lastSync: undefined,
              syncedItems: undefined,
              isEnabled: false
            }
          : integration
      )
    );
    toast({
      title: "Integration Disconnected",
      description: "Integration has been disconnected successfully.",
    });
  };

  const handleAddIntegration = (newIntegration: typeof availableIntegrations[0]) => {
    const integration: Integration = {
      ...newIntegration,
      status: 'disconnected',
      configurable: true,
      isEnabled: false,
      category: newIntegration.category as Integration['category']
    };
    setIntegrations(prev => [...prev, integration]);
    setShowCreateDialog(false);
    toast({
      title: "Integration Added",
      description: `${newIntegration.name} has been added to your integrations.`,
    });
  };

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All', icon: <Settings className="w-4 h-4" /> },
    { id: 'development', label: 'Development', icon: <Database className="w-4 h-4" /> },
    { id: 'communication', label: 'Communication', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'automation', label: 'Automation', icon: <Zap className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <Calendar className="w-4 h-4" /> },
    { id: 'crm', label: 'CRM', icon: <Mail className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
          <p className="text-gray-600">Connect your tools to sync data and automate workflows</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {availableIntegrations.filter(ai => 
                !integrations.some(i => i.id === ai.id)
              ).map((integration) => (
                <div key={integration.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center mb-2">
                    {integration.icon}
                    <h3 className="font-medium text-gray-900 ml-2">{integration.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                  <div className="space-y-2 mb-3">
                    {integration.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="text-xs text-gray-500">• {feature}</div>
                    ))}
                  </div>
                  <Button size="sm" onClick={() => handleAddIntegration(integration)}>
                    Add Integration
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.status === 'connected').length}
                </div>
                <div className="text-sm text-gray-600">Connected</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <RefreshCw className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {integrations.reduce((sum, i) => sum + (i.syncedItems || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Synced Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {integrations.reduce((sum, i) => sum + (i.errors || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.isEnabled).length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center">
              {category.icon}
              <span className="hidden sm:inline ml-2">{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="space-y-4">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {integration.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                          <Badge variant="outline" className={getStatusColor(integration.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(integration.status)}
                              {integration.status}
                            </div>
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{integration.description}</p>
                        
                        {/* Sync Status */}
                        {integration.status === 'connected' && (
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span>Last sync: {integration.lastSync}</span>
                            <span>•</span>
                            <span>{integration.syncedItems} items synced</span>
                            {integration.errors && integration.errors > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-red-600">{integration.errors} errors</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                          {integration.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={integration.isEnabled}
                          onCheckedChange={() => handleToggleIntegration(integration.id)}
                        />
                        <Label className="text-sm">Enabled</Label>
                      </div>
                      
                      {integration.status === 'connected' && (
                        <Button variant="outline" size="sm" onClick={() => handleSyncNow(integration.id)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Now
                        </Button>
                      )}
                      
                      {integration.configurable && (
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      )}
                      
                      {integration.status === 'connected' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDisconnect(integration.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Disconnect
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsManager;