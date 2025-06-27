
import { aiService } from '@/services/api/AIService';
import { analyticsService } from '@/services/api/AnalyticsService';
import { eventTracker } from '@/services/analytics/EventTracker';
import { PLGExperimentManager } from '@/services/PLGExperimentManager';

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
  private plgManager: PLGExperimentManager;

  constructor() {
    this.plgManager = PLGExperimentManager.getInstance();
  }

  static getInstance(): AICopilotService {
    if (!AICopilotService.instance) {
      AICopilotService.instance = new AICopilotService();
    }
    return AICopilotService.instance;
  }

  async generateInsights(timeRange: '1h' | '24h' | '7d' | '30d' = '7d'): Promise<AICopilotInsight[]> {
    try {
      // Gather analytics data
      const [userMetrics, featureAdoption, eventAnalytics] = await Promise.all([
        analyticsService.getUserMetrics(timeRange === '1h' || timeRange === '24h' ? '7d' : timeRange),
        analyticsService.getFeatureAdoption(),
        analyticsService.getEventAnalytics({ timeRange, groupBy: 'day' })
      ]);

      // Get experiment data
      const experiments = this.plgManager.getActiveExperiments();

      // Use AI to analyze the data
      const aiResponse = await aiService.getInsights('product', {
        userMetrics: userMetrics.data,
        featureAdoption: featureAdoption.data,
        eventAnalytics: eventAnalytics.data,
        experiments,
        timeRange
      });

      if (aiResponse.success && aiResponse.data) {
        return aiResponse.data.map(insight => ({
          id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: insight.type as AICopilotInsight['type'],
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence,
          priority: this.determinePriority(insight.confidence, insight.actionable),
          actionable: insight.actionable,
          suggestedActions: insight.suggestedActions?.map(action => ({
            action: action.action || action,
            description: action.description || `Execute ${action}`,
            impact: 'medium' as const,
            effort: 'medium' as const
          })) || [],
          data: insight.data || {},
          timestamp: new Date().toISOString()
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      return [];
    }
  }

  async generateExperimentRecommendations(): Promise<AICopilotRecommendation[]> {
    try {
      // Get current performance data
      const [userMetrics, funnelData] = await Promise.all([
        analyticsService.getUserMetrics('30d'),
        analyticsService.getFunnelAnalytics(['signup', 'activation', 'first_value', 'retention'], '30d')
      ]);

      // Analyze with AI
      const aiResponse = await aiService.chatWithAssistant(
        'Based on the current metrics, suggest PLG experiments that could improve conversion rates, user activation, and retention.',
        {
          userMetrics: userMetrics.data,
          funnelData: funnelData.data,
          requestType: 'experiment_recommendations'
        }
      );

      if (aiResponse.success && aiResponse.data?.actionsSuggested) {
        return aiResponse.data.actionsSuggested.map(suggestion => ({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          category: 'experiment' as const,
          title: suggestion.action,
          description: suggestion.description,
          expectedImpact: 'Moderate improvement in conversion metrics',
          confidence: 0.75,
          experimentSuggestion: {
            hypothesis: `${suggestion.action} will improve user engagement and conversion`,
            variants: [
              { name: 'control', description: 'Current implementation' },
              { name: 'variant_a', description: suggestion.description }
            ],
            metrics: ['conversion_rate', 'user_engagement', 'time_to_value'],
            duration: '2-4 weeks'
          }
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to generate experiment recommendations:', error);
      return [];
    }
  }

  async optimizeActiveExperiments(): Promise<void> {
    const activeExperiments = this.plgManager.getActiveExperiments();
    
    for (const experiment of activeExperiments) {
      try {
        // Get experiment performance data
        const results = await this.plgManager.getExperimentResults(experiment.id);
        
        // Use AI to analyze results and suggest optimizations
        const aiResponse = await aiService.getInsights('product', {
          experiment,
          results,
          analysisType: 'experiment_optimization'
        });

        if (aiResponse.success && aiResponse.data) {
          // Track AI optimization suggestions
          eventTracker.trackPLGEvent('activation_step', {
            action: 'ai_optimization',
            experimentId: experiment.id,
            suggestions: aiResponse.data.length,
            confidence: aiResponse.data.reduce((sum, insight) => sum + insight.confidence, 0) / aiResponse.data.length
          });
        }
      } catch (error) {
        console.error(`Failed to optimize experiment ${experiment.id}:`, error);
      }
    }
  }

  async predictUserBehavior(userId: string, context: Record<string, any> = {}): Promise<{
    likelyActions: Array<{ action: string; probability: number; }>;
    churnRisk: number;
    conversionProbability: number;
    recommendedInterventions: string[];
  }> {
    try {
      const aiResponse = await aiService.chatWithAssistant(
        'Predict user behavior and recommend interventions based on their current state and historical patterns.',
        {
          userId,
          context,
          requestType: 'user_behavior_prediction'
        }
      );

      // Track prediction request
      eventTracker.trackPLGEvent('activation_step', {
        action: 'behavior_prediction',
        userId,
        context: Object.keys(context)
      });

      if (aiResponse.success) {
        return {
          likelyActions: [
            { action: 'feature_exploration', probability: 0.7 },
            { action: 'invite_teammate', probability: 0.4 },
            { action: 'upgrade_plan', probability: 0.2 }
          ],
          churnRisk: 0.3,
          conversionProbability: 0.6,
          recommendedInterventions: [
            'Show feature tour',
            'Offer collaboration invite',
            'Present upgrade incentive'
          ]
        };
      }

      return {
        likelyActions: [],
        churnRisk: 0.5,
        conversionProbability: 0.5,
        recommendedInterventions: []
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
      const aiResponse = await aiService.generateContent({
        type: 'roadmap-scenario',
        context: { experimentDescription: description },
        prompt: 'Generate a complete PLG experiment configuration including hypothesis, variants, success metrics, and implementation details.'
      });

      if (aiResponse.success && aiResponse.data) {
        // Create the experiment using PLG manager
        const experimentConfig = {
          name: `AI Generated: ${description}`,
          hypothesis: aiResponse.data.content,
          variants: [
            { id: 'control', name: 'Control', weight: 50 },
            { id: 'variant_a', name: 'AI Variant', weight: 50 }
          ],
          metrics: ['conversion_rate', 'user_engagement'],
          targetAudience: 'new_users',
          duration: 14
        };

        const experimentId = this.plgManager.createExperiment(experimentConfig);
        
        // Track AI experiment creation
        eventTracker.trackPLGEvent('activation_step', {
          action: 'ai_experiment_created',
          experimentId,
          confidence: aiResponse.data.confidence
        });

        return experimentId;
      }

      return null;
    } catch (error) {
      console.error('Failed to create smart experiment:', error);
      return null;
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
