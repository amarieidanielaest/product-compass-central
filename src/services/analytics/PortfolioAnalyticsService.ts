
import { BaseApiService, ApiResponse } from '../api/BaseApiService';
import { aiService } from '../api/AIService';

export interface PortfolioInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  affectedProducts: string[];
  actionItems: string[];
  aiGenerated: boolean;
  createdAt: string;
}

export interface CrossProductMetrics {
  userOverlap: {
    productPairs: Array<{
      productA: string;
      productB: string;
      overlapUsers: number;
      overlapPercentage: number;
    }>;
    totalCrossProductUsers: number;
  };
  revenueAttribution: {
    directRevenue: Record<string, number>;
    influencedRevenue: Record<string, number>;
    crossSellRevenue: number;
  };
  featureAdoption: {
    crossProductFeatures: Array<{
      feature: string;
      adoptionRate: number;
      products: string[];
      userSatisfaction: number;
    }>;
  };
}

export interface PortfolioHealthScore {
  overall: number;
  breakdown: {
    technical: number;
    business: number;
    strategic: number;
    operational: number;
  };
  trends: {
    thirtyDayChange: number;
    quarterlyChange: number;
    yearlyChange: number;
  };
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }>;
}

export interface PredictiveAnalytics {
  churnPrediction: {
    predictedChurnRate: number;
    highRiskUsers: number;
    preventionActions: string[];
  };
  growthForecast: {
    predictedGrowth: number;
    confidence: number;
    timeframe: string;
    drivers: string[];
  };
  marketTrends: {
    emergingOpportunities: string[];
    competitiveThreat: string[];
    recommendedActions: string[];
  };
}

class PortfolioAnalyticsService extends BaseApiService {
  constructor() {
    super('/api/analytics/portfolio');
  }

  async getPortfolioInsights(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<ApiResponse<PortfolioInsight[]>> {
    const response = await this.makeRequest<PortfolioInsight[]>(`/insights?timeRange=${timeRange}`);
    
    // Enhance with AI-generated insights
    if (response.data) {
      const aiInsights = await this.generateAIInsights(response.data);
      response.data = [...response.data, ...aiInsights];
    }
    
    return response;
  }

  async getCrossProductMetrics(): Promise<ApiResponse<CrossProductMetrics>> {
    return this.makeRequest<CrossProductMetrics>('/cross-product-metrics');
  }

  async getPortfolioHealthScore(): Promise<ApiResponse<PortfolioHealthScore>> {
    return this.makeRequest<PortfolioHealthScore>('/health-score');
  }

  async getPredictiveAnalytics(): Promise<ApiResponse<PredictiveAnalytics>> {
    return this.makeRequest<PredictiveAnalytics>('/predictive');
  }

  async getCustomAnalytics(query: {
    metrics: string[];
    dimensions: string[];
    filters: Record<string, any>;
    timeRange: string;
    granularity: 'hour' | 'day' | 'week' | 'month';
  }): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/custom-query', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  async generatePortfolioReport(config: {
    reportType: 'executive' | 'operational' | 'strategic';
    timeRange: string;
    includeProducts: string[];
    sections: string[];
  }): Promise<ApiResponse<{
    reportId: string;
    downloadUrl: string;
    summary: string;
  }>> {
    return this.makeRequest('/reports', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  private async generateAIInsights(existingInsights: PortfolioInsight[]): Promise<PortfolioInsight[]> {
    try {
      const prompt = `Analyze portfolio data and generate strategic insights. Focus on cross-product opportunities, risk mitigation, and growth strategies.`;
      
      const aiResponse = await aiService.generateContent({
        prompt,
        context: { existingInsights },
        type: 'analysis'
      });

      if (aiResponse.data) {
        return [{
          id: `ai-insight-${Date.now()}`,
          type: 'recommendation',
          title: 'AI-Generated Strategic Recommendation',
          description: aiResponse.data.content,
          impact: 'high',
          confidence: 0.85,
          affectedProducts: [],
          actionItems: [],
          aiGenerated: true,
          createdAt: new Date().toISOString()
        }];
      }
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
    }
    
    return [];
  }
}

export const portfolioAnalyticsService = new PortfolioAnalyticsService();
