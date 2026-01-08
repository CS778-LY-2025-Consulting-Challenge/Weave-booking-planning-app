import { NextRequest, NextResponse } from 'next/server';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const location = searchParams.get('location') || searchParams.get('q') || '';
    const checkIn = searchParams.get('checkInDate') || '';
    const checkOut = searchParams.get('checkOutDate') || '';
    const guests = searchParams.get('guests') || '2';

    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    if (!SERPAPI_API_KEY) {
      console.error('[SerpAPI Hotels] API key not configured');
      return NextResponse.json(
        { error: 'SerpAPI key not configured' },
        { status: 500 }
      );
    }

    // Build SerpAPI Google Hotels query
    const query = `hotels in ${location}`;
    
    const params = new URLSearchParams({
      engine: 'google_hotels',
      q: query,
      check_in_date: checkIn,
      check_out_date: checkOut,
      adults: guests,
      currency: 'USD',
      gl: 'us',
      hl: 'en',
      api_key: SERPAPI_API_KEY,
    });

    const url = `${SERPAPI_BASE_URL}?${params.toString()}`;
    console.log(`[SerpAPI Hotels] Fetching from: ${url.replace(SERPAPI_API_KEY, 'HIDDEN')}`);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SerpAPI Hotels] API error:', response.status, errorText);
      return NextResponse.json(
        { error: `SerpAPI error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[SerpAPI Hotels] Successfully fetched ${data?.properties?.length || 0} hotels`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[SerpAPI Hotels] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search hotels via SerpAPI' },
      { status: 500 }
    );
  }
}
