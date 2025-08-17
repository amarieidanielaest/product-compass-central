import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Webhook, 
  Slack, 
  Mail, 
  MessageSquare, 
  Github, 
  Trello, 
  Zap,
  Copy,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationSettingsProps {
  boardId: string;
}

interface Integration {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  config?: Record<string, any>;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ boardId }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'webhook',
      name: 'Webhooks',
      icon: <Webhook className="h-5 w-5" />,
      description: 'Send real-time notifications to your applications',
      enabled: false,
      status: 'disconnected'
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: <Slack className="h-5 w-5" />,
      description: 'Get notifications in your Slack channels',
      enabled: false,
      status: 'disconnected'
    },
    {
      id: 'email',
      name: 'Email Notifications',
      icon: <Mail className="h-5 w-5" />,
      description: 'Automated email alerts for feedback updates',
      enabled: true,
      status: 'connected'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="h-5 w-5" />,
      description: 'Create issues from feedback items',
      enabled: false,
      status: 'disconnected'
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Send updates to Discord channels',
      enabled: false,
      status: 'disconnected'
    },
    {
      id: 'trello',
      name: 'Trello',
      icon: <Trello className="h-5 w-5" />,
      description: 'Create cards from feedback items',
      enabled: false,
      status: 'disconnected'
    }
  ]);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrationSettings();
  }, [boardId]);

  const loadIntegrationSettings = async () => {
    try {
      // Mock loading for now - will need actual table after types are generated
      console.log('Loading integration settings for board:', boardId);
      // TODO: Load integration settings once types are available
    } catch (error) {
      console.error('Error loading integration settings:', error);
    }
  };

  const toggleIntegration = async (integration: Integration) => {
    if (!integration.enabled && integration.id === 'webhook' && !webhookUrl) {
      toast({
        title: "Missing Configuration",
        description: "Please provide a webhook URL before enabling",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Mock integration toggle for now
      console.log(`Toggling ${integration.name} integration`);
      
      setIntegrations(prev => prev.map(i => 
        i.id === integration.id 
          ? { 
              ...i, 
              enabled: !i.enabled, 
              status: !i.enabled ? 'connected' : 'disconnected'
            }
          : i
      ));

      toast({
        title: "Success",
        description: `${integration.name} ${integration.enabled ? 'disabled' : 'enabled'} successfully`,
      });
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: "Error",
        description: "Failed to update integration settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async (integration: Integration) => {
    if (integration.id === 'webhook' && integration.config?.url) {
      try {
        const response = await fetch(integration.config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'test',
            message: 'Test webhook from customer board',
            timestamp: new Date().toISOString()
          })
        });

        if (response.ok) {
          toast({
            title: "Test Successful",
            description: "Webhook test completed successfully",
          });
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        toast({
          title: "Test Failed",
          description: "Webhook test failed. Please check your URL",
          variant: "destructive"
        });
      }
    }
  };

  const copyApiKey = () => {
    const apiKey = `cb_${boardId.substring(0, 8)}_${Date.now().toString(36)}`;
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API Key Copied",
      description: "API key has been copied to your clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Integration Settings
          </CardTitle>
          <CardDescription>
            Connect your customer board with external tools and services
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {integration.icon}
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <Badge 
                          variant={getStatusColor(integration.status)} 
                          className="text-xs mt-1"
                        >
                          {getStatusIcon(integration.status)}
                          <span className="ml-1">{integration.status}</span>
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={integration.enabled}
                      onCheckedChange={() => toggleIntegration(integration)}
                      disabled={loading}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {integration.description}
                  </p>
                  
                  {integration.enabled && (
                    <div className="space-y-2">
                      {integration.id === 'webhook' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testIntegration(integration)}
                          className="w-full"
                        >
                          Test Integration
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedIntegration(integration)}
                        className="w-full"
                      >
                        Configure
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time notifications about board activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-app.com/webhooks/feedback"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This URL will receive POST requests when events occur on your board
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Webhook Events</h4>
                <div className="space-y-2">
                  {[
                    'feedback.created',
                    'feedback.updated',
                    'feedback.commented',
                    'feedback.voted',
                    'member.added',
                    'member.removed'
                  ].map((event) => (
                    <div key={event} className="flex items-center justify-between">
                      <span className="text-sm font-mono">{event}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Sample Payload</h4>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`{
  "event": "feedback.created",
  "board_id": "${boardId}",
  "data": {
    "id": "feedback-id",
    "title": "New feature request",
    "description": "...",
    "status": "submitted",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Generate API keys and access documentation for integrating with your board
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input 
                    value={`cb_${boardId.substring(0, 8)}_****`}
                    readOnly 
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={copyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this API key to authenticate requests to the board API
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Available Endpoints</h4>
                <div className="space-y-2">
                  {[
                    { method: 'GET', endpoint: '/api/boards/{boardId}/feedback', description: 'List feedback items' },
                    { method: 'POST', endpoint: '/api/boards/{boardId}/feedback', description: 'Create feedback item' },
                    { method: 'GET', endpoint: '/api/boards/{boardId}/analytics', description: 'Get analytics data' },
                    { method: 'GET', endpoint: '/api/boards/{boardId}/members', description: 'List board members' }
                  ].map((endpoint) => (
                    <div key={endpoint.endpoint} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.endpoint}</code>
                      </div>
                      <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full">
                View Full API Documentation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};