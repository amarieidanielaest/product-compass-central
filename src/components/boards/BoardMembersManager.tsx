import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, UserPlus, Mail, Crown, Shield, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BoardMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  joined_at: string;
  invited_by: string;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface BoardMembersManagerProps {
  boardId: string;
  onMembersChange?: () => void;
}

export const BoardMembersManager: React.FC<BoardMembersManagerProps> = ({
  boardId,
  onMembersChange
}) => {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, [boardId]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('board_memberships')
        .select(`
          *,
          profiles!inner(
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .eq('board_id', boardId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers((data || []).map(item => ({
        ...item,
        profile: item.profiles
      })) as BoardMember[]);
    } catch (error) {
      console.error('Error loading board members:', error);
      toast({
        title: "Error",
        description: "Failed to load board members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setIsInviting(true);
    try {
      // First check if user exists
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail.toLowerCase().trim())
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (!profiles) {
        toast({
          title: "User not found",
          description: "No user found with this email address",
          variant: "destructive"
        });
        return;
      }

      // Check if already a member
      const { data: existing, error: existingError } = await supabase
        .from('board_memberships')
        .select('id')
        .eq('board_id', boardId)
        .eq('user_id', profiles.id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        toast({
          title: "Already a member",
          description: "This user is already a member of the board",
          variant: "destructive"
        });
        return;
      }

      // Add member
      const { error: insertError } = await supabase
        .from('board_memberships')
        .insert({
          board_id: boardId,
          user_id: profiles.id,
          role: inviteRole,
          joined_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Member invited successfully",
      });

      setInviteEmail('');
      setInviteRole('member');
      setShowInviteDialog(false);
      loadMembers();
      onMembersChange?.();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to invite member",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('board_memberships')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member role updated successfully",
      });

      loadMembers();
      onMembersChange?.();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive"
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('board_memberships')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed successfully",
      });

      loadMembers();
      onMembersChange?.();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'member':
        return <Shield className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'member':
        return 'default';
      case 'viewer':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Board Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading members...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Board Members</CardTitle>
          <CardDescription>
            Manage who has access to this customer board
          </CardDescription>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Board Member</DialogTitle>
              <DialogDescription>
                Add a team member to this customer board
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                    <SelectItem value="member">Member - Can manage content</SelectItem>
                    <SelectItem value="viewer">Viewer - Read only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={inviteMember} 
                  disabled={isInviting}
                  className="flex-1"
                >
                  {isInviting ? 'Inviting...' : 'Send Invitation'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowInviteDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.profile?.avatar_url} />
                  <AvatarFallback>
                    {member.profile?.first_name?.[0]}{member.profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {member.profile?.first_name} {member.profile?.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {member.profile?.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getRoleColor(member.role)} className="gap-1">
                  {getRoleIcon(member.role)}
                  {member.role}
                </Badge>
                <Select
                  value={member.role}
                  onValueChange={(value) => updateMemberRole(member.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeMember(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No members yet. Invite your first team member to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};