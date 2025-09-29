import { supabase } from '@/integrations/supabase/client';

export interface AIAnalysisResult {
  success: boolean;
  data?: any;
  message?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  data: Record<string, any>;
  generatedAt: Date;
}

export interface DataPattern {
  pattern: string;
  frequency: number;
  strength: number;
  predictive: boolean;
  metadata: Record<string, any>;
}

class AIServiceIntegration {
  private readonly baseUrl = 'https://spubjrvuggyrozoawofp.supabase.co/functions/v1';
  private insights: Map<string, AIInsight> = new Map();
  private patterns: Map<string, DataPattern> = new Map();

  async callAIService(endpoint: string, payload: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          action: endpoint,
          payload
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`AI service call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async analyzeDataPatterns(data: any[]): Promise<AIAnalysisResult> {
    try {
      const result = await this.callAIService('pattern-analysis', {
        data,
        analysisType: 'comprehensive'
      });

      const patterns = result.patterns?.map((p: any) => ({
        pattern: p.description,
        frequency: p.frequency,
        strength: p.confidence,
        predictive: p.predictive || false,
        metadata: p.metadata || {}
      })) || [];

      patterns.forEach((pattern: DataPattern) => {
        const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.patterns.set(id, pattern);
      });

      return {
        success: true,
        data: { patterns, summary: result.summary },
        confidence: result.confidence || 0.8
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Pattern analysis failed'
      };
    }
  }

  async generatePredictiveInsights(
    historicalData: any[],
    timeframe: 'week' | 'month' | 'quarter'
  ): Promise<AIAnalysisResult> {
    try {
      const result = await this.callAIService('predictive-analysis', {
        data: historicalData,
        timeframe,
        modelType: 'time-series'
      });

      const insights = result.predictions?.map((pred: any) => ({
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'prediction' as const,
        title: pred.title,
        description: pred.description,
        confidence: pred.confidence,
        impact: pred.impact || 'medium',
        actionable: pred.actionable || false,
        data: pred.data || {},
        generatedAt: new Date()
      })) || [];

      insights.forEach((insight: AIInsight) => {
        this.insights.set(insight.id, insight);
      });

      return {
        success: true,
        data: { insights, predictions: result.predictions },
        confidence: result.confidence || 0.7
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Predictive analysis failed'
      };
    }
  }

  async generateRecommendations(context: {
    data: any[];
    goals: string[];
    constraints: string[];
  }): Promise<AIAnalysisResult> {
    try {
      const result = await this.callAIService('recommendation-engine', {
        ...context,
        analysisType: 'actionable'
      });

      const recommendations = result.recommendations?.map((rec: any) => ({
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'recommendation' as const,
        title: rec.title,
        description: rec.description,
        confidence: rec.confidence,
        impact: rec.impact || 'medium',
        actionable: true,
        data: {
          priority: rec.priority,
          effort: rec.effort,
          timeline: rec.timeline,
          expectedOutcome: rec.expectedOutcome
        },
        generatedAt: new Date()
      })) || [];

      recommendations.forEach((rec: AIInsight) => {
        this.insights.set(rec.id, rec);
      });

      return {
        success: true,
        data: { recommendations },
        confidence: result.confidence || 0.75
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Recommendation generation failed'
      };
    }
  }

  async detectAnomalies(data: any[], baseline?: any[]): Promise<AIAnalysisResult> {
    try {
      const result = await this.callAIService('anomaly-detection', {
        data,
        baseline,
        sensitivity: 'medium'
      });

      const anomalies = result.anomalies?.map((anomaly: any) => ({
        id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'anomaly' as const,
        title: `Anomaly detected: ${anomaly.metric}`,
        description: anomaly.description,
        confidence: anomaly.confidence,
        impact: anomaly.severity || 'medium',
        actionable: anomaly.actionable || false,
        data: {
          metric: anomaly.metric,
          expectedValue: anomaly.expected,
          actualValue: anomaly.actual,
          deviation: anomaly.deviation
        },
        generatedAt: new Date()
      })) || [];

      anomalies.forEach((anomaly: AIInsight) => {
        this.insights.set(anomaly.id, anomaly);
      });

      return {
        success: true,
        data: { anomalies },
        confidence: result.confidence || 0.8
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Anomaly detection failed'
      };
    }
  }

  async getInsights(filters?: {
    type?: AIInsight['type'];
    impact?: AIInsight['impact'];
    actionable?: boolean;
    since?: Date;
  }): Promise<AIInsight[]> {
    let insights = Array.from(this.insights.values());

    if (filters) {
      if (filters.type) {
        insights = insights.filter(i => i.type === filters.type);
      }
      if (filters.impact) {
        insights = insights.filter(i => i.impact === filters.impact);
      }
      if (filters.actionable !== undefined) {
        insights = insights.filter(i => i.actionable === filters.actionable);
      }
      if (filters.since) {
        insights = insights.filter(i => i.generatedAt >= filters.since!);
      }
    }

    return insights.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  async analyzeStrategicAlignment(params: {
    initiative: any;
    context: string;
  }): Promise<AIAnalysisResult> {
    try {
      const analysis = await this.callAIService('strategic-analysis', {
        type: 'alignment',
        data: params
      });
      return { success: true, data: analysis };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Analysis failed' };
    }
  }

  async analyzeOKRAlignment(params: {
    initiativeId: string;
    objectiveId: string;
  }): Promise<AIAnalysisResult> {
    try {
      const analysis = await this.callAIService('okr-alignment', params);
      return { success: true, data: analysis };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Analysis failed' };
    }
  }

  async generateStrategicRecommendations(params: {
    initiatives: any[];
    okrs: any[];
    metrics: any;
  }): Promise<AIAnalysisResult> {
    try {
      const recommendations = await this.callAIService('strategic-recommendations', params);
      return { success: true, data: recommendations };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Generation failed' };
    }
  }

  async generateStrategicInsights(params: {
    roadmap: any;
    historicalData: any[];
  }): Promise<AIAnalysisResult> {
    try {
      const insights = await this.callAIService('strategic-insights', params);
      return { success: true, data: insights };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Generation failed' };
    }
  }
}

export const aiServiceIntegration = new AIServiceIntegration();