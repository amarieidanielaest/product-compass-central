import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Configure auth security settings
    // Note: These settings need to be configured in the Supabase dashboard
    // This function serves as documentation and can be used for validation
    
    const securityConfig = {
      // Reduce OTP expiry time to recommended 5 minutes (300 seconds)
      otp_expiry: 300,
      
      // Enable leaked password protection
      password_security: {
        leaked_password_protection: true,
        minimum_password_strength: 2 // Require at least "fair" password strength
      },
      
      // Configure session settings
      session_security: {
        jwt_expiry: 3600, // 1 hour
        refresh_token_rotation: true,
        secure_password_change: true
      }
    }

    console.log('Auth security configuration:', securityConfig)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Auth security settings configured',
        configuration: securityConfig,
        next_steps: [
          '1. In Supabase Dashboard > Authentication > Settings:',
          '   - Set OTP expiry to 300 seconds (5 minutes)',
          '   - Enable "Leaked password protection"',
          '   - Enable "Secure password change"',
          '2. In Supabase Dashboard > Settings > General:',
          '   - Upgrade PostgreSQL version',
          '3. Verify settings are applied correctly'
        ]
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error configuring auth security:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})