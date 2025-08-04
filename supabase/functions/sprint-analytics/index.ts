import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { sprintData, analysisType } = await req.json();
    
    console.log('Received sprint analytics request:', { analysisType, sprintDataLength: sprintData?.length });

    // Format sprint data for Gemini analysis
    const formattedData = JSON.stringify(sprintData, null, 2);
    
    let prompt = '';
    
    switch (analysisType) {
      case 'bottlenecks':
        prompt = `Analyze the following sprint data and identify potential bottlenecks in the workflow. Return a JSON response with an array of bottlenecks, each containing: type, description, severity (1-5), affectedItems (array of item IDs), and suggestedActions (array of strings).

Sprint Data:
${formattedData}

Return only valid JSON in this format:
{
  "bottlenecks": [
    {
      "type": "column_overflow",
      "description": "Too many items stuck in Review column",
      "severity": 4,
      "affectedItems": ["item1", "item2"],
      "suggestedActions": ["Add more reviewers", "Implement review time limits"]
    }
  ]
}`;
        break;
        
      case 'velocity':
        prompt = `Analyze the sprint velocity based on the following data and predict future sprint capacity. Return a JSON response with current velocity, predicted velocity for next sprint, confidence level (0-1), and factors affecting velocity.

Sprint Data:
${formattedData}

Return only valid JSON in this format:
{
  "velocity": {
    "current": 25,
    "predicted": 28,
    "confidence": 0.85,
    "factors": ["Team is getting more efficient", "Reduced external dependencies"],
    "recommendation": "Plan for 26-30 story points next sprint"
  }
}`;
        break;
        
      case 'risks':
        prompt = `Identify risks in the current sprint based on the data provided. Return a JSON response with identified risks, their probability, impact, and mitigation strategies.

Sprint Data:
${formattedData}

Return only valid JSON in this format:
{
  "risks": [
    {
      "title": "Sprint goal at risk",
      "probability": 0.7,
      "impact": "high",
      "description": "Multiple high-priority items are behind schedule",
      "mitigation": ["Focus on critical path items", "Consider scope reduction"]
    }
  ]
}`;
        break;
        
      case 'optimization':
        prompt = `Analyze the sprint data and provide optimization suggestions for improving team efficiency and workflow. Return a JSON response with actionable recommendations.

Sprint Data:
${formattedData}

Return only valid JSON in this format:
{
  "optimizations": [
    {
      "category": "workflow",
      "title": "Reduce WIP limits",
      "description": "Current WIP limits are too high causing context switching",
      "impact": "medium",
      "effort": "low",
      "expectedImprovement": "15% faster cycle time"
    }
  ]
}`;
        break;
        
      case 'team_performance':
        prompt = `Analyze team performance metrics from the sprint data. Focus on individual and team productivity, collaboration patterns, and areas for improvement.

Sprint Data:
${formattedData}

Return only valid JSON in this format:
{
  "teamPerformance": {
    "overallScore": 8.5,
    "strengths": ["Good collaboration", "Consistent velocity"],
    "improvementAreas": ["Code review bottlenecks", "Planning accuracy"],
    "individualInsights": [
      {
        "member": "John",
        "productivity": 9.0,
        "notes": "Consistently high output, good code quality"
      }
    ],
    "recommendations": ["Implement pair programming for knowledge sharing"]
  }
}`;
        break;
        
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCvY_cO2lf7krYQYI07tUeFRl7O4oaYkB0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');
    
    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated by Gemini');
    }

    // Try to parse as JSON
    let analysisResult;
    try {
      // Clean the response - remove any markdown formatting
      const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', generatedText);
      // Return a fallback response
      analysisResult = {
        error: 'Failed to parse AI response',
        rawResponse: generatedText
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sprint-analytics function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Sprint analytics processing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});