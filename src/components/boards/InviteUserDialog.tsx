import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { boardService, BoardMembership } from '@/services/api/BoardService';

const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer']),
});

type InviteUserForm = z.infer<typeof inviteUserSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  boardName: string;
  currentMembers: BoardMembership[];
  onInviteUser: (email: string, role: string) => Promise<void>;
}

export function InviteUserDialog({ 
  open, 
  onOpenChange, 
  boardId, 
  boardName,
  currentMembers,
  onInviteUser 
}: InviteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitesSent, setInvitesSent] = useState<string[]>([]);

  const form = useForm<InviteUserForm>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const handleSubmit = async (data: InviteUserForm) => {
    setIsSubmitting(true);
    try {
      await onInviteUser(data.email, data.role);
      setInvitesSent(prev => [...prev, data.email]);
      form.reset();
    } catch (error) {
      console.error('Failed to invite user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setInvitesSent([]);
    form.reset();
    onOpenChange(false);
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Can manage board settings, invite users, and moderate all content';
      case 'member':
        return 'Can create feedback, vote, comment, and view all content';
      case 'viewer':
        return 'Can only view content and vote on feedback';
      default:
        return '';
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite User to {boardName}
          </DialogTitle>
          <DialogDescription>
            Invite users to collaborate on this customer feedback board.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Members Section */}
          <div>
            <h4 className="text-sm font-medium mb-3">Current Members ({currentMembers.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {currentMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{member.user_id}</span>
                  <Badge variant={getRoleBadgeColor(member.role)}>
                    {member.role}
                  </Badge>
                </div>
              ))}
              {currentMembers.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  +{currentMembers.length - 5} more members
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Invite Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="user@example.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {getRoleDescription(field.value)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Success Messages */}
              {invitesSent.length > 0 && (
                <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                  <div className="text-sm text-green-800">
                    <strong>Invitations sent to:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      {invitesSent.map((email) => (
                        <li key={email}>{email}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  {invitesSent.length > 0 ? 'Done' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}