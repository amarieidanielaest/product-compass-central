
export interface BaseEvent {
  userId?: string;
  sessionId: string;
  timestamp: string;
  properties: Record<string, any>;
}

export interface UserEvent extends BaseEvent {
  type: 'user';
  action: 'signup' | 'login' | 'logout' | 'profile_update' | 'subscription_change';
}

export interface ProductEvent extends BaseEvent {
  type: 'product';
  action: 'feature_used' | 'page_view' | 'button_click' | 'form_submit' | 'search' | 'filter_applied';
  feature?: string;
  page?: string;
  component?: string;
}

export interface BusinessEvent extends BaseEvent {
  type: 'business';
  action: 'conversion' | 'upgrade' | 'downgrade' | 'trial_start' | 'trial_end' | 'payment_success' | 'payment_failed';
  value?: number;
  currency?: string;
  plan?: string;
}

export interface PLGEvent extends BaseEvent {
  type: 'plg';
  action: 'activation_step' | 'aha_moment' | 'invite_sent' | 'share_action' | 'viral_signup' | 'time_to_value';
  step?: string;
  cohort?: string;
  experimentId?: string;
  variant?: string;
}

export interface FeedbackEvent extends BaseEvent {
  type: 'feedback';
  action: 'submitted' | 'upvoted' | 'commented' | 'resolved' | 'prioritized';
  feedbackId?: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export type AnalyticsEvent = UserEvent | ProductEvent | BusinessEvent | PLGEvent | FeedbackEvent;

class EventTracker {
  private sessionId: string;
  private userId?: string;
  private eventQueue: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private isOnline = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.startBatchProcessing();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      }
    });

    // Track online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flush();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private createBaseEvent(): BaseEvent {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {}
    };
  }

  // User Events
  trackUserEvent(action: UserEvent['action'], properties: Record<string, any> = {}) {
    const event: UserEvent = {
      ...this.createBaseEvent(),
      type: 'user',
      action,
      properties
    };
    this.enqueueEvent(event);
  }

  // Product Events
  trackProductEvent(action: ProductEvent['action'], properties: Record<string, any> = {}) {
    const event: ProductEvent = {
      ...this.createBaseEvent(),
      type: 'product',
      action,
      properties,
      feature: properties.feature,
      page: properties.page,
      component: properties.component
    };
    this.enqueueEvent(event);
  }

  // Business Events
  trackBusinessEvent(action: BusinessEvent['action'], properties: Record<string, any> = {}) {
    const event: BusinessEvent = {
      ...this.createBaseEvent(),
      type: 'business',
      action,
      properties,
      value: properties.value,
      currency: properties.currency,
      plan: properties.plan
    };
    this.enqueueEvent(event);
  }

  // PLG Events
  trackPLGEvent(action: PLGEvent['action'], properties: Record<string, any> = {}) {
    const event: PLGEvent = {
      ...this.createBaseEvent(),
      type: 'plg',
      action,
      properties,
      step: properties.step,
      cohort: properties.cohort,
      experimentId: properties.experimentId,
      variant: properties.variant
    };
    this.enqueueEvent(event);
  }

  // Feedback Events
  trackFeedbackEvent(action: FeedbackEvent['action'], properties: Record<string, any> = {}) {
    const event: FeedbackEvent = {
      ...this.createBaseEvent(),
      type: 'feedback',
      action,
      properties,
      feedbackId: properties.feedbackId,
      category: properties.category,
      sentiment: properties.sentiment
    };
    this.enqueueEvent(event);
  }

  private enqueueEvent(event: AnalyticsEvent) {
    this.eventQueue.push(event);
    
    if (this.eventQueue.length >= this.batchSize) {
      this.flush();
    }
  }

  private startBatchProcessing() {
    setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush() {
    if (this.eventQueue.length === 0 || !this.isOnline) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch('https://spubjrvuggyrozoawofp.supabase.co/functions/v1/analytics-api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdWJqcnZ1Z2d5cm96b2F3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzM1NTYsImV4cCI6MjA2NzIwOTU1Nn0.X4f0Ouq6evWVNwXBkTjnSXqHiwf7rc6LlgWN9HodCxM'}`,
        },
        body: JSON.stringify({ events: eventsToSend }),
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  // Convenience methods for common tracking scenarios
  trackPageView(page: string, properties: Record<string, any> = {}) {
    this.trackProductEvent('page_view', { page, ...properties });
  }

  trackFeatureUsage(feature: string, properties: Record<string, any> = {}) {
    this.trackProductEvent('feature_used', { feature, ...properties });
  }

  trackConversion(action: string, value?: number, properties: Record<string, any> = {}) {
    this.trackBusinessEvent('conversion', { action, value, ...properties });
  }

  trackActivationStep(step: string, properties: Record<string, any> = {}) {
    this.trackPLGEvent('activation_step', { step, ...properties });
  }
}

export const eventTracker = new EventTracker();
