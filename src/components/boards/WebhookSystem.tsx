import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Webhook, Edit, Trash2, TestTube, Play, AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  events: string[];
  headers: Record<string, string>;
  payload_template: string;
  is_active: boolean;
  created_at: string;
  last_triggered: string | null;
  success_count: number;
  failure_count: number;
  secret?: string;
}

interface WebhookSystemProps {
  boardId: string;
}

const AVAILABLE_EVENTS = [
  { value: 'feedback.created', label: 'New Feedback Created' },
  { value: 'feedback.updated', label: 'Feedback Updated' },
  { value: 'feedback.status_changed', label: 'Feedback Status Changed' },
  { value: 'feedback.voted', label: 'Feedback Voted' },
  { value: 'feedback.commented', label: 'Feedback Commented' },
  { value: 'board.member_added', label: 'Board Member Added' },
  { value: 'board.updated', label: 'Board Updated' }
];

const DEFAULT_PAYLOAD_TEMPLATES = {
  slack: JSON.stringify({
    text: "New feedback received: {{feedback.title}}",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*{{feedback.title}}*\n{{feedback.description}}"
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Priority: {{feedback.priority}} | Status: {{feedback.status}} | Votes: {{feedback.votes_count}}"
          }
        ]
      }
    ]
  }, null, 2),
  
  discord: JSON.stringify({
    content: "New feedback received",
    embeds: [
      {
        title: "{{feedback.title}}",
        description: "{{feedback.description}}",
        color: 3447003,
        fields: [
          { name: "Priority", value: "{{feedback.priority}}", inline: true },
          { name: "Status", value: "{{feedback.status}}", inline: true },
          { name: "Votes", value: "{{feedback.votes_count}}", inline: true }
        ],
        timestamp: "{{feedback.created_at}}"
      }
    ]
  }, null, 2),
  
  generic: JSON.stringify({
    event: "{{event_type}}",
    board_id: "{{board.id}}",
    board_name: "{{board.name}}",
    timestamp: "{{timestamp}}",
    data: "{{data}}"
  }, null, 2)
};

