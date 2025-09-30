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
    const path = url.pathname.replace('/predictive-analytics/', '');
    const body = req.method === 'POST' ? await req.json() : null;

    console.log('Predictive Analytics request:', path);

    // Feature Success Prediction
    if (path === 'predict-feature' && req.method === 'POST') {
      const { featureId } = body || {};
      
      const prediction = {
        featureId,
        successProbability: 0.78,
        expectedImpact: {
          userEngagement: '+23%',
          revenue: '+15%',
          retention: '+12%'
        },
        risks: [
          {
            type: 'technical',
            severity: 'medium',
            description: 'May require additional infrastructure'
          }
        ],
        recommendedLaunchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.85
      };

      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Churn Prediction
    if (path === 'predict-churn' && req.method === 'POST') {
      const { timeframe = '30d' } = body || {};
      
      const prediction = {
        timeframe,
        predictions: [
          {
            segment: 'free-tier',
            churnRate: 0.15,
            atRiskUsers: 45,
            factors: ['Low engagement', 'No feature usage']
          },
          {
            segment: 'premium',
            churnRate: 0.05,
            atRiskUsers: 12,
            factors: ['Support ticket unresolved']
          }
        ],
        recommendations: [
          'Implement re-engagement campaign for free-tier users',
          'Prioritize support tickets for premium users'
        ]
      };

      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Revenue Forecast
    if (path === 'forecast-revenue' && req.method === 'POST') {
      const { horizon = '90d' } = body || {};
      
      const forecast = {
        horizon,
        forecast: [
          { date: new Date().toISOString(), value: 50000, confidence: [45000, 55000] },
          { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), value: 58000, confidence: [52000, 64000] },
          { date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), value: 67000, confidence: [59000, 75000] },
          { date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), value: 77000, confidence: [67000, 87000] }
        ],
        factors: [
          { name: 'Seasonal trends', impact: 'positive' },
          { name: 'Market conditions', impact: 'neutral' }
        ]
      };

      return new Response(JSON.stringify(forecast), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Capacity Planning
    if (path === 'plan-capacity' && req.method === 'POST') {
      const { projectId } = body || {};
      
      const plan = {
        projectId,
        currentUtilization: 0.78,
        projectedUtilization: [
          { date: new Date().toISOString(), utilization: 0.78 },
          { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), utilization: 0.85 },
          { date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), utilization: 0.92 }
        ],
        recommendations: [
          'Add 1 developer by week 2',
          'Consider moving non-critical tasks to next sprint'
        ],
        risks: [
          {
            type: 'capacity',
            severity: 'high',
            description: 'Team will be over capacity in 2 weeks'
          }
        ]
      };

      return new Response(JSON.stringify(plan), {
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
