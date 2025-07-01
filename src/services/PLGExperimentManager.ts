
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { analyticsService } from './api/AnalyticsService';

export interface PLGExperiment {
  id: string;
  key: string;
  name: string;
  hypothesis: string;
  variants: {
    control: any;
    treatment: any;
  };
  metrics: {
    primary: string;
    secondary: string[];
  };
  targetMetrics: {
    activationRate?: number;
    timeToValue?: number;
    retentionRate?: number;
    conversionRate?: number;
  };
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
}

export interface ExperimentResults {
  experimentId: string;
  metrics: Record<string, number>;
  variants: Record<string, {
    participants: number;
    conversions: number;
    conversionRate: number;
  }>;
  statisticalSignificance: number;
}

export class PLGExperimentManager {
  private static instance: PLGExperimentManager;
  private featureFlags: ReturnType<typeof useFeatureFlags> | null = null;
  private experiments: PLGExperiment[] = [];

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): PLGExperimentManager {
    if (!PLGExperimentManager.instance) {
      PLGExperimentManager.instance = new PLGExperimentManager();
    }
    return PLGExperimentManager.instance;
  }

  setFeatureFlags(featureFlags: ReturnType<typeof useFeatureFlags>) {
    this.featureFlags = featureFlags;
  }

  getActiveExperiments(): PLGExperiment[] {
    return this.experiments.filter(exp => exp.status === 'active');
  }

  async getExperimentResults(experimentId: string): Promise<ExperimentResults | null> {
    try {
      // Mock implementation - in real app this would fetch from analytics service
      return {
        experimentId,
        metrics: {
          conversion_rate: 0.15,
          user_engagement: 0.75,
          time_to_value: 180
        },
        variants: {
          control: { participants: 1000, conversions: 120, conversionRate: 0.12 },
          treatment: { participants: 1000, conversions: 180, conversionRate: 0.18 }
        },
        statisticalSignificance: 0.95
      };
    } catch (error) {
      console.error('Failed to get experiment results:', error);
      return null;
    }
  }

  createExperiment(config: {
    name: string;
    hypothesis: string;
    variants: Array<{ id: string; name: string; weight: number }>;
    metrics: string[];
    targetAudience: string;
    duration: number;
  }): string {
    const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const experiment: PLGExperiment = {
      id: experimentId,
      key: config.name.toLowerCase().replace(/\s+/g, '_'),
      name: config.name,
      hypothesis: config.hypothesis,
      variants: {
        control: config.variants.find(v => v.id === 'control'),
        treatment: config.variants.find(v => v.id !== 'control')
      },
      metrics: {
        primary: config.metrics[0] || 'conversion_rate',
        secondary: config.metrics.slice(1)
      },
      targetMetrics: {
        conversionRate: 0.15,
        activationRate: 0.25
      },
      status: 'active',
      startDate: new Date().toISOString()
    };

    this.experiments.push(experiment);
    return experimentId;
  }

  // Onboarding Flow Experiments
  getOnboardingVariant(experimentKey: string = 'onboarding_flow'): 'control' | 'progressive' | 'gamified' {
    if (!this.featureFlags) return 'control';
    const variant = this.featureFlags.getValue(experimentKey, 'control');
    this.trackExperimentExposure(experimentKey, variant);
    return variant;
  }

  // Activation Experiments
  getActivationFlow(experimentKey: string = 'activation_flow'): 'standard' | 'guided' | 'self_serve' {
    if (!this.featureFlags) return 'standard';
    const variant = this.featureFlags.getValue(experimentKey, 'standard');
    this.trackExperimentExposure(experimentKey, variant);
    return variant;
  }

  // Pricing Page Experiments
  getPricingVariant(experimentKey: string = 'pricing_display'): 'table' | 'cards' | 'comparison' {
    if (!this.featureFlags) return 'table';
    const variant = this.featureFlags.getValue(experimentKey, 'table');
    this.trackExperimentExposure(experimentKey, variant);
    return variant;
  }

  // Feature Discovery Experiments
  getFeatureDiscoveryMethod(experimentKey: string = 'feature_discovery'): 'tooltips' | 'highlights' | 'tour' {
    if (!this.featureFlags) return 'tooltips';
    const variant = this.featureFlags.getValue(experimentKey, 'tooltips');
    this.trackExperimentExposure(experimentKey, variant);
    return variant;
  }

  // Upgrade Prompt Experiments
  getUpgradePromptTiming(experimentKey: string = 'upgrade_timing'): 'immediate' | 'after_value' | 'limit_reached' {
    if (!this.featureFlags) return 'limit_reached';
    const variant = this.featureFlags.getValue(experimentKey, 'limit_reached');
    this.trackExperimentExposure(experimentKey, variant);
    return variant;
  }

  // CTA Button Experiments
  getCTAVariant(experimentKey: string = 'cta_button'): {
    text: string;
    color: string;
    size: string;
  } {
    if (!this.featureFlags) return { text: 'Get Started', color: 'blue', size: 'md' };
    
    const variant = this.featureFlags.getValue(experimentKey, 'control');
    this.trackExperimentExposure(experimentKey, variant);
    
    const variants = {
      control: { text: 'Get Started', color: 'blue', size: 'md' },
      action: { text: 'Start Free Trial', color: 'green', size: 'lg' },
      urgency: { text: 'Join Now - Limited Time', color: 'red', size: 'lg' },
    };
    
    return variants[variant as keyof typeof variants] || variants.control;
  }

  // Track when a user is exposed to an experiment
  private async trackExperimentExposure(experimentKey: string, variant: string) {
    try {
      await analyticsService.trackEvent({
        userId: 'current-user-id', // This should come from auth context
        eventName: 'experiment_exposure',
        properties: {
          experiment: experimentKey,
          variant,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to track experiment exposure:', error);
    }
  }

  // Track experiment conversions
  async trackConversion(experimentKey: string, metric: string, value?: number) {
    if (!this.featureFlags) return;
    
    const variant = this.featureFlags.getValue(experimentKey, 'control');
    
    try {
      await this.featureFlags.trackExperiment(experimentKey, variant, {
        metric,
        value: value || 1,
        timestamp: new Date().toISOString(),
      });

      await analyticsService.trackEvent({
        userId: 'current-user-id',
        eventName: 'experiment_conversion',
        properties: {
          experiment: experimentKey,
          variant,
          metric,
          value: value || 1,
        },
      });
    } catch (error) {
      console.error('Failed to track experiment conversion:', error);
    }
  }
}

// Hook to use PLG experiments
export const usePLGExperiments = () => {
  const featureFlags = useFeatureFlags();
  const experimentManager = PLGExperimentManager.getInstance();
  
  // Set feature flags reference
  experimentManager.setFeatureFlags(featureFlags);

  return {
    experimentManager,
    isEnabled: featureFlags.isEnabled,
    loading: featureFlags.loading,
    error: featureFlags.error,
  };
};
