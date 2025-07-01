
import { BaseApiService, ApiResponse } from '../api/BaseApiService';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'feedback' | 'development' | 'planning' | 'deployment';
  targetSegment: 'enterprise' | 'plg' | 'both';
  steps: Array<{
    id: string;
    name: string;
    type: 'approval' | 'notification' | 'automation' | 'assignment';
    configuration: Record<string, any>;
    conditions?: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }>;
  }>;
  triggers: Array<{
    event: string;
    conditions?: Record<string, any>;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  id: string;
  organizationId: string;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customCSS?: string;
  };
  features: {
    aiCopilot: boolean;
    advancedAnalytics: boolean;
    customWorkflows: boolean;
    multiProduct: boolean;
    enterpriseSecurity: boolean;
    whiteLabeling: boolean;
  };
  limits: {
    maxUsers: number;
    maxProducts: number;
    maxFeedbackItems: number;
    storageGB: number;
  };
  integrations: Record<string, {
    enabled: boolean;
    configuration: Record<string, any>;
    lastSync?: string;
  }>;
  customFields: Record<string, Array<{
    name: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'date';
    required: boolean;
    options?: string[];
    validation?: Record<string, any>;
  }>>;
  notifications: {
    email: {
      enabled: boolean;
      frequency: 'immediate' | 'daily' | 'weekly';
      events: string[];
    };
    slack: {
      enabled: boolean;
      webhookUrl?: string;
      channels: Record<string, string>;
    };
    webhook: {
      enabled: boolean;
      url?: string;
      events: string[];
      authentication?: {
        type: 'bearer' | 'api-key';
        value: string;
      };
    };
  };
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Array<{
    resource: string;
    actions: ('create' | 'read' | 'update' | 'delete' | 'approve')[];
    conditions?: Record<string, any>;
  }>;
  isCustom: boolean;
  organizationId: string;
}

class ConfigurationService extends BaseApiService {
  constructor() {
    super('/api/enterprise/configuration');
  }

  // Organization Settings
  async getOrganizationSettings(): Promise<ApiResponse<OrganizationSettings>> {
    return this.makeRequest<OrganizationSettings>('/settings');
  }

  async updateOrganizationSettings(updates: Partial<OrganizationSettings>): Promise<ApiResponse<OrganizationSettings>> {
    return this.makeRequest<OrganizationSettings>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async updateBranding(branding: OrganizationSettings['branding']): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/settings/branding', {
      method: 'POST',
      body: JSON.stringify(branding),
    });
  }

  async toggleFeature(feature: keyof OrganizationSettings['features'], enabled: boolean): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/settings/features', {
      method: 'PATCH',
      body: JSON.stringify({ [feature]: enabled }),
    });
  }

  // Workflow Templates
  async getWorkflowTemplates(category?: WorkflowTemplate['category']): Promise<ApiResponse<WorkflowTemplate[]>> {
    const queryParams = category ? `?category=${category}` : '';
    return this.makeRequest<WorkflowTemplate[]>(`/workflows${queryParams}`);
  }

  async createWorkflowTemplate(template: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<WorkflowTemplate>> {
    return this.makeRequest<WorkflowTemplate>('/workflows', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateWorkflowTemplate(id: string, updates: Partial<WorkflowTemplate>): Promise<ApiResponse<WorkflowTemplate>> {
    return this.makeRequest<WorkflowTemplate>(`/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async activateWorkflow(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/workflows/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateWorkflow(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/workflows/${id}/deactivate`, {
      method: 'POST',
    });
  }

  // User Roles & Permissions
  async getUserRoles(): Promise<ApiResponse<UserRole[]>> {
    return this.makeRequest<UserRole[]>('/roles');
  }

  async createUserRole(role: Omit<UserRole, 'id'>): Promise<ApiResponse<UserRole>> {
    return this.makeRequest<UserRole>('/roles', {
      method: 'POST',
      body: JSON.stringify(role),
    });
  }

  async updateUserRole(id: string, updates: Partial<UserRole>): Promise<ApiResponse<UserRole>> {
    return this.makeRequest<UserRole>(`/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteUserRole(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/roles/assign', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    });
  }

  // Custom Fields
  async getCustomFields(entity: keyof OrganizationSettings['customFields']): Promise<ApiResponse<OrganizationSettings['customFields'][string]>> {
    return this.makeRequest(`/custom-fields/${entity}`);
  }

  async updateCustomFields(entity: keyof OrganizationSettings['customFields'], fields: OrganizationSettings['customFields'][string]): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/custom-fields/${entity}`, {
      method: 'POST',
      body: JSON.stringify(fields),
    });
  }

  // Integration Management
  async getIntegrations(): Promise<ApiResponse<OrganizationSettings['integrations']>> {
    return this.makeRequest('/integrations');
  }

  async configureIntegration(name: string, configuration: { enabled: boolean; configuration: Record<string, any> }): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/integrations/${name}`, {
      method: 'POST',
      body: JSON.stringify(configuration),
    });
  }

  async testIntegration(name: string): Promise<ApiResponse<{ status: 'success' | 'error'; message: string; details?: any }>> {
    return this.makeRequest(`/integrations/${name}/test`, {
      method: 'POST',
    });
  }

  async syncIntegration(name: string): Promise<ApiResponse<{ status: string; recordsProcessed: number; errors?: string[] }>> {
    return this.makeRequest(`/integrations/${name}/sync`, {
      method: 'POST',
    });
  }

  // Notification Configuration
  async updateNotificationSettings(settings: OrganizationSettings['notifications']): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/notifications', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async testNotification(type: 'email' | 'slack' | 'webhook', payload: Record<string, any>): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.makeRequest(`/notifications/test/${type}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const configurationService = new ConfigurationService();
