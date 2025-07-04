
// Import notification service
import { notificationService } from './notifications/NotificationService';
import { authenticationService } from './core/AuthenticationService';

class ServiceRegistry {
  private services = new Map<string, any>();

  constructor() {
    this.registerCoreServices();
    this.registerAPIServices();
    this.registerEnterpriseServices();
    this.registerAnalyticsServices();
    this.registerNotificationServices();
    this.registerAuthServices();
  }

  private registerCoreServices() {
    // Register core services here
  }

  private registerAPIServices() {
    // Register API services here
  }

  private registerEnterpriseServices() {
    // Register enterprise services here
  }

  private registerAnalyticsServices() {
    // Register analytics services here
  }

  private registerNotificationServices() {
    this.services.set('notifications', notificationService);
  }

  private registerAuthServices() {
    this.services.set('authentication', authenticationService);
  }

  getService<T>(name: string): T {
    return this.services.get(name);
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
}

export const serviceRegistry = new ServiceRegistry();
