
import { BaseApiService, ApiResponse } from '../api/BaseApiService';

export interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  service: string;
  version: string;
  rateLimit?: {
    requests: number;
    window: number; // seconds
  };
  authentication: 'none' | 'bearer' | 'api-key';
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

export interface APIRequest {
  id: string;
  endpoint: APIEndpoint;
  payload?: any;
  headers?: Record<string, string>;
  timestamp: string;
  userId?: string;
}

export interface APIResponse<T = any> {
  requestId: string;
  status: number;
  data: T;
  headers: Record<string, string>;
  duration: number;
  cached: boolean;
  retryCount: number;
}

export interface CircuitBreakerState {
  service: string;
  status: 'closed' | 'open' | 'half-open';
  failures: number;
  nextRetryAt?: string;
}

class APIOrchestrationService extends BaseApiService {
  private endpoints: Map<string, APIEndpoint> = new Map();
  private requestQueue: APIRequest[] = [];
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private rateLimiters: Map<string, { count: number; resetAt: number }> = new Map();
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();

  constructor() {
    super('/api/orchestration');
    this.initializeEndpoints();
    this.startRequestProcessor();
  }

  async registerEndpoint(endpoint: APIEndpoint): Promise<void> {
    this.endpoints.set(endpoint.id, endpoint);
    
    // Initialize circuit breaker for the service
    if (!this.circuitBreakers.has(endpoint.service)) {
      this.circuitBreakers.set(endpoint.service, {
        service: endpoint.service,
        status: 'closed',
        failures: 0
      });
    }
  }

