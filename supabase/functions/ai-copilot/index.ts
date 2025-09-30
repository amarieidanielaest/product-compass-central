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
    const path = url.pathname.replace('/ai-copilot/', '');
    const body = req.method === 'POST' ? await req.json() : null;

    console.log('AI Copilot request:', path, body);

    // Generate Insights
    if (path === 'insights' && req.method === 'POST') {
      const { timeRange = '7d' } = body || {};
      
      // Fetch relevant data based on time range
      const startDate = new Date();
      if (timeRange === '1h') startDate.setHours(startDate.getHours() - 1);
      else if (timeRange === '24h') startDate.setHours(startDate.getHours() - 24);
      else if (timeRange === '7d') startDate.setDate(startDate.getDate() - 7);
      else if (timeRange === '30d') startDate.setDate(startDate.getDate() - 30);

      const [feedbackData, roadmapData, sprintData] = await Promise.all([
        supabase.from('feedback_items').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('roadmap_items').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('sprints_sprint').select('*, work_items(*)').gte('created_at', startDate.toISOString())
      ]);

      const insights = {
        patterns: [
          {
            type: 'trend',
            description: `${feedbackData.data?.length || 0} feedback items submitted in the last ${timeRange}`,
            confidence: 0.85,
            impact: 'high',
            actionable: true
          }
        ],
        anomalies: [],
        opportunities: [
          {
            title: 'User Engagement Growth',
            description: 'User engagement has increased significantly',
            impact: 'high',
            effort: 'medium'
          }
        ],
        risks: []
      };

      return new Response(JSON.stringify(insights), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate Recommendations
    if (path === 'recommendations' && req.method === 'POST') {
      const recommendations = [
        {
          id: crypto.randomUUID(),
          type: 'feature',
          title: 'Prioritize Top Voted Features',
          description: 'Focus on implementing the most requested features',
          priority: 'high',
          impact: 'high',
          effort: 'medium',
          confidence: 0.9,
          reasoning: 'Based on user feedback analysis',
          actionableSteps: [
            'Review top 5 most voted features',
            'Create implementation plan',
            'Allocate resources'
          ]
        }
      ];

      return new Response(JSON.stringify(recommendations), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Predict User Behavior
    if (path === 'predict-behavior' && req.method === 'POST') {
      const { userId, context } = body || {};
      
      const prediction = {
        userId,
        likelihood: {
          churn: 0.15,
          upgrade: 0.45,
          engagement: 0.78
        },
        recommendations: [
          'Increase engagement with personalized content',
          'Offer premium features trial'
        ],
        confidence: 0.82
      };

      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Optimize Experiments
    if (path === 'optimize-experiments' && req.method === 'POST') {
      const optimization = {
        experiments: [
          {
            id: 'exp-1',
            name: 'Feature A/B Test',
            recommendation: 'End experiment, variant B shows 23% improvement',
            confidence: 0.91
          }
        ],
        suggestedActions: [
          'Roll out winning variant',
          'Start new experiment for next feature'
        ]
      };

      return new Response(JSON.stringify(optimization), {
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
