
import { BaseApiService, ApiResponse } from './BaseApiService';
import { AnalyticsEvent } from '@/services/analytics/EventTracker';

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

export interface EventBatch {
  events: AnalyticsEvent[];
  timestamp: string;
  batchId: string;
}

class AnalyticsApiService extends BaseApiService {
  constructor() {
    super('/api/analytics');
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

  // New event tracking methods
  async sendEvents(events: AnalyticsEvent[]): Promise<ApiResponse<void>> {
    const batch: EventBatch = {
      events,
      timestamp: new Date().toISOString(),
      batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    return this.makeRequest<void>('/events', {
      method: 'POST',
      body: JSON.stringify(batch),
    });
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

  // Analytics Query Methods
  async getEventAnalytics(params: {
    eventType?: string;
    timeRange: '1h' | '24h' | '7d' | '30d' | '90d';
    groupBy?: 'hour' | 'day' | 'week';
    filters?: Record<string, any>;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    });

    return this.makeRequest(`/events/analytics?${queryParams.toString()}`);
  }

  async getFunnelAnalytics(funnelSteps: string[], timeRange: string): Promise<ApiResponse<{
    totalUsers: number;
    stepConversions: Array<{
      step: string;
      users: number;
      conversionRate: number;
      dropoffRate: number;
    }>;
  }>> {
    return this.makeRequest('/funnel', {
      method: 'POST',
      body: JSON.stringify({ funnelSteps, timeRange }),
    });
  }

  async getCohortAnalysis(params: {
    cohortType: 'daily' | 'weekly' | 'monthly';
    timeRange: string;
    retentionPeriods: number[];
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/cohorts', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const analyticsService = new AnalyticsApiService();
