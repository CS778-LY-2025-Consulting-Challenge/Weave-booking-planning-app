import { NextRequest, NextResponse } from 'next/server';

/**
 * SerpAPI Google Flights API Integration
 * 
 * Documentation: https://serpapi.com/google-flights-api
 */

interface SerpApiFlight {
    flights: Array<{
        departure_airport: {
            name: string;
            id: string;
            time: string;
        };
        arrival_airport: {
            name: string;
            id: string;
            time: string;
        };
        duration: number;
        airplane: string;
        airline: string;
        airline_logo: string;
        travel_class: string;
        flight_number: string;
        extensions: string[];
    }>;
    layovers?: Array<{
        duration: number;
        name: string;
        id: string;
    }>;
    total_duration: number;
    carbon_emissions?: {
        this_flight: number;
    };
    price: number;
    type: string;
    airline_logo: string;
}

interface SerpApiFlightResponse {
    search_metadata: {
        id: string;
        status: string;
        json_endpoint: string;
        created_at: string;
        processed_at: string;
        google_flights_url: string;
        raw_html_file: string;
        total_time_taken: number;
    };
    search_parameters: {
        engine: string;
        hl: string;
        gl: string;
        departure_id: string;
        arrival_id: string;
        outbound_date: string;
        return_date?: string;
        currency: string;
    };
    best_flights?: SerpApiFlight[];
    other_flights?: SerpApiFlight[];
    error?: string;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Required parameters
        const departureId = searchParams.get('departure_id');
        const arrivalId = searchParams.get('arrival_id');
        const outboundDate = searchParams.get('outbound_date');

        // Optional parameters
        const returnDate = searchParams.get('return_date');
        const type = searchParams.get('type') || (returnDate ? '1' : '2'); // 1=Round trip, 2=One-way
        const currency = searchParams.get('currency') || 'USD';
        const hl = searchParams.get('hl') || 'en';
        const gl = searchParams.get('gl') || 'us';
        const adults = searchParams.get('adults') || '1';
        const children = searchParams.get('children') || '0';
        const infants = searchParams.get('infants_in_seat') || '0';
        const cabinClass = searchParams.get('travel_class') || '1'; // 1=Economy, 2=Premium Economy, 3=Business, 4=First

        console.log('[SerpAPI] Request parameters:', {
            departureId,
            arrivalId,
            outboundDate,
            returnDate,
            type,
            currency,
            adults,
            children,
            cabinClass
        });

        if (!departureId || !arrivalId || !outboundDate) {
            console.error('[SerpAPI] Missing required parameters');
            return NextResponse.json(
                { error: 'Missing required parameters: departure_id, arrival_id, outbound_date' },
                { status: 400 }
            );
        }

        // Validate round trip requirements
        if (type === '1' && !returnDate) {
            console.error('[SerpAPI] return_date is required for round trip flights');
            return NextResponse.json(
                { error: '`return_date` is required if `type` is `1` (Round trip).' },
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
            api_key: apiKey,
        });

        if (returnDate && type === '1') {
            serpApiParams.append('return_date', returnDate);
        }

        const serpApiUrl = `https://serpapi.com/search.json?${serpApiParams.toString()}`;

        console.log(`[SerpAPI] Searching flights from ${departureId} to ${arrivalId} on ${outboundDate}`);
        console.log(`[SerpAPI] Full request URL (key hidden):`, serpApiUrl.replace(apiKey, 'HIDDEN_KEY'));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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

            if (!response.ok) {
                console.error(`[SerpAPI] API error: ${response.status} ${response.statusText}`);
                console.error(`[SerpAPI] Error response body:`, JSON.stringify(data, null, 2));
                
                // Return the actual error message from SerpAPI if available
                const errorMessage = data.error || `SerpAPI request failed with status ${response.status}`;
                return NextResponse.json(
                    { 
                        error: errorMessage,
                        details: data,
                        status: response.status
                    },
                    { status: response.status }
                );
            }

            if (data.error) {
                console.error(`[SerpAPI] API returned error:`, data.error);
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

            console.log(`[SerpAPI] Found ${allFlights.length} flights`);

            return NextResponse.json({
                success: true,
                flights: allFlights,
                total_results: allFlights.length,
                search_metadata: data.search_metadata,
                search_parameters: data.search_parameters,
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError instanceof Error) {
                if (fetchError.name === 'AbortError') {
                    console.error('[SerpAPI] Request timed out after 30 seconds');
                    return NextResponse.json(
                        { error: 'Request timed out. Please try again.' },
                        { status: 504 }
                    );
                }
                
                console.error('[SerpAPI] Network error:', fetchError.message);
                return NextResponse.json(
                    { error: `Network error: ${fetchError.message}` },
                    { status: 503 }
                );
            }
            
            throw fetchError;
        }

    } catch (error) {
        console.error('[SerpAPI] Error:', error);
        console.error('[SerpAPI] Error stack:', error instanceof Error ? error.stack : 'No stack');
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Server error: ${msg}` },
            { status: 500 }
        );
    }
}
