
import { BaseApiService, ApiResponse } from './BaseApiService';

export interface UserMetrics {
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  churnRate: number;
  engagementScore: number;
}

export interface FeatureAdoption {
  feature: string;
  adoptionRate: number;
  usageCount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ProductHealthMetrics {
  overallHealth: number;
  performanceScore: number;
  reliabilityScore: number;
  satisfactionScore: number;
  trends: {
    performance: Array<{ date: string; value: number; }>;
    satisfaction: Array<{ date: string; value: number; }>;
  };
}

class AnalyticsApiService extends BaseApiService {
  constructor() {
    // This will be the Data & Analytics Suite microservice URL
    super(process.env.REACT_APP_ANALYTICS_SERVICE_URL || '/api/analytics');
  }

  async getUserMetrics(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<ApiResponse<UserMetrics>> {
    return this.makeRequest<UserMetrics>(`/users?timeRange=${timeRange}`);
  }

  async getFeatureAdoption(): Promise<ApiResponse<FeatureAdoption[]>> {
    return this.makeRequest<FeatureAdoption[]>('/features/adoption');
  }

  async getProductHealth(): Promise<ApiResponse<ProductHealthMetrics>> {
    return this.makeRequest<ProductHealthMetrics>('/product-health');
  }

  async getCustomDashboardData(dashboardId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/dashboards/${dashboardId}`);
  }

  async trackEvent(event: {
    userId: string;
    eventName: string;
    properties: Record<string, any>;
    timestamp?: string;
  }): Promise<ApiResponse<void>> {
    return this.makeRequest('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }
}

export const analyticsService = new AnalyticsApiService();
