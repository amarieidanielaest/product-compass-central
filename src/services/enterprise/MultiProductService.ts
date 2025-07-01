
import { BaseApiService, ApiResponse } from '../api/BaseApiService';

export interface Product {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'beta' | 'sunset' | 'archived';
  tier: 'starter' | 'professional' | 'enterprise';
  deploymentModel: 'saas' | 'on-premise' | 'hybrid';
  organizationId: string;
  configuration: {
    environments: Array<{
      name: string;
      type: 'development' | 'staging' | 'production';
      url?: string;
      healthCheckUrl?: string;
    }>;
    integrations: Record<string, any>;
    customFields: Array<{
      name: string;
      type: 'text' | 'number' | 'boolean' | 'select';
      required: boolean;
      options?: string[];
    }>;
  };
  metrics: {
    totalUsers: number;
    activeUsers: number;
    revenue: number;
    healthScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductPortfolio {
  id: string;
  name: string;
  description: string;
  products: Product[];
  strategy: {
    vision: string;
    objectives: Array<{
      id: string;
      title: string;
      description: string;
      keyResults: Array<{
        id: string;
        description: string;
        target: number;
        current: number;
        unit: string;
      }>;
    }>;
  };
  dependencies: Array<{
    sourceProductId: string;
    targetProductId: string;
    type: 'integration' | 'data-dependency' | 'shared-resource';
    description: string;
  }>;
  rollupMetrics: {
    totalRevenue: number;
    totalUsers: number;
    portfolioHealthScore: number;
    strategicAlignment: number;
  };
}

export interface DeploymentEnvironment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production';
  productId: string;
  configuration: {
    url?: string;
    healthCheckUrl?: string;
    version: string;
    featureFlags: Record<string, boolean>;
    integrations: Record<string, any>;
  };
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    lastDeployment: string;
  };
}

class MultiProductService extends BaseApiService {
  constructor() {
    super('/api/enterprise/products');
  }

  // Product Management
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.makeRequest<Product[]>('/');
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/${id}`);
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>('/', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async archiveProduct(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/${id}/archive`, {
      method: 'POST',
    });
  }

  // Portfolio Management
  async getPortfolios(): Promise<ApiResponse<ProductPortfolio[]>> {
    return this.makeRequest<ProductPortfolio[]>('/portfolios');
  }

  async createPortfolio(portfolio: Omit<ProductPortfolio, 'id' | 'rollupMetrics'>): Promise<ApiResponse<ProductPortfolio>> {
    return this.makeRequest<ProductPortfolio>('/portfolios', {
      method: 'POST',
      body: JSON.stringify(portfolio),
    });
  }

  async updatePortfolio(id: string, updates: Partial<ProductPortfolio>): Promise<ApiResponse<ProductPortfolio>> {
    return this.makeRequest<ProductPortfolio>(`/portfolios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async addProductToPortfolio(portfolioId: string, productId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/portfolios/${portfolioId}/products`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  // Environment Management
  async getEnvironments(productId: string): Promise<ApiResponse<DeploymentEnvironment[]>> {
    return this.makeRequest<DeploymentEnvironment[]>(`/${productId}/environments`);
  }

  async createEnvironment(productId: string, environment: Omit<DeploymentEnvironment, 'id' | 'productId' | 'metrics'>): Promise<ApiResponse<DeploymentEnvironment>> {
    return this.makeRequest<DeploymentEnvironment>(`/${productId}/environments`, {
      method: 'POST',
      body: JSON.stringify(environment),
    });
  }

  async updateEnvironment(productId: string, environmentId: string, updates: Partial<DeploymentEnvironment>): Promise<ApiResponse<DeploymentEnvironment>> {
    return this.makeRequest<DeploymentEnvironment>(`/${productId}/environments/${environmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deployToEnvironment(productId: string, environmentId: string, deployment: {
    version: string;
    featureFlags?: Record<string, boolean>;
    rollbackOnFailure?: boolean;
  }): Promise<ApiResponse<{ deploymentId: string; status: string }>> {
    return this.makeRequest(`/${productId}/environments/${environmentId}/deploy`, {
      method: 'POST',
      body: JSON.stringify(deployment),
    });
  }

  // Cross-Product Dependencies
  async getDependencies(productId?: string): Promise<ApiResponse<ProductPortfolio['dependencies']>> {
    const queryParams = productId ? `?productId=${productId}` : '';
    return this.makeRequest(`/dependencies${queryParams}`);
  }

  async createDependency(dependency: Omit<ProductPortfolio['dependencies'][0], 'id'>): Promise<ApiResponse<ProductPortfolio['dependencies'][0]>> {
    return this.makeRequest('/dependencies', {
      method: 'POST',
      body: JSON.stringify(dependency),
    });
  }

  // Health Monitoring
  async getProductHealth(productId: string): Promise<ApiResponse<{
    overall: number;
    technical: {
      uptime: number;
      performance: number;
      errors: number;
    };
    business: {
      userGrowth: number;
      revenue: number;
      satisfaction: number;
    };
    strategic: {
      okrProgress: number;
      roadmapAlignment: number;
      marketPosition: number;
    };
  }>> {
    return this.makeRequest(`/${productId}/health`);
  }

  async getPortfolioHealth(): Promise<ApiResponse<{
    portfolios: Array<{
      id: string;
      name: string;
      healthScore: number;
      risks: Array<{
        severity: 'low' | 'medium' | 'high';
        description: string;
        recommendation: string;
      }>;
    }>;
    crossProductRisks: Array<{
      severity: 'low' | 'medium' | 'high';
      description: string;
      affectedProducts: string[];
      recommendation: string;
    }>;
  }>> {
    return this.makeRequest('/portfolio-health');
  }
}

export const multiProductService = new MultiProductService();
