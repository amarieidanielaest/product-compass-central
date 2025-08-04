import { BaseApiService, ApiResponse, PaginatedResponse, PaginationParams } from './BaseApiService';
import { supabase } from '@/integrations/supabase/client';

export interface Team {
  id: string;
  name: string;
  description?: string;
  methodology: 'agile' | 'waterfall' | 'hybrid';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  team_id: string;
  start_date?: string;
  end_date?: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  methodology_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  project_id: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  capacity: number;
  committed: number;
  completed: number;
  methodology_type: 'scrum' | 'kanban' | 'waterfall';
  workflow_config: Record<string, any>;
  created_at: string;
  updated_at: string;
  project?: Project;
  work_items?: WorkItem[];
  workflow_columns?: WorkflowColumn[];
}

export interface WorkItem {
  id: string;
  title: string;
  description?: string;
  item_type: 'task' | 'story' | 'epic' | 'bug' | 'feature' | 'milestone';
  status: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  sprint_id?: string;
  roadmap_item_id?: string;
  parent_id?: string;
  assignee_id?: string;
  reporter_id?: string;
  effort_estimate: number;
  effort_unit: 'points' | 'hours' | 'days';
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  acceptance_criteria?: string;
  custom_fields: Record<string, any>;
  tags: string[];
  linked_feedback_ids: string[];
  created_at: string;
  updated_at: string;
  assignee?: any; // Profile
  reporter?: any; // Profile
  parent?: WorkItem;
  subtasks?: WorkItem[];
  dependencies?: WorkItemDependency[];
}

export interface WorkItemDependency {
  id: string;
  from_item_id: string;
  to_item_id: string;
  dependency_type: 'blocks' | 'depends_on' | 'relates_to';
  created_at: string;
  from_item?: WorkItem;
  to_item?: WorkItem;
}

export interface WorkflowColumn {
  id: string;
  sprint_id: string;
  name: string;
  position: number;
  wip_limit?: number;
  column_type: 'start' | 'standard' | 'end';
  color: string;
  created_at: string;
}

export interface MethodologyTemplate {
  id: string;
  name: string;
  methodology_type: 'scrum' | 'kanban' | 'waterfall' | 'hybrid';
  description?: string;
  default_columns: any[];
  default_statuses: string[];
  default_config: Record<string, any>;
  is_system_template: boolean;
  created_at: string;
}

export interface SprintFilters {
  project_id?: string;
  status?: string[];
  methodology_type?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface WorkItemFilters {
  sprint_id?: string;
  status?: string[];
  assignee_id?: string;
  priority?: string[];
  item_type?: string[];
}

class SprintApiService {
  private async callEdgeFunction(method: string, path: string, data?: any): Promise<ApiResponse<any>> {
    try {
      const { data: result, error } = await supabase.functions.invoke('sprint-api', {
        body: { method, path, data }
      });

      if (error) throw error;
      return { data: result, errors: null, success: true };
    } catch (error) {
      return { data: null, errors: [(error as Error).message], success: false };
    }
  }

  // Team management
  async getTeams(): Promise<ApiResponse<Team[]>> {
    return this.callEdgeFunction('GET', 'teams');
  }

