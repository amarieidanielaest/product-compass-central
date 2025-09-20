import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '@/services/api';
import { useAnalytics } from './useAnalytics';

export interface PredictiveModel {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  lastTrained: string;
  predictions: PredictiveResult[];
}

export interface PredictiveResult {
  metric: string;
  timeframe: '1d' | '7d' | '30d' | '90d';
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
}

export interface ScenarioAnalysis {
  scenario: string;
  changes: Record<string, any>;
  predictions: PredictiveResult[];
  confidence: number;
  riskFactors: string[];
}

export const usePredictiveAnalytics = () => {
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [activePredictions, setActivePredictions] = useState<PredictiveResult[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackFeature } = useAnalytics();

  const generatePredictions = useCallback(async (timeframe: '1d' | '7d' | '30d' | '90d' = '30d') => {
    setLoading(true);
    setError(null);
    
    try {
      trackFeature('predictive_analytics_generation');
      
      // Mock predictive analytics generation
      const mockPredictions: PredictiveResult[] = [
        {
          metric: 'User Acquisition',
          timeframe,
          currentValue: 145,
          predictedValue: timeframe === '30d' ? 189 : timeframe === '7d' ? 162 : 147,
          confidence: 0.87,
          trend: 'increasing',
          factors: [
            { name: 'Seasonal Growth', impact: 0.23, description: 'Historical seasonal patterns show 23% boost' },
            { name: 'Feature Releases', impact: 0.15, description: 'Upcoming mobile features driving adoption' },
            { name: 'Marketing Campaign', impact: 0.12, description: 'Q4 campaign showing strong early results' }
          ]
        },
        {
          metric: 'Feature Adoption',
          timeframe,
          currentValue: 68.5,
          predictedValue: timeframe === '30d' ? 78.2 : timeframe === '7d' ? 71.1 : 69.2,
          confidence: 0.82,
          trend: 'increasing',
          factors: [
            { name: 'Onboarding Improvements', impact: 0.31, description: 'New user tutorial reducing friction' },
            { name: 'Product Hunt Launch', impact: 0.18, description: 'Increased visibility driving trial conversions' },
            { name: 'Customer Success Outreach', impact: 0.14, description: 'Proactive support increasing engagement' }
          ]
        },
        {
          metric: 'Sprint Velocity',
          timeframe,
          currentValue: 42.8,
          predictedValue: timeframe === '30d' ? 48.5 : timeframe === '7d' ? 44.2 : 43.1,
          confidence: 0.91,
          trend: 'increasing',
          factors: [
            { name: 'Team Maturity', impact: 0.28, description: 'Team gaining experience with sprint processes' },
            { name: 'Tool Optimization', impact: 0.19, description: 'Better tooling reducing administrative overhead' },
            { name: 'Process Refinement', impact: 0.16, description: 'Iterative improvements to planning accuracy' }
          ]
        },
        {
          metric: 'Customer Satisfaction',
          timeframe,
          currentValue: 4.2,
          predictedValue: timeframe === '30d' ? 4.5 : timeframe === '7d' ? 4.3 : 4.25,
          confidence: 0.75,
          trend: 'increasing',
          factors: [
            { name: 'Bug Fix Velocity', impact: 0.25, description: 'Faster resolution of customer issues' },
            { name: 'Feature Requests', impact: 0.21, description: 'Delivery of highly requested capabilities' },
            { name: 'Support Response Time', impact: 0.17, description: 'Improved customer service metrics' }
          ]
        }
      ];

      setActivePredictions(mockPredictions);
      
      // Generate mock models
      const mockModels: PredictiveModel[] = [
        {
          id: 'user_growth_lstm',
          name: 'User Growth LSTM',
          description: 'Long Short-Term Memory model for user acquisition prediction',
          accuracy: 0.87,
          lastTrained: new Date(Date.now() - 86400000 * 2).toISOString(),
          predictions: mockPredictions.filter(p => p.metric.includes('User'))
        },
        {
          id: 'feature_adoption_rf',
          name: 'Feature Adoption Random Forest',
          description: 'Random Forest classifier for feature adoption rates',
          accuracy: 0.82,
          lastTrained: new Date(Date.now() - 86400000 * 1).toISOString(),
          predictions: mockPredictions.filter(p => p.metric.includes('Feature'))
        },
        {
          id: 'velocity_regression',
          name: 'Velocity Regression Model',
          description: 'Linear regression model for sprint velocity forecasting',
          accuracy: 0.91,
          lastTrained: new Date(Date.now() - 86400000 * 3).toISOString(),
          predictions: mockPredictions.filter(p => p.metric.includes('Sprint'))
        }
      ];

      setModels(mockModels);
      
    } catch (err) {
      console.error('Failed to generate predictions:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate predictions');
    } finally {
      setLoading(false);
    }
  }, [trackFeature]);

  const runScenarioAnalysis = useCallback(async (
    scenarioName: string, 
    changes: Record<string, any>
  ): Promise<ScenarioAnalysis | null> => {
    try {
      trackFeature('scenario_analysis');
      
      // Mock scenario analysis
      const mockScenario: ScenarioAnalysis = {
        scenario: scenarioName,
        changes,
        confidence: 0.78,
        riskFactors: [
          'Team onboarding time may extend timeline',
          'Market conditions could affect adoption rates',
          'Competing priorities might impact resource allocation'
        ],
        predictions: activePredictions.map(pred => ({
          ...pred,
          predictedValue: pred.predictedValue * (1 + (Math.random() - 0.5) * 0.4), // Add scenario variation
          confidence: pred.confidence * 0.9 // Scenarios are less certain
        }))
      };

      setScenarios(prev => [...prev, mockScenario]);
      return mockScenario;
      
    } catch (err) {
      console.error('Failed to run scenario analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to run scenario analysis');
      return null;
    }
  }, [activePredictions, trackFeature]);

  const trainModel = useCallback(async (modelId: string, trainingData?: any) => {
    try {
      trackFeature('model_training');
      
      // Mock model training
      setModels(prev => prev.map(model => 
        model.id === modelId 
          ? { 
              ...model, 
              accuracy: Math.min(0.95, model.accuracy + 0.02),
              lastTrained: new Date().toISOString()
            }
          : model
      ));
      
      return { success: true, message: 'Model training completed successfully' };
      
    } catch (err) {
      console.error('Failed to train model:', err);
      setError(err instanceof Error ? err.message : 'Failed to train model');
      return { success: false, message: 'Model training failed' };
    }
  }, [trackFeature]);

  const getConfidenceMetrics = useCallback(() => {
    if (activePredictions.length === 0) return null;
    
    const avgConfidence = activePredictions.reduce((sum, pred) => sum + pred.confidence, 0) / activePredictions.length;
    const highConfidence = activePredictions.filter(pred => pred.confidence > 0.8).length;
    const lowConfidence = activePredictions.filter(pred => pred.confidence < 0.6).length;
    
    return {
      average: avgConfidence,
      high: highConfidence,
      low: lowConfidence,
      total: activePredictions.length
    };
  }, [activePredictions]);

  // Auto-generate predictions on mount
  useEffect(() => {
    generatePredictions();
  }, [generatePredictions]);

  return {
    models,
    predictions: activePredictions,
    scenarios,
    loading,
    error,
    generatePredictions,
    runScenarioAnalysis,
    trainModel,
    getConfidenceMetrics,
    clearError: () => setError(null),
    clearScenarios: () => setScenarios([])
  };
};