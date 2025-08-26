import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerManagement } from '@/components/admin/CustomerManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Search, Plus, Filter, BarChart3, Mail, 
  Clock, CheckCircle2, XCircle, MessageSquare, Star
} from 'lucide-react';

interface CustomerBoard {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_public: boolean;
  access_type: string;
  member_count?: number;
  feedback_count?: number;
  created_at: string;
}

interface CustomerAccessRequest {
  id: string;
  board_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  board: { name: string };
}

export const CustomerAdminDashboard: React.FC = () => {
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [boards, setBoards] = useState<CustomerBoard[]>([]);
  const [accessRequests, setAccessRequests] = useState<CustomerAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadBoards();
    loadAccessRequests();
  }, []);

  const loadBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_boards')
        .select(`
          id,
          name,
          slug,
          description,
          is_public,
          access_type,
          created_at,
          board_memberships(count),
          feedback_items(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const boardsWithCounts = data?.map(board => ({
        ...board,
        member_count: board.board_memberships?.[0]?.count || 0,
        feedback_count: board.feedback_items?.[0]?.count || 0
      })) || [];

      setBoards(boardsWithCounts);
      
      if (boardsWithCounts.length > 0 && !selectedBoard) {
        setSelectedBoard(boardsWithCounts[0].id);
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

  const loadAccessRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_access_requests')
        .select(`
          *,
          board:board_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccessRequests(data || []);
    } catch (error) {
      console.error('Error loading access requests:', error);
    }
  };

  const handleApproveRequest = async (requestId: string, email: string, boardId: string) => {
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('customer_access_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Generate invitation token
      const token = btoa(Math.random().toString(36) + Date.now().toString()).replace(/[^a-zA-Z0-9]/g, '');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry for approved requests

      // Create invitation
      const { error: inviteError } = await supabase
        .from('customer_board_invitations')
        .insert({
          board_id: boardId,
          email,
          role: 'member',
          token,
          expires_at: expiresAt.toISOString(),
        });

      if (inviteError) throw inviteError;

      toast({
        title: 'Request approved!',
        description: `Invitation sent to ${email}`,
      });

      loadAccessRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve request',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (requestId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('customer_access_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request rejected',
        description: `Access denied for ${email}`,
      });

      loadAccessRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  const filteredRequests = accessRequests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
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
          <p className="text-gray-600">Manage customer access, boards, and requests</p>
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
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {boards.reduce((acc, board) => acc + (board.member_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all boards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accessRequests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {boards.reduce((acc, board) => acc + (board.feedback_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From customers
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="boards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="boards">Board Management</TabsTrigger>
          <TabsTrigger value="requests">Access Requests</TabsTrigger>
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
                        <div className="flex items-center gap-2">
                          <Badge variant={board.is_public ? 'default' : 'secondary'}>
                            {board.is_public ? 'Public' : 'Private'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {board.member_count} members
                          </span>
                        </div>
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

        <TabsContent value="requests" className="space-y-6">
          {/* Access Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Access Requests</CardTitle>
                  <CardDescription>Review and approve customer access requests</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No access requests</h3>
                  <p className="text-gray-600">Customer access requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {request.first_name?.[0] || request.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {request.first_name && request.last_name
                                ? `${request.first_name} ${request.last_name}`
                                : request.email
                              }
                            </p>
                            <Badge className={getStatusColor(request.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                {request.status}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{request.email}</p>
                          {request.company && (
                            <p className="text-sm text-gray-500">{request.company}</p>
                          )}
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-gray-400">
                              Board: {request.board.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {request.message && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{request.message}"</p>
                          )}
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(request.id, request.email, request.board_id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id, request.email)}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Customer Analytics
              </CardTitle>
              <CardDescription>Coming soon - Analytics dashboard for customer engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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