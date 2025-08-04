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

class BoardApiService extends BaseApiService {
  constructor() {
    super('/api/boards');
  }

  // Board Management
  async getBoards(filters: any = {}): Promise<ApiResponse<CustomerBoard[]>> {
    const queryParams = new URLSearchParams(filters);
    return this.makeRequest<CustomerBoard[]>(`/?${queryParams}`);
  }

  async createBoard(board: Omit<CustomerBoard, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<CustomerBoard>> {
    return this.makeRequest<CustomerBoard>('/', {
      method: 'POST',
      body: JSON.stringify(board),
    });
  }

  async updateBoard(id: string, updates: Partial<CustomerBoard>): Promise<ApiResponse<CustomerBoard>> {
    return this.makeRequest<CustomerBoard>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Board Memberships
  async getBoardMembers(boardId: string): Promise<ApiResponse<BoardMembership[]>> {
    return this.makeRequest<BoardMembership[]>(`/${boardId}/members`);
  }

  async inviteUserToBoard(boardId: string, email: string, role: string): Promise<ApiResponse<BoardMembership>> {
    return this.makeRequest<BoardMembership>(`/${boardId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async removeBoardMember(boardId: string, userId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/${boardId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Enhanced Feedback
  async getBoardFeedback(
    boardId: string,
    filters: any = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<ApiResponse<PaginatedResponse<EnhancedFeedbackItem>>> {
    const queryParams = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      ...filters
    });
    return this.makeRequest<PaginatedResponse<EnhancedFeedbackItem>>(`/${boardId}/feedback?${queryParams}`);
  }

  async createFeedback(boardId: string, feedback: Partial<EnhancedFeedbackItem>): Promise<ApiResponse<EnhancedFeedbackItem>> {
    return this.makeRequest<EnhancedFeedbackItem>(`/${boardId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  async updateFeedback(boardId: string, feedbackId: string, updates: Partial<EnhancedFeedbackItem>): Promise<ApiResponse<EnhancedFeedbackItem>> {
    return this.makeRequest<EnhancedFeedbackItem>(`/${boardId}/feedback/${feedbackId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Voting
  async voteFeedback(feedbackId: string, voteType: 'upvote' | 'downvote'): Promise<ApiResponse<FeedbackVote>> {
    return this.makeRequest<FeedbackVote>(`/feedback/${feedbackId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote_type: voteType }),
    });
  }

  async removeVote(feedbackId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/feedback/${feedbackId}/vote`, {
      method: 'DELETE',
    });
  }

  // Comments
  async getFeedbackComments(feedbackId: string): Promise<ApiResponse<FeedbackComment[]>> {
    return this.makeRequest<FeedbackComment[]>(`/feedback/${feedbackId}/comments`);
  }

  async createComment(feedbackId: string, content: string, parentId?: string): Promise<ApiResponse<FeedbackComment>> {
    return this.makeRequest<FeedbackComment>(`/feedback/${feedbackId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    });
  }

  async updateComment(commentId: string, content: string): Promise<ApiResponse<FeedbackComment>> {
    return this.makeRequest<FeedbackComment>(`/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }
}

export const boardService = new BoardApiService();