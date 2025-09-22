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
import { Building, Users, Crown, Shield, Palette, Globe, Mail, Plus, Edit, Trash2, UserPlus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
  lastActive: string;
}

interface OrganizationSettings {
  general: {
    name: string;
    domain: string;
    description: string;
    logo: string;
    website: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    customCSS: string;
  };
  features: {
    enablePublicBoards: boolean;
    allowGuestAccess: boolean;
    enableCustomDomains: boolean;
    enableWhiteLabeling: boolean;
    enableAdvancedAnalytics: boolean;
    enableAPIAccess: boolean;
  };
  limits: {
    maxMembers: number;
    maxBoards: number;
    maxStorage: number; // GB
    maxAPIRequests: number; // per month
  };
}

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
}

const DEFAULT_PERMISSIONS = [
  { id: 'boards:create', label: 'Create Boards', category: 'Boards' },
  { id: 'boards:read', label: 'View Boards', category: 'Boards' },
  { id: 'boards:update', label: 'Edit Boards', category: 'Boards' },
  { id: 'boards:delete', label: 'Delete Boards', category: 'Boards' },
  { id: 'feedback:create', label: 'Create Feedback', category: 'Feedback' },
  { id: 'feedback:read', label: 'View Feedback', category: 'Feedback' },
  { id: 'feedback:update', label: 'Edit Feedback', category: 'Feedback' },
  { id: 'feedback:delete', label: 'Delete Feedback', category: 'Feedback' },
  { id: 'members:invite', label: 'Invite Members', category: 'Members' },
  { id: 'members:manage', label: 'Manage Members', category: 'Members' },
  { id: 'analytics:view', label: 'View Analytics', category: 'Analytics' },
  { id: 'settings:manage', label: 'Manage Settings', category: 'Settings' },
];

