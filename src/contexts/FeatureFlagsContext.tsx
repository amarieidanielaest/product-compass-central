
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { featureFlagsService, UserContext } from '@/services/api/FeatureFlagsService';

interface FeatureFlagsContextValue {
  flags: Record<string, any>;
  loading: boolean;
  error: string | null;
  refreshFlags: () => Promise<void>;
  isEnabled: (flagKey: string) => boolean;
  getValue: <T = any>(flagKey: string, defaultValue: T) => T;
  trackExperiment: (flagKey: string, variant: string, value: any) => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | undefined>(undefined);

interface FeatureFlagsProviderProps {
  children: ReactNode;
  userContext?: UserContext;
}

export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({ 
  children, 
  userContext 
}) => {
  const [flags, setFlags] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFlags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await featureFlagsService.getFlags(userContext);
      
      if (response.success) {
        setFlags(response.data);
      } else {
        setError(response.message || 'Failed to load feature flags');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFlags();
  }, [userContext?.userId]);

  const isEnabled = (flagKey: string): boolean => {
    return Boolean(flags[flagKey]);
  };

  const getValue = <T = any>(flagKey: string, defaultValue: T): T => {
    return flags[flagKey] !== undefined ? flags[flagKey] : defaultValue;
  };

  const trackExperiment = async (flagKey: string, variant: string, value: any) => {
    if (!userContext?.userId) return;

    try {
      await featureFlagsService.trackExperiment({
        flagKey,
        variant,
        value,
        userId: userContext.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to track experiment:', err);
    }
  };

  const value: FeatureFlagsContextValue = {
    flags,
    loading,
    error,
    refreshFlags,
    isEnabled,
    getValue,
    trackExperiment,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = (): FeatureFlagsContextValue => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};
