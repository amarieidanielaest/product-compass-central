import { BaseApiService, ApiResponse, PaginatedResponse, PaginationParams } from './BaseApiService';

export interface CustomerBoard {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organization_id?: string;
  is_public: boolean;
  is_active: boolean;
  board_type: 'general' | 'customer_specific' | 'internal';
  customer_organization_id?: string;
  access_type: 'public' | 'private' | 'invite_only';
  branding_config: any;
  features_enabled: {
    roadmap: boolean;
    feedback: boolean;
    changelog: boolean;
    knowledge_center: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface BoardMembership {
  id: string;
  board_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  invited_by?: string;
  joined_at?: string;
  created_at: string;
}

export interface FeedbackVote {
  id: string;
  feedback_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface FeedbackComment {
  id: string;
  feedback_id: string;
  author_id: string;
  parent_id?: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnhancedFeedbackItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: 'submitted' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  organization_id?: string;
  board_id?: string;
  submitted_by?: string;
  assigned_to?: string;
  votes_count: number;
  comments_count: number;
  impact_score: number;
  effort_estimate: number;
  tags: string[];
  customer_info: any;
  created_at: string;
  updated_at: string;
}

import { supabase } from '@/integrations/supabase/client';

class BoardApiService {
  // Board Management
  async getBoards(filters: any = {}): Promise<ApiResponse<CustomerBoard[]>> {
    try {
      const { data: boards, error } = await supabase.functions.invoke('boards-api');

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return boards;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async createBoard(board: Omit<CustomerBoard, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<CustomerBoard>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('boards-api', {
        body: board
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async updateBoard(id: string, updates: Partial<CustomerBoard>): Promise<ApiResponse<CustomerBoard>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('boards-api', {
        method: 'PATCH',
        body: updates
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  // Board Memberships
  async getBoardMembers(boardId: string): Promise<ApiResponse<BoardMembership[]>> {
    try {
      const { data: result, error } = await supabase.functions.invoke(`boards-api/${boardId}/members`);

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async inviteUserToBoard(boardId: string, email: string, role: string): Promise<ApiResponse<BoardMembership>> {
    try {
      const { data: result, error } = await supabase.functions.invoke(`boards-api/${boardId}/invite`, {
        body: { email, role }
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async removeBoardMember(boardId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('boards-api', {
        method: 'DELETE',
        body: { path: `${boardId}/members/${userId}` }
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  // Enhanced Feedback
  async getBoardFeedback(
    boardId: string,
    filters: any = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<ApiResponse<PaginatedResponse<EnhancedFeedbackItem>>> {
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        boardId,
        ...filters
      });

      const { data: result, error } = await supabase.functions.invoke(`boards-api/${boardId}/feedback?${queryParams}`);

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async createFeedback(boardId: string, feedback: Partial<EnhancedFeedbackItem>): Promise<ApiResponse<EnhancedFeedbackItem>> {
    try {
      const { data: result, error } = await supabase.functions.invoke(`boards-api/${boardId}/feedback`, {
        body: feedback
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async updateFeedback(boardId: string, feedbackId: string, updates: Partial<EnhancedFeedbackItem>): Promise<ApiResponse<EnhancedFeedbackItem>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('boards-api', {
        method: 'PATCH',
        body: { path: `${boardId}/feedback/${feedbackId}`, ...updates }
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  // Voting
  async voteFeedback(feedbackId: string, voteType: 'upvote' | 'downvote'): Promise<ApiResponse<FeedbackVote>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('boards-api', {
        method: 'POST',
        body: { path: `feedback/${feedbackId}/vote`, vote_type: voteType }
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async removeVote(feedbackId: string): Promise<ApiResponse<void>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('boards-api', {
        method: 'DELETE',
        body: { path: `feedback/${feedbackId}/vote` }
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  // Comments
  async getFeedbackComments(feedbackId: string): Promise<ApiResponse<FeedbackComment[]>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('boards-api', {
        method: 'GET',
        body: { path: `feedback/${feedbackId}/comments` }
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async createComment(feedbackId: string, content: string, parentId?: string): Promise<ApiResponse<FeedbackComment>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('boards-api', {
        method: 'POST',
        body: { path: `feedback/${feedbackId}/comments`, content, parent_id: parentId }
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async updateComment(commentId: string, content: string): Promise<ApiResponse<FeedbackComment>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('boards-api', {
        method: 'PATCH',
        body: { path: `comments/${commentId}`, content }
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('boards-api', {
        method: 'DELETE',
        body: { path: `comments/${commentId}` }
      });

      if (error) {
        return { success: false, message: error.message, data: null };
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }
}

export const boardService = new BoardApiService();