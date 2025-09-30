import { supabase } from '@/integrations/supabase/client';

export interface FeaturePrediction {
  featureId: string;
  successProbability: number;
  expectedImpact: {
    userEngagement: string;
    revenue: string;
    retention: string;
  };
  risks: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendedLaunchDate: string;
  confidence: number;
}

export interface ChurnPrediction {
  timeframe: string;
  predictions: Array<{
    segment: string;
    churnRate: number;
    atRiskUsers: number;
    factors: string[];
  }>;
  recommendations: string[];
}

export interface RevenueForecast {
  horizon: string;
  forecast: Array<{
    date: string;
    value: number;
    confidence: [number, number];
  }>;
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
}

export interface CapacityPlan {
  projectId: string;
  currentUtilization: number;
  projectedUtilization: Array<{
    date: string;
    utilization: number;
  }>;
  recommendations: string[];
  risks: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

class PredictiveAnalyticsService {
  async predictFeatureSuccess(featureId: string): Promise<FeaturePrediction> {
    const { data, error } = await supabase.functions.invoke('predictive-analytics/predict-feature', {
      body: { featureId }
    });

    if (error) throw error;
    return data;
  }

  async predictChurn(timeframe: string = '30d'): Promise<ChurnPrediction> {
    const { data, error } = await supabase.functions.invoke('predictive-analytics/predict-churn', {
      body: { timeframe }
    });

    if (error) throw error;
    return data;
  }

  async forecastRevenue(horizon: string = '90d'): Promise<RevenueForecast> {
    const { data, error } = await supabase.functions.invoke('predictive-analytics/forecast-revenue', {
      body: { horizon }
    });

    if (error) throw error;
    return data;
  }

  async planCapacity(projectId: string): Promise<CapacityPlan> {
    const { data, error } = await supabase.functions.invoke('predictive-analytics/plan-capacity', {
      body: { projectId }
    });

    if (error) throw error;
    return data;
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService();
