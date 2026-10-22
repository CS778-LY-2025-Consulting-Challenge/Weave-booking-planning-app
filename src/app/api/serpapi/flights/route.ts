import { NextRequest, NextResponse } from 'next/server';
import {
    searchAviationStackAsSerpApi,
    SerpApiFlight,
    SerpApiFlightResponse
} from '@/services/aviationstackService';
import { flightSearchLimiter, getClientIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

/**
 * Unified Flight Search API Endpoint
 * Supports AviationStack API (Primary/Preferred) and SerpAPI (Alternative/Fallback)
 * with full feature parity: cabin class, passenger count, stops, layovers, logos, and dynamic pricing.
 */

export async function GET(request: NextRequest) {
    // Rate limit: 30 requests per hour per visitor
    const { identifier } = await getClientIdentifier(request);
    const rateLimit = await checkRateLimit(flightSearchLimiter, identifier);
    if (!rateLimit.success) {
        console.warn(`[FlightAPI] Rate limit reached for ${identifier}`);
        return createRateLimitResponse(
            rateLimit,
            'You have reached the limit of 30 flight searches per hour. Please try again shortly.'
        );
    }

    try {
        const searchParams = request.nextUrl.searchParams;

        // Required parameters
        const departureId = searchParams.get('departure_id') || searchParams.get('from');
        const arrivalId = searchParams.get('arrival_id') || searchParams.get('to');
        const outboundDate = searchParams.get('outbound_date') || searchParams.get('date');

        // Optional parameters
        const returnDate = searchParams.get('return_date') || searchParams.get('returnDate') || undefined;
        const type = searchParams.get('type') || (returnDate ? '1' : '2'); // 1=Round trip, 2=One-way
        const currency = searchParams.get('currency') || 'USD';
        const hl = searchParams.get('hl') || 'en';
        const gl = searchParams.get('gl') || 'us';
        const adults = searchParams.get('adults') || '1';
        const children = searchParams.get('children') || '0';
        const infants = searchParams.get('infants_in_seat') || searchParams.get('infants') || '0';
        const cabinClass = searchParams.get('travel_class') || '1'; // 1=Economy, 2=Premium Economy, 3=Business, 4=First
        const requestedProvider = searchParams.get('provider') || process.env.FLIGHT_API_PROVIDER;

        console.log('[FlightAPI] Search request:', {
            departureId,
            arrivalId,
            outboundDate,
            returnDate,
            type,
            currency,
            adults,
            children,
            cabinClass,
            requestedProvider
        });

        if (!departureId || !arrivalId || !outboundDate) {
            console.error('[FlightAPI] Missing required parameters');
            return NextResponse.json(
                { error: 'Missing required parameters: departure_id, arrival_id, outbound_date' },
                { status: 400 }
            );
        }

        // Validate round trip requirements
        if (type === '1' && !returnDate) {
            console.error('[FlightAPI] return_date is required for round trip flights');
            return NextResponse.json(
                { error: '`return_date` is required if `type` is `1` (Round trip).' },
                { status: 400 }
            );
        }

        const aviationStackKey = process.env.AVIATIONSTACK_API_KEY;
        const serpApiKey = process.env.SERPAPI_API_KEY;

        // Determine which provider to prioritize
        // User requested AviationStack API with same feature set as SerpAPI
        const preferSerpApi = requestedProvider === 'serpapi' && Boolean(serpApiKey);
        const preferAviationStack = Boolean(aviationStackKey) && (requestedProvider === 'aviationstack' || !preferSerpApi);

        if (!aviationStackKey && !serpApiKey) {
            console.warn('[FlightAPI] Neither AVIATIONSTACK_API_KEY nor SERPAPI_API_KEY found');
            return NextResponse.json(
                { error: 'Flight API key not configured. Please add AVIATIONSTACK_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        // Helper function for AviationStack execution
        const executeAviationStack = async () => {
            console.log(`[FlightAPI] Searching flights via AviationStack: ${departureId} → ${arrivalId} on ${outboundDate}`);
            const data = await searchAviationStackAsSerpApi({
                departure_id: departureId,
                arrival_id: arrivalId,
                outbound_date: outboundDate,
                return_date: returnDate,
                type,
                currency,
                hl,
                gl,
                adults,
                children,
                infants,
                travel_class: cabinClass,
            });

            const allFlights = [
                ...(data.best_flights || []),
                ...(data.other_flights || []),
            ];

            return {
                success: true,
                flights: allFlights,
                total_results: allFlights.length,
                search_metadata: data.search_metadata,
                search_parameters: data.search_parameters,
            };
        };

        // Helper function for SerpAPI execution
        const executeSerpApi = async () => {
            if (!serpApiKey) throw new Error('SERPAPI_API_KEY not configured');

            const serpApiParams = new URLSearchParams({
                engine: 'google_flights',
                departure_id: departureId,
                arrival_id: arrivalId,
                outbound_date: outboundDate,
                type: type,
                currency: currency,
                hl: hl,
                gl: gl,
                adults: adults,
                children: children,
                infants_in_seat: infants,
                travel_class: cabinClass,
                api_key: serpApiKey,
            });

            if (returnDate && type === '1') {
                serpApiParams.append('return_date', returnDate);
            }

            const serpApiUrl = `https://serpapi.com/search.json?${serpApiParams.toString()}`;
            console.log(`[FlightAPI] Searching flights via SerpAPI: ${departureId} → ${arrivalId} on ${outboundDate}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);

            try {
                const response = await fetch(serpApiUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Weave-Travel-App/1.0',
                    },
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                const data: SerpApiFlightResponse = await response.json();

                if (!response.ok || data.error) {
                    throw new Error(data.error || `SerpAPI request failed with status ${response.status}`);
                }

                const allFlights = [
                    ...(data.best_flights || []),
                    ...(data.other_flights || []),
                ];

                return {
                    success: true,
                    flights: allFlights,
                    total_results: allFlights.length,
                    search_metadata: data.search_metadata,
                    search_parameters: data.search_parameters,
                };
            } catch (err) {
                clearTimeout(timeoutId);
                throw err;
            }
        };

        // Execution strategy: Try preferred provider first, fall back to secondary provider if available
        if (preferAviationStack) {
            try {
                const result = await executeAviationStack();
                return NextResponse.json(result);
            } catch (aviationErr) {
                console.error('[FlightAPI] AviationStack error:', aviationErr);
                if (serpApiKey) {
                    console.warn('[FlightAPI] Falling back to SerpAPI...');
                    try {
                        const fallbackResult = await executeSerpApi();
                        return NextResponse.json(fallbackResult);
                    } catch (serpErr) {
                        console.error('[FlightAPI] Both providers failed. SerpAPI error:', serpErr);
                    }
                }
                const msg = aviationErr instanceof Error ? aviationErr.message : 'AviationStack search failed';
                return NextResponse.json({ error: msg }, { status: 500 });
            }
        } else {
            try {
                const result = await executeSerpApi();
                return NextResponse.json(result);
            } catch (serpErr) {
                console.error('[FlightAPI] SerpAPI error:', serpErr);
                if (aviationStackKey) {
                    console.warn('[FlightAPI] Falling back to AviationStack...');
                    try {
                        const fallbackResult = await executeAviationStack();
                        return NextResponse.json(fallbackResult);
                    } catch (aviationErr) {
                        console.error('[FlightAPI] Both providers failed. AviationStack error:', aviationErr);
                    }
                }
                const msg = serpErr instanceof Error ? serpErr.message : 'Flight search failed';
                return NextResponse.json({ error: msg }, { status: 500 });
            }
        }
    } catch (error) {
        console.error('[FlightAPI] Server error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Server error: ${msg}` },
            { status: 500 }
        );
    }
}
