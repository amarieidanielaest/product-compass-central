
import { BaseApiService, ApiResponse } from '../api/BaseApiService';
import { authenticationService } from '../core/AuthenticationService';

export interface SecurityPolicy {
  id: string;
  name: string;
  type: 'ip-whitelist' | 'sso-enforcement' | 'mfa-requirement' | 'session-timeout' | 'data-residency';
  enabled: boolean;
  configuration: Record<string, any>;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPWhitelistEntry {
  id: string;
  ipAddress: string;
  description: string;
  enabled: boolean;
}

export interface SSOConfiguration {
  provider: 'okta' | 'azure-ad' | 'google-workspace' | 'onelogin';
  clientId: string;
  domain: string;
  enforceForAllUsers: boolean;
  allowedDomains: string[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'soc2' | 'hipaa' | 'custom';
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    dataProcessingActivities: number;
    userAccessReviews: number;
    securityIncidents: number;
    policyViolations: number;
  };
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
}

class EnterpriseSecurityService extends BaseApiService {
  constructor() {
    super('/api/enterprise/security');
  }

  // Security Policies
  async getSecurityPolicies(): Promise<ApiResponse<SecurityPolicy[]>> {
    return this.makeRequest<SecurityPolicy[]>('/policies');
  }

  async createSecurityPolicy(policy: Omit<SecurityPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SecurityPolicy>> {
    return this.makeRequest<SecurityPolicy>('/policies', {
      method: 'POST',
      body: JSON.stringify(policy),
    });
  }

  async updateSecurityPolicy(id: string, updates: Partial<SecurityPolicy>): Promise<ApiResponse<SecurityPolicy>> {
    return this.makeRequest<SecurityPolicy>(`/policies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // IP Whitelisting
  async getIPWhitelist(): Promise<ApiResponse<IPWhitelistEntry[]>> {
    return this.makeRequest<IPWhitelistEntry[]>('/ip-whitelist');
  }

  async addIPToWhitelist(entry: Omit<IPWhitelistEntry, 'id'>): Promise<ApiResponse<IPWhitelistEntry>> {
    return this.makeRequest<IPWhitelistEntry>('/ip-whitelist', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async removeIPFromWhitelist(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/ip-whitelist/${id}`, {
      method: 'DELETE',
    });
  }

  // SSO Configuration
  async getSSOConfiguration(): Promise<ApiResponse<SSOConfiguration | null>> {
    return this.makeRequest<SSOConfiguration | null>('/sso');
  }

  async configurSSO(config: SSOConfiguration): Promise<ApiResponse<SSOConfiguration>> {
    return this.makeRequest<SSOConfiguration>('/sso', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Audit Logging
  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<AuditLogEntry[]>> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });

    return this.makeRequest<AuditLogEntry[]>(`/audit-logs?${queryParams}`);
  }

  async logAction(action: {
    action: string;
    resource: string;
    resourceId: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const user = await authenticationService.getCurrentUser();
    if (!user) return;

    await this.makeRequest('/audit-logs', {
      method: 'POST',
      body: JSON.stringify({
        ...action,
        userId: user.id,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  // Compliance & Reporting
  async generateComplianceReport(type: ComplianceReport['type'], period: ComplianceReport['period']): Promise<ApiResponse<ComplianceReport>> {
    return this.makeRequest<ComplianceReport>('/compliance/reports', {
      method: 'POST',
      body: JSON.stringify({ type, period }),
    });
  }

  async getComplianceReports(): Promise<ApiResponse<ComplianceReport[]>> {
    return this.makeRequest<ComplianceReport[]>('/compliance/reports');
  }

  // Data Residency
  async getDataResidencySettings(): Promise<ApiResponse<{
    region: 'us' | 'eu' | 'apac';
    enforcedAt: string;
    migrationStatus?: 'pending' | 'in-progress' | 'completed';
  }>> {
    return this.makeRequest('/data-residency');
  }

  async setDataResidency(region: 'us' | 'eu' | 'apac'): Promise<ApiResponse<void>> {
    return this.makeRequest('/data-residency', {
      method: 'POST',
      body: JSON.stringify({ region }),
    });
  }

  // Session Management
  async getActiveSessions(userId?: string): Promise<ApiResponse<Array<{
    id: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    lastActivity: string;
    expiresAt: string;
  }>>> {
    const queryParams = userId ? `?userId=${userId}` : '';
    return this.makeRequest(`/sessions${queryParams}`);
  }

  async terminateSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async terminateAllUserSessions(userId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/sessions/user/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const enterpriseSecurityService = new EnterpriseSecurityService();
