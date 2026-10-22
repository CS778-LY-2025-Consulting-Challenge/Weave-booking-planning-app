import { NextRequest, NextResponse } from 'next/server';
import { searchAviationStackAsSerpApi } from '@/services/aviationstackService';
import { flightSearchLimiter, getClientIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

export async function GET(request: NextRequest) {
  // Rate limit: 30 requests per hour per visitor
  const { identifier } = await getClientIdentifier(request);
  const rateLimit = await checkRateLimit(flightSearchLimiter, identifier);
  if (!rateLimit.success) {
    console.warn(`[Flights API] Rate limit reached for ${identifier}`);
    return createRateLimitResponse(
      rateLimit,
      'You have reached the limit of 30 flight searches per hour. Please try again shortly.'
    );
  }

  try {
    const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
    const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;
    const searchParams = request.nextUrl.searchParams;
    
    const departureId = searchParams.get('departure_id') || searchParams.get('from');
    const arrivalId = searchParams.get('arrival_id') || searchParams.get('to');
    const outboundDate = searchParams.get('outbound_date') || searchParams.get('departureDate');
    const returnDate = searchParams.get('return_date') || searchParams.get('returnDate') || undefined;
    const type = searchParams.get('type') || (returnDate ? '1' : '2'); // 1=Round trip, 2=One-way
    const adults = searchParams.get('adults') || '1';
    const children = searchParams.get('children') || '0';
    const infants = searchParams.get('infants_in_seat') || searchParams.get('infants') || '0';
    const currency = searchParams.get('currency') || 'USD';
    const travelClass = searchParams.get('travel_class') || '1';
    const requestedProvider = searchParams.get('provider') || process.env.FLIGHT_API_PROVIDER;

    console.log('[Flights API] Search params:', {
      departureId,
      arrivalId,
      outboundDate,
      returnDate,
      type,
      adults,
      children,
      infants,
      requestedProvider
    });

    if (!departureId || !arrivalId || !outboundDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: departure_id, arrival_id, outbound_date' },
        { status: 400 }
      );
    }

    // Validate round trip requirements
    if (type === '1' && !returnDate) {
      return NextResponse.json(
        { error: 'return_date is required for round trip flights (type=1)' },
        { status: 400 }
      );
    }

    const preferSerpApi = requestedProvider === 'serpapi' && Boolean(SERPAPI_API_KEY);
    const preferAviationStack = Boolean(AVIATIONSTACK_API_KEY) && (requestedProvider === 'aviationstack' || !preferSerpApi);

    if (preferAviationStack) {
      try {
        console.log(`[Flights API] Executing AviationStack search: ${departureId} → ${arrivalId}`);
        const data = await searchAviationStackAsSerpApi({
          departure_id: departureId,
          arrival_id: arrivalId,
          outbound_date: outboundDate,
          return_date: returnDate,
          type,
          currency,
          adults,
          children,
          infants,
          travel_class: travelClass,
        });

        const allFlights = [
          ...(data.best_flights || []),
          ...(data.other_flights || []),
        ];

        return NextResponse.json({
          success: true,
          flights: allFlights,
          total_results: allFlights.length,
          search_metadata: data.search_metadata,
          search_parameters: data.search_parameters,
        });
      } catch (aviationErr) {
        console.error('[Flights API] AviationStack error:', aviationErr);
        if (!SERPAPI_API_KEY) {
          throw aviationErr;
        }
        console.warn('[Flights API] Falling back to SerpAPI...');
      }
    }

    if (!SERPAPI_API_KEY) {
      console.error('[Flights API] Neither AviationStack nor SerpAPI API keys configured');
      return NextResponse.json(
        { error: 'Flight API key not configured. Please add AVIATIONSTACK_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    // Build SerpAPI Google Flights query
    const params = new URLSearchParams({
      engine: 'google_flights',
      departure_id: departureId,
      arrival_id: arrivalId,
      outbound_date: outboundDate,
      type: type,
      currency: currency,
      hl: 'en',
      gl: 'us',
      adults: adults,
      children: children,
      infants_in_seat: infants,
      travel_class: travelClass,
      api_key: SERPAPI_API_KEY,
    });

    if (returnDate && type === '1') {
      params.append('return_date', returnDate);
    }

    const url = `${SERPAPI_BASE_URL}?${params.toString()}`;
    console.log(`[Flights API] Fetching from SerpAPI: ${url.replace(SERPAPI_API_KEY, 'HIDDEN')}`);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Flights API] SerpAPI error:', response.status, errorText);
      return NextResponse.json(
        { error: `SerpAPI error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Check for API-level errors
    if (data.error) {
      console.error('[Flights API] SerpAPI returned error:', data.error);
      return NextResponse.json(
        { error: data.error },
        { status: 400 }
      );
    }

    // Combine best_flights and other_flights
    const allFlights = [
      ...(data.best_flights || []),
      ...(data.other_flights || []),
    ];

    console.log(`[Flights API] Successfully fetched ${allFlights.length} flights`);

    return NextResponse.json({
      success: true,
      flights: allFlights,
      total_results: allFlights.length,
      search_metadata: data.search_metadata,
      search_parameters: data.search_parameters,
    });

  } catch (error) {
    console.error('[Flights API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search flights' },
      { status: 500 }
    );
  }
}
