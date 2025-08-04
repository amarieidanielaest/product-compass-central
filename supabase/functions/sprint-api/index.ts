import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the request body for POST requests
    let body;
    let apiPath = '';
    
    if (req.method === 'POST') {
      body = await req.json();
      apiPath = body.path || '';
      console.log('Sprint API request:', body.method || req.method, apiPath);
    } else {
      const url = new URL(req.url);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      apiPath = pathSegments.slice(3).join('/');
      console.log('Sprint API request:', req.method, apiPath);
    }

    // Route handling - handle both direct GET and POST with method in body
    const method = body?.method || req.method;
    
    if (method === 'GET') {
      if (apiPath === 'teams') {
        const { data, error } = await supabase
          .from('teams_sprint')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      else if (apiPath.startsWith('teams/') && apiPath.endsWith('/projects')) {
        const teamId = apiPath.split('/')[1];
        const { data, error } = await supabase
          .from('projects_sprint')
          .select('*')
          .eq('team_id', teamId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      else if (apiPath.startsWith('projects/') && apiPath.endsWith('/sprints')) {
        const projectId = apiPath.split('/')[1];
        const { data, error } = await supabase
          .from('sprints_sprint')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      else if (apiPath.startsWith('sprints/') && !apiPath.includes('/')) {
        const sprintId = apiPath.split('/')[1];
        const { data, error } = await supabase
          .from('sprints_sprint')
          .select('*')
          .eq('id', sprintId)
          .single();

        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      else if (apiPath.startsWith('sprints/') && apiPath.endsWith('/work-items')) {
        const sprintId = apiPath.split('/')[1];
        const { data, error } = await supabase
          .from('work_items_sprint')
          .select('*')
          .eq('sprint_id', sprintId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      else if (apiPath.startsWith('sprints/') && apiPath.endsWith('/columns')) {
        const sprintId = apiPath.split('/')[1];
        const { data, error } = await supabase
          .from('workflow_columns_sprint')
          .select('*')
          .eq('sprint_id', sprintId)
          .order('position', { ascending: true });

        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    else if (method === 'POST' && !body?.method) {
      const requestBody = body || await req.json();
      
      if (apiPath === 'sprints') {
        const { data, error } = await supabase
          .from('sprints_sprint')
          .insert(requestBody)
          .select()
          .single();

        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      else if (apiPath === 'work-items') {
        const { data, error } = await supabase
          .from('work_items_sprint')
          .insert(requestBody)
          .select()
          .single();

        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    else if (method === 'PUT') {
      const requestBody = body?.data || body || await req.json();
      
      if (apiPath.startsWith('work-items/')) {
        const workItemId = apiPath.split('/')[1];
        const { data, error } = await supabase
          .from('work_items_sprint')
          .update(requestBody)
          .eq('id', workItemId)
          .select()
          .single();

        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      else if (apiPath.startsWith('sprints/')) {
        const sprintId = apiPath.split('/')[1];
        const { data, error } = await supabase
          .from('sprints_sprint')
          .update(requestBody)
          .eq('id', sprintId)
          .select()
          .single();

        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    else if (method === 'DELETE') {
      if (apiPath.startsWith('work-items/')) {
        const workItemId = apiPath.split('/')[1];
        const { error } = await supabase
          .from('work_items_sprint')
          .delete()
          .eq('id', workItemId);

        if (error) throw error;
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Default 404 response
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sprint-api function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Sprint API processing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});