  async executeRequest<T>(
    endpointId: string,
    payload?: any,
    options: {
      priority?: 'low' | 'normal' | 'high';
      timeout?: number;
      bypassCache?: boolean;
      headers?: Record<string, string>;
    } = {}
  ): Promise<APIResponse<T>> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointId} not found`);
    }

    // Check circuit breaker
    const circuitBreaker = this.circuitBreakers.get(endpoint.service);
    if (circuitBreaker?.status === 'open') {
      throw new Error(`Circuit breaker open for service ${endpoint.service}`);
    }

    // Check rate limiting
    if (endpoint.rateLimit && !this.checkRateLimit(endpointId, endpoint.rateLimit)) {
      throw new Error(`Rate limit exceeded for endpoint ${endpointId}`);
    }

    // Check cache
    const cacheKey = this.generateCacheKey(endpoint, payload);
    if (!options.bypassCache && endpoint.method === 'GET') {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return {
          requestId: `cached_${Date.now()}`,
          status: 200,
          data: cached.data,
          headers: {},
          duration: 0,
          cached: true,
          retryCount: 0
        };
      }
    }

    // Create request
    const request: APIRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      payload,
      headers: options.headers || {},
      timestamp: new Date().toISOString(),
    };

    // Execute request with retry logic
    return this.executeWithRetry(request, options);
  }

  async batchExecute<T>(
    requests: Array<{
      endpointId: string;
      payload?: any;
      headers?: Record<string, string>;
    }>,
    options: {
      maxConcurrency?: number;
      failFast?: boolean;
    } = {}
  ): Promise<Array<APIResponse<T> | Error>> {
    const { maxConcurrency = 5, failFast = false } = options;
    const results: Array<APIResponse<T> | Error> = [];
    
    // Process requests in batches
    for (let i = 0; i < requests.length; i += maxConcurrency) {
      const batch = requests.slice(i, i + maxConcurrency);
      
      const batchPromises = batch.map(async (req) => {
        try {
          return await this.executeRequest<T>(req.endpointId, req.payload, { headers: req.headers });
        } catch (error) {
          if (failFast) throw error;
          return error as Error;
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push(result.reason);
          if (failFast) break;
        }
      }

      if (failFast && results.some(r => r instanceof Error)) {
        break;
      }
    }

    return results;
  }

  async getServiceHealth(): Promise<Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy';
    circuitBreaker: CircuitBreakerState;
    responseTime: number;
    errorRate: number;
  }>> {
    const health: Record<string, any> = {};
    
    for (const [service, circuitBreaker] of this.circuitBreakers) {
      health[service] = {
        status: this.determineServiceHealth(circuitBreaker),
        circuitBreaker,
        responseTime: await this.getAverageResponseTime(service),
        errorRate: await this.getErrorRate(service)
      };
    }

    return health;
  }

  private async executeWithRetry<T>(
    request: APIRequest,
    options: { timeout?: number } = {}
  ): Promise<APIResponse<T>> {
    const maxRetries = request.endpoint.retryPolicy?.maxRetries || 3;
    const backoffMultiplier = request.endpoint.retryPolicy?.backoffMultiplier || 2;
    
    let lastError: Error;
    let retryCount = 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        
        // Make the actual HTTP request
        const response = await this.makeRequest<T>(
          `${request.endpoint.service}${request.endpoint.path}`,
          {
            method: request.endpoint.method,
            body: request.payload ? JSON.stringify(request.payload) : undefined,
            headers: request.headers,
            signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined,
          }
        );

        const duration = Date.now() - startTime;

        // Update circuit breaker on success
        this.updateCircuitBreaker(request.endpoint.service, true);

        // Cache GET responses
        if (request.endpoint.method === 'GET' && response.success) {
          const cacheKey = this.generateCacheKey(request.endpoint, request.payload);
          this.cache.set(cacheKey, {
            data: response.data,
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
          });
        }

        return {
          requestId: request.id,
          status: response.success ? 200 : 500,
          data: response.data,
          headers: {},
          duration,
          cached: false,
          retryCount
        };

      } catch (error) {
        lastError = error as Error;
        retryCount++;
        
        // Update circuit breaker on failure
        this.updateCircuitBreaker(request.endpoint.service, false);

        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const delay = Math.pow(backoffMultiplier, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private checkRateLimit(endpointId: string, rateLimit: { requests: number; window: number }): boolean {
    const now = Date.now();
    const limiter = this.rateLimiters.get(endpointId);
    
    if (!limiter || limiter.resetAt < now) {
      this.rateLimiters.set(endpointId, {
        count: 1,
        resetAt: now + (rateLimit.window * 1000)
      });
      return true;
    }

    if (limiter.count >= rateLimit.requests) {
      return false;
    }

    limiter.count++;
    return true;
  }

  private updateCircuitBreaker(service: string, success: boolean): void {
    const circuitBreaker = this.circuitBreakers.get(service);
    if (!circuitBreaker) return;

    if (success) {
      circuitBreaker.failures = 0;
      if (circuitBreaker.status === 'half-open') {
        circuitBreaker.status = 'closed';
      }
    } else {
      circuitBreaker.failures++;
      
      if (circuitBreaker.failures >= 5) {
        circuitBreaker.status = 'open';
        circuitBreaker.nextRetryAt = new Date(Date.now() + 60000).toISOString(); // 1 minute
      }
    }
  }

  private generateCacheKey(endpoint: APIEndpoint, payload?: any): string {
    const payloadHash = payload ? JSON.stringify(payload) : '';
    return `${endpoint.id}_${payloadHash}`;
  }

  private determineServiceHealth(circuitBreaker: CircuitBreakerState): 'healthy' | 'degraded' | 'unhealthy' {
    if (circuitBreaker.status === 'open') return 'unhealthy';
    if (circuitBreaker.failures > 2) return 'degraded';
    return 'healthy';
  }

  private async getAverageResponseTime(service: string): Promise<number> {
    // Mock implementation - would calculate from metrics
    return Math.random() * 500 + 100;
  }

  private async getErrorRate(service: string): Promise<number> {
    // Mock implementation - would calculate from metrics
    return Math.random() * 0.1;
  }

  private async initializeEndpoints(): Promise<void> {
    // Register core endpoints
    const coreEndpoints: APIEndpoint[] = [
      {
        id: 'user-metrics',
        name: 'Get User Metrics',
        method: 'GET',
        path: '/users/metrics',
        service: 'analytics',
        version: 'v1',
        authentication: 'bearer',
        rateLimit: { requests: 100, window: 60 }
      },
      {
        id: 'create-feedback',
        name: 'Create Feedback',
        method: 'POST',
        path: '/feedback',
        service: 'feedback',
        version: 'v1',
        authentication: 'bearer',
        retryPolicy: { maxRetries: 3, backoffMultiplier: 2 }
      }
    ];

    for (const endpoint of coreEndpoints) {
      await this.registerEndpoint(endpoint);
    }
  }

  private startRequestProcessor(): void {
    // Process queued requests periodically
    setInterval(() => {
      if (this.requestQueue.length > 0) {
        // Process high priority requests first
        this.requestQueue.sort((a, b) => {
          // Mock priority sorting - would be based on actual priority
          return 0;
        });
      }
    }, 1000);
  }
}

export const apiOrchestrationService = new APIOrchestrationService();
