import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const ACCOMMODATION_SEARCH_PROMPT = `
You are a hotel search assistant. Given a city and search criteria, return a list of recommended hotels.

**CRITICAL Hotel Selection Criteria:**
- Prefer MAJOR HOTEL CHAINS: Hilton, Hyatt, Marriott, InterContinental, Sheraton, Radisson, etc.
- These hotels are more likely to have official websites
- Must have good ratings (4.0+) and substantial reviews (500+)
- Include variety: Luxury, Business, Boutique hotels

**Search Context:**
- City: {{CITY}}
- Check-in Date: {{CHECK_IN}}
- Check-out Date: {{CHECK_OUT}}
- Nights: {{NIGHTS}}
- User Query: {{QUERY}}

**Requirements:**
1. Return 8-12 hotel options that match the criteria
2. Each hotel must include ALL fields below
3. Prioritize well-known hotel chains
4. Provide realistic, location-appropriate pricing in NZ$
5. Include accurate coordinates for each hotel

**Output Format (Strict JSON):**
{
  "results": [
    {
      "name": "Hotel Name (e.g., Park Hyatt Tokyo)",
      "location": "Full address or neighborhood",
      "city": "City name",
      "coords": { "lat": number, "lng": number },
      "checkIn": "ISO date (e.g., 2026-01-10)",
      "checkOut": "ISO date (e.g., 2026-01-13)",
      "nights": number,
      "pricePerNight": "NZ$XXX",
      "totalPrice": "NZ$XXX",
      "rating": 4.0-5.0,
      "reviewCount": 500-5000,
      "hotelType": "Luxury Hotel | Business Hotel | Boutique Hotel",
      "amenities": ["Free WiFi", "Pool", "Gym", etc.],
      "imageQuery": "Search term for hotel image",
      "distance": "Distance from city center (e.g., '0.5 km from center')"
    }
  ]
}

**Important:**
- Use accurate coordinates for real hotels in the specified city
- Price estimates should be realistic for the region
- Always prefer recognizable hotel brands
`;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { query = '', city = '', checkIn = '', checkOut = '', nights = 1, context = {} } = body;

  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }

  console.log(`[Search Accommodations API] Query: "${query}", City: ${city}, Nights: ${nights}`);

  try {
    // Prepare the prompt with context
    const prompt = ACCOMMODATION_SEARCH_PROMPT
      .replace('{{CITY}}', city)
      .replace('{{CHECK_IN}}', checkIn || 'Not specified')
      .replace('{{CHECK_OUT}}', checkOut || 'Not specified')
      .replace('{{NIGHTS}}', String(nights))
      .replace('{{QUERY}}', query || 'Show me popular hotels');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Find hotels in ${city}. ${query}` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      temperature: 0.7,
    });

    const content = JSON.parse(response.choices[0].message.content || '{}');

    console.log(`[Search Accommodations API] Found ${content.results?.length || 0} hotels`);

    // Fetch Unsplash images for each hotel concurrently
    if (content.results && Array.isArray(content.results) && UNSPLASH_ACCESS_KEY) {
      const resultsWithImages = await Promise.all(
        content.results.map(async (result: any) => {
          if (result.imageQuery) {
            try {
              const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                result.imageQuery
              )}&orientation=landscape&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;
              const unsplashRes = await fetch(unsplashUrl);
              const unsplashData = await unsplashRes.json();
              if (unsplashData.results && unsplashData.results.length > 0) {
                return { ...result, imageUrl: unsplashData.results[0].urls.regular };
              }
            } catch (imgErr) {
              console.warn(`[Search Accommodations API] Failed to fetch image for "${result.imageQuery}":`, imgErr);
            }
          }
          return result;
        })
      );
      content.results = resultsWithImages;
    }

    return NextResponse.json({
      results: content.results || [],
      message: content.message || 'Hotels found',
    });
  } catch (error: any) {
    console.error('[Search Accommodations API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search accommodations: ' + error.message, results: [] },
      { status: 500 }
    );
  }
}

