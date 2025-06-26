
import { BaseApiService, ApiResponse } from './BaseApiService';

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'epic' | 'initiative' | 'milestone';
  status: 'idea' | 'planned' | 'in-progress' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: number; // story points or weeks
  businessValue: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  dependencies: string[];
  linkedFeedback: string[];
  assignedTeam?: string;
  tags: string[];
  aiSuggestions?: {
    priorityScore: number;
    riskAssessment: string;
    suggestedActions: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapView {
  id: string;
  name: string;
  type: 'strategic' | 'delivery' | 'timeline' | 'kanban';
  filters: {
    status?: string[];
    priority?: string[];
    team?: string[];
    dateRange?: { start: string; end: string; };
  };
  groupBy: 'status' | 'priority' | 'team' | 'quarter';
  isDefault: boolean;
}

class RoadmapApiService extends BaseApiService {
  constructor() {
    // This will be the Roadmap Management microservice URL
    super('/api/roadmap');
  }

  async getRoadmapItems(viewId?: string): Promise<ApiResponse<RoadmapItem[]>> {
    const queryParams = viewId ? `?viewId=${viewId}` : '';
    return this.makeRequest<RoadmapItem[]>(`/items${queryParams}`);
  }

  async createRoadmapItem(item: Omit<RoadmapItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<RoadmapItem>> {
    return this.makeRequest<RoadmapItem>('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateRoadmapItem(id: string, updates: Partial<RoadmapItem>): Promise<ApiResponse<RoadmapItem>> {
    return this.makeRequest<RoadmapItem>(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getRoadmapViews(): Promise<ApiResponse<RoadmapView[]>> {
    return this.makeRequest<RoadmapView[]>('/views');
  }

  async createRoadmapView(view: Omit<RoadmapView, 'id'>): Promise<ApiResponse<RoadmapView>> {
    return this.makeRequest<RoadmapView>('/views', {
      method: 'POST',
      body: JSON.stringify(view),
    });
  }

  async optimizeRoadmap(constraints: {
    teamCapacity: Record<string, number>;
    timeframe: { start: string; end: string; };
    priorityWeights: Record<string, number>;
  }): Promise<ApiResponse<{
    optimizedSequence: RoadmapItem[];
    reasoning: string;
    impactScore: number;
    risks: string[];
  }>> {
    return this.makeRequest('/optimize', {
      method: 'POST',
      body: JSON.stringify(constraints),
    });
  }
}

export const roadmapService = new RoadmapApiService();
