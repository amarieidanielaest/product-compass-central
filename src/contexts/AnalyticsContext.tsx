
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { eventTracker } from '@/services/analytics/EventTracker';

interface AnalyticsContextValue {
  userId?: string;
  sessionId: string;
  isTracking: boolean;
  setUserId: (userId: string) => void;
  enableTracking: () => void;
  disableTracking: () => void;
  trackConsentGiven: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  enableAutoTracking?: boolean;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children, 
  enableAutoTracking = true 
}) => {
  const [userId, setUserIdState] = useState<string>();
  const [isTracking, setIsTracking] = useState(enableAutoTracking);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Check for consent in localStorage
    const consent = localStorage.getItem('analytics_consent');
    if (consent === 'granted') {
      setIsTracking(true);
    } else if (consent === 'denied') {
      setIsTracking(false);
    }
  }, []);

  const setUserId = (id: string) => {
    setUserIdState(id);
    eventTracker.setUserId(id);
    
    if (isTracking) {
      eventTracker.trackUserEvent('login', { userId: id });
    }
  };

  const enableTracking = () => {
    setIsTracking(true);
    localStorage.setItem('analytics_consent', 'granted');
  };

  const disableTracking = () => {
    setIsTracking(false);
    localStorage.setItem('analytics_consent', 'denied');
  };

  const trackConsentGiven = () => {
    enableTracking();
    eventTracker.trackUserEvent('profile_update', { 
      action: 'consent_granted',
      consentType: 'analytics'
    });
  };

  const value: AnalyticsContextValue = {
    userId,
    sessionId,
    isTracking,
    setUserId,
    enableTracking,
    disableTracking,
    trackConsentGiven
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = (): AnalyticsContextValue => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};
