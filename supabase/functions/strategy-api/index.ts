import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/strategy-api/', '');
    const method = req.method;

    // Strategic Roadmap
    if (path.startsWith('roadmap')) {
      if (method === 'GET') {
        const { data, error } = await supabase
          .from('roadmap_items')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (method === 'POST') {
        const body = await req.json();
        const { data, error } = await supabase
          .from('roadmap_items')
          .insert([{ ...body, author_id: user.id }])
          .select()
          .single();
        
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // OKR Management
    if (path.startsWith('okrs')) {
      if (method === 'GET') {
        const { data, error } = await supabase
          .from('okrs')
          .select('*, key_results(*)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Portfolio Management
    if (path.startsWith('portfolio')) {
      if (method === 'GET' && path === 'portfolio/health') {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*');
        
        if (error) throw error;
        
        const health = {
          overall: 85,
          projects: projects?.length || 0,
          risks: [],
          opportunities: []
        };
        
        return new Response(JSON.stringify(health), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
