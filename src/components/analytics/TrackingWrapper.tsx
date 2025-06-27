
import React, { useEffect, ReactNode } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface TrackingWrapperProps {
  children: ReactNode;
  trackingId: string;
  trackingType: 'page' | 'feature' | 'component';
  properties?: Record<string, any>;
  autoTrack?: boolean;
}

export const TrackingWrapper: React.FC<TrackingWrapperProps> = ({
  children,
  trackingId,
  trackingType,
  properties = {},
  autoTrack = true
}) => {
  const { trackEvent, trackFeature, trackPageView } = useAnalytics();

  useEffect(() => {
    if (!autoTrack) return;

    const startTime = Date.now();

    switch (trackingType) {
      case 'page':
        trackPageView(trackingId, properties);
        break;
      case 'feature':
        trackFeature(trackingId, properties);
        break;
      case 'component':
        trackEvent('product', 'page_view', { 
          component: trackingId, 
          ...properties 
        });
        break;
    }

    return () => {
      const duration = Date.now() - startTime;
      trackEvent('product', 'page_view', {
        [trackingType]: trackingId,
        action: 'exit',
        duration,
        ...properties
      });
    };
  }, [trackingId, trackingType, autoTrack]);

  return <>{children}</>;
};

// Convenience components
export const PageTracker: React.FC<{ pageName: string; children: ReactNode; properties?: Record<string, any> }> = 
  ({ pageName, children, properties }) => (
    <TrackingWrapper trackingId={pageName} trackingType="page" properties={properties}>
      {children}
    </TrackingWrapper>
  );

export const FeatureTracker: React.FC<{ featureName: string; children: ReactNode; properties?: Record<string, any> }> = 
  ({ featureName, children, properties }) => (
    <TrackingWrapper trackingId={featureName} trackingType="feature" properties={properties}>
      {children}
    </TrackingWrapper>
  );

export const ComponentTracker: React.FC<{ componentName: string; children: ReactNode; properties?: Record<string, any> }> = 
  ({ componentName, children, properties }) => (
    <TrackingWrapper trackingId={componentName} trackingType="component" properties={properties}>
      {children}
    </TrackingWrapper>
  );
