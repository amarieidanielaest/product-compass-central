import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Bell, Mail, MessageSquare, Users, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationPreferences {
  email: {
    feedback_created: boolean;
    feedback_updated: boolean;
    feedback_commented: boolean;
    feedback_voted: boolean;
    status_changed: boolean;
    member_added: boolean;
    digest_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  };
  in_app: {
    feedback_created: boolean;
    feedback_updated: boolean;
    feedback_commented: boolean;
    feedback_voted: boolean;
    status_changed: boolean;
    member_added: boolean;
    push_enabled: boolean;
  };
  slack: {
    enabled: boolean;
    webhook_url: string;
    channel: string;
    events: string[];
  };
}

interface NotificationHistory {
  id: string;
  type: 'email' | 'in_app' | 'slack';
  event: string;
  title: string;
  message: string;
  sent_at: string;
  status: 'sent' | 'failed' | 'pending';
  recipient: string;
}

const EVENT_LABELS: Record<string, string> = {
  feedback_created: 'New Feedback Created',
  feedback_updated: 'Feedback Updated',
  feedback_commented: 'New Comments',
  feedback_voted: 'Feedback Voted',
  status_changed: 'Status Changes',
  member_added: 'New Members Added'
};

export const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      feedback_created: true,
      feedback_updated: true,
      feedback_commented: true,
      feedback_voted: false,
      status_changed: true,
      member_added: true,
      digest_frequency: 'daily'
    },
    in_app: {
      feedback_created: true,
      feedback_updated: true,
      feedback_commented: true,
      feedback_voted: false,
      status_changed: true,
      member_added: true,
      push_enabled: true
    },
    slack: {
      enabled: false,
      webhook_url: '',
      channel: '#notifications',
      events: ['feedback_created', 'status_changed']
    }
  });

  const [history, setHistory] = useState<NotificationHistory[]>([]);

  useEffect(() => {
    loadNotificationPreferences();
    loadNotificationHistory();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      setLoading(true);
      // Mock loading delay
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const loadNotificationHistory = async () => {
    try {
      // Mock notification history
      const mockHistory: NotificationHistory[] = [
        {
          id: '1',
          type: 'email',
          event: 'feedback_created',
          title: 'New Feedback: Mobile App Navigation',
          message: 'John Doe submitted new feedback about mobile app navigation.',
          sent_at: new Date(Date.now() - 3600000).toISOString(),
          status: 'sent',
          recipient: user?.email || 'user@example.com'
        },
        {
          id: '2',
          type: 'in_app',
          event: 'status_changed',
          title: 'Feedback Status Updated',
          message: 'Dark mode feature request has been moved to "In Progress".',
          sent_at: new Date(Date.now() - 7200000).toISOString(),
          status: 'sent',
          recipient: user?.email || 'user@example.com'
        },
        {
          id: '3',
          type: 'slack',
          event: 'feedback_commented',
          title: 'New Comment on Feedback',
          message: 'Sarah commented on the API rate limiting feedback.',
          sent_at: new Date(Date.now() - 10800000).toISOString(),
          status: 'failed',
          recipient: '#notifications'
        }
      ];
      setHistory(mockHistory);
    } catch (error) {
      console.error('Failed to load notification history:', error);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Notification preferences saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (type: 'email' | 'in_app' | 'slack') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Test Notification Sent',
        description: `Test ${type} notification has been sent successfully`
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: `Failed to send test ${type} notification`,
        variant: 'destructive'
      });
    }
  };

  const updateEmailPreference = (event: keyof typeof preferences.email, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      email: { ...prev.email, [event]: value }
    }));
  };

  const updateInAppPreference = (event: keyof typeof preferences.in_app, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      in_app: { ...prev.in_app, [event]: value }
    }));
  };

  const updateSlackPreference = (key: keyof typeof preferences.slack, value: any) => {
    setPreferences(prev => ({
      ...prev,
      slack: { ...prev.slack, [key]: value }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'in_app': return <Bell className="h-4 w-4" />;
      case 'slack': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
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
          <h2 className="text-2xl font-bold">Notification Settings</h2>
          <p className="text-muted-foreground">Configure how you receive notifications</p>
        </div>
        
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Receive notifications via email when events occur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(EVENT_LABELS).map(([event, label]) => (
                <div key={event} className="flex items-center justify-between">
                  <label className="text-sm font-medium">{label}</label>
                  <Switch
                    checked={preferences.email[event as keyof typeof preferences.email] as boolean}
                    onCheckedChange={(value) => updateEmailPreference(event as keyof typeof preferences.email, value)}
                  />
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Email Digest Frequency</label>
                  <Select 
                    value={preferences.email.digest_frequency} 
                    onValueChange={(value: any) => updateEmailPreference('digest_frequency', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => testNotification('email')}>
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                In-App Notifications
              </CardTitle>
              <CardDescription>
                Show notifications within the application interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(EVENT_LABELS).map(([event, label]) => (
                <div key={event} className="flex items-center justify-between">
                  <label className="text-sm font-medium">{label}</label>
                  <Switch
                    checked={preferences.in_app[event as keyof typeof preferences.in_app] as boolean}
                    onCheckedChange={(value) => updateInAppPreference(event as keyof typeof preferences.in_app, value)}
                  />
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Browser Push Notifications</label>
                  <Switch
                    checked={preferences.in_app.push_enabled}
                    onCheckedChange={(value) => updateInAppPreference('push_enabled', value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => testNotification('in_app')}>
                  Send Test Notification
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Slack Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Slack Integration
              </CardTitle>
              <CardDescription>
                Send notifications to your Slack workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Slack Notifications</label>
                <Switch
                  checked={preferences.slack.enabled}
                  onCheckedChange={(value) => updateSlackPreference('enabled', value)}
                />
              </div>

              {preferences.slack.enabled && (
                <>
                  <div>
                    <label className="text-sm font-medium">Webhook URL</label>
                    <Input
                      type="url"
                      value={preferences.slack.webhook_url}
                      onChange={(e) => updateSlackPreference('webhook_url', e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Channel</label>
                    <Input
                      type="text"
                      value={preferences.slack.channel}
                      onChange={(e) => updateSlackPreference('channel', e.target.value)}
                      placeholder="#notifications"
                      className="mt-1"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => testNotification('slack')}>
                      Send Test Message
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>View recent notifications sent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No notifications sent yet</p>
                ) : (
                  history.map(notification => (
                    <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(notification.type)}
                        <div>
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            To: {notification.recipient} • {new Date(notification.sent_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(notification.status)}>
                          {notification.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};