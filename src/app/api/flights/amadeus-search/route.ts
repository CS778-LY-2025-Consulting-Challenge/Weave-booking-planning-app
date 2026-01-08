import { NextRequest, NextResponse } from 'next/server';
import Amadeus from 'amadeus';

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
  hostname: process.env.AMADEUS_ENVIRONMENT === 'production' ? 'production' : 'test'
});

interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  nonStop?: boolean;
  currencyCode?: string;
  maxResults?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: FlightSearchParams = await request.json();
    
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      infants = 0,
      travelClass = 'ECONOMY',
      nonStop = false,
      currencyCode = 'USD',
      maxResults = 50
    } = body;

    // Validation
    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: originLocationCode, destinationLocationCode, or departureDate' },
        { status: 400 }
      );
    }

    console.log('[Amadeus Flight Search] Searching flights:', {
      from: originLocationCode,
      to: destinationLocationCode,
      departure: departureDate,
      return: returnDate,
      passengers: { adults, children, infants },
      class: travelClass
    });

    // Build search parameters
    const searchParams: any = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      currencyCode,
      max: maxResults,
      travelClass
    };

    // Add optional parameters
    if (returnDate) {
      searchParams.returnDate = returnDate;
    }
    if (children > 0) {
      searchParams.children = children;
    }
    if (infants > 0) {
      searchParams.infants = infants;
    }
    if (nonStop) {
      searchParams.nonStop = true;
    }

    // Call Amadeus Flight Offers Search API
    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);

    console.log(`[Amadeus Flight Search] Found ${response.data.length} flight offers`);

    // Transform the response for easier frontend consumption
    const transformedFlights = response.data.map((offer: any) => {
      const outbound = offer.itineraries[0];
      const inbound = offer.itineraries[1];
      const firstSegment = outbound.segments[0];
      const lastSegment = outbound.segments[outbound.segments.length - 1];

      // Calculate total duration
      const duration = parseDuration(outbound.duration);
      
      // Determine number of stops
      const stops = outbound.segments.length - 1;

      // Get price information
      const price = parseFloat(offer.price.total);
      const pricePerPerson = price / (adults + children);

      // Get cabin class
      const cabin = firstSegment.cabin || travelClass;

      // Get airline info
      const airlineCode = firstSegment.carrierCode;

      return {
        id: offer.id,
        type: offer.type,
        source: offer.source,
        instantTicketingRequired: offer.instantTicketingRequired,
        nonHomogeneous: offer.nonHomogeneous,
        oneWay: offer.oneWay,
        lastTicketingDate: offer.lastTicketingDate,
        numberOfBookableSeats: offer.numberOfBookableSeats,
        
        // Outbound flight details
        outbound: {
          duration: outbound.duration,
          durationFormatted: duration,
          segments: outbound.segments.map((seg: any) => ({
            departure: {
              iataCode: seg.departure.iataCode,
              terminal: seg.departure.terminal,
              at: seg.departure.at
            },
            arrival: {
              iataCode: seg.arrival.iataCode,
              terminal: seg.arrival.terminal,
              at: seg.arrival.at
            },
            carrierCode: seg.carrierCode,
            number: seg.number,
            aircraft: seg.aircraft?.code,
            duration: seg.duration,
            numberOfStops: seg.numberOfStops || 0,
            cabin: seg.cabin
          }))
        },

        // Inbound flight details (if round trip)
        inbound: inbound ? {
          duration: inbound.duration,
          durationFormatted: parseDuration(inbound.duration),
          segments: inbound.segments.map((seg: any) => ({
            departure: {
              iataCode: seg.departure.iataCode,
              terminal: seg.departure.terminal,
              at: seg.departure.at
            },
            arrival: {
              iataCode: seg.arrival.iataCode,
              terminal: seg.arrival.terminal,
              at: seg.arrival.at
            },
            carrierCode: seg.carrierCode,
            number: seg.number,
            aircraft: seg.aircraft?.code,
            duration: seg.duration,
            numberOfStops: seg.numberOfStops || 0,
            cabin: seg.cabin
          }))
        } : null,

        // Summary information
        summary: {
          from: firstSegment.departure.iataCode,
          to: lastSegment.arrival.iataCode,
          departureTime: formatTime(firstSegment.departure.at),
          arrivalTime: formatTime(lastSegment.arrival.at),
          duration: duration,
          stops: stops,
          stopsText: stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`,
          cabin: cabin,
          airline: airlineCode,
          departureDate: firstSegment.departure.at.split('T')[0],
          arrivalDate: lastSegment.arrival.at.split('T')[0]
        },

        // Pricing
        price: {
          currency: offer.price.currency,
          total: price,
          base: parseFloat(offer.price.base || offer.price.total),
          fees: offer.price.fees?.map((fee: any) => ({
            amount: parseFloat(fee.amount),
            type: fee.type
          })) || [],
          grandTotal: parseFloat(offer.price.grandTotal || offer.price.total),
          pricePerPerson: pricePerPerson
        },

        // Pricing by traveler type
        pricingOptions: offer.pricingOptions,
        validatingAirlineCodes: offer.validatingAirlineCodes,
        travelerPricings: offer.travelerPricings
      };
    });

    // Sort by price (lowest first)
    transformedFlights.sort((a: any, b: any) => a.price.total - b.price.total);

    return NextResponse.json({
      success: true,
      meta: {
        count: transformedFlights.length,
        searchParams: {
          from: originLocationCode,
          to: destinationLocationCode,
          departureDate,
          returnDate,
          passengers: { adults, children, infants },
          travelClass
        }
      },
      data: transformedFlights,
      dictionaries: response.dictionaries // Include carrier codes, aircraft codes, etc.
    });

  } catch (error: any) {
    console.error('[Amadeus Flight Search] Error:', error);
    
    // Handle Amadeus API errors
    if (error.response) {
      const amadeusError = error.response.body || error.response;
      return NextResponse.json(
        { 
          error: 'Amadeus API error',
          details: amadeusError.errors || amadeusError,
          message: amadeusError.errors?.[0]?.detail || 'Failed to search flights'
        },
        { status: error.response.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to search flights',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Helper function to parse ISO 8601 duration to readable format
function parseDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;

  return `${hours}h ${minutes}m`;
}

// Helper function to format time from ISO datetime
function formatTime(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}
