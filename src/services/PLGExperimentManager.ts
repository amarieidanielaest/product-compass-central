
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { analyticsService } from './api/AnalyticsService';

export interface PLGExperiment {
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
}

export class PLGExperimentManager {
  private featureFlags: ReturnType<typeof useFeatureFlags>;

  constructor(featureFlags: ReturnType<typeof useFeatureFlags>) {
    this.featureFlags = featureFlags;
  }

  // Onboarding Flow Experiments
  getOnboardingVariant(experimentKey: string = 'onboarding_flow'): 'control' | 'progressive' | 'gamified' {
    const variant = this.featureFlags.getValue(experimentKey, 'control');
    this.trackExperimentExposure(experimentKey, variant);
    return variant;
  }

  // Activation Experiments
  getActivationFlow(experimentKey: string = 'activation_flow'): 'standard' | 'guided' | 'self_serve' {
    const variant = this.featureFlags.getValue(experimentKey, 'standard');
    this.trackExperimentExposure(experimentKey, variant);
    return variant;
  }

  // Pricing Page Experiments
  getPricingVariant(experimentKey: string = 'pricing_display'): 'table' | 'cards' | 'comparison' {
    const variant = this.featureFlags.getValue(experimentKey, 'table');
    this.trackExperimentExposure(experimentKey, variant);
    return variant;
  }

  // Feature Discovery Experiments
  getFeatureDiscoveryMethod(experimentKey: string = 'feature_discovery'): 'tooltips' | 'highlights' | 'tour' {
    const variant = this.featureFlags.getValue(experimentKey, 'tooltips');
    this.trackExperimentExposure(experimentKey, variant);
    return variant;
  }

  // Upgrade Prompt Experiments
  getUpgradePromptTiming(experimentKey: string = 'upgrade_timing'): 'immediate' | 'after_value' | 'limit_reached' {
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
  const experimentManager = new PLGExperimentManager(featureFlags);

  return {
    experimentManager,
    isEnabled: featureFlags.isEnabled,
    loading: featureFlags.loading,
    error: featureFlags.error,
  };
};
