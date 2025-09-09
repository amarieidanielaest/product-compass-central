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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email, password, first_name, last_name, company, job_title, token, invitation_token } = await req.json()
    console.log('Customer Auth called:', action)

    switch (action) {
      case 'register': {
        console.log('Registering customer user:', email)
        
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('customer_users')
          .select('*')
          .eq('email', email)
          .single()

        if (existingUser) {
          return new Response(
            JSON.stringify({ error: 'User already exists' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Create customer user using database function
        const { data: createResult, error: createError } = await supabase.rpc(
          'create_customer_user',
          {
            p_email: email,
            p_password: password, // In production, hash this password
            p_first_name: first_name,
            p_last_name: last_name,
            p_company: company,
            p_job_title: job_title
          }
        )

        if (createError) {
          console.error('Error creating customer user:', createError)
          return new Response(
            JSON.stringify({ error: createError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        if (createResult.error) {
          return new Response(
            JSON.stringify({ error: createResult.error }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({
            token: createResult.token,
            expires_at: createResult.expires_at
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'login': {
        console.log('Authenticating customer user:', email)
        
        // Authenticate customer user using database function
        const { data: authResult, error: authError } = await supabase.rpc(
          'authenticate_customer_user',
          {
            p_email: email,
            p_password: password
          }
        )

        if (authError) {
          console.error('Error authenticating customer user:', authError)
          return new Response(
            JSON.stringify({ error: authError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        if (authResult.error) {
          return new Response(
            JSON.stringify({ error: authResult.error }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({
            token: authResult.token,
            user: authResult.user,
            expires_at: authResult.expires_at
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'verify-token': {
        console.log('Verifying customer token')
        
        // Verify token using database function
        const { data: verifyResult, error: verifyError } = await supabase.rpc(
          'get_customer_user_by_token',
          { p_token: token }
        )

        if (verifyError) {
          console.error('Error verifying token:', verifyError)
          return new Response(
            JSON.stringify({ error: verifyError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        if (verifyResult.error) {
          return new Response(
            JSON.stringify({ valid: false, error: verifyResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({
            valid: true,
            user: verifyResult.user,
            expires_at: verifyResult.expires_at
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'logout': {
        console.log('Logging out customer user')
        
        // Delete session
        const { error: deleteError } = await supabase
          .from('customer_sessions')
          .delete()
          .eq('token', token)

        if (deleteError) {
          console.error('Error deleting session:', deleteError)
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'accept-invitation': {
        console.log('Accepting board invitation')
        
        // Get customer user ID from token first
        const { data: tokenResult } = await supabase.rpc(
          'get_customer_user_by_token',
          { p_token: token }
        )

        if (tokenResult?.error || !tokenResult?.user) {
          return new Response(
            JSON.stringify({ error: 'Invalid session' }),
            { 
              status: 401, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Accept invitation using database function
        const { data: acceptResult, error: acceptError } = await supabase.rpc(
          'accept_customer_board_invitation',
          {
            p_token: invitation_token,
            p_customer_user_id: tokenResult.user.id
          }
        )

        if (acceptError) {
          console.error('Error accepting invitation:', acceptError)
          return new Response(
            JSON.stringify({ error: acceptError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        if (acceptResult.error) {
          return new Response(
            JSON.stringify({ error: acceptResult.error }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            board_id: acceptResult.board_id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('Customer auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})