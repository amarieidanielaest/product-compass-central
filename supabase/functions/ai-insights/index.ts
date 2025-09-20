import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  console.log('AI Insights API request:', req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/ai-insights', '');
    
    if (path === '/insights' && req.method === 'POST') {
      return await handleGetInsights(req);
    } else if (path === '/generate' && req.method === 'POST') {
      return await handleGenerateContent(req);
    } else if (path === '/chat' && req.method === 'POST') {
      return await handleChatAssistant(req);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Insights API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleGetInsights(req: Request) {
  const { domain, context } = await req.json();
  console.log('Getting AI insights for domain:', domain);

  // Mock insights based on domain
  const insights = generateMockInsights(domain, context);

  return new Response(JSON.stringify(insights), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGenerateContent(req: Request) {
  const { type, context, prompt } = await req.json();
  console.log('Generating AI content:', type);

  const content = generateMockContent(type, context, prompt);

  return new Response(JSON.stringify(content), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleChatAssistant(req: Request) {
  const { message, context } = await req.json();
  console.log('AI chat message:', message);

  const response = generateChatResponse(message, context);

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateMockInsights(domain: string, context: any) {
  const baseInsights = {
    product: [
      {
        type: 'opportunity',
        title: 'Feature Adoption Gap',
        description: 'Sprint board usage is 23% lower than dashboard usage, indicating potential UX improvements needed.',
        confidence: 0.85,
        actionable: true,
        suggestedActions: [
          'Add sprint board onboarding tutorial',
          'Simplify work item creation flow',
          'Add sprint planning templates'
        ]
      },
      {
        type: 'trend',
        title: 'User Engagement Growth',
        description: 'Customer portal engagement increased 34% this month, driven by knowledge center usage.',
        confidence: 0.92,
        actionable: false,
        data: { growth: 34, driver: 'knowledge_center' }
      }
    ],
    feedback: [
      {
        type: 'warning',
        title: 'Feature Request Backlog',
        description: 'You have 23 high-priority feature requests older than 30 days. Consider roadmap prioritization.',
        confidence: 0.78,
        actionable: true,
        suggestedActions: [
          'Review and prioritize old requests',
          'Communicate timeline to customers',
          'Bundle similar requests into epics'
        ]
      },
      {
        type: 'recommendation', 
        title: 'Customer Feedback Patterns',
        description: 'Mobile experience requests account for 40% of recent feedback. Mobile optimization should be prioritized.',
        confidence: 0.88,
        actionable: true,
        suggestedActions: [
          'Add mobile optimization to roadmap',
          'Audit current mobile experience',
          'Survey customers on mobile usage patterns'
        ]
      }
    ],
    roadmap: [
      {
        type: 'opportunity',
        title: 'Resource Optimization',
        description: 'Current sprint capacity utilization is at 67%. You could increase velocity by 20% with better planning.',
        confidence: 0.73,
        actionable: true,
        suggestedActions: [
          'Review team capacity allocation',
          'Implement capacity planning tools',
          'Balance work item sizing'
        ]
      }
    ],
    strategy: [
      {
        type: 'trend',
        title: 'OKR Progress Alignment',
        description: 'Q4 objectives are 78% on track, with customer satisfaction metrics exceeding targets.',
        confidence: 0.91,
        actionable: false,
        data: { progress: 78, ahead: ['customer_satisfaction'], behind: ['feature_delivery'] }
      }
    ]
  };

  return baseInsights[domain] || [];
}

function generateMockContent(type: string, context: any, prompt: string) {
  const mockContent = {
    prd: {
      content: `# Product Requirements Document: ${context.title || 'New Feature'}

## Overview
This document outlines the requirements for implementing ${context.title || 'a new feature'} based on customer feedback and strategic objectives.

## Problem Statement
${prompt || 'Users need better tools to manage their workflow effectively.'}

## Solution Approach
- Implement intuitive user interface
- Ensure scalable architecture
- Focus on user experience
- Integrate with existing systems

## Success Metrics
- User adoption: > 80% within 3 months
- Task completion time: 25% reduction
- User satisfaction: > 4.5/5 rating

## Implementation Timeline
- Phase 1: Core functionality (4 weeks)
- Phase 2: Advanced features (6 weeks) 
- Phase 3: Polish and optimization (2 weeks)`,
      confidence: 0.85,
      suggestions: [
        'Add detailed user personas',
        'Include competitive analysis',
        'Define acceptance criteria'
      ],
      metadata: { wordCount: 145, estimatedReadTime: '2 min' }
    },
    summary: {
      content: `## Executive Summary

Based on recent data analysis, key findings include:

- **User Growth**: 23% increase in monthly active users
- **Feature Adoption**: Sprint planning tools show highest engagement
- **Customer Feedback**: Mobile optimization is top priority
- **Performance**: 98.5% uptime maintained

## Recommendations
1. Prioritize mobile experience improvements
2. Expand sprint planning capabilities  
3. Invest in customer success programs`,
      confidence: 0.92,
      suggestions: [
        'Add specific metrics',
        'Include trend analysis',
        'Provide action items'
      ],
      metadata: { dataPoints: 15, confidenceLevel: 'high' }
    }
  };

  return mockContent[type] || mockContent.summary;
}

function generateChatResponse(message: string, context: any) {
  const responses = [
    {
      response: "I can help you analyze that data. Based on your current metrics, I notice some interesting patterns in user behavior. Would you like me to dive deeper into the engagement trends?",
      followUpQuestions: [
        "What's driving the recent user growth?",
        "How can we improve feature adoption?",
        "What should we prioritize on the roadmap?"
      ],
      actionsSuggested: [
        { action: "Generate Report", description: "Create a comprehensive analytics report" },
        { action: "Update Roadmap", description: "Adjust roadmap based on insights" }
      ]
    },
    {
      response: "Looking at your product data, I see opportunities for optimization. Your sprint board has great potential but could benefit from better onboarding. Let me suggest some improvements.",
      followUpQuestions: [
        "How can we improve the sprint planning flow?",
        "What onboarding elements are missing?",
        "Should we add more templates?"
      ],
      actionsSuggested: [
        { action: "Create Tutorial", description: "Build interactive sprint board tutorial" },
        { action: "Add Templates", description: "Create methodology-specific templates" }
      ]
    }
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}