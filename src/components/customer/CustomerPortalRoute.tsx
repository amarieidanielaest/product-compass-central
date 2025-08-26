import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { CustomerAuthProvider, useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CustomerAuth } from './CustomerAuth';
import { CustomerPortal } from '@/components/boards/CustomerPortal';
import { boardService, CustomerBoard } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CustomerPortalContent: React.FC = () => {
  const { organization, boardSlug } = useParams();
  const { user, loading: authLoading, isAuthenticated } = useCustomerAuth();
  const [board, setBoard] = useState<CustomerBoard | null>(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const [boardNotFound, setBoardNotFound] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBoardInfo();
  }, [organization, boardSlug]);

  const loadBoardInfo = async () => {
    try {
      setBoardLoading(true);
      setBoardNotFound(false);
      
      // Load board by slug
      const boardsResponse = await boardService.getBoards({ slug: boardSlug });
      
      if (boardsResponse.success && boardsResponse.data && boardsResponse.data.length > 0) {
        const boardData = boardsResponse.data[0];
        setBoard(boardData);
        
        // Check if board is private and requires authentication
        if (boardData.access_type === 'private' || !boardData.is_public) {
          setRequiresAuth(true);
          
          // If user is authenticated, check if they have access to this board
          if (isAuthenticated()) {
            try {
              // Check board membership for customer user
              const membershipResponse = await boardService.getBoardMemberships(boardData.id);
              
              if (membershipResponse.success && membershipResponse.data) {
                const userHasAccess = membershipResponse.data.some(
                  membership => membership.customer_user_id === user?.id
                );
                setRequiresAuth(!userHasAccess);
              } else {
                setRequiresAuth(true);
              }
            } catch (error) {
              console.error('Error checking board membership:', error);
              setRequiresAuth(true);
            }
          }
        } else {
          setRequiresAuth(false);
        }
      } else {
        setBoardNotFound(true);
      }
    } catch (error) {
      console.error('Error loading board info:', error);
      setBoardNotFound(true);
      toast({
        title: 'Error',
        description: 'Failed to load board information',
        variant: 'destructive',
      });
    } finally {
      setBoardLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setRequiresAuth(false);
    loadBoardInfo(); // Reload board info after authentication
  };

  // Show loading while checking auth or board
  if (authLoading || boardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show 404 if board not found
  if (boardNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Board Not Found</h2>
          <p className="text-gray-600">
            The board "{boardSlug}" could not be found or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  // Show authentication form if required and user is not authenticated
  if (requiresAuth && !isAuthenticated()) {
    return (
      <CustomerAuth 
        boardName={board?.name}
        onSuccess={handleAuthSuccess}
        showCompanyFields={true}
      />
    );
  }

  // Show the customer portal
  return <CustomerPortal />;
};

export const CustomerPortalRoute: React.FC = () => {
  return (
    <CustomerAuthProvider>
      <CustomerPortalContent />
    </CustomerAuthProvider>
  );
};