  async createTeam(team: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Team>> {
    return this.callEdgeFunction('POST', 'teams', team);
  }

  // Project management
  async getProjects(teamId: string): Promise<ApiResponse<Project[]>> {
    return this.callEdgeFunction('GET', `teams/${teamId}/projects`);
  }

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Project>> {
    return this.callEdgeFunction('POST', 'projects', project);
  }

  // Sprint management
  async getSprints(projectId: string): Promise<ApiResponse<Sprint[]>> {
    return this.callEdgeFunction('GET', `projects/${projectId}/sprints`);
  }

  async getSprint(id: string): Promise<ApiResponse<Sprint>> {
    return this.callEdgeFunction('GET', `sprints/${id}`);
  }

  async createSprint(sprint: Omit<Sprint, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Sprint>> {
    return this.callEdgeFunction('POST', 'sprints', sprint);
  }

  async updateSprint(id: string, updates: Partial<Sprint>): Promise<ApiResponse<Sprint>> {
    return this.callEdgeFunction('PUT', `sprints/${id}`, updates);
  }

  async deleteSprint(id: string): Promise<ApiResponse<void>> {
    return this.callEdgeFunction('DELETE', `sprints/${id}`);
  }

  // Work item management
  async getWorkItems(sprintId: string): Promise<ApiResponse<WorkItem[]>> {
    return this.callEdgeFunction('GET', `sprints/${sprintId}/work-items`);
  }

  async createWorkItem(workItem: Omit<WorkItem, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<WorkItem>> {
    return this.callEdgeFunction('POST', 'work-items', workItem);
  }

  async updateWorkItem(id: string, updates: Partial<WorkItem>): Promise<ApiResponse<WorkItem>> {
    return this.callEdgeFunction('PUT', `work-items/${id}`, updates);
  }

  async deleteWorkItem(id: string): Promise<ApiResponse<void>> {
    return this.callEdgeFunction('DELETE', `work-items/${id}`);
  }

  // Workflow column management
  async getWorkflowColumns(sprintId: string): Promise<ApiResponse<WorkflowColumn[]>> {
    return this.callEdgeFunction('GET', `sprints/${sprintId}/columns`);
  }

  async updateWorkflowColumns(sprintId: string, columns: Partial<WorkflowColumn>[]): Promise<ApiResponse<WorkflowColumn[]>> {
    return this.callEdgeFunction('PUT', `sprints/${sprintId}/columns`, columns);
  }

  // Methodology templates
  async getMethodologyTemplates(): Promise<ApiResponse<MethodologyTemplate[]>> {
    return this.callEdgeFunction('GET', 'methodology-templates');
  }

  async createSprintFromTemplate(templateId: string, sprintData: Partial<Sprint>): Promise<ApiResponse<Sprint>> {
    return this.callEdgeFunction('POST', 'create-from-template', { template_id: templateId, sprint_data: sprintData });
  }

  // Analytics and metrics
  async getSprintMetrics(sprintId: string): Promise<ApiResponse<{
    burndown_data: Array<{ date: string; remaining: number; ideal: number; }>;
    velocity_trend: Array<{ sprint: string; velocity: number; }>;
    completion_rate: number;
    cycle_time_avg: number;
    blocked_items: number;
    wip_violations: number;
  }>> {
    return this.callEdgeFunction('GET', `sprints/${sprintId}/metrics`);
  }

  async getTeamVelocity(teamId: string, sprints: number = 6): Promise<ApiResponse<{
    average_velocity: number;
    velocity_trend: Array<{ sprint: string; velocity: number; }>;
    predictability_score: number;
  }>> {
    return this.callEdgeFunction('GET', `teams/${teamId}/velocity?sprints=${sprints}`);
  }

  // Dependencies
  async createDependency(dependency: Omit<WorkItemDependency, 'id' | 'created_at'>): Promise<ApiResponse<WorkItemDependency>> {
    return this.callEdgeFunction('POST', 'dependencies', dependency);
  }

  async deleteDependency(id: string): Promise<ApiResponse<void>> {
    return this.callEdgeFunction('DELETE', `dependencies/${id}`);
  }

  // Bulk operations
  async bulkUpdateWorkItems(updates: Array<{ id: string; updates: Partial<WorkItem> }>): Promise<ApiResponse<WorkItem[]>> {
    return this.callEdgeFunction('PATCH', 'work-items/bulk-update', { updates });
  }

  async moveWorkItemsToSprint(workItemIds: string[], targetSprintId: string): Promise<ApiResponse<WorkItem[]>> {
    return this.callEdgeFunction('PATCH', 'work-items/move-to-sprint', { work_item_ids: workItemIds, target_sprint_id: targetSprintId });
  }
}

export const sprintService = new SprintApiService();