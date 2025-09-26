import { authenticationService, AuthUser, AuthSession } from './AuthenticationService';
import { serviceRegistry } from '../ServiceRegistry';

export interface AuthEventHandler {
  onLogin?: (user: AuthUser, session: AuthSession) => Promise<void>;
  onLogout?: (user: AuthUser) => Promise<void>;
  onSessionRefresh?: (session: AuthSession) => Promise<void>;
  onProfileUpdate?: (user: AuthUser) => Promise<void>;
}

export interface SecurityPolicy {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  sessionPolicy: {
    maxDuration: number; // seconds
    requireRefresh: boolean;
    multiSessionAllowed: boolean;
  };
  mfaPolicy: {
    enabled: boolean;
    required: boolean;
    methods: ('totp' | 'sms' | 'email')[];
  };
}

class EnhancedAuthenticationService {
  private eventHandlers: AuthEventHandler[] = [];
  private securityPolicy: SecurityPolicy;

  constructor() {
    this.securityPolicy = this.getDefaultSecurityPolicy();
    this.setupEventListeners();
  }

  async authenticateWithEnhancements(email: string, password: string): Promise<{ 
    success: boolean; 
    session?: AuthSession; 
    requiresMFA?: boolean;
    error?: string;
  }> {
    try {
      // Validate password against policy
      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      // Attempt authentication
      const result = await authenticationService.login({ email, password });
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }

      if (result.data) {
        // Check if MFA is required
        const requiresMFA = await this.checkMFARequirement(result.data.user);
        
        if (requiresMFA) {
          return { success: false, requiresMFA: true };
        }

        // Execute login event handlers
        await this.executeEventHandlers('onLogin', result.data.user, result.data);

        return { success: true, session: result.data };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async enhancedLogout(): Promise<void> {
    const user = await authenticationService.getCurrentUser();
    
    if (user) {
      await this.executeEventHandlers('onLogout', user);
    }

    await authenticationService.logout();
  }

  async updateSecurityPolicy(policy: Partial<SecurityPolicy>): Promise<void> {
    this.securityPolicy = {
      ...this.securityPolicy,
      ...policy,
      passwordPolicy: { ...this.securityPolicy.passwordPolicy, ...policy.passwordPolicy },
      sessionPolicy: { ...this.securityPolicy.sessionPolicy, ...policy.sessionPolicy },
      mfaPolicy: { ...this.securityPolicy.mfaPolicy, ...policy.mfaPolicy }
    };

    // Notify all active sessions of policy changes
    await this.notifyPolicyChange();
  }

  validatePassword(password: string): { valid: boolean; message?: string } {
    const { passwordPolicy } = this.securityPolicy;

    if (password.length < passwordPolicy.minLength) {
      return { valid: false, message: `Password must be at least ${passwordPolicy.minLength} characters long` };
    }

    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }

    if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }

    return { valid: true };
  }

  registerEventHandler(handler: AuthEventHandler): () => void {
    this.eventHandlers.push(handler);
    
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
    };
  }

  async getUserPermissions(userId: string): Promise<{
    roles: string[];
    permissions: string[];
    organizationAccess: Array<{ orgId: string; role: string }>;
    boardAccess: Array<{ boardId: string; role: string }>;
  }> {
    // This would integrate with the role system
    const user = await authenticationService.getCurrentUser();
    
    if (!user || user.id !== userId) {
      throw new Error('Unauthorized access to user permissions');
    }

    return {
      roles: user.roles || [],
      permissions: this.calculatePermissions(user.roles || []),
      organizationAccess: await this.getUserOrganizationAccess(userId),
      boardAccess: await this.getUserBoardAccess(userId)
    };
  }

  async checkPermission(permission: string): Promise<boolean> {
    const user = await authenticationService.getCurrentUser();
    if (!user) return false;

    const userPermissions = await this.getUserPermissions(user.id);
    return userPermissions.permissions.includes(permission);
  }

  getSecurityPolicy(): SecurityPolicy {
    return this.securityPolicy;
  }

  private getDefaultSecurityPolicy(): SecurityPolicy {
    return {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
      },
      sessionPolicy: {
        maxDuration: 24 * 60 * 60, // 24 hours
        requireRefresh: true,
        multiSessionAllowed: true
      },
      mfaPolicy: {
        enabled: false,
        required: false,
        methods: ['totp']
      }
    };
  }

  private setupEventListeners(): void {
    // Listen to session changes from the base authentication service
    authenticationService.onSessionChange((session) => {
      if (session) {
        this.executeEventHandlers('onSessionRefresh', session.user, session);
      }
    });
  }

  private async executeEventHandlers(
    event: keyof AuthEventHandler,
    ...args: any[]
  ): Promise<void> {
    const promises = this.eventHandlers
      .filter(handler => handler[event])
      .map(handler => {
        try {
          return (handler[event] as any)(...args);
        } catch (error) {
          console.error(`Error in auth event handler for ${event}:`, error);
          return Promise.resolve();
        }
      });

    await Promise.allSettled(promises);
  }

  private async checkMFARequirement(user: AuthUser): Promise<boolean> {
    if (!this.securityPolicy.mfaPolicy.enabled) {
      return false;
    }

    // Check if user has MFA enabled or if it's required by policy
    return this.securityPolicy.mfaPolicy.required;
  }

  private calculatePermissions(roles: string[]): string[] {
    const rolePermissions: Record<string, string[]> = {
      'admin': ['*'], // All permissions
      'product_manager': [
        'roadmap.read', 'roadmap.write', 'roadmap.delete',
        'feedback.read', 'feedback.write', 'feedback.moderate',
        'strategy.read', 'strategy.write',
        'analytics.read'
      ],
      'developer': [
        'roadmap.read', 'feedback.read', 'sprint.read', 'sprint.write'
      ],
      'viewer': [
        'roadmap.read', 'feedback.read', 'analytics.read'
      ]
    };

    const permissions = new Set<string>();
    
    for (const role of roles) {
      const rolePerms = rolePermissions[role] || [];
      rolePerms.forEach(perm => permissions.add(perm));
    }

    return Array.from(permissions);
  }

  private async getUserOrganizationAccess(userId: string): Promise<Array<{ orgId: string; role: string }>> {
    // This would query the organization memberships table
    // For now, return empty array
    return [];
  }

  private async getUserBoardAccess(userId: string): Promise<Array<{ boardId: string; role: string }>> {
    // This would query the board memberships table
    // For now, return empty array
    return [];
  }

  private async notifyPolicyChange(): Promise<void> {
    // Notify all connected clients about policy changes
    // This could use real-time subscriptions or push notifications
    console.log('Security policy updated');
  }
}

export const enhancedAuthenticationService = new EnhancedAuthenticationService();