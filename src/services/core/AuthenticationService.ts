
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

export interface AuthUser extends User {
  profile?: Profile;
  roles?: AppRole[];
}

export interface AuthSession extends Session {
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

class AuthenticationService {
  private currentSession: AuthSession | null = null;
  private sessionListeners: Array<(session: AuthSession | null) => void> = [];

  constructor() {
    this.initializeSession();
  }

  private async initializeSession() {
    // Set up auth state listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const authSession = await this.enrichSession(session as AuthSession);
        this.setSession(authSession);
      } else {
        this.clearSession();
      }
    });

    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const authSession = await this.enrichSession(session as AuthSession);
      this.setSession(authSession);
    }
  }

  private async enrichSession(session: Session): Promise<AuthSession> {
    const authSession = session as AuthSession;
    
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      // Fetch user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      authSession.user.profile = profile || undefined;
      authSession.user.roles = roles?.map(r => r.role) || [];
    } catch (error) {
      console.error('Failed to fetch user profile/roles:', error);
    }

    return authSession;
  }

  async login(credentials: LoginCredentials): Promise<{ data: AuthSession | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { data: null, error };
      }

      if (data.session) {
        const authSession = await this.enrichSession(data.session);
        return { data: authSession, error: null };
      }

      return { data: null, error: new Error('No session returned') };
    } catch (error) {
      return { data: null, error };
    }
  }

  async register(request: RegisterRequest): Promise<{ data: AuthSession | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: request.email,
        password: request.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: request.firstName,
            last_name: request.lastName,
          }
        }
      });

      if (error) {
        return { data: null, error };
      }

      if (data.session) {
        const authSession = await this.enrichSession(data.session);
        return { data: authSession, error: null };
      }

      return { data: null, error: null }; // User needs to confirm email
    } catch (error) {
      return { data: null, error };
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async refreshToken(): Promise<{ data: AuthSession | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        this.clearSession();
        return { data: null, error };
      }

      if (data.session) {
        const authSession = await this.enrichSession(data.session);
        return { data: authSession, error: null };
      }

      return { data: null, error: new Error('No session returned') };
    } catch (error) {
      this.clearSession();
      return { data: null, error };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentSession?.user || null;
  }

  async updateProfile(updates: Partial<Profile>): Promise<{ data: Profile | null; error: any }> {
    if (!this.currentSession?.user) {
      return { data: null, error: new Error('No user logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', this.currentSession.user.id)
        .select()
        .maybeSingle();

      if (error) {
        return { data: null, error };
      }

      // Update local session
      if (this.currentSession && data) {
        this.currentSession.user.profile = data;
        this.notifySessionChange(this.currentSession);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  hasRole(role: AppRole): boolean {
    return this.currentSession?.user.roles?.includes(role) || false;
  }

  isAuthenticated(): boolean {
    return !!this.currentSession && !!this.currentSession.user;
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
    this.notifySessionChange(session);
  }

  private clearSession() {
    this.currentSession = null;
    this.notifySessionChange(null);
  }

  private notifySessionChange(session: AuthSession | null) {
    this.sessionListeners.forEach(listener => listener(session));
  }
}

export const authenticationService = new AuthenticationService();
