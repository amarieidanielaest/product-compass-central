import { useState, useEffect } from 'react';
import { Users, UserPlus, MoreHorizontal, Shield, Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { InviteUserDialog } from './InviteUserDialog';
import { boardService, BoardMembership, CustomerBoard } from '@/services/api/BoardService';
import { useToast } from '@/hooks/use-toast';

interface BoardMembersManagerProps {
  board: CustomerBoard;
  currentUserRole?: 'admin' | 'member' | 'viewer';
}

export function BoardMembersManager({ board, currentUserRole }: BoardMembersManagerProps) {
  const [members, setMembers] = useState<BoardMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, [board.id]);

  const loadMembers = async () => {
    try {
      const result = await boardService.getBoardMembers(board.id);
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (email: string, role: string) => {
    try {
      const result = await boardService.inviteUserToBoard(board.id, email, role);
      if (result.success) {
        toast({
          title: "Invitation sent",
          description: `Invitation sent to ${email}`,
        });
        await loadMembers(); // Refresh members list
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await boardService.removeBoardMember(board.id, userId);
      toast({
        title: "Member removed",
        description: "Member has been removed from the board",
      });
      await loadMembers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'member':
        return <User className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'member':
        return 'default';
      case 'viewer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const canManageMembers = currentUserRole === 'admin';

  if (loading) {
    return <div>Loading members...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Board Members ({members.length})
            </CardTitle>
            {canManageMembers && (
              <Button 
                size="sm" 
                onClick={() => setShowInviteDialog(true)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Invite User
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No members found
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {member.user_id.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        User {member.user_id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Joined {new Date(member.joined_at || member.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeColor(member.role)} className="gap-1">
                      {getRoleIcon(member.role)}
                      {member.role}
                    </Badge>
                    
                    {canManageMembers && member.role !== 'admin' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRemoveMember(member.user_id)}>
                            Remove from board
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        boardId={board.id}
        boardName={board.name}
        currentMembers={members}
        onInviteUser={handleInviteUser}
      />
    </>
  );
}