
import { BaseApiService, ApiResponse } from './BaseApiService';

export interface OKR {
  id: string;
  title: string;
  description: string;
  type: 'objective' | 'key-result';
  parentId?: string; // for key results
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  progress: number; // 0-100
  target: number;
  current: number;
  unit: string;
  owner: string;
  quarter: string;
  year: number;
  linkedInitiatives: string[];
  aiInsights?: {
    progressPrediction: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface StrategicInitiative {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  businessValue: 'low' | 'medium' | 'high' | 'critical';
  effort: number;
  startDate: string;
  endDate: string;
  linkedOKRs: string[];
  linkedRoadmapItems: string[];
  owner: string;
  stakeholders: string[];
  metrics: Array<{
    name: string;
    target: number;
    current: number;
    unit: string;
  }>;
  risks: Array<{
    description: string;
    impact: 'low' | 'medium' | 'high';
    probability: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

class StrategyApiService extends BaseApiService {
  constructor() {
    // This will be the Strategy & OKR Management microservice URL
    super('/api/strategy');
  }

  async getOKRs(quarter?: string, year?: number): Promise<ApiResponse<OKR[]>> {
    const queryParams = new URLSearchParams();
    if (quarter) queryParams.append('quarter', quarter);
    if (year) queryParams.append('year', year.toString());
    
    return this.makeRequest<OKR[]>(`/okrs?${queryParams}`);
  }

  async createOKR(okr: Omit<OKR, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<OKR>> {
    return this.makeRequest<OKR>('/okrs', {
      method: 'POST',
      body: JSON.stringify(okr),
    });
  }

  async updateOKRProgress(id: string, progress: { current: number; notes?: string }): Promise<ApiResponse<OKR>> {
    return this.makeRequest<OKR>(`/okrs/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(progress),
    });
  }

  async getStrategicInitiatives(): Promise<ApiResponse<StrategicInitiative[]>> {
    return this.makeRequest<StrategicInitiative[]>('/initiatives');
  }

  async createStrategicInitiative(initiative: Omit<StrategicInitiative, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<StrategicInitiative>> {
    return this.makeRequest<StrategicInitiative>('/initiatives', {
      method: 'POST',
      body: JSON.stringify(initiative),
    });
  }

  async getStrategicDashboard(): Promise<ApiResponse<{
    okrProgress: Array<{ quarter: string; completed: number; total: number; }>;
    initiativeStatus: Record<string, number>;
    alignmentScore: number;
    keyMetrics: Array<{ name: string; value: number; trend: 'up' | 'down' | 'stable'; }>;
  }>> {
    return this.makeRequest('/dashboard');
  }

  async generateStrategicInsights(): Promise<ApiResponse<{
    recommendations: Array<{
      type: 'okr' | 'initiative' | 'alignment';
      priority: 'low' | 'medium' | 'high';
      description: string;
      action: string;
    }>;
    riskAlerts: Array<{
      entity: string;
      risk: string;
      severity: 'low' | 'medium' | 'high';
      recommendation: string;
    }>;
  }>> {
    return this.makeRequest('/insights');
  }
}

export const strategyService = new StrategyApiService();
