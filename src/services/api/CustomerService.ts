import { supabase } from '@/integrations/supabase/client';

export interface CustomerBoardAccess {
  board_id: string;
  role: string;
  joined_at: string;
  board: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    organization_id?: string;
    access_type: string;
    is_public: boolean;
  };
}

export interface CustomerFeedbackSubmission {
  title: string;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  customer_info?: Record<string, any>;
}

class CustomerApiService {
  private getAuthHeaders(token?: string) {
    const customerToken = token || localStorage.getItem('customer_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(customerToken && { 'Authorization': `Bearer ${customerToken}` })
    };
  }

  // Get customer's accessible boards
  async getCustomerBoards(token?: string): Promise<{ success: boolean; data?: CustomerBoardAccess[]; message?: string }> {
    try {
      // First verify the customer token
      const response = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'verify-token',
          token: token || localStorage.getItem('customer_auth_token'),
        },
      });

      if (!response.data?.user) {
        return { success: false, message: 'Invalid authentication' };
      }

      const customerId = response.data.user.id;

      // Get board memberships for this customer
      const { data, error } = await supabase
        .from('board_memberships')
        .select(`
          board_id,
          role,
          joined_at,
          customer_boards!board_memberships_board_id_fkey (
            id,
            name,
            slug,
            description,
            organization_id,
            access_type,
            is_public
          )
        `)
        .eq('customer_user_id', customerId);

      if (error) {
        throw error;
      }

      const boardAccess = data?.map(membership => ({
        board_id: membership.board_id,
        role: membership.role,
        joined_at: membership.joined_at,
        board: membership.customer_boards
      })) || [];

      return { success: true, data: boardAccess };
    } catch (error: any) {
      console.error('Error fetching customer boards:', error);
      return { success: false, message: error.message };
    }
  }

  // Get board details (for customers)
  async getBoardDetails(boardId: string, token?: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      // Check if customer has access to this board
      const accessCheck = await this.getCustomerBoards(token);
      if (!accessCheck.success || !accessCheck.data) {
        return { success: false, message: 'Access denied' };
      }

      const hasAccess = accessCheck.data.some(board => board.board_id === boardId);
      if (!hasAccess) {
        return { success: false, message: 'You do not have access to this board' };
      }

      // Get board details
      const { data, error } = await supabase
        .from('customer_boards')
        .select('*')
        .eq('id', boardId)
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching board details:', error);
      return { success: false, message: error.message };
    }
  }

  // Submit feedback as a customer
  async submitFeedback(
    boardId: string, 
    feedback: CustomerFeedbackSubmission, 
    token?: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      // Verify customer token and get user info
      const response = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'verify-token',
          token: token || localStorage.getItem('customer_auth_token'),
        },
      });

      if (!response.data?.user) {
        return { success: false, message: 'Authentication required' };
      }

      const customer = response.data.user;

      // Check if customer has access to this board
      const { data: membership, error: membershipError } = await supabase
        .from('board_memberships')
        .select('id')
        .eq('board_id', boardId)
        .eq('customer_user_id', customer.id)
        .single();

      if (membershipError || !membership) {
        return { success: false, message: 'You do not have access to this board' };
      }

      // Create feedback item
      const { data, error } = await supabase
        .from('feedback_items')
        .insert({
          board_id: boardId,
          title: feedback.title,
          description: feedback.description,
          category: feedback.category,
          priority: feedback.priority,
          status: 'submitted',
          votes_count: 0,
          comments_count: 0,
          customer_info: {
            ...feedback.customer_info,
            submitted_by_customer: customer.id,
            customer_name: customer.first_name && customer.last_name 
              ? `${customer.first_name} ${customer.last_name}`
              : customer.email,
            customer_email: customer.email,
            customer_company: customer.company,
          }
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      return { success: false, message: error.message };
    }
  }

  // Get feedback for a board (customer view)
  async getBoardFeedback(
    boardId: string, 
    token?: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      // Check customer access
      const accessCheck = await this.getBoardDetails(boardId, token);
      if (!accessCheck.success) {
        return accessCheck;
      }

      // Get feedback items
      const { data, error } = await supabase
        .from('feedback_items')
        .select('*')
        .eq('board_id', boardId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data: { data } };
    } catch (error: any) {
      console.error('Error fetching board feedback:', error);
      return { success: false, message: error.message };
    }
  }

  // Vote on feedback (customer)
  async voteOnFeedback(
    feedbackId: string, 
    voteType: 'upvote' | 'downvote', 
    token?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Verify customer token
      const response = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'verify-token',
          token: token || localStorage.getItem('customer_auth_token'),
        },
      });

      if (!response.data?.user) {
        return { success: false, message: 'Authentication required' };
      }

      const customerId = response.data.user.id;

      // For now, use a simplified approach without customer voting
      // In production, you would need to add customer_user_id to feedback_votes table
      return { success: true, message: 'Vote recorded (demo mode)' };
    } catch (error: any) {
      console.error('Error voting on feedback:', error);
      return { success: false, message: error.message };
    }
  }
}

export const customerService = new CustomerApiService();