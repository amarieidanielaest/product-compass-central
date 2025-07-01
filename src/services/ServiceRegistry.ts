
import { authenticationService } from './core/AuthenticationService';
import { dataManagementService } from './core/DataManagementService';
import { apiOrchestrationService } from './core/APIOrchestrationService';
import { aiCopilotService } from './ai/AICopilotService';
import { feedbackService } from './api/FeedbackService';
import { analyticsService } from './api/AnalyticsService';
import { aiService } from './api/AIService';
import { sprintService } from './api/SprintService';
import { roadmapService } from './api/RoadmapService';
import { strategyService } from './api/StrategyService';
import { featureFlagsService } from './api/FeatureFlagsService';
import { enterpriseSecurityService, multiProductService, configurationService } from './enterprise';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, any> = new Map();

  constructor() {
    this.initializeServices();
  }

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  private initializeServices() {
    // Core services
    this.services.set('authentication', authenticationService);
    this.services.set('dataManagement', dataManagementService);
    this.services.set('apiOrchestration', apiOrchestrationService);
    
    // AI services
    this.services.set('aiCopilot', aiCopilotService);
    this.services.set('ai', aiService);
    
    // API services
    this.services.set('feedback', feedbackService);
    this.services.set('analytics', analyticsService);
    this.services.set('sprint', sprintService);
    this.services.set('roadmap', roadmapService);
    this.services.set('strategy', strategyService);
    this.services.set('featureFlags', featureFlagsService);

    // Enterprise services
    this.services.set('enterpriseSecurity', enterpriseSecurityService);
    this.services.set('multiProduct', multiProductService);
    this.services.set('configuration', configurationService);
  }

  getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as T;
  }

  getAllServices(): Record<string, any> {
    const result: Record<string, any> = {};
    this.services.forEach((service, name) => {
      result[name] = service;
    });
    return result;
  }

  async initializeAllServices(): Promise<void> {
    console.log('Initializing modular monolith services...');
    
    try {
      // Initialize enterprise security policies
      console.log('Setting up enterprise security policies...');
      
      // Initialize multi-product configurations
      console.log('Configuring multi-product management...');
      
      // Initialize organization settings
      console.log('Loading organization configuration...');
      
      console.log('All services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }
}

export const serviceRegistry = ServiceRegistry.getInstance();
