
import { useState, useEffect, useCallback } from 'react';
import { aiCopilotService, AICopilotInsight, AICopilotRecommendation } from '@/services/ai/AICopilotService';
import { eventTracker } from '@/services/analytics/EventTracker';

export const useAICopilot = () => {
  const [insights, setInsights] = useState<AICopilotInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AICopilotRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = useCallback(async (timeRange: '1h' | '24h' | '7d' | '30d' = '7d') => {
    setLoading(true);
    setError(null);

    try {
      const newInsights = await aiCopilotService.generateInsights(timeRange);
      setInsights(newInsights);
      
      // Track insights generation
      eventTracker.trackProductEvent('feature_used', {
        feature: 'ai_copilot',
        action: 'insights_generated',
        insightCount: newInsights.length,
        timeRange
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newRecommendations = await aiCopilotService.generateExperimentRecommendations();
      setRecommendations(newRecommendations);
      
      // Track recommendations generation
      eventTracker.trackProductEvent('feature_used', {
        feature: 'ai_copilot',
        action: 'recommendations_generated',
        recommendationCount: newRecommendations.length
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createExperimentFromRecommendation = useCallback(async (recommendation: AICopilotRecommendation) => {
    if (!recommendation.experimentSuggestion) return null;

    try {
      const experimentId = await aiCopilotService.createSmartExperiment(recommendation.description);
      
      if (experimentId) {
        eventTracker.trackPLGEvent('activation_step', {
          action: 'experiment_from_recommendation',
          experimentId,
          recommendationId: recommendation.id
        });
      }

      return experimentId;
    } catch (err) {
      console.error('Failed to create experiment from recommendation:', err);
      return null;
    }
  }, []);

  const predictUserBehavior = useCallback(async (userId: string, context: Record<string, any> = {}) => {
    try {
      const prediction = await aiCopilotService.predictUserBehavior(userId, context);
      
      eventTracker.trackProductEvent('feature_used', {
        feature: 'ai_copilot',
        action: 'behavior_prediction',
        userId,
        churnRisk: prediction.churnRisk,
        conversionProb: prediction.conversionProbability
      });

      return prediction;
    } catch (err) {
      console.error('Failed to predict user behavior:', err);
      return null;
    }
  }, []);

  const optimizeExperiments = useCallback(async () => {
    try {
      await aiCopilotService.optimizeActiveExperiments();
      
      eventTracker.trackProductEvent('feature_used', {
        feature: 'ai_copilot',
        action: 'experiments_optimized'
      });
    } catch (err) {
      console.error('Failed to optimize experiments:', err);
    }
  }, []);

  return {
    insights,
    recommendations,
    loading,
    error,
    generateInsights,
    generateRecommendations,
    createExperimentFromRecommendation,
    predictUserBehavior,
    optimizeExperiments
  };
};

export const useAIInsights = (autoRefresh: boolean = false, timeRange: '7d' | '30d' = '7d') => {
  const [insights, setInsights] = useState<AICopilotInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const newInsights = await aiCopilotService.generateInsights(timeRange);
        setInsights(newInsights);
      } catch (error) {
        console.error('Failed to load AI insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();

    if (autoRefresh) {
      const interval = setInterval(loadInsights, 5 * 60 * 1000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange]);

  return { insights, loading };
};
