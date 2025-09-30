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
    const path = url.pathname.replace('/unified-data/', '');
    const body = req.method === 'POST' ? await req.json() : null;

    // Product Lifecycle Data
    if (path === 'product-lifecycle') {
      const [feedback, roadmap, sprints] = await Promise.all([
        supabase.from('feedback_items').select('*').limit(100),
        supabase.from('roadmap_items').select('*').limit(100),
        supabase.from('sprints_sprint').select('*, work_items(*)').limit(50)
      ]);

      const data = {
        feedback: feedback.data || [],
        roadmap: roadmap.data || [],
        sprints: sprints.data || [],
        lastUpdated: new Date().toISOString()
      };

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cross-Entity Relationships
    if (path === 'relationships') {
      const entityType = body?.entityType;
      const entityId = body?.entityId;

      if (!entityType || !entityId) {
        throw new Error('Missing entityType or entityId');
      }

      const relationships = [];
      
      if (entityType === 'feedback') {
        const { data } = await supabase
          .from('feedback_items')
          .select('*, roadmap_items(*)')
          .eq('id', entityId)
          .single();
        
        if (data?.roadmap_items) {
          relationships.push(...data.roadmap_items);
        }
      }

      return new Response(JSON.stringify(relationships), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analytics Aggregation
    if (path === 'analytics') {
      const metrics = body?.metrics || [];
      const timeRange = body?.timeRange || { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() };

      const results = {};
      
      for (const metric of metrics) {
        if (metric === 'feedback_velocity') {
          const { data } = await supabase
            .from('feedback_items')
            .select('created_at')
            .gte('created_at', timeRange.start);
          
          results[metric] = data?.length || 0;
        }
      }

      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
