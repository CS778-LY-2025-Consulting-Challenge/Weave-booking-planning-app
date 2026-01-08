import { NextRequest, NextResponse } from 'next/server';

/**
 * SerpAPI Google Hotels API Integration
 * 
 * This API provides comprehensive hotel data with images, ratings, prices, and amenities.
 * Free plan: 250 searches/month
 * 
 * Documentation: https://serpapi.com/google-hotels-api
 */

interface SerpApiHotel {
  type: 'hotel' | 'vacation rental';
  name: string;
  description?: string;
  link?: string;
  property_token?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  check_in_time?: string;
  check_out_time?: string;
  rate_per_night?: {
    lowest?: string;
    extracted_lowest?: number;
    before_taxes_fees?: string;
    extracted_before_taxes_fees?: number;
  };
  total_rate?: {
    lowest?: string;
    extracted_lowest?: number;
    before_taxes_fees?: string;
    extracted_before_taxes_fees?: number;
  };
  hotel_class?: string;
  extracted_hotel_class?: number;
  images?: Array<{
    thumbnail?: string;
    original_image?: string;
  }>;
  overall_rating?: number;
  reviews?: number;
  location_rating?: number;
  amenities?: string[];
  excluded_amenities?: string[];
}

interface SerpApiResponse {
  search_metadata?: {
    status: string;
    id?: string;
  };
  search_information?: {
    total_results?: number;
  };
  properties?: SerpApiHotel[];
  ads?: SerpApiHotel[];
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get('q') || searchParams.get('location');
    const checkInDate = searchParams.get('check_in_date') || searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('check_out_date') || searchParams.get('checkOutDate');
    const adults = searchParams.get('adults') || '2';
    const children = searchParams.get('children') || '0';
    const currency = searchParams.get('currency') || 'USD';
    const gl = searchParams.get('gl') || 'us';
    const hl = searchParams.get('hl') || 'en';

    if (!query) {
      return NextResponse.json(
        { error: 'query (q) parameter is required' },
        { status: 400 }
      );
    }

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'check_in_date and check_out_date are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      console.warn('[SerpAPI] SERPAPI_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'SerpAPI API key not configured' },
        { status: 500 }
      );
    }

    // Build SerpAPI request URL
    const serpApiParams = new URLSearchParams({
      engine: 'google_hotels',
      q: query,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults: adults,
      children: children,
      currency: currency,
      gl: gl,
      hl: hl,
      api_key: apiKey,
    });

    const serpApiUrl = `https://serpapi.com/search.json?${serpApiParams.toString()}`;
    
    console.log(`[SerpAPI] Searching hotels for: "${query}"`);
    console.log(`[SerpAPI] Request URL: ${serpApiUrl.replace(apiKey, '***')}`);

    const response = await fetch(serpApiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[SerpAPI] API error: ${response.status} ${response.statusText}`);
      console.error(`[SerpAPI] Error response:`, errorText);
      return NextResponse.json(
        { error: `SerpAPI request failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      console.error(`[SerpAPI] API returned error:`, data.error);
      return NextResponse.json(
        { error: data.error },
        { status: 400 }
      );
    }

    // Combine properties and ads (ads are also hotels)
    const allHotels = [
      ...(data.properties || []),
      ...(data.ads || []),
    ];

    console.log(`[SerpAPI] Found ${allHotels.length} hotels (${data.properties?.length || 0} properties + ${data.ads?.length || 0} ads)`);
    console.log(`[SerpAPI] Total results available: ${data.search_information?.total_results || 'unknown'}`);

    return NextResponse.json({
      success: true,
      hotels: allHotels,
      total_results: data.search_information?.total_results || allHotels.length,
      search_metadata: data.search_metadata,
    });

  } catch (error) {
    console.error('[SerpAPI] Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Server error: ${msg}` },
      { status: 500 }
    );
  }
}

