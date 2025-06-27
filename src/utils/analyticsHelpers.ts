
import { eventTracker } from '@/services/analytics/EventTracker';

// Activation Tracking Helpers
export const trackActivationMilestone = (milestone: string, properties: Record<string, any> = {}) => {
  eventTracker.trackPLGEvent('activation_step', {
    step: milestone,
    timestamp: new Date().toISOString(),
    ...properties
  });
};

export const trackAhaMoment = (moment: string, timeToValue: number, properties: Record<string, any> = {}) => {
  eventTracker.trackPLGEvent('aha_moment', {
    moment,
    timeToValue,
    ...properties
  });
};

// Conversion Funnel Tracking
export const trackFunnelStep = (funnel: string, step: string, properties: Record<string, any> = {}) => {
  eventTracker.trackBusinessEvent('conversion', {
    funnel,
    step,
    action: 'funnel_step',
    ...properties
  });
};

export const trackFunnelConversion = (funnel: string, value?: number, properties: Record<string, any> = {}) => {
  eventTracker.trackBusinessEvent('conversion', {
    funnel,
    action: 'funnel_complete',
    value,
    ...properties
  });
};

// Feature Adoption Tracking
export const trackFeatureFirstUse = (feature: string, properties: Record<string, any> = {}) => {
  eventTracker.trackProductEvent('feature_used', {
    feature,
    action: 'first_use',
    ...properties
  });
};

export const trackFeatureEngagement = (feature: string, duration: number, interactions: number, properties: Record<string, any> = {}) => {
  eventTracker.trackProductEvent('feature_used', {
    feature,
    action: 'engagement',
    duration,
    interactions,
    ...properties
  });
};

// Viral/Social Tracking
export const trackInviteSent = (method: string, count: number = 1, properties: Record<string, any> = {}) => {
  eventTracker.trackPLGEvent('invite_sent', {
    method,
    count,
    ...properties
  });
};

export const trackShareAction = (content: string, platform: string, properties: Record<string, any> = {}) => {
  eventTracker.trackPLGEvent('share_action', {
    content,
    platform,
    ...properties
  });
};

export const trackViralSignup = (referralCode: string, referrerUserId: string, properties: Record<string, any> = {}) => {
  eventTracker.trackPLGEvent('viral_signup', {
    referralCode,
    referrerUserId,
    ...properties
  });
};

// Feedback and Support Tracking
export const trackFeedbackSubmission = (feedbackId: string, category: string, sentiment: 'positive' | 'negative' | 'neutral', properties: Record<string, any> = {}) => {
  eventTracker.trackFeedbackEvent('submitted', {
    feedbackId,
    category,
    sentiment,
    ...properties
  });
};

export const trackSupportInteraction = (type: 'chat' | 'email' | 'phone', topic: string, properties: Record<string, any> = {}) => {
  eventTracker.trackUserEvent('profile_update', {
    action: 'support_interaction',
    type,
    topic,
    ...properties
  });
};

// Error and Performance Tracking
export const trackError = (errorType: string, errorMessage: string, properties: Record<string, any> = {}) => {
  eventTracker.trackProductEvent('button_click', {
    action: 'error',
    errorType,
    errorMessage,
    stack: properties.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...properties
  });
};

export const trackPerformanceMetric = (metric: string, value: number, properties: Record<string, any> = {}) => {
  eventTracker.trackProductEvent('page_view', {
    action: 'performance',
    metric,
    value,
    ...properties
  });
};

// A/B Test Tracking (integrates with feature flags)
export const trackExperimentExposure = (experimentId: string, variant: string, properties: Record<string, any> = {}) => {
  eventTracker.trackPLGEvent('activation_step', {
    action: 'experiment_exposure',
    experimentId,
    variant,
    ...properties
  });
};

export const trackExperimentConversion = (experimentId: string, variant: string, goal: string, value?: number, properties: Record<string, any> = {}) => {
  eventTracker.trackPLGEvent('activation_step', {
    action: 'experiment_conversion',
    experimentId,
    variant,
    goal,
    value,
    ...properties
  });
};
