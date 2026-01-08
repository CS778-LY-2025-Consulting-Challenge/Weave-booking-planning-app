import { NextRequest, NextResponse } from 'next/server';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const hotelId = searchParams.get('hotelId');
    const hotelName = searchParams.get('hotelName');
    const location = searchParams.get('location');
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');
    const guests = searchParams.get('guests') || '2';
    
    // NEW: Get SerpAPI fields if available
    const propertyToken = searchParams.get('property_token');
    const detailsLink = searchParams.get('details_link');

    if (!hotelId && !hotelName && !propertyToken) {
      return NextResponse.json(
        { error: 'hotelId, hotelName, or property_token is required' },
        { status: 400 }
      );
    }

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'checkInDate and checkOutDate are required' },
        { status: 400 }
      );
    }

    if (!SERPAPI_API_KEY) {
      console.error('[Hotel Details] SerpAPI key not configured');
      return NextResponse.json(
        { error: 'SerpAPI key not configured' },
        { status: 500 }
      );
    }

    // OPTION 1: Use the ready-made SerpAPI details link if provided
    if (detailsLink) {
      console.log(`[Hotel Details] Using SerpAPI details link directly`);
      
      const response = await fetch(detailsLink, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Hotel Details] SerpAPI error:', response.status, errorText);
        return NextResponse.json(
          { error: `SerpAPI error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('[Hotel Details] Successfully fetched hotel details using direct link');
      return NextResponse.json(data);
    }

    // OPTION 2: Use property_token if available (more reliable than name search)
    if (propertyToken) {
      console.log(`[Hotel Details] Using property_token: ${propertyToken}`);
      
      const params = new URLSearchParams({
        engine: 'google_hotels',
        property_token: propertyToken,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        adults: guests,
        currency: 'USD',
        gl: 'us',
        hl: 'en',
        api_key: SERPAPI_API_KEY,
      });

      const url = `${SERPAPI_BASE_URL}?${params.toString()}`;
      console.log(`[Hotel Details] Fetching from SerpAPI with token`);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Hotel Details] SerpAPI error:', response.status, errorText);
        return NextResponse.json(
          { error: `SerpAPI error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('[Hotel Details] Successfully fetched hotel details using property_token');
      return NextResponse.json(data);
    }

    // OPTION 3: Fallback to search by name (less reliable)
    // Build search query - prioritize hotel name with location for better results
    const query = hotelName 
      ? `${hotelName}${location ? ` ${location}` : ''}`
      : `hotel ${location || ''}`;

    console.log(`[Hotel Details] Falling back to name search: "${query}"`);

    const params = new URLSearchParams({
      engine: 'google_hotels',
      q: query,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults: guests,
      currency: 'USD',
      gl: 'us',
      hl: 'en',
      api_key: SERPAPI_API_KEY,
    });

    // If we have a hotel ID from Google, use it
    if (hotelId && hotelId.includes('ChI')) {
      params.set('hotel_id', hotelId);
    }

    const url = `${SERPAPI_BASE_URL}?${params.toString()}`;
    console.log(`[Hotel Details] Fetching from SerpAPI: ${url.replace(SERPAPI_API_KEY, 'HIDDEN')}`);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Hotel Details] SerpAPI error:', response.status, errorText);
      return NextResponse.json(
        { error: `SerpAPI error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // If we got multiple properties, try to find the best match
    if (data?.properties && Array.isArray(data.properties)) {
      if (data.properties.length === 0) {
        console.warn('[Hotel Details] No hotels found in SerpAPI response');
        return NextResponse.json(
          { error: 'Hotel not found' },
          { status: 404 }
        );
      }

      // If we have hotel name, try to find exact match
      if (hotelName) {
        const exactMatch = data.properties.find((p: any) => 
          p.name?.toLowerCase().includes(hotelName.toLowerCase()) ||
          hotelName.toLowerCase().includes(p.name?.toLowerCase())
        );
        
        if (exactMatch) {
          console.log(`[Hotel Details] Found exact match for "${hotelName}"`);
          return NextResponse.json({ 
            data: exactMatch,
            properties: data.properties,
            search_metadata: data.search_metadata 
          });
        }
      }

      // Return the first result with all properties
      console.log(`[Hotel Details] Returning first result from ${data.properties.length} hotels`);
      return NextResponse.json({ 
        data: data.properties[0],
        properties: data.properties,
        search_metadata: data.search_metadata 
      });
    }

    console.log('[Hotel Details] Successfully fetched hotel details from SerpAPI');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Hotel Details] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch hotel details' },
      { status: 500 }
    );
  }
}
