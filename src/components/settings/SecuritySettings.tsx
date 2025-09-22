import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Lock, Key, Smartphone, Globe, Clock, Users, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SecuritySettings {
  password: {
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    minLength: number;
    maxAge: number; // days
  };
  twoFactor: {
    enabled: boolean;
    method: 'sms' | 'authenticator' | 'email';
    backupCodes: string[];
  };
  sessions: {
    maxConcurrent: number;
    timeout: number; // minutes
    requireReauth: boolean;
  };
  sso: {
    enabled: boolean;
    provider: 'google' | 'microsoft' | 'okta' | 'onelogin';
    domain: string;
    enforceForAll: boolean;
  };
  access: {
    ipWhitelist: string[];
    allowedCountries: string[];
    blockTor: boolean;
    requireVerifiedEmail: boolean;
  };
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  createdAt: string;
  lastActivity: string;
  isCurrent: boolean;
}

export const SecuritySettings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  const [settings, setSettings] = useState<SecuritySettings>({
    password: {
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      minLength: 8,
      maxAge: 90
    },
    twoFactor: {
      enabled: false,
      method: 'authenticator',
      backupCodes: []
    },
    sessions: {
      maxConcurrent: 5,
      timeout: 30,
      requireReauth: false
    },
    sso: {
      enabled: false,
      provider: 'google',
      domain: '',
      enforceForAll: false
    },
    access: {
      ipWhitelist: [],
      allowedCountries: [],
      blockTor: true,
      requireVerifiedEmail: true
    }
  });

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [newPassword, setNewPassword] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    loadSecuritySettings();
    loadActiveSessions();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      // Mock loading delay
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load security settings',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const loadActiveSessions = async () => {
    try {
      // Mock data
      const mockSessions: ActiveSession[] = [
        {
          id: '1',
          device: 'Chrome on Windows',
          location: 'New York, NY',
          ipAddress: '192.168.1.1',
          createdAt: new Date().toISOString(),
          lastActivity: new Date(Date.now() - 300000).toISOString(),
          isCurrent: true
        },
        {
          id: '2',
          device: 'Safari on iPhone',
          location: 'San Francisco, CA',
          ipAddress: '10.0.0.1',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          isCurrent: false
        }
      ];
      setActiveSessions(mockSessions);
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Security settings saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save security settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setSettings(prev => ({
      ...prev,
      twoFactor: { ...prev.twoFactor, backupCodes: codes }
    }));
    setShowBackupCodes(true);
  };

  const changePassword = async () => {
    try {
      if (!newPassword.current || !newPassword.new || !newPassword.confirm) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all fields',
          variant: 'destructive'
        });
        return;
      }

      if (newPassword.new !== newPassword.confirm) {
        toast({
          title: 'Validation Error',
          description: 'New passwords do not match',
          variant: 'destructive'
        });
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNewPassword({ current: '', new: '', confirm: '' });
      setShowPasswordDialog(false);
      
      toast({
        title: 'Success',
        description: 'Password changed successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive'
      });
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({
        title: 'Success',
        description: 'Session terminated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to terminate session',
        variant: 'destructive'
      });
    }
  };

  const terminateAllSessions = async () => {
    try {
      setActiveSessions(prev => prev.filter(s => s.isCurrent));
      toast({
        title: 'Success',
        description: 'All other sessions terminated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to terminate sessions',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
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
          <h2 className="text-2xl font-bold">Security Settings</h2>
          <p className="text-muted-foreground">Manage your account security and authentication</p>
        </div>
        
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="authentication" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
        </TabsList>

        <TabsContent value="authentication" className="space-y-6">
          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password Security
              </CardTitle>
              <CardDescription>
                Configure password requirements and change your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Require Uppercase Letters</label>
                  <Switch
                    checked={settings.password.requireUppercase}
                    onCheckedChange={(value) => 
                      setSettings(prev => ({
                        ...prev,
                        password: { ...prev.password, requireUppercase: value }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Require Numbers</label>
                  <Switch
                    checked={settings.password.requireNumbers}
                    onCheckedChange={(value) => 
                      setSettings(prev => ({
                        ...prev,
                        password: { ...prev.password, requireNumbers: value }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Require Special Characters</label>
                  <Switch
                    checked={settings.password.requireSpecialChars}
                    onCheckedChange={(value) => 
                      setSettings(prev => ({
                        ...prev,
                        password: { ...prev.password, requireSpecialChars: value }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Minimum Length</label>
                  <Select 
                    value={settings.password.minLength.toString()} 
                    onValueChange={(value) => 
                      setSettings(prev => ({
                        ...prev,
                        password: { ...prev.password, minLength: parseInt(value) }
                      }))
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Current Password</label>
                        <Input
                          type="password"
                          value={newPassword.current}
                          onChange={(e) => setNewPassword(prev => ({ ...prev, current: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">New Password</label>
                        <Input
                          type="password"
                          value={newPassword.new}
                          onChange={(e) => setNewPassword(prev => ({ ...prev, new: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <Input
                          type="password"
                          value={newPassword.confirm}
                          onChange={(e) => setNewPassword(prev => ({ ...prev, confirm: e.target.value }))}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={changePassword}>
                        Change Password
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Two-Factor Authentication
                <Badge variant={settings.twoFactor.enabled ? 'default' : 'secondary'}>
                  {settings.twoFactor.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Two-Factor Authentication</label>
                <Switch
                  checked={settings.twoFactor.enabled}
                  onCheckedChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      twoFactor: { ...prev.twoFactor, enabled: value }
                    }))
                  }
                />
              </div>

              {settings.twoFactor.enabled && (
                <>
                  <div>
                    <label className="text-sm font-medium">Authentication Method</label>
                    <Select 
                      value={settings.twoFactor.method} 
                      onValueChange={(value: any) => 
                        setSettings(prev => ({
                          ...prev,
                          twoFactor: { ...prev.twoFactor, method: value }
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="authenticator">Authenticator App</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Backup Codes</h4>
                        <p className="text-sm text-muted-foreground">
                          Generate backup codes in case you lose access to your authenticator
                        </p>
                      </div>
                      <Button variant="outline" onClick={generateBackupCodes}>
                        Generate Codes
                      </Button>
                    </div>

                    {showBackupCodes && settings.twoFactor.backupCodes.length > 0 && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h5 className="font-medium mb-2">Your Backup Codes</h5>
                        <p className="text-sm text-muted-foreground mb-3">
                          Store these codes in a safe place. Each code can only be used once.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {settings.twoFactor.backupCodes.map((code, index) => (
                            <code key={index} className="text-sm bg-background p-2 rounded border">
                              {code}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          {/* Session Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active login sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Terminate All Other Sessions
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Terminate All Sessions</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will log you out of all other devices. You will remain logged in on this device.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={terminateAllSessions}>
                        Terminate All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="space-y-3">
                {activeSessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${session.isCurrent ? 'bg-green-500' : 'bg-muted'}`} />
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          {session.device}
                          {session.isCurrent && <Badge variant="outline" className="text-xs">Current</Badge>}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {session.location} • {session.ipAddress}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last active: {new Date(session.lastActivity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {!session.isCurrent && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                      >
                        Terminate
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Session Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Session Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Session Timeout (minutes)</label>
                  <Select 
                    value={settings.sessions.timeout.toString()} 
                    onValueChange={(value) => 
                      setSettings(prev => ({
                        ...prev,
                        sessions: { ...prev.sessions, timeout: parseInt(value) }
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Max Concurrent Sessions</label>
                  <Select 
                    value={settings.sessions.maxConcurrent.toString()} 
                    onValueChange={(value) => 
                      setSettings(prev => ({
                        ...prev,
                        sessions: { ...prev.sessions, maxConcurrent: parseInt(value) }
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="-1">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Access Control
              </CardTitle>
              <CardDescription>
                Control who can access your account and from where
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Require Email Verification</label>
                  <p className="text-xs text-muted-foreground">Users must verify their email before accessing the account</p>
                </div>
                <Switch
                  checked={settings.access.requireVerifiedEmail}
                  onCheckedChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      access: { ...prev.access, requireVerifiedEmail: value }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Block Tor Network</label>
                  <p className="text-xs text-muted-foreground">Prevent access from Tor exit nodes</p>
                </div>
                <Switch
                  checked={settings.access.blockTor}
                  onCheckedChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      access: { ...prev.access, blockTor: value }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sso" className="space-y-6">
          {/* SSO Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Single Sign-On (SSO)
                <Badge variant={settings.sso.enabled ? 'default' : 'secondary'}>
                  {settings.sso.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure enterprise SSO for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable SSO</label>
                <Switch
                  checked={settings.sso.enabled}
                  onCheckedChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      sso: { ...prev.sso, enabled: value }
                    }))
                  }
                />
              </div>

              {settings.sso.enabled && (
                <>
                  <div>
                    <label className="text-sm font-medium">SSO Provider</label>
                    <Select 
                      value={settings.sso.provider} 
                      onValueChange={(value: any) => 
                        setSettings(prev => ({
                          ...prev,
                          sso: { ...prev.sso, provider: value }
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google Workspace</SelectItem>
                        <SelectItem value="microsoft">Microsoft Azure AD</SelectItem>
                        <SelectItem value="okta">Okta</SelectItem>
                        <SelectItem value="onelogin">OneLogin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Domain</label>
                    <Input
                      type="text"
                      value={settings.sso.domain}
                      onChange={(e) => 
                        setSettings(prev => ({
                          ...prev,
                          sso: { ...prev.sso, domain: e.target.value }
                        }))
                      }
                      placeholder="company.com"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enforce for All Users</label>
                      <p className="text-xs text-muted-foreground">Require all users to use SSO</p>
                    </div>
                    <Switch
                      checked={settings.sso.enforceForAll}
                      onCheckedChange={(value) => 
                        setSettings(prev => ({
                          ...prev,
                          sso: { ...prev.sso, enforceForAll: value }
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};