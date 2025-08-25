import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  avatar_url?: string;
}

interface CustomerAuthContextType {
  user: CustomerUser | null;
  token: string | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, company?: string, jobTitle?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  acceptInvitation: (invitationToken: string) => Promise<{ error?: string }>;
  isAuthenticated: () => boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('customer_auth_token');
      
      if (storedToken) {
        try {
          const response = await supabase.functions.invoke('customer-auth', {
            body: {
              action: 'verify-token',
              token: storedToken,
            },
          });

          if (response.data && response.data.valid && response.data.user) {
            setUser(response.data.user);
            setToken(storedToken);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('customer_auth_token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('customer_auth_token');
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string, 
    company?: string, 
    jobTitle?: string
  ) => {
    try {
      const response = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'register',
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          company,
          job_title: jobTitle,
        },
      });

      if (response.error) {
        return { error: response.error.message };
      }

      if (response.data?.error) {
        return { error: response.data.error };
      }

      if (response.data?.token) {
        // Store token and get user info
        localStorage.setItem('customer_auth_token', response.data.token);
        setToken(response.data.token);

        // Verify token to get user data
        const verifyResponse = await supabase.functions.invoke('customer-auth', {
          body: {
            action: 'verify-token',
            token: response.data.token,
          },
        });

        if (verifyResponse.data?.user) {
          setUser(verifyResponse.data.user);
        }
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Registration failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'login',
          email,
          password,
        },
      });

      if (response.error) {
        return { error: response.error.message };
      }

      if (response.data?.error) {
        return { error: response.data.error };
      }

      if (response.data?.token && response.data?.user) {
        localStorage.setItem('customer_auth_token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  };

  const signOut = async () => {
    try {
      if (token) {
        await supabase.functions.invoke('customer-auth', {
          body: {
            action: 'logout',
            token,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('customer_auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const acceptInvitation = async (invitationToken: string) => {
    if (!token) {
      return { error: 'Not authenticated' };
    }

    try {
      const response = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'accept-invitation',
          invitation_token: invitationToken,
          token,
        },
      });

      if (response.error) {
        return { error: response.error.message };
      }

      if (response.data?.error) {
        return { error: response.data.error };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Failed to accept invitation' };
    }
  };

  const isAuthenticated = (): boolean => {
    return !!(user && token);
  };

  return (
    <CustomerAuthContext.Provider value={{
      user,
      token,
      loading,
      signUp,
      signIn,
      signOut,
      acceptInvitation,
      isAuthenticated,
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};