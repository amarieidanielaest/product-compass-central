
import { useEffect, useCallback } from 'react';
import { eventTracker, AnalyticsEvent } from '@/services/analytics/EventTracker';
import { useLocation } from 'react-router-dom';

export const useAnalytics = () => {
  const location = useLocation();

  // Auto-track page views
  useEffect(() => {
    eventTracker.trackPageView(location.pathname, {
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname]);

  const trackEvent = useCallback((
    type: AnalyticsEvent['type'],
    action: string,
    properties: Record<string, any> = {}
  ) => {
    switch (type) {
      case 'user':
        eventTracker.trackUserEvent(action as any, properties);
        break;
      case 'product':
        eventTracker.trackProductEvent(action as any, properties);
        break;
      case 'business':
        eventTracker.trackBusinessEvent(action as any, properties);
        break;
      case 'plg':
        eventTracker.trackPLGEvent(action as any, properties);
        break;
      case 'feedback':
        eventTracker.trackFeedbackEvent(action as any, properties);
        break;
    }
  }, []);

  const trackClick = useCallback((element: string, properties: Record<string, any> = {}) => {
    eventTracker.trackProductEvent('button_click', { component: element, ...properties });
  }, []);

  const trackFeature = useCallback((feature: string, properties: Record<string, any> = {}) => {
    eventTracker.trackFeatureUsage(feature, properties);
  }, []);

  const trackConversion = useCallback((action: string, value?: number, properties: Record<string, any> = {}) => {
    eventTracker.trackConversion(action, value, properties);
  }, []);

  return {
    trackEvent,
    trackClick,
    trackFeature,
    trackConversion,
    trackPageView: eventTracker.trackPageView.bind(eventTracker),
    trackActivationStep: eventTracker.trackActivationStep.bind(eventTracker),
    setUserId: eventTracker.setUserId.bind(eventTracker)
  };
};

export const usePageTracking = (pageName: string, properties: Record<string, any> = {}) => {
  useEffect(() => {
    eventTracker.trackPageView(pageName, properties);
  }, [pageName]);
};

export const useFeatureTracking = (featureName: string) => {
  useEffect(() => {
    eventTracker.trackFeatureUsage(featureName, {
      entryTime: new Date().toISOString()
    });

    return () => {
      // Track feature exit
      eventTracker.trackProductEvent('feature_used', {
        feature: featureName,
        action: 'exit',
        exitTime: new Date().toISOString()
      });
    };
  }, [featureName]);
};
