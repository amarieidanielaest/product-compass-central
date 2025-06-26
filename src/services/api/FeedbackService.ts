
import { BaseApiService, ApiResponse, PaginatedResponse, PaginationParams } from './BaseApiService';

export interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  source: 'internal' | 'customer-portal' | 'support-ticket' | 'in-app';
  status: 'new' | 'in-review' | 'planned' | 'in-progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  customerInfo: {
    id: string;
    name: string;
    tier: 'starter' | 'professional' | 'enterprise';
    value: number;
  };
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    themes: string[];
    priorityScore: number;
    suggestedActions: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackFilters {
  status?: string[];
  priority?: string[];
  source?: string[];
  customerTier?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

class FeedbackApiService extends BaseApiService {
  constructor() {
    // This will be the Feedback & Insights Engine microservice URL
    super('/api/feedback');
  }

  async getFeedback(
    filters: FeedbackFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<ApiResponse<PaginatedResponse<FeedbackItem>>> {
    const queryParams = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
          acc[key] = value.join(',');
        } else if (typeof value === 'object' && value !== null) {
          acc[key] = JSON.stringify(value);
        } else if (value !== undefined) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    });

    return this.makeRequest<PaginatedResponse<FeedbackItem>>(`/?${queryParams}`);
  }

  async createFeedback(feedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<FeedbackItem>> {
    return this.makeRequest<FeedbackItem>('/', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  async updateFeedbackStatus(id: string, status: FeedbackItem['status']): Promise<ApiResponse<FeedbackItem>> {
    return this.makeRequest<FeedbackItem>(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async processFeedbackWithAI(id: string): Promise<ApiResponse<FeedbackItem>> {
    return this.makeRequest<FeedbackItem>(`/${id}/ai-process`, {
      method: 'POST',
    });
  }

  async getFeedbackInsights(): Promise<ApiResponse<{
    totalFeedback: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    sentimentTrends: Array<{ date: string; positive: number; neutral: number; negative: number; }>;
    topThemes: Array<{ theme: string; count: number; }>;
  }>> {
    return this.makeRequest('/insights');
  }
}

export const feedbackService = new FeedbackApiService();
