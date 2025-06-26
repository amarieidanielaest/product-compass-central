
import { BaseApiService, ApiResponse } from './BaseApiService';

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  enabled: boolean;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json';
  defaultValue: any;
  conditions?: {
    userSegment?: string[];
    percentage?: number;
    environment?: string[];
  };
  variants?: {
    [key: string]: {
      value: any;
      weight: number;
    };
  };
  experiment?: {
    id: string;
    name: string;
    hypothesis: string;
    metrics: string[];
    startDate: string;
    endDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserContext {
  userId: string;
  email?: string;
  tier: 'starter' | 'professional' | 'enterprise';
  signupDate: string;
  lastActiveDate: string;
  features?: string[];
  customProperties?: Record<string, any>;
}

export interface ExperimentResult {
  flagKey: string;
  variant: string;
  value: any;
  userId: string;
  timestamp: string;
}

class FeatureFlagsApiService extends BaseApiService {
  constructor() {
    super('/api/feature-flags');
  }

  async getFlags(userContext?: UserContext): Promise<ApiResponse<Record<string, any>>> {
    const body = userContext ? JSON.stringify({ userContext }) : undefined;
    return this.makeRequest<Record<string, any>>('/evaluate', {
      method: body ? 'POST' : 'GET',
      body,
    });
  }

  async getAllFlags(): Promise<ApiResponse<FeatureFlag[]>> {
    return this.makeRequest<FeatureFlag[]>('/');
  }

  async createFlag(flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<FeatureFlag>> {
    return this.makeRequest<FeatureFlag>('/', {
      method: 'POST',
      body: JSON.stringify(flag),
    });
  }

  async updateFlag(id: string, updates: Partial<FeatureFlag>): Promise<ApiResponse<FeatureFlag>> {
    return this.makeRequest<FeatureFlag>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async trackExperiment(result: ExperimentResult): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/experiments/track', {
      method: 'POST',
      body: JSON.stringify(result),
    });
  }

  async getExperimentResults(flagKey: string): Promise<ApiResponse<{
    variants: Record<string, {
      users: number;
      conversions: number;
      conversionRate: number;
      significance: number;
    }>;
    duration: number;
    sampleSize: number;
  }>> {
    return this.makeRequest(`/experiments/${flagKey}/results`);
  }
}

export const featureFlagsService = new FeatureFlagsApiService();
