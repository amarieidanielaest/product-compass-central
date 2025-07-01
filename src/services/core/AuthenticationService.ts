
import { BaseApiService, ApiResponse } from '../api/BaseApiService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'product_manager' | 'developer' | 'stakeholder';
  tier: 'starter' | 'professional' | 'enterprise';
  permissions: string[];
  organizationId: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

class AuthenticationService extends BaseApiService {
  private currentSession: AuthSession | null = null;
  private sessionListeners: Array<(session: AuthSession | null) => void> = [];

  constructor() {
    super('/api/auth');
    this.initializeSession();
  }

  private async initializeSession() {
    const storedSession = localStorage.getItem('auth_session');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        if (new Date(session.expiresAt) > new Date()) {
          this.currentSession = session;
          this.notifySessionChange(session);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('auth_session');
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthSession>> {
    const response = await this.makeRequest<AuthSession>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      this.setSession(response.data);
    }

    return response;
  }

  async register(request: RegisterRequest): Promise<ApiResponse<AuthSession>> {
    const response = await this.makeRequest<AuthSession>('/register', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (response.success) {
      this.setSession(response.data);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearSession();
    }
  }

  async refreshToken(): Promise<ApiResponse<AuthSession>> {
    if (!this.currentSession?.refreshToken) {
      return { success: false, data: null as any, message: 'No refresh token available' };
    }

    const response = await this.makeRequest<AuthSession>('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.currentSession.refreshToken }),
    });

    if (response.success) {
      this.setSession(response.data);
    } else {
      this.clearSession();
    }

    return response;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentSession?.user || null;
  }

  async updateProfile(updates: Partial<Pick<User, 'name' | 'email'>>): Promise<ApiResponse<User>> {
    const response = await this.makeRequest<User>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (response.success && this.currentSession) {
      this.currentSession.user = { ...this.currentSession.user, ...response.data };
      this.persistSession();
      this.notifySessionChange(this.currentSession);
    }

    return response;
  }

  hasPermission(permission: string): boolean {
    return this.currentSession?.user.permissions.includes(permission) || false;
  }

  hasRole(role: User['role']): boolean {
    return this.currentSession?.user.role === role;
  }

  isAuthenticated(): boolean {
    return !!this.currentSession && new Date(this.currentSession.expiresAt) > new Date();
  }

  onSessionChange(callback: (session: AuthSession | null) => void): () => void {
    this.sessionListeners.push(callback);
    callback(this.currentSession); // Call immediately with current session

    // Return unsubscribe function
    return () => {
      this.sessionListeners = this.sessionListeners.filter(listener => listener !== callback);
    };
  }

  private setSession(session: AuthSession) {
    this.currentSession = session;
    this.persistSession();
    this.notifySessionChange(session);
  }

  private clearSession() {
    this.currentSession = null;
    localStorage.removeItem('auth_session');
    this.notifySessionChange(null);
  }

  private persistSession() {
    if (this.currentSession) {
      localStorage.setItem('auth_session', JSON.stringify(this.currentSession));
    }
  }

  private notifySessionChange(session: AuthSession | null) {
    this.sessionListeners.forEach(listener => listener(session));
  }
}

export const authenticationService = new AuthenticationService();
