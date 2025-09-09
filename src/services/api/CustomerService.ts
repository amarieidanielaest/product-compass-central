import { BaseApiService, ApiResponse, PaginatedResponse } from './BaseApiService';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerFeedback {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'rejected';
  votes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  avatar_url?: string;
}

class CustomerApiService extends BaseApiService {
  constructor() {
    super('/api/customer');
  }

  // Authentication
  async signUp(
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string, 
    company?: string, 
    jobTitle?: string
  ): Promise<ApiResponse<{ token: string; user: CustomerUser }>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'register',
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          company,
          job_title: jobTitle,
        },
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      if (result?.error) {
        return { success: false, message: result.error, data: null };
      }

      return {
        success: true,
        data: { token: result.token, user: result.user },
        message: 'Registration successful'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Registration failed',
        data: null
      };
    }
  }

  async signIn(email: string, password: string): Promise<ApiResponse<{ token: string; user: CustomerUser }>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'login',
          email,
          password,
        },
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      if (result?.error) {
        return { success: false, message: result.error, data: null };
      }

      return {
        success: true,
        data: { token: result.token, user: result.user },
        message: 'Login successful'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login failed',
        data: null
      };
    }
  }

  async verifyToken(token: string): Promise<ApiResponse<{ user: CustomerUser; expires_at: string }>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'verify-token',
          token,
        },
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      if (!result?.valid || result?.error) {
        return { success: false, message: result?.error || 'Invalid token', data: null };
      }

      return {
        success: true,
        data: { user: result.user, expires_at: result.expires_at },
        message: 'Token valid'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Token verification failed',
        data: null
      };
    }
  }

  async signOut(token: string): Promise<ApiResponse<void>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'logout',
          token,
        },
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return {
        success: true,
        data: null as any,
        message: 'Logout successful'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Logout failed',
        data: null
      };
    }
  }

  // Feedback management
  async getBoardFeedback(
    boardId: string, 
    token: string,
    filters: any = {}
  ): Promise<ApiResponse<PaginatedResponse<CustomerFeedback>>> {
    try {
      const response = await fetch(`https://spubjrvuggyrozoawofp.supabase.co/functions/v1/boards-api/${boardId}/feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to load feedback');
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to load feedback',
        data: null
      };
    }
  }

  async submitFeedback(
    boardId: string, 
    feedback: Partial<CustomerFeedback>,
    token: string
  ): Promise<ApiResponse<CustomerFeedback>> {
    try {
      const response = await fetch(`https://spubjrvuggyrozoawofp.supabase.co/functions/v1/boards-api/${boardId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(feedback)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit feedback');
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to submit feedback',
        data: null
      };
    }
  }

  async voteOnFeedback(
    feedbackId: string, 
    voteType: 'upvote' | 'downvote',
    token: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`https://spubjrvuggyrozoawofp.supabase.co/functions/v1/boards-api/feedback/${feedbackId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ vote_type: voteType })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to record vote');
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to record vote',
        data: null
      };
    }
  }

  async acceptInvitation(
    invitationToken: string, 
    customerToken: string
  ): Promise<ApiResponse<{ board_id: string }>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'accept-invitation',
          invitation_token: invitationToken,
          token: customerToken,
        },
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      if (result?.error) {
        return { success: false, message: result.error, data: null };
      }

      return {
        success: true,
        data: { board_id: result.board_id },
        message: 'Invitation accepted successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to accept invitation',
        data: null
      };
    }
  }
}

export const customerService = new CustomerApiService();