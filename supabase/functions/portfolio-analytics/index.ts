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
    const path = url.pathname.replace('/portfolio-analytics/', '');

    console.log('Portfolio Analytics request:', path);

    // Get portfolio insights
    if (path === 'insights' && req.method === 'GET') {
      const timeRange = url.searchParams.get('timeRange') || '30d';

      const insights = [
        {
          id: 'insight-1',
          type: 'opportunity',
          title: 'Cross-Product Synergy Opportunity',
          description: 'Users of Product A show high engagement with features similar to Product B',
          impact: 'high',
          confidence: 0.87,
          affectedProducts: ['product-a', 'product-b'],
          actionItems: [
            'Create cross-sell campaign',
            'Develop integrated feature set',
            'Analyze user journey patterns'
          ],
          aiGenerated: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'insight-2',
          type: 'risk',
          title: 'Capacity Constraint in Sprint Planning',
          description: 'Multiple products competing for same development resources',
          impact: 'medium',
          confidence: 0.92,
          affectedProducts: ['product-a', 'product-c'],
          actionItems: [
            'Prioritize strategic initiatives',
            'Consider hiring additional developers',
            'Implement capacity planning tools'
          ],
          aiGenerated: false,
          createdAt: new Date().toISOString()
        }
      ];

      return new Response(JSON.stringify(insights), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get cross-product metrics
    if (path === 'cross-product-metrics' && req.method === 'GET') {
      const metrics = {
        userOverlap: {
          productPairs: [
            {
              productA: 'product-a',
              productB: 'product-b',
              overlapUsers: 1250,
              overlapPercentage: 35.5
            }
          ],
          totalCrossProductUsers: 2100
        },
        revenueAttribution: {
          directRevenue: { 'product-a': 150000, 'product-b': 120000 },
          influencedRevenue: { 'product-a': 45000, 'product-b': 38000 },
          crossSellRevenue: 67000
        },
        featureAdoption: {
          crossProductFeatures: [
            {
              feature: 'unified-dashboard',
              adoptionRate: 0.67,
              products: ['product-a', 'product-b'],
              userSatisfaction: 4.3
            }
          ]
        }
      };

      return new Response(JSON.stringify(metrics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get portfolio health score
    if (path === 'health-score' && req.method === 'GET') {
      const healthScore = {
        overall: 78.5,
        breakdown: {
          technical: 82,
          business: 76,
          strategic: 75,
          operational: 81
        },
        trends: {
          thirtyDayChange: 3.2,
          quarterlyChange: 8.5,
          yearlyChange: 15.3
        },
        riskFactors: [
          {
            factor: 'Developer Capacity',
            severity: 'medium' as const,
            description: 'Current sprint velocity indicates resource constraints',
            mitigation: 'Prioritize high-impact features and consider resource reallocation'
          }
        ]
      };

      return new Response(JSON.stringify(healthScore), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get predictive analytics
    if (path === 'predictive' && req.method === 'GET') {
      const predictive = {
        churnPrediction: {
          predictedChurnRate: 0.12,
          highRiskUsers: 85,
          preventionActions: [
            'Increase engagement touchpoints',
            'Offer personalized feature recommendations',
            'Implement retention campaigns'
          ]
        },
        growthForecast: {
          predictedGrowth: 23.5,
          confidence: 0.82,
          timeframe: 'Q2 2025',
          drivers: ['New feature adoption', 'Market expansion', 'Cross-sell success']
        },
        marketTrends: {
          emergingOpportunities: ['AI-powered analytics', 'Mobile-first features'],
          competitiveThreat: ['New market entrant', 'Feature parity challenges'],
          recommendedActions: [
            'Accelerate AI integration',
            'Invest in mobile experience',
            'Differentiate through unique capabilities'
          ]
        }
      };

      return new Response(JSON.stringify(predictive), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Custom analytics query
    if (path === 'custom-query' && req.method === 'POST') {
      const query = await req.json();
      
      // Simulate custom query processing
      const results = [
        { date: '2025-01-01', metric: 150, dimension: 'product-a' },
        { date: '2025-01-01', metric: 120, dimension: 'product-b' }
      ];

      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate report
    if (path === 'reports' && req.method === 'POST') {
      const config = await req.json();
      
      const report = {
        reportId: `report-${Date.now()}`,
        downloadUrl: `/reports/report-${Date.now()}.pdf`,
        summary: 'Portfolio performance report generated successfully'
      };

      return new Response(JSON.stringify(report), {
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