export const WebhookSystem: React.FC<WebhookSystemProps> = ({ boardId }) => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    method: 'POST' as const,
    events: [] as string[],
    headers: {} as Record<string, string>,
    payload_template: DEFAULT_PAYLOAD_TEMPLATES.generic,
    is_active: true
  });

  useEffect(() => {
    loadWebhooks();
  }, [boardId]);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockWebhooks: WebhookConfig[] = [
        {
          id: '1',
          name: 'Slack Notifications',
          url: 'https://hooks.slack.com/services/...',
          method: 'POST',
          events: ['feedback.created', 'feedback.status_changed'],
          headers: { 'Content-Type': 'application/json' },
          payload_template: DEFAULT_PAYLOAD_TEMPLATES.slack,
          is_active: true,
          created_at: new Date().toISOString(),
          last_triggered: new Date(Date.now() - 3600000).toISOString(),
          success_count: 45,
          failure_count: 2
        }
      ];
      setWebhooks(mockWebhooks);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load webhooks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async () => {
    try {
      if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const webhook: WebhookConfig = {
        id: Date.now().toString(),
        ...newWebhook,
        created_at: new Date().toISOString(),
        last_triggered: null,
        success_count: 0,
        failure_count: 0
      };

      setWebhooks(prev => [...prev, webhook]);
      setCreateDialogOpen(false);
      setNewWebhook({
        name: '',
        url: '',
        method: 'POST',
        events: [],
        headers: {},
        payload_template: DEFAULT_PAYLOAD_TEMPLATES.generic,
        is_active: true
      });

      toast({
        title: 'Success',
        description: 'Webhook created successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create webhook',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      setWebhooks(prev => prev.filter(w => w.id !== webhookId));
      toast({
        title: 'Success',
        description: 'Webhook deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete webhook',
        variant: 'destructive'
      });
    }
  };

  const handleToggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      setWebhooks(prev => prev.map(w =>
        w.id === webhookId ? { ...w, is_active: isActive } : w
      ));
      toast({
        title: 'Success',
        description: `Webhook ${isActive ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update webhook',
        variant: 'destructive'
      });
    }
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    try {
      setTestingWebhook(webhook.id);
      
      // Simulate webhook test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Test Successful',
        description: 'Webhook test completed successfully'
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Webhook test failed',
        variant: 'destructive'
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  const toggleEvent = (event: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const addHeader = () => {
    const key = `header-${Date.now()}`;
    setNewWebhook(prev => ({
      ...prev,
      headers: { ...prev.headers, [key]: '' }
    }));
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    setNewWebhook(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[oldKey];
      if (newKey) {
        newHeaders[newKey] = value;
      }
      return { ...prev, headers: newHeaders };
    });
  };

  const removeHeader = (key: string) => {
    setNewWebhook(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  const loadTemplate = (template: keyof typeof DEFAULT_PAYLOAD_TEMPLATES) => {
    setNewWebhook(prev => ({
      ...prev,
      payload_template: DEFAULT_PAYLOAD_TEMPLATES[template]
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Webhook Configuration</h2>
          <p className="text-muted-foreground">Set up webhooks to receive real-time notifications</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook to receive notifications when events occur on your board.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="payload">Payload</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Slack Notifications"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">URL *</label>
                  <Input
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Method</label>
                  <Select value={newWebhook.method} onValueChange={(value: any) => setNewWebhook(prev => ({ ...prev, method: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-3 block">Select Events *</label>
                  <div className="grid grid-cols-1 gap-2">
                    {AVAILABLE_EVENTS.map(event => (
                      <div key={event.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={event.value}
                          checked={newWebhook.events.includes(event.value)}
                          onCheckedChange={() => toggleEvent(event.value)}
                        />
                        <label htmlFor={event.value} className="text-sm">
                          {event.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="headers" className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Custom Headers</label>
                  <Button variant="outline" size="sm" onClick={addHeader}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Header
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(newWebhook.headers).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <Input
                        placeholder="Header name"
                        value={key.startsWith('header-') ? '' : key}
                        onChange={(e) => updateHeader(key, e.target.value, value)}
                      />
                      <Input
                        placeholder="Header value"
                        value={value}
                        onChange={(e) => updateHeader(key, key, e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={() => removeHeader(key)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {Object.keys(newWebhook.headers).length === 0 && (
                    <p className="text-sm text-muted-foreground">No custom headers configured</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="payload" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm font-medium">Payload Template</label>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => loadTemplate('slack')}>
                      Slack
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => loadTemplate('discord')}>
                      Discord
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => loadTemplate('generic')}>
                      Generic
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  value={newWebhook.payload_template}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, payload_template: e.target.value }))}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="JSON payload template..."
                />
                
                <div className="text-xs text-muted-foreground">
                  <p>Available variables: {'{{event_type}}'}, {'{{board.id}}'}, {'{{board.name}}'}, {'{{feedback.title}}'}, {'{{feedback.description}}'}, {'{{feedback.status}}'}, {'{{feedback.priority}}'}, {'{{feedback.votes_count}}'}, {'{{timestamp}}'}</p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWebhook}>
                Create Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhook List */}
      <div className="grid gap-4">
        {webhooks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No webhooks configured</h3>
              <p className="text-muted-foreground text-center mb-4">
                Set up webhooks to receive real-time notifications when events occur on your board.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          webhooks.map(webhook => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Webhook className="h-5 w-5" />
                      {webhook.name}
                      <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                        {webhook.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{webhook.url}</CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestWebhook(webhook)}
                      disabled={testingWebhook === webhook.id}
                    >
                      {testingWebhook === webhook.id ? (
                        <Clock className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-1" />
                      )}
                      Test
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingWebhook(webhook)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this webhook? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteWebhook(webhook.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map(event => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {AVAILABLE_EVENTS.find(e => e.value === event)?.label || event}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{webhook.success_count} successes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>{webhook.failure_count} failures</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {webhook.last_triggered
                          ? `Last triggered ${new Date(webhook.last_triggered).toLocaleString()}`
                          : 'Never triggered'
                        }
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleWebhook(webhook.id, !webhook.is_active)}
                      >
                        <Zap className="h-4 w-4" />
                        {webhook.is_active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};