
import { supabase } from '@/integrations/supabase/client';
import { eventTracker } from '@/services/analytics/EventTracker';

export interface AICopilotInsight {
  id: string;
  type: 'performance' | 'experiment' | 'user_behavior' | 'conversion' | 'feature_adoption';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  suggestedActions: Array<{
    action: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  }>;
  data: Record<string, any>;
  timestamp: string;
}

export interface AICopilotRecommendation {
  id: string;
  category: 'experiment' | 'feature' | 'user_journey' | 'conversion';
  title: string;
  description: string;
  expectedImpact: string;
  confidence: number;
  experimentSuggestion?: {
    hypothesis: string;
    variants: Array<{ name: string; description: string; }>;
    metrics: string[];
    duration: string;
  };
}

class AICopilotService {
  private static instance: AICopilotService;

  constructor() {
    // Initialize service
  }

  static getInstance(): AICopilotService {
    if (!AICopilotService.instance) {
      AICopilotService.instance = new AICopilotService();
    }
    return AICopilotService.instance;
  }

  async generateInsights(timeRange: '1h' | '24h' | '7d' | '30d' = '7d'): Promise<AICopilotInsight[]> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-copilot/insights', {
        body: { timeRange }
      });

      if (error) throw error;

      return (data?.patterns || []).map((insight: any) => ({
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: insight.type as AICopilotInsight['type'],
        title: insight.description,
        description: insight.description,
        confidence: insight.confidence,
        priority: this.determinePriority(insight.confidence, insight.actionable),
        actionable: insight.actionable,
        suggestedActions: [],
        data: {},
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      return [];
    }
  }

  async generateExperimentRecommendations(): Promise<AICopilotRecommendation[]> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-copilot/recommendations', {
        body: {}
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to generate experiment recommendations:', error);
      return [];
    }
  }

  async predictUserBehavior(userId: string, context: Record<string, any> = {}): Promise<{
    likelyActions: Array<{ action: string; probability: number; }>;
    churnRisk: number;
    conversionProbability: number;
    recommendedInterventions: string[];
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-copilot/predict-behavior', {
        body: { userId, context }
      });

      if (error) throw error;

      eventTracker.trackPLGEvent('activation_step', {
        action: 'behavior_prediction',
        userId,
        context: Object.keys(context)
      });

      return {
        likelyActions: [
          { action: 'feature_exploration', probability: 0.7 },
          { action: 'invite_teammate', probability: 0.4 },
          { action: 'upgrade_plan', probability: 0.2 }
        ],
        churnRisk: data?.likelihood?.churn || 0.3,
        conversionProbability: data?.likelihood?.upgrade || 0.6,
        recommendedInterventions: data?.recommendations || []
      };
    } catch (error) {
      console.error('Failed to predict user behavior:', error);
      return {
        likelyActions: [],
        churnRisk: 0.5,
        conversionProbability: 0.5,
        recommendedInterventions: []
      };
    }
  }

  async createSmartExperiment(description: string): Promise<string | null> {
    try {
      const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase.functions.invoke('ai-copilot/experiments', {
        body: { description, experimentId }
      });

      if (error) throw error;
      
      // Track AI experiment creation
      eventTracker.trackPLGEvent('activation_step', {
        action: 'ai_experiment_created',
        experimentId,
        confidence: 0.85
      });

      return experimentId;
    } catch (error) {
      console.error('Failed to create smart experiment:', error);
      return null;
    }
  }

  async optimizeActiveExperiments(): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-copilot/optimize-experiments', {
        body: {}
      });

      if (error) throw error;

      eventTracker.trackProductEvent('feature_used', {
        feature: 'ai_copilot',
        action: 'experiments_optimized',
        experimentCount: data?.experiments?.length || 0
      });

      console.log('Experiments optimized successfully');
    } catch (error) {
      console.error('Failed to optimize experiments:', error);
      throw error;
    }
  }

  private determinePriority(confidence: number, actionable: boolean): AICopilotInsight['priority'] {
    if (!actionable) return 'low';
    if (confidence > 0.8) return 'critical';
    if (confidence > 0.6) return 'high';
    if (confidence > 0.4) return 'medium';
    return 'low';
  }
}

export const aiCopilotService = AICopilotService.getInstance();
