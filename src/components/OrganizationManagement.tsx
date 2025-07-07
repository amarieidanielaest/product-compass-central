import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Building,
  Users,
  Globe,
  ExternalLink,
  Settings
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  custom_domain?: string;
  branding_config: any;
  is_active: boolean;
  created_at: string;
  member_count?: number;
  board_count?: number;
}

interface CustomerBoard {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_public: boolean;
  features_enabled: any;
  is_active: boolean;
  organization_id: string;
}

const OrganizationManagement = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [boards, setBoards] = useState<CustomerBoard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  // Form states
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingBoard, setEditingBoard] = useState<CustomerBoard | null>(null);
  const [isOrgDialogOpen, setIsOrgDialogOpen] = useState(false);
  const [isBoardDialogOpen, setIsBoardDialogOpen] = useState(false);

  // Check if user is admin
  if (!hasRole('admin')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadOrganizations(), loadBoards()]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_memberships(count),
          customer_boards(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const orgsWithCounts = data?.map(org => ({
        ...org,
        member_count: org.organization_memberships?.[0]?.count || 0,
        board_count: org.customer_boards?.[0]?.count || 0
      })) || [];

      setOrganizations(orgsWithCounts);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive",
      });
    }
  };

  const loadBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_boards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoards(data || []);
    } catch (error) {
      console.error('Error loading boards:', error);
      toast({
        title: "Error",
        description: "Failed to load customer boards",
        variant: "destructive",
      });
    }
  };

  const handleSaveOrganization = async (formData: FormData) => {
    try {
      const orgData = {
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        description: formData.get('description') as string,
        logo_url: formData.get('logo_url') as string || null,
        custom_domain: formData.get('custom_domain') as string || null,
        is_active: formData.get('is_active') === 'on',
      };

      if (editingOrg) {
        const { error } = await supabase
          .from('organizations')
          .update(orgData)
          .eq('id', editingOrg.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Organization updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('organizations')
          .insert([orgData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Organization created successfully",
        });
      }

      setIsOrgDialogOpen(false);
      setEditingOrg(null);
      loadOrganizations();
    } catch (error) {
      console.error('Error saving organization:', error);
      toast({
        title: "Error",
        description: "Failed to save organization",
        variant: "destructive",
      });
    }
  };

  const handleSaveBoard = async (formData: FormData) => {
    try {
      const boardData = {
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        description: formData.get('description') as string,
        organization_id: formData.get('organization_id') as string,
        is_public: formData.get('is_public') === 'on',
        is_active: formData.get('is_active') === 'on',
        features_enabled: {
          knowledge_center: formData.get('knowledge_center') === 'on',
          roadmap: formData.get('roadmap') === 'on',
          changelog: formData.get('changelog') === 'on',
          feedback: formData.get('feedback') === 'on',
        }
      };

      if (editingBoard) {
        const { error } = await supabase
          .from('customer_boards')
          .update(boardData)
          .eq('id', editingBoard.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Customer board updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('customer_boards')
          .insert([boardData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Customer board created successfully",
        });
      }

      setIsBoardDialogOpen(false);
      setEditingBoard(null);
      loadBoards();
    } catch (error) {
      console.error('Error saving board:', error);
      toast({
        title: "Error",
        description: "Failed to save customer board",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Organization deleted successfully",
      });
      
      loadOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive",
      });
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOrgBoards = (orgId: string) => boards.filter(board => board.organization_id === orgId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Organization Management</h1>
          <p className="text-muted-foreground">Manage customer organizations and their portals</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-80"
            />
          </div>
          <div className="flex space-x-2">
            <Dialog open={isBoardDialogOpen} onOpenChange={setIsBoardDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setEditingBoard(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Board
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingBoard ? 'Edit Customer Board' : 'Create New Customer Board'}
                  </DialogTitle>
                  <DialogDescription>
                    Create a portal space for customers to access documentation, roadmap, and feedback.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveBoard(new FormData(e.currentTarget));
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="organization_id">Organization</Label>
                      <Select name="organization_id" defaultValue={editingBoard?.organization_id || ''} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Board Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingBoard?.name || ''}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        name="slug"
                        defaultValue={editingBoard?.slug || ''}
                        placeholder="main"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingBoard?.description || ''}
                      />
                    </div>
                    <div className="grid gap-4">
                      <Label>Features Enabled</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="knowledge_center"
                            name="knowledge_center"
                            defaultChecked={editingBoard?.features_enabled?.knowledge_center !== false}
                          />
                          <Label htmlFor="knowledge_center">Knowledge Center</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="roadmap"
                            name="roadmap"
                            defaultChecked={editingBoard?.features_enabled?.roadmap !== false}
                          />
                          <Label htmlFor="roadmap">Roadmap</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="changelog"
                            name="changelog"
                            defaultChecked={editingBoard?.features_enabled?.changelog !== false}
                          />
                          <Label htmlFor="changelog">Changelog</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="feedback"
                            name="feedback"
                            defaultChecked={editingBoard?.features_enabled?.feedback !== false}
                          />
                          <Label htmlFor="feedback">Feedback</Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_public"
                          name="is_public"
                          defaultChecked={editingBoard?.is_public || false}
                        />
                        <Label htmlFor="is_public">Public Access</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          name="is_active"
                          defaultChecked={editingBoard?.is_active !== false}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingBoard ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isOrgDialogOpen} onOpenChange={setIsOrgDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingOrg(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Organization
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingOrg ? 'Edit Organization' : 'Create New Organization'}
                  </DialogTitle>
                  <DialogDescription>
                    Create a customer organization to manage their portal experience.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveOrganization(new FormData(e.currentTarget));
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Organization Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingOrg?.name || ''}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        name="slug"
                        defaultValue={editingOrg?.slug || ''}
                        placeholder="organization-name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingOrg?.description || ''}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="logo_url">Logo URL</Label>
                      <Input
                        id="logo_url"
                        name="logo_url"
                        defaultValue={editingOrg?.logo_url || ''}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="custom_domain">Custom Domain</Label>
                      <Input
                        id="custom_domain"
                        name="custom_domain"
                        defaultValue={editingOrg?.custom_domain || ''}
                        placeholder="portal.customer.com"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        name="is_active"
                        defaultChecked={editingOrg?.is_active !== false}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingOrg ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Organizations List */}
        <div className="space-y-4">
          {filteredOrganizations.map((org) => (
            <Card key={org.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {org.logo_url && (
                      <img 
                        src={org.logo_url} 
                        alt={org.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{org.name}</h3>
                      <p className="text-muted-foreground mb-2">{org.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {org.member_count} members
                        </span>
                        <span className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {org.board_count} boards
                        </span>
                        <Badge variant={org.is_active ? "default" : "secondary"}>
                          {org.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a 
                        href={`/portal/${org.slug}/main`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Portal
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingOrg(org);
                        setIsOrgDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this organization? This will also delete all associated data.')) {
                          handleDeleteOrganization(org.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Customer Boards */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Customer Boards
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getOrgBoards(org.id).map((board) => (
                      <Card key={board.id} className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{board.name}</h5>
                            <div className="flex items-center space-x-1">
                              {board.is_public && (
                                <Badge variant="outline" className="text-xs">Public</Badge>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingBoard(board);
                                  setIsBoardDialogOpen(true);
                                }}
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{board.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationManagement;