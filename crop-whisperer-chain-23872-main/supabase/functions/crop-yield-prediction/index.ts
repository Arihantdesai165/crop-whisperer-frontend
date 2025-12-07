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
    const { seedType, plotSize, season, location, soilType, fertilizerPlan, irrigationPlan, previousYield, plantingDate } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert agricultural AI assistant specializing in crop yield prediction and profit estimation for Indian farmers.

Given farm details, provide accurate yield predictions with financial analysis. Return your response as valid JSON only, with this exact structure:

{
  "predictedYield": "string (e.g., '18-22 quintals per acre')",
  "estimatedRevenue": "string (e.g., '₹1,80,000 - ₹2,20,000')",
  "profitEstimate": "string (e.g., '₹80,000 - ₹1,20,000')",
  "costBreakdown": {
    "seeds": "string (e.g., '₹15,000')",
    "fertilizer": "string (e.g., '₹25,000')",
    "irrigation": "string (e.g., '₹20,000')",
    "labor": "string (e.g., '₹40,000')",
    "total": "string (e.g., '₹1,00,000')"
  },
  "confidence": number (0-100),
  "reasoning": "string (detailed explanation of prediction factors, weather considerations, risks, and recommendations)",
  "marketPrice": "string (current market price information)"
}

Base your predictions on:
- Current market prices for the crop and location
- Typical yields for the region and soil type
- Season and weather patterns
- Input quality (fertilizer, irrigation)
- Historical yield data if provided

Provide realistic estimates and explain all key factors affecting the prediction.`;

    const userPrompt = `Predict crop yield and estimate profits for:

Crop: ${seedType}
Plot Size: ${plotSize} acres
Season: ${season}
Location: ${location}
Soil Type: ${soilType}
Fertilizer Plan: ${fertilizerPlan || 'Standard NPK'}
Irrigation Plan: ${irrigationPlan || 'Moderate irrigation'}
Previous Yield: ${previousYield ? `${previousYield} quintals/acre` : 'Not provided'}
Planting Date: ${plantingDate || 'Not specified'}

Provide yield prediction with financial analysis.`;

    console.log('Calling Lovable AI for yield prediction...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Parse JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON');
    }

    const prediction = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ prediction }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Yield prediction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to predict yield';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
