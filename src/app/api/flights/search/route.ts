import { NextResponse } from 'next/server';
import { searchAllFlights, getSearchStats } from '@/services/unifiedFlightService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { from, to, date, returnDate, passengers = 1, travelClass = 1, type = 2 } = body;

    console.log('[Flights API] Unified search request:', { from, to, date, returnDate, passengers, type });

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters: from and to' },
        { status: 400 }
      );
    }

    // Parse passengers
    const totalPassengers = typeof passengers === 'number' ? passengers : 1;

    // Search using unified service (combines Google Flights + Aviationstack)
    const searchResult = await searchAllFlights({
      from,
      to,
      date,
      returnDate,
      passengers: totalPassengers,
      travelClass,
      type,
      currency: 'USD',
    });

    const { flights, summary } = searchResult;

    // Log search statistics (for debugging, not shown to users)
    console.log(`[Flights API] ${getSearchStats(searchResult)}`);
    console.log(`[Flights API] API Status - Google: ${summary.apiStatus.googleFlights}, Aviationstack: ${summary.apiStatus.aviationstack}`);

    // Format response to match existing UI structure
    const results = flights.map((flight) => ({
      id: flight.id,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      airlineCode: flight.airlineCode,
      logo: flight.logo,
      departure: {
        airport: flight.departure.airport,
        iata: flight.departure.iata,
        scheduled: flight.departure.scheduled || flight.departure.time,
        terminal: flight.departure.terminal,
        gate: flight.departure.gate,
      },
      arrival: {
        airport: flight.arrival.airport,
        iata: flight.arrival.iata,
        scheduled: flight.arrival.scheduled || flight.arrival.time,
        terminal: flight.arrival.terminal,
        gate: flight.arrival.gate,
      },
      duration: flight.duration,
      stops: flight.stops,
      stopsText: flight.stopsText,
      aircraft: flight.aircraft,
      price: flight.price,
      status: flight.status,
      source: flight.source, // For debugging (not shown to users)
    }));

    return NextResponse.json({
      results,
      total: results.length,
      from: flights[0]?.departure.iata || from,
      to: flights[0]?.arrival.iata || to,
      // Include metadata for debugging (not shown to users)
      _meta: {
        sources: {
          googleFlights: summary.fromGoogleFlights,
          aviationstack: summary.fromAviationstack,
        },
      },
    });
  } catch (error: any) {
    console.error('[Flights API] Error:', error);
    
    // Return empty results instead of error to maintain seamless UX
    return NextResponse.json({
      results: [],
      total: 0,
      from: '',
      to: '',
    });
  }
}

