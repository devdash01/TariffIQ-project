import { NextResponse } from 'next/server';

// Vercel Native AI Bridge (Node.js)
// --------------------------------
// This route runs directly on Vercel to bypass all CORS and cold-start limits.
// It uses the Groq API key to perform high-speed HS classification.

export async function POST(req: Request) {
  try {
    const { product_description } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured on Vercel' }, { status: 500 });
    }

    const prompt = `
You are a licensed customs broker and HS Code specialist.
Classify the product below using the Harmonized System nomenclature.

Product: "${product_description}"

RULES:
1. Use real 6-digit HS codes (XXXX.XX).
2. Return exactly 6 candidates.
3. Order by confidence.

Return STRICTLY VALID JSON:
{
  "primary_hs": "XXXX.XX",
  "confidence": 0.95,
  "analysis": {
    "final_justification": "Why this code fits"
  },
  "candidate_results": [
    {
      "hs_code": "XXXX.XX",
      "description": "Heading description",
      "score": 0.95,
      "explanation": "Brief explanation",
      "duty_rate": "8.5%",
      "risk": "Low"
    }
  ]
}
`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a customs expert. Respond with JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;

    return NextResponse.json({
      primary_hs: parsed.primary_hs,
      confidence: parsed.confidence,
      analysis: parsed.analysis,
      results: parsed.candidate_results.map((c: any) => ({
        hs_code: c.hs_code,
        description: c.description,
        score: c.score,
        reasoning: c.explanation,
        duty_rate: c.duty_rate || '8.5%',
        risk: c.risk || 'Low'
      }))
    });

  } catch (error: any) {
    console.error('AI Bridge Error:', error);
    return NextResponse.json({ error: 'Classification failed', details: error.message }, { status: 500 });
  }
}
