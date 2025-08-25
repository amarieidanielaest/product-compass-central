import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CustomerUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  avatar_url?: string;
}

interface CustomerSession {
  user: CustomerUser;
  token: string;
  expires_at: string;
}

interface AuthRequest {
  action: 'register' | 'login' | 'verify-token' | 'logout' | 'accept-invitation';
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  token?: string;
  invitation_token?: string;
}

const logStep = (step: string, details?: any) => {
  console.log(`[Customer Auth] ${step}`, details ? JSON.stringify(details) : '');
};

// Simple password hashing (in production, use bcrypt)
const hashPassword = (password: string): string => {
  // This is a simple hash for demo purposes - use proper hashing in production
  return btoa(password + 'salt123');
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: AuthRequest = await req.json();
    logStep('Customer auth request', { action: body.action, email: body.email });

    switch (body.action) {
      case 'register': {
        const { email, password, first_name, last_name, company, job_title } = body;
        
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Hash password
        const passwordHash = hashPassword(password);

        // Call database function to create user
        const { data, error } = await supabase.rpc('create_customer_user', {
          p_email: email,
          p_password: passwordHash,
          p_first_name: first_name || null,
          p_last_name: last_name || null,
          p_company: company || null,
          p_job_title: job_title || null,
        });

        if (error) {
          logStep('Registration error', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (data.error) {
          return new Response(
            JSON.stringify({ error: data.error }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        logStep('User registered successfully', { user_id: data.user_id });

        return new Response(
          JSON.stringify({
            user_id: data.user_id,
            token: data.token,
            expires_at: data.expires_at,
            message: 'Account created successfully'
          }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'login': {
        const { email, password } = body;
        
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Hash password for comparison
        const passwordHash = hashPassword(password);

        // Call database function to authenticate
        const { data, error } = await supabase.rpc('authenticate_customer_user', {
          p_email: email,
          p_password: passwordHash
        });

        if (error) {
          logStep('Login error', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (data.error) {
          return new Response(
            JSON.stringify({ error: data.error }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        logStep('User logged in successfully', { email });

        return new Response(
          JSON.stringify({
            user: data.user,
            token: data.token,
            expires_at: data.expires_at,
            message: 'Login successful'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'verify-token': {
        const { token } = body;
        
        if (!token) {
          return new Response(
            JSON.stringify({ error: 'Token is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Call database function to verify token
        const { data, error } = await supabase.rpc('get_customer_user_by_token', {
          p_token: token
        });

        if (error) {
          logStep('Token verification error', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (data.error) {
          return new Response(
            JSON.stringify({ error: data.error }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            user: data.user,
            expires_at: data.expires_at,
            valid: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'logout': {
        const { token } = body;
        
        if (!token) {
          return new Response(
            JSON.stringify({ error: 'Token is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete session from database
        const { error } = await supabase
          .from('customer_sessions')
          .delete()
          .eq('token', token);

        if (error) {
          logStep('Logout error', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        logStep('User logged out successfully');

        return new Response(
          JSON.stringify({ message: 'Logout successful' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'accept-invitation': {
        const { invitation_token, token } = body;
        
        if (!invitation_token || !token) {
          return new Response(
            JSON.stringify({ error: 'Invitation token and user token are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // First verify the user token to get customer user ID
        const { data: userData, error: userError } = await supabase.rpc('get_customer_user_by_token', {
          p_token: token
        });

        if (userError || userData.error) {
          return new Response(
            JSON.stringify({ error: 'Invalid user token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Accept the invitation
        const { data, error } = await supabase.rpc('accept_customer_board_invitation', {
          p_token: invitation_token,
          p_customer_user_id: userData.user.id
        });

        if (error) {
          logStep('Accept invitation error', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (data.error) {
          return new Response(
            JSON.stringify({ error: data.error }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        logStep('Invitation accepted successfully', { board_id: data.board_id });

        return new Response(
          JSON.stringify({
            board_id: data.board_id,
            message: 'Invitation accepted successfully'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: any) {
    logStep('Customer auth error', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);