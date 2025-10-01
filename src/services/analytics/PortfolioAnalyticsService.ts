import { supabase } from '@/integrations/supabase/client';
import { aiService } from '../api/AIService';

interface ApiResponse<T> {
  data?: T;
  error?: Error;
}

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

class PortfolioAnalyticsService {
  async getPortfolioInsights(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<ApiResponse<PortfolioInsight[]>> {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-analytics/insights', {
        method: 'GET'
      });

      if (error) throw error;

      // Enhance with AI-generated insights
      if (data) {
        const aiInsights = await this.generateAIInsights(data);
        return { data: [...data, ...aiInsights] };
      }

      return { data: [] };
    } catch (error) {
      console.error('Failed to get portfolio insights:', error);
      return { error: error as Error };
    }
  }

  async getCrossProductMetrics(): Promise<ApiResponse<CrossProductMetrics>> {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-analytics/cross-product-metrics');
      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async getPortfolioHealthScore(): Promise<ApiResponse<PortfolioHealthScore>> {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-analytics/health-score');
      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async getPredictiveAnalytics(): Promise<ApiResponse<PredictiveAnalytics>> {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-analytics/predictive');
      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async getCustomAnalytics(query: {
    metrics: string[];
    dimensions: string[];
    filters: Record<string, any>;
    timeRange: string;
    granularity: 'hour' | 'day' | 'week' | 'month';
  }): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-analytics/custom-query', {
        body: query
      });
      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error as Error };
    }
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
    try {
      const { data, error } = await supabase.functions.invoke('portfolio-analytics/reports', {
        body: config
      });
      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error as Error };
    }
  }

  private async generateAIInsights(existingInsights: PortfolioInsight[]): Promise<PortfolioInsight[]> {
    try {
      const prompt = `Analyze portfolio data and generate strategic insights. Focus on cross-product opportunities, risk mitigation, and growth strategies.`;
      
      const aiResponse = await aiService.generateContent({
        prompt,
        context: { existingInsights },
        type: 'insights'
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
