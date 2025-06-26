
import { BaseApiService, ApiResponse, PaginatedResponse, PaginationParams } from './BaseApiService';

export interface SprintItem {
  id: string;
  name: string;
  goal: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  teamId: string;
  capacity: number;
  committed: number;
  completed: number;
  tasks: SprintTask[];
  velocity: number;
  burndownData: Array<{ date: string; remaining: number; ideal: number; }>;
}

export interface SprintTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  storyPoints: number;
  linkedFeedback?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SprintFilters {
  status?: string[];
  teamId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

class SprintApiService extends BaseApiService {
  constructor() {
    // This will be the Sprint Management microservice URL
    super('/api/sprints');
  }

  async getSprints(
    filters: SprintFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<ApiResponse<PaginatedResponse<SprintItem>>> {
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

    return this.makeRequest<PaginatedResponse<SprintItem>>(`/?${queryParams}`);
  }

  async createSprint(sprint: Omit<SprintItem, 'id' | 'tasks' | 'velocity' | 'burndownData'>): Promise<ApiResponse<SprintItem>> {
    return this.makeRequest<SprintItem>('/', {
      method: 'POST',
      body: JSON.stringify(sprint),
    });
  }

  async updateSprintStatus(id: string, status: SprintItem['status']): Promise<ApiResponse<SprintItem>> {
    return this.makeRequest<SprintItem>(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateTaskStatus(sprintId: string, taskId: string, status: SprintTask['status']): Promise<ApiResponse<SprintTask>> {
    return this.makeRequest<SprintTask>(`/${sprintId}/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getSprintMetrics(sprintId: string): Promise<ApiResponse<{
    velocityTrend: Array<{ sprint: string; velocity: number; }>;
    burndownChart: Array<{ date: string; remaining: number; ideal: number; }>;
    completionRate: number;
    blockedTasks: number;
  }>> {
    return this.makeRequest(`/${sprintId}/metrics`);
  }
}

export const sprintService = new SprintApiService();
