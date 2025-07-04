
import React, { createContext, useContext, useEffect, useState } from 'react';
import { serviceRegistry } from '@/services/ServiceRegistry';

interface ServiceContextType {
  services: Record<string, any>;
  initialized: boolean;
  error: string | null;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Record<string, any>>({});

  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Convert Map to Record for easier access
        const servicesMap = serviceRegistry.getAllServices();
        const servicesRecord: Record<string, any> = {};
        servicesMap.forEach((service, key) => {
          servicesRecord[key] = service;
        });
        
        setServices(servicesRecord);
        setInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize services');
        console.error('Service initialization error:', err);
      }
    };

    initializeServices();
  }, []);

  return (
    <ServiceContext.Provider value={{ services, initialized, error }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};

export const useService = <T,>(serviceName: string): T => {
  const { services, initialized } = useServices();
  
  if (!initialized) {
    throw new Error('Services not yet initialized');
  }
  
  const service = services[serviceName];
  if (!service) {
    throw new Error(`Service ${serviceName} not found`);
  }
  
  return service as T;
};