export const OrganizationSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  
  const [settings, setSettings] = useState<OrganizationSettings>({
    general: {
      name: 'Acme Corporation',
      domain: 'acme.com',
      description: 'Leading innovation in product development',
      logo: '',
      website: 'https://acme.com'
    },
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#6366F1',
      logoUrl: '',
      faviconUrl: '',
      customCSS: ''
    },
    features: {
      enablePublicBoards: true,
      allowGuestAccess: false,
      enableCustomDomains: true,
      enableWhiteLabeling: false,
      enableAdvancedAnalytics: true,
      enableAPIAccess: true
    },
    limits: {
      maxMembers: 100,
      maxBoards: 50,
      maxStorage: 100,
      maxAPIRequests: 10000
    }
  });

  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('member');

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockMembers: OrganizationMember[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john@acme.com',
          role: 'owner',
          status: 'active',
          joinedAt: new Date(Date.now() - 86400000 * 90).toISOString(),
          lastActive: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@acme.com',
          role: 'admin',
          status: 'active',
          joinedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
          lastActive: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike@acme.com',
          role: 'member',
          status: 'pending',
          joinedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          lastActive: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      const mockRoles: CustomRole[] = [
        {
          id: '1',
          name: 'Product Manager',
          description: 'Can manage products and roadmaps',
          permissions: ['boards:create', 'boards:read', 'boards:update', 'feedback:read', 'feedback:update', 'analytics:view'],
          isDefault: false
        },
        {
          id: '2',
          name: 'Support Agent',
          description: 'Can view and respond to feedback',
          permissions: ['feedback:read', 'feedback:update'],
          isDefault: false
        }
      ];

      setMembers(mockMembers);
      setCustomRoles(mockRoles);
      
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load organization data',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Organization settings saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save organization settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const inviteMember = async () => {
    try {
      if (!inviteEmail || !inviteRole) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all fields',
          variant: 'destructive'
        });
        return;
      }

      const newMember: OrganizationMember = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole as any,
        status: 'pending',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      setMembers(prev => [...prev, newMember]);
      setInviteEmail('');
      setInviteRole('member');
      setInviteDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Member invited successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to invite member',
        variant: 'destructive'
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast({
        title: 'Success',
        description: 'Member removed successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive'
      });
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, role: newRole as any } : m
      ));
      toast({
        title: 'Success',
        description: 'Member role updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive'
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'member': return 'outline';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
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
          <h2 className="text-2xl font-bold">Organization Settings</h2>
          <p className="text-muted-foreground">Manage your organization and team members</p>
        </div>
        
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization Details
              </CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Organization Name</label>
                  <Input
                    value={settings.general.name}
                    onChange={(e) => 
                      setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, name: e.target.value }
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Domain</label>
                  <Input
                    value={settings.general.domain}
                    onChange={(e) => 
                      setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, domain: e.target.value }
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={settings.general.description}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, description: e.target.value }
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={settings.general.website}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, website: e.target.value }
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Usage & Limits</CardTitle>
              <CardDescription>Current usage and plan limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Members</span>
                    <span>{members.length} / {settings.limits.maxMembers}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${(members.length / settings.limits.maxMembers) * 100}%` }} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Boards</span>
                    <span>12 / {settings.limits.maxBoards}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${(12 / settings.limits.maxBoards) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span>45 GB / {settings.limits.maxStorage} GB</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${(45 / settings.limits.maxStorage) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Requests</span>
                    <span>2.5K / {(settings.limits.maxAPIRequests / 1000).toFixed(0)}K/month</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${(2500 / settings.limits.maxAPIRequests) * 100}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
                  </CardTitle>
                  <CardDescription>Manage your organization members and their roles</CardDescription>
                </div>
                
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your organization
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Email Address</label>
                        <Input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="colleague@company.com"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Role</label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={inviteMember}>
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-medium text-primary">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString()} • 
                          Last active {new Date(member.lastActive).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(member.status)}>
                        {member.status}
                      </Badge>
                      
                      <Select 
                        value={member.role} 
                        onValueChange={(role) => updateMemberRole(member.id, role)}
                        disabled={member.role === 'owner'}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {member.role !== 'owner' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.name} from the organization?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeMember(member.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Customization
              </CardTitle>
              <CardDescription>
                Customize your organization's visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: settings.branding.primaryColor }}
                    />
                    <Input
                      type="color"
                      value={settings.branding.primaryColor}
                      onChange={(e) => 
                        setSettings(prev => ({
                          ...prev,
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))
                      }
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={settings.branding.primaryColor}
                      onChange={(e) => 
                        setSettings(prev => ({
                          ...prev,
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Secondary Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: settings.branding.secondaryColor }}
                    />
                    <Input
                      type="color"
                      value={settings.branding.secondaryColor}
                      onChange={(e) => 
                        setSettings(prev => ({
                          ...prev,
                          branding: { ...prev.branding, secondaryColor: e.target.value }
                        }))
                      }
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={settings.branding.secondaryColor}
                      onChange={(e) => 
                        setSettings(prev => ({
                          ...prev,
                          branding: { ...prev.branding, secondaryColor: e.target.value }
                        }))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Logo URL</label>
                  <Input
                    value={settings.branding.logoUrl}
                    onChange={(e) => 
                      setSettings(prev => ({
                        ...prev,
                        branding: { ...prev.branding, logoUrl: e.target.value }
                      }))
                    }
                    placeholder="https://example.com/logo.png"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Favicon URL</label>
                  <Input
                    value={settings.branding.faviconUrl}
                    onChange={(e) => 
                      setSettings(prev => ({
                        ...prev,
                        branding: { ...prev.branding, faviconUrl: e.target.value }
                      }))
                    }
                    placeholder="https://example.com/favicon.ico"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Custom CSS</label>
                <textarea
                  value={settings.branding.customCSS}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      branding: { ...prev.branding, customCSS: e.target.value }
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm font-mono"
                  rows={8}
                  placeholder="/* Custom CSS styles */"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Configuration
              </CardTitle>
              <CardDescription>
                Enable or disable features for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.features).map(([key, value]) => {
                const labels: Record<string, { title: string; description: string }> = {
                  enablePublicBoards: { title: 'Public Boards', description: 'Allow creating public feedback boards' },
                  allowGuestAccess: { title: 'Guest Access', description: 'Allow non-members to submit feedback' },
                  enableCustomDomains: { title: 'Custom Domains', description: 'Use your own domain for boards' },
                  enableWhiteLabeling: { title: 'White Labeling', description: 'Remove ProductHub branding' },
                  enableAdvancedAnalytics: { title: 'Advanced Analytics', description: 'Access detailed metrics and reports' },
                  enableAPIAccess: { title: 'API Access', description: 'Enable REST API for integrations' }
                };

                return (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{labels[key]?.title || key}</h4>
                      <p className="text-sm text-muted-foreground">
                        {labels[key]?.description || 'Feature description'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          features: { ...prev.features, [key]: checked }
                        }))
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};