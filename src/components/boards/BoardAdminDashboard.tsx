import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BoardSelector } from './BoardSelector';
import { CreateBoardDialog } from './CreateBoardDialog';
import { BoardMembersManager } from './BoardMembersManager';
import { BoardAnalytics } from './BoardAnalytics';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { IntegrationSettings } from './IntegrationSettings';
import { 
  Settings, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Plus,
  Globe,
  Lock,
  Edit,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CustomerBoard {
  id: string;
  name: string;
  slug: string;
  description: string;
  organization_id: string | null;
  customer_organization_id: string | null;
  board_type: string | null;
  access_type: string | null;
  is_public: boolean;
  is_active: boolean;
  features_enabled: any;
  branding_config?: any;
  created_at: string;
  updated_at?: string;
  organization?: {
    name: string;
    slug: string;
  } | null;
  _count?: {
    feedback_items: number;
    board_memberships: number;
  };
}

export const BoardAdminDashboard: React.FC = () => {
  const [boards, setBoards] = useState<CustomerBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<CustomerBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_boards')
        .select(`
          *,
          organization:organizations(name, slug),
          feedback_items(count),
          board_memberships(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to include counts
      const transformedBoards = data?.map(board => ({
        ...board,
        features_enabled: board.features_enabled as any,
        _count: {
          feedback_items: board.feedback_items?.length || 0,
          board_memberships: board.board_memberships?.length || 0
        }
      })) || [];

      setBoards(transformedBoards as any);
      
      // Select first board if none selected
      if (!selectedBoard && transformedBoards.length > 0) {
        setSelectedBoard(transformedBoards[0] as any);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
      toast({
        title: "Error",
        description: "Failed to load customer boards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBoardCreated = () => {
    loadBoards();
    setShowCreateDialog(false);
    toast({
      title: "Success",
      description: "Customer board created successfully",
    });
  };

  const toggleBoardStatus = async (boardId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('customer_boards')
        .update({ is_active: newStatus })
        .eq('id', boardId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Board ${newStatus ? 'activated' : 'deactivated'} successfully`,
      });

      loadBoards();
    } catch (error) {
      console.error('Error updating board status:', error);
      toast({
        title: "Error",
        description: "Failed to update board status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Board Administration</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Board Administration</h1>
          <p className="text-muted-foreground">Manage your customer feedback boards</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Board
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Boards</p>
                <p className="text-2xl font-bold">{boards.length}</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">
                  {boards.reduce((sum, board) => sum + (board._count?.feedback_items || 0), 0)}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">
                  {boards.reduce((sum, board) => sum + (board._count?.board_memberships || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Public Boards</p>
                <p className="text-2xl font-bold">
                  {boards.filter(board => board.is_public).length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {boards.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Board List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Boards</CardTitle>
                <CardDescription>Select a board to manage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {boards.map((board) => (
                  <div
                    key={board.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedBoard?.id === board.id
                        ? 'bg-muted border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedBoard(board)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{board.name}</h4>
                      <div className="flex items-center gap-1">
                        {board.is_public ? (
                          <Globe className="h-3 w-3 text-green-600" />
                        ) : (
                          <Lock className="h-3 w-3 text-orange-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{board._count?.feedback_items || 0} feedback</span>
                      <Badge variant="outline" className="text-xs">
                        {board.board_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Board Details */}
          <div className="lg:col-span-3">
            {selectedBoard ? (
              <div className="space-y-6">
                {/* Board Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {selectedBoard.name}
                          <Badge variant={selectedBoard.is_public ? "default" : "secondary"}>
                            {selectedBoard.is_public ? "Public" : "Private"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {selectedBoard.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/portal/${selectedBoard.organization?.slug || 'org'}/${selectedBoard.slug}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Board
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBoardStatus(selectedBoard.id, !selectedBoard.is_active)}
                        >
                          {selectedBoard.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium capitalize">{selectedBoard.board_type?.replace('_', ' ') || 'General'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Organization</p>
                        <p className="font-medium">{selectedBoard.organization?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{new Date(selectedBoard.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Features</p>
                        <div className="flex gap-1 mt-1">
                          {selectedBoard.features_enabled?.feedback && (
                            <Badge variant="outline" className="text-xs">Feedback</Badge>
                          )}
                          {selectedBoard.features_enabled?.roadmap && (
                            <Badge variant="outline" className="text-xs">Roadmap</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Feedback Items</p>
                              <p className="text-2xl font-bold">{selectedBoard._count?.feedback_items || 0}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Board Members</p>
                              <p className="text-2xl font-bold">{selectedBoard._count?.board_memberships || 0}</p>
                            </div>
                            <Users className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Status</p>
                              <p className="text-2xl font-bold">
                                {selectedBoard.is_active ? 'Active' : 'Inactive'}
                              </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics">
                    <BoardAnalytics board={selectedBoard as any} />
                  </TabsContent>

                  <TabsContent value="members">
                    <BoardMembersManager 
                      boardId={selectedBoard.id} 
                      onMembersChange={loadBoards}
                    />
                  </TabsContent>

                  <TabsContent value="advanced">
                    <AdvancedAnalytics boardId={selectedBoard.id} />
                  </TabsContent>

                  <TabsContent value="integrations">
                    <IntegrationSettings boardId={selectedBoard.id} />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Board</h3>
                  <p className="text-muted-foreground">
                    Choose a board from the sidebar to view its details and settings
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Boards Found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first customer board to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Board
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateBoardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateBoard={async () => handleBoardCreated()}
      />
    </div>
  );
};