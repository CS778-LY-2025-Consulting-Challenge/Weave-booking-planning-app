import { NextRequest, NextResponse } from 'next/server';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
// @ts-ignore
const SerpApi = require('google-search-results-nodejs');

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
      console.error('[SerpAPI Hotels] API key not configured. Env var present:', !!process.env.SERPAPI_API_KEY);
      return NextResponse.json(
        { error: 'SerpAPI key not configured' },
        { status: 500 }
      );
    }

    // Build SerpAPI Google Hotels query variables
    const params = {
      engine: 'google_hotels',
      q: `hotels in ${location}`,
      check_in_date: checkIn,
      check_out_date: checkOut,
      adults: guests,
      currency: 'USD',
      gl: 'us',
      hl: 'en',
    };

    console.log(`[SerpAPI Hotels] Fetching via SDK for location: ${location}`);

    // Wrap SDK callback in Promise
    const data = await new Promise((resolve, reject) => {
      const search = new SerpApi.GoogleSearch(SERPAPI_API_KEY);
      search.json(params, (json: any) => {
        if (json.error) {
          reject(new Error(json.error));
        } else {
          resolve(json);
        }
      });
    });

    // @ts-ignore
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
