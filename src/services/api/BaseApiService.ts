
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export abstract class BaseApiService {
  protected baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Get Supabase auth header if making request to Supabase functions
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      // Add Supabase auth for edge function calls
      if (this.baseUrl.includes('supabase.co/functions')) {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        } else {
          // Use anon key as fallback
          headers['Authorization'] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdWJqcnZ1Z2d5cm96b2F3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzM1NTYsImV4cCI6MjA2NzIwOTU1Nn0.X4f0Ouq6evWVNwXBkTjnSXqHiwf7rc6LlgWN9HodCxM`;
        }
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      return {
        data,
        success: response.ok,
        message: data.message,
        errors: data.errors,
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Network error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}
