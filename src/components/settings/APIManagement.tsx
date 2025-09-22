import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Code, Key, Copy, Eye, EyeOff, Trash2, Plus, ExternalLink, Activity, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created_at: string;
  last_used: string | null;
  usage_count: number;
  is_active: boolean;
}

interface APIUsage {
  endpoint: string;
  method: string;
  count: number;
  last_called: string;
}

const AVAILABLE_PERMISSIONS = [
  { value: 'read:feedback', label: 'Read Feedback' },
  { value: 'write:feedback', label: 'Write Feedback' },
  { value: 'read:roadmap', label: 'Read Roadmap' },
  { value: 'write:roadmap', label: 'Write Roadmap' },
  { value: 'read:users', label: 'Read Users' },
  { value: 'write:users', label: 'Write Users' },
  { value: 'admin', label: 'Full Admin Access' }
];

export const APIManagement: React.FC = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [usage, setUsage] = useState<APIUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  
  const [newKey, setNewKey] = useState({
    name: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadAPIKeys();
    loadUsageStats();
  }, []);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockKeys: APIKey[] = [
        {
          id: '1',
          name: 'Production API',
          key: 'pk_live_51234567890abcdef1234567890abcdef12345678',
          permissions: ['read:feedback', 'write:feedback', 'read:roadmap'],
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          last_used: new Date(Date.now() - 3600000).toISOString(),
          usage_count: 1250,
          is_active: true
        },
        {
          id: '2',
          name: 'Development Key',
          key: 'pk_test_51234567890abcdef1234567890abcdef12345678',
          permissions: ['read:feedback', 'read:roadmap'],
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
          last_used: new Date(Date.now() - 1800000).toISOString(),
          usage_count: 45,
          is_active: true
        },
        {
          id: '3',
          name: 'Legacy Integration',
          key: 'pk_live_51234567890abcdef1234567890abcdef87654321',
          permissions: ['read:feedback'],
          created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
          last_used: null,
          usage_count: 0,
          is_active: false
        }
      ];
      setApiKeys(mockKeys);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      // Mock usage data
      const mockUsage: APIUsage[] = [
        {
          endpoint: '/api/feedback',
          method: 'GET',
          count: 850,
          last_called: new Date(Date.now() - 3600000).toISOString()
        },
        {
          endpoint: '/api/feedback',
          method: 'POST',
          count: 245,
          last_called: new Date(Date.now() - 7200000).toISOString()
        },
        {
          endpoint: '/api/roadmap',
          method: 'GET',
          count: 156,
          last_called: new Date(Date.now() - 1800000).toISOString()
        },
        {
          endpoint: '/api/users',
          method: 'GET',
          count: 89,
          last_called: new Date(Date.now() - 10800000).toISOString()
        }
      ];
      setUsage(mockUsage);
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  };

  const generateAPIKey = () => {
    const prefix = 'pk_live_';
    const characters = '0123456789abcdef';
    let result = prefix;
    
    for (let i = 0; i < 40; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  };

  const handleCreateKey = async () => {
    try {
      if (!newKey.name || newKey.permissions.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please provide a name and select at least one permission',
          variant: 'destructive'
        });
        return;
      }

      const apiKey: APIKey = {
        id: Date.now().toString(),
        name: newKey.name,
        key: generateAPIKey(),
        permissions: newKey.permissions,
        created_at: new Date().toISOString(),
        last_used: null,
        usage_count: 0,
        is_active: true
      };

      setApiKeys(prev => [...prev, apiKey]);
      setCreateDialogOpen(false);
      setNewKey({ name: '', permissions: [] });

      toast({
        title: 'Success',
        description: 'API key created successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      setApiKeys(prev => prev.filter(k => k.id !== keyId));
      toast({
        title: 'Success',
        description: 'API key deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive'
      });
    }
  };

  const handleToggleKey = async (keyId: string, isActive: boolean) => {
    try {
      setApiKeys(prev => prev.map(k =>
        k.id === keyId ? { ...k, is_active: isActive } : k
      ));
      toast({
        title: 'Success',
        description: `API key ${isActive ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update API key',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard'
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const togglePermission = (permission: string) => {
    setNewKey(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const maskKey = (key: string) => {
    return key.slice(0, 8) + '...' + key.slice(-8);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Management</h2>
          <p className="text-muted-foreground">Manage API keys and monitor usage</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key with specific permissions for your application.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Key Name *</label>
                <Input
                  value={newKey.name}
                  onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Production API"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-3 block">Permissions *</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_PERMISSIONS.map(permission => (
                    <div key={permission.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permission.value}
                        checked={newKey.permissions.includes(permission.value)}
                        onChange={() => togglePermission(permission.value)}
                        className="rounded"
                      />
                      <label htmlFor={permission.value} className="text-sm">
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey}>
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Usage Stats</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          {apiKeys.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Key className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No API keys created</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first API key to start integrating with our API.
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First API Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            apiKeys.map(apiKey => (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        {apiKey.name}
                        <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                          {apiKey.is_active ? 'Active' : 'Disabled'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Created {new Date(apiKey.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleKey(apiKey.id, !apiKey.is_active)}
                      >
                        {apiKey.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this API key? This action cannot be undone and will immediately revoke access.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteKey(apiKey.id)}>
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
                    <div>
                      <label className="text-sm font-medium">API Key</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type={showKey[apiKey.id] ? 'text' : 'password'}
                          value={showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {showKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Permissions</h4>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {AVAILABLE_PERMISSIONS.find(p => p.value === permission)?.label || permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Usage Count:</span>
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4 text-blue-500" />
                          {apiKey.usage_count.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Used:</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-green-500" />
                          {apiKey.last_used ? new Date(apiKey.last_used).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Statistics</CardTitle>
              <CardDescription>Monitor your API endpoint usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usage.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{stat.method}</Badge>
                        <code className="text-sm">{stat.endpoint}</code>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last called: {new Date(stat.last_called).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stat.count.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">requests</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Learn how to integrate with our API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-5 w-5" />
                    <h3 className="font-medium">Getting Started</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn the basics of our REST API and authentication.
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Guide
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5" />
                    <h3 className="font-medium">Authentication</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    How to authenticate your API requests securely.
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5" />
                    <h3 className="font-medium">Rate Limits</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Understand API rate limits and best practices.
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    See Limits
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-5 w-5" />
                    <h3 className="font-medium">API Reference</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete API endpoint documentation and examples.
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Browse API
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Example Request</h4>
                <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
{`curl -X GET "https://api.yourapp.com/v1/feedback" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};