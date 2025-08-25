import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { boardService, CustomerBoard } from '@/services/api';
import { Mail, UserPlus, Users, Shield, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CustomerUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  created_at: string;
}

interface BoardMembership {
  id: string;
  customer_user_id: string;
  board_id: string;
  role: string;
  joined_at: string;
  customer_user: CustomerUser;
}

interface BoardInvitation {
  id: string;
  board_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

interface CustomerManagementProps {
  boardId: string;
  boardName: string;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({ boardId, boardName }) => {
  const [members, setMembers] = useState<BoardMembership[]>([]);
  const [invitations, setInvitations] = useState<BoardInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { toast } = useToast();

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member',
  });

  useEffect(() => {
    loadBoardMembers();
    loadBoardInvitations();
  }, [boardId]);

  const loadBoardMembers = async () => {
    try {
      // Load board memberships with customer user data
      const { data, error } = await supabase
        .from('board_memberships')
        .select(`
          id,
          customer_user_id,
          board_id,
          role,
          joined_at,
          customer_users!board_memberships_customer_user_id_fkey (
            id,
            email,
            first_name,
            last_name,
            company,
            job_title,
            created_at
          )
        `)
        .eq('board_id', boardId)
        .not('customer_user_id', 'is', null);

      if (error) throw error;

      const memberships = data?.map(membership => ({
        ...membership,
        customer_user: membership.customer_users
      })) || [];

      setMembers(memberships);
    } catch (error) {
      console.error('Error loading board members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load board members',
        variant: 'destructive',
      });
    }
  };

  const loadBoardInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_board_invitations')
        .select('*')
        .eq('board_id', boardId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading board invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCustomer = async () => {
    if (!inviteForm.email) {
      toast({
        title: 'Error',
        description: 'Email is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate invitation token and expiry
      const token = btoa(Math.random().toString(36) + Date.now().toString()).replace(/[^a-zA-Z0-9]/g, '');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invitation in database
      const { error } = await supabase
        .from('customer_board_invitations')
        .insert({
          board_id: boardId,
          email: inviteForm.email,
          role: inviteForm.role,
          token,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Invitation sent!',
        description: `Invitation sent to ${inviteForm.email}`,
      });

      setIsInviteDialogOpen(false);
      setInviteForm({ email: '', role: 'member' });
      loadBoardInvitations();
      
      // In a real app, you would send an email here
      console.log('Invitation link:', `${window.location.origin}/portal/invitation/${token}`);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (membershipId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('board_memberships')
        .delete()
        .eq('id', membershipId);

      if (error) throw error;

      toast({
        title: 'Member removed',
        description: `${email} has been removed from the board`,
      });

      loadBoardMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeInvitation = async (invitationId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('customer_board_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: 'Invitation revoked',
        description: `Invitation to ${email} has been revoked`,
      });

      loadBoardInvitations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke invitation',
        variant: 'destructive',
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600">Manage customer access to {boardName}</p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Customer</DialogTitle>
              <DialogDescription>
                Send an invitation to give a customer access to {boardName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteCustomer}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Board Members ({members.length})
          </CardTitle>
          <CardDescription>
            Customers who have access to this board
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
              <p className="text-gray-600 mb-4">Invite customers to give them access to this board</p>
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite First Customer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.customer_user.first_name?.[0] || member.customer_user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {member.customer_user.first_name && member.customer_user.last_name
                            ? `${member.customer_user.first_name} ${member.customer_user.last_name}`
                            : member.customer_user.email
                          }
                        </p>
                        <Badge className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{member.customer_user.email}</p>
                      {member.customer_user.company && (
                        <p className="text-sm text-gray-500">{member.customer_user.company}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id, member.customer_user.email)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations ({invitations.filter(inv => !inv.accepted_at).length})
          </CardTitle>
          <CardDescription>
            Invitations that haven't been accepted yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No pending invitations</p>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {invitation.accepted_at ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{invitation.email}</p>
                        <Badge className={getRoleColor(invitation.role)}>
                          {invitation.role}
                        </Badge>
                        <Badge variant={invitation.accepted_at ? "default" : "secondary"}>
                          {invitation.accepted_at ? "Accepted" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Invited {new Date(invitation.created_at).toLocaleDateString()}
                        {invitation.accepted_at && ` • Accepted ${new Date(invitation.accepted_at).toLocaleDateString()}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        Expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {!invitation.accepted_at && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeInvitation(invitation.id, invitation.email)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};