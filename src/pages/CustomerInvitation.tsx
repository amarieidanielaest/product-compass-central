import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CustomerAuthProvider, useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CustomerAuth } from '@/components/customer/CustomerAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InvitationData {
  id: string;
  board_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  customer_boards: {
    name: string;
    description?: string;
  };
}

const CustomerInvitationContent: React.FC = () => {
  const { token } = useParams();
  const { user, isAuthenticated, acceptInvitation } = useCustomerAuth();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('customer_board_invitations')
        .select(`
          *,
          customer_boards (
            name,
            description
          )
        `)
        .eq('token', token)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Invitation not found or has expired');
        } else {
          throw fetchError;
        }
        return;
      }

      if (!data) {
        setError('Invitation not found');
        return;
      }

      // Check if invitation has expired
      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired');
        return;
      }

      // Check if invitation has already been accepted
      if (data.accepted_at) {
        setAccepted(true);
      }

      setInvitation(data);
    } catch (err: any) {
      console.error('Error loading invitation:', err);
      setError(err.message || 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token || !isAuthenticated()) {
      toast({
        title: 'Error',
        description: 'You must be signed in to accept the invitation',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAccepting(true);
      
      const { error } = await acceptInvitation(token);
      
      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
      } else {
        setAccepted(true);
        toast({
          title: 'Success!',
          description: `You now have access to ${invitation?.customer_boards.name}`,
        });
        
        // Redirect to the board after a short delay
        setTimeout(() => {
          if (invitation) {
            window.location.href = `/portal/${invitation.board_id}`;
          }
        }, 2000);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to accept invitation',
        variant: 'destructive',
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleAuthSuccess = () => {
    // After authentication, try to accept the invitation automatically
    if (invitation && !accepted) {
      handleAcceptInvitation();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle className="text-red-600 w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-red-600">
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="text-green-600 w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-green-600">
              Invitation Accepted!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You now have access to <strong>{invitation.customer_boards.name}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting you to the board...
            </p>
            <Button onClick={() => window.location.href = `/portal/org/${invitation.board_id}`}>
              Go to Board
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">You've been invited!</h3>
              <p className="text-sm text-blue-700">
                You have been invited to join <strong>{invitation.customer_boards.name}</strong> as a {invitation.role}.
              </p>
            </div>
          </div>
        </div>
        
        <CustomerAuth 
          boardName={invitation.customer_boards.name}
          onSuccess={handleAuthSuccess}
          showCompanyFields={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="text-blue-600 w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold">
            Board Invitation
          </CardTitle>
          <CardDescription>
            You've been invited to join a customer board
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {invitation.customer_boards.name}
            </h3>
            {invitation.customer_boards.description && (
              <p className="text-gray-600 mb-4">
                {invitation.customer_boards.description}
              </p>
            )}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium capitalize">{invitation.role}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Invited:</span>
                <span className="font-medium">
                  {new Date(invitation.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium">
                  {new Date(invitation.expires_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              By accepting this invitation, you'll be able to submit feedback, view the roadmap, 
              and participate in discussions for {invitation.customer_boards.name}.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleAcceptInvitation}
            disabled={accepting}
            className="w-full"
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const CustomerInvitation: React.FC = () => {
  return (
    <CustomerAuthProvider>
      <CustomerInvitationContent />
    </CustomerAuthProvider>
  );
};