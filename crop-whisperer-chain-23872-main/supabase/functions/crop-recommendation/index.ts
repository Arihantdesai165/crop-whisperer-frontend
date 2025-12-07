import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      soilType, 
      soilPH, 
      area, 
      waterAccess, 
      previousCrops, 
      season, 
      budget, 
      marketPreference,
      location 
    } = await req.json();

    console.log('Received crop recommendation request:', {
      soilType,
      area,
      waterAccess,
      season,
      location
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Construct detailed prompt for AI
    const prompt = `You are an expert agricultural advisor specializing in crop recommendation for Indian farmers.

Based on the following farm details, recommend the TOP 3 most suitable crops:

Farm Details:
- Soil Type: ${soilType}
${soilPH ? `- Soil pH: ${soilPH}` : ''}
- Farm Area: ${area} acres
- Water Access: ${waterAccess}
- Season: ${season}
- Budget: ₹${budget}
- Market Preference: ${marketPreference}
- Location: ${location}
${previousCrops ? `- Previous Crops: ${previousCrops}` : ''}

Provide recommendations in the following JSON format (RESPOND ONLY WITH VALID JSON, NO MARKDOWN):
{
  "recommendations": [
    {
      "cropName": "Crop Name",
      "confidence": 85,
      "reasoning": "Detailed explanation of why this crop suits the farm (2-3 sentences)",
      "expectedYield": "X quintals per acre or Y tons total",
      "marketDemand": "Current market status and price trends",
      "riskLevel": "Low/Medium/High"
    }
  ],
  "summary": "Overall recommendation summary (1-2 sentences)"
}

Consider:
1. Soil suitability and pH compatibility
2. Water requirements vs availability
3. Seasonal appropriateness
4. Budget alignment (seed, fertilizer, labor costs)
5. Market demand and profitability
6. Crop rotation benefits
7. Local climate and geography
8. Risk factors (pest resistance, climate resilience)

Provide practical, actionable recommendations that maximize the farmer's ROI while being suitable for the given conditions.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert agricultural advisor. Respond ONLY with valid JSON, no markdown formatting.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const aiContent = data.choices?.[0]?.message?.content;
    if (!aiContent) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response from AI
    let recommendations;
    try {
      // Remove markdown code blocks if present
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse AI recommendations');
    }

    console.log('Successfully generated recommendations');

    return new Response(
      JSON.stringify(recommendations),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in crop-recommendation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
