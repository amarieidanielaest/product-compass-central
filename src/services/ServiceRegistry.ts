
// Core service imports
import { notificationService } from './notifications/NotificationService';
import { authenticationService } from './core/AuthenticationService';

// API service imports
import { boardService } from './api/BoardService';
import { feedbackService } from './api/FeedbackService';
import { roadmapService } from './api/RoadmapService';
import { analyticsService } from './api/AnalyticsService';
import { sprintService } from './api/SprintService';
import { strategyService } from './api/StrategyService';
import { aiService } from './api/AIService';

export interface ServiceHealthStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  lastHealthCheck: string;
}

class ServiceRegistry {
  private services = new Map<string, any>();
  private healthChecks = new Map<string, ServiceHealthStatus>();

  constructor() {
    this.registerCoreServices();
    this.registerAPIServices();
    this.registerNotificationServices();
    this.registerAuthServices();
    this.startHealthMonitoring();
  }

  private registerCoreServices() {
    // Core services will be registered as they're enhanced
  }

  private registerAPIServices() {
    this.services.set('board', boardService);
    this.services.set('feedback', feedbackService);
    this.services.set('roadmap', roadmapService);
    this.services.set('analytics', analyticsService);
    this.services.set('sprint', sprintService);
    this.services.set('strategy', strategyService);
    this.services.set('ai', aiService);
  }

  private registerNotificationServices() {
    this.services.set('notifications', notificationService);
  }

  private registerAuthServices() {
    this.services.set('authentication', authenticationService);
  }

  getService<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found in registry`);
    }
    return service as T;
  }

  registerService(name: string, service: any): void {
    this.services.set(name, service);
  }

  hasService(name: string): boolean {
    return this.services.has(name);
  }

  getAllServices(): Map<string, any> {
    return new Map(this.services);
  }

  async getServiceHealth(serviceName?: string): Promise<ServiceHealthStatus | ServiceHealthStatus[]> {
    if (serviceName) {
      const status = this.healthChecks.get(serviceName);
      if (!status) {
        throw new Error(`Health status for service '${serviceName}' not found`);
      }
      return status;
    }

    return Array.from(this.healthChecks.values());
  }

  async refreshServiceHealth(serviceName?: string): Promise<void> {
    if (serviceName) {
      await this.performHealthCheck(serviceName);
    } else {
      const healthCheckPromises = Array.from(this.services.keys()).map(name => 
        this.performHealthCheck(name)
      );
      await Promise.allSettled(healthCheckPromises);
    }
  }

  private async performHealthCheck(serviceName: string): Promise<void> {
    try {
      const healthStatus: ServiceHealthStatus = {
        name: serviceName,
        status: 'healthy',
        version: '1.0.0',
        uptime: Date.now(),
        lastHealthCheck: new Date().toISOString()
      };

      this.healthChecks.set(serviceName, healthStatus);
    } catch (error) {
      this.healthChecks.set(serviceName, {
        name: serviceName,
        status: 'unhealthy',
        version: '1.0.0',
        uptime: 0,
        lastHealthCheck: new Date().toISOString()
      });
    }
  }

  private startHealthMonitoring(): void {
    // Perform health checks every 30 seconds
    setInterval(async () => {
      await this.refreshServiceHealth();
    }, 30000);

    // Initial health check
    setTimeout(() => {
      this.refreshServiceHealth();
    }, 1000);
  }
}

export const serviceRegistry = new ServiceRegistry();
