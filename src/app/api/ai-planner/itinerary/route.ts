import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ITINERARY_SYSTEM_PROMPT = `
You are Charizard, an expert travel planner AI. The user has provided their trip essentials through chat.
Now you must generate a COMPLETE, DETAILED itinerary.

**Your Mission:**
Generate a full trip plan with day-by-day activities, transportation, accommodation, and map data.

**CRITICAL Requirements:**
1. **mapPoints**: MUST include ALL UNIQUE cities in the journey, INCLUDING the departure city.
   - Example: If trip is Auckland → Tokyo → Shanghai → Auckland (round trip), include:
     [
       { "name": "Auckland", "lat": -36.8485, "lng": 174.7633 },
       { "name": "Tokyo", "lat": 35.6762, "lng": 139.6503 },
       { "name": "Shanghai", "lat": 31.2304, "lng": 121.4737 }
     ]
   - Note: List each city ONCE, even if returning to departure city

2. **routeFlow**: Array of city names showing the COMPLETE journey path, MUST include the return journey.
   - Example for round trip: ["Auckland", "Tokyo", "Shanghai", "Auckland"]
   - CRITICAL: If the trip returns to the starting city, the routeFlow MUST include the departure city at BOTH the beginning AND the end
   - This ensures the map displays the complete round-trip route with return flight

3. **dayPlans**: For EVERY day of the trip, create detailed activities.
   - Each activity MUST have:
     * Precise coordinates (lat, lng)
     * Type: "attraction", "food", or "hotel" (REQUIRED)
       - Use "food" for: restaurants, cafes, dining, meals (breakfast/lunch/dinner), food markets, bars
       - Use "hotel" for: hotels, accommodations, check-in/check-out
       - Use "attraction" for: sightseeing spots, museums, temples, parks, shopping, activities
     * Time, title, description, location

4. **transportation**: List all major transport legs (flights, trains, buses)
   - Include mode, from, to, time, price estimate
   - For flights, include coords array with departure and arrival coordinates

5. **accommodation**: List all hotels/stays with name, location, price, nights, coords

6. **summary**: Calculate and provide:
   - days: total trip duration
   - cities: number of unique cities visited
   - activitiesCount: total activities across all days
   - hotelsCount: number of accommodations
   - transportsCount: number of transportation legs

7. **tripTitle**: A catchy title for the trip (e.g., "10-Day Culinary Adventure in Japan")

**Output Format (Strict JSON):**
{
  "tripTitle": "string",
  "summary": { "days": number, "cities": number, "activitiesCount": number, "hotelsCount": number, "transportsCount": number },
  "routeFlow": ["City1", "City2", "City3", "City1"],
  "mapPoints": [{ "name": "string", "lat": number, "lng": number }],
  "destination": "string or array",
  "departureCity": "string",
  "dates": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD", "durationDays": number },
  "travellers": number,
  "purpose": "string",
  "preferences": ["string"],
  "dayPlans": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "title": "string",
      "summary": "string",
      "weather": { "text": "string" },
      "activities": [
        {
          "time": "Morning/Afternoon/Evening",
          "title": "string",
          "desc": "string",
          "location": "string",
          "coords": { "lat": number, "lng": number },
          "type": "attraction|food|hotel",
          "rating": number,
          "reviewCount": number
        }
      ]
    }
  ],
  "transportation": [
    {
      "mode": "flight|train|bus|car",
      "from": "string",
      "to": "string",
      "time": "string",
      "priceEstimate": "string",
      "coords": [{ "lat": number, "lng": number }]
    }
  ],
  "accommodation": [
    {
      "name": "string",
      "location": "string",
      "pricePerNight": number,
      "nights": number,
      "coords": { "lat": number, "lng": number }
    }
  ],
  "media": {
    "photos": ["url"],
    "videos": ["url"]
  }
}

**Important:**
- Be specific with coordinates - use real locations
- **Ratings & Reviews**: Always include simulated rating (4.0 to 5.0) and reviewCount (50 to 2000) for every activity.
- NEVER use placeholders like [...] or "more activities"
- Make the itinerary realistic and detailed
- Adapt to the user's preferences and purpose
`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { plannerState = {} } = body as { plannerState?: any };

    console.log('[Itinerary API] Received plannerState:', plannerState);

    // Build a context summary for the AI
    const contextPrompt = `
Generate a complete itinerary based on:
- Destination: ${plannerState.destination || 'Not specified'}
- Departure City: ${plannerState.departureCity || 'Not specified'}
- Start Date: ${plannerState.dates?.start || 'Not specified'}
- End Date: ${plannerState.dates?.end || 'Not specified'}
- Duration: ${plannerState.dates?.durationDays || 'Not specified'} days
- Travellers: ${plannerState.travellers || 'Not specified'}
- Purpose: ${plannerState.purpose || 'General travel'}
- Preferences: ${plannerState.preferences?.join(', ') || 'None specified'}

Create a comprehensive, day-by-day itinerary that matches these parameters.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ITINERARY_SYSTEM_PROMPT },
        { role: 'user', content: contextPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 16000,
      temperature: 0.8,
    });

    const content = JSON.parse(response.choices[0].message.content || '{}');
    console.log('[Itinerary API] Generated itinerary:', {
      tripTitle: content.tripTitle,
      cities: content.mapPoints?.length,
      days: content.dayPlans?.length,
    });

    return NextResponse.json({ data: content });
  } catch (error: any) {
    console.error('[Itinerary API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary: ' + error.message },
      { status: 500 }
    );
  }
}


