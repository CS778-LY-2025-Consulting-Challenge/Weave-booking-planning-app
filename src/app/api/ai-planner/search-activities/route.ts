import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SEARCH_SYSTEM_PROMPT = `
You are a travel activity search assistant specializing in finding attractions, restaurants, and activities.

**Your Task:**
When a user searches for activities (e.g., "Must-see landmarks in New York", "Best sushi restaurants in Tokyo"), 
you must return 5-8 relevant, high-quality options with PRECISE coordinates.

**Critical Requirements:**
1. Return 5-8 results maximum (quality over quantity)
2. MUST include ACCURATE latitude and longitude for each result
3. Prioritize popular, highly-rated places
4. Include practical information: duration, price, ratings
5. Calculate approximate distance from city center if coordinates provided
6. Add concise highlights (1-2 sentences)

**Output Format (Strict JSON):**
{
  "reply": "I found 6 must-see landmarks in New York for you:",
  "results": [
    {
      "name": "Statue of Liberty",
      "type": "attraction",
      "coords": { "lat": 40.6892, "lng": -74.0445 },
      "rating": 4.7,
      "reviewCount": 15420,
      "duration": "3-4 hours",
      "price": "$25",
      "highlights": "Iconic symbol of freedom, ferry ride included, stunning harbor views",
      "address": "Liberty Island, New York, NY 10004",
      "distance": "8.5 km from city center"
    }
  ]
}

**Type Guidelines:**
- "attraction": landmarks, museums, parks, monuments, viewpoints
- "food": restaurants, cafes, food markets, bars
- "hotel": hotels, hostels, accommodations

**Important:**
- Use real, verified coordinates (not approximate)
- Be specific with location names
- Ensure variety in recommendations
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, city, coords, context } = body;

    console.log('[Search Activities API] Received request:', { query, city });

    // Build context for AI
    const userContext = context ? `
User context:
- Budget: ${context.budget || 'Not specified'}
- Preferences: ${context.preferences?.join(', ') || 'None'}
- Duration available: ${context.duration || 'Flexible'}
` : '';

    const locationContext = coords 
      ? `Reference coordinates: lat ${coords.lat}, lng ${coords.lng}` 
      : '';

    const fullPrompt = `
${userContext}
${locationContext}

Search Query: "${query}"
${city ? `City/Location: ${city}` : ''}

Find relevant activities and return them in the specified JSON format.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SEARCH_SYSTEM_PROMPT },
        { role: 'user', content: fullPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      temperature: 0.7,
    });

    const content = JSON.parse(response.choices[0].message.content || '{}');
    
    console.log('[Search Activities API] AI returned:', {
      reply: content.reply,
      resultCount: content.results?.length || 0,
    });

    return NextResponse.json(content);
  } catch (error: any) {
    console.error('[Search Activities API] Error:', error);
    return NextResponse.json(
      { 
        reply: 'Sorry, I encountered an error while searching for activities.',
        results: [],
        error: error.message 
      },
      { status: 500 }
    );
  }
}

