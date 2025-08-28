import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerManagement } from '@/components/admin/CustomerManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, MessageSquare, Clock, Star } from 'lucide-react';

interface CustomerBoard {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_public: boolean;
  access_type: string;
  created_at: string;
}

export const SimplifiedCustomerAdminDashboard: React.FC = () => {
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [boards, setBoards] = useState<CustomerBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_boards')
        .select('id, name, slug, description, is_public, access_type, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBoards(data || []);
      
      if (data && data.length > 0 && !selectedBoard) {
        setSelectedBoard(data[0].id);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customer boards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedBoardData = boards.find(b => b.id === selectedBoard);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Administration</h1>
          <p className="text-gray-600">Manage customer access and boards</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Boards</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boards.length}</div>
            <p className="text-xs text-muted-foreground">
              {boards.filter(b => b.is_public).length} public
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Boards</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boards.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Management</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-muted-foreground">
              System operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Portal</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Portal running
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="boards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="boards">Board Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="boards" className="space-y-6">
          {/* Board Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Board to Manage</CardTitle>
              <CardDescription>Choose a customer board to manage its members and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{board.name}</span>
                        <Badge variant={board.is_public ? 'default' : 'secondary'}>
                          {board.is_public ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Board Management */}
          {selectedBoard && selectedBoardData && (
            <CustomerManagement 
              boardId={selectedBoard} 
              boardName={selectedBoardData.name} 
            />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Customer Analytics
              </CardTitle>
              <CardDescription>Analytics dashboard coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600 mb-4">Detailed analytics and insights coming soon</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Customer engagement metrics</p>
                  <p>• Feedback trends and insights</p>
                  <p>• Board performance analytics</p>
                  <p>• Customer satisfaction scores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};