import { NextResponse } from 'next/server';
import { searchFlights, getIATACode, calculateDuration } from '@/services/aviationstackService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { from, to } = body;

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing from or to city' },
        { status: 400 }
      );
    }

    const fromCode = getIATACode(from);
    const toCode = getIATACode(to);

    console.log('[Test Aviationstack] Testing flight search:', { from, to, fromCode, toCode });

    // Use centralized service
    const data = await searchFlights({
      from,
      to,
      limit: 3,
    });

    console.log('[Test Aviationstack] Response data:', JSON.stringify(data).substring(0, 200));

    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { 
          error: 'No flights found',
          details: data,
          fromCode,
          toCode,
        },
        { status: 404 }
      );
    }

    // Parse first flight
    const flight = data.data[0];
    const departure = flight.departure;
    const arrival = flight.arrival;
    const airline = flight.airline;

    // Calculate duration
    const duration = calculateDuration(departure?.scheduled, arrival?.scheduled);

    // Get departure date
    const depDate = departure?.scheduled ? new Date(departure.scheduled) : new Date();
    const flightDate = depDate.toISOString().split('T')[0];

    // Format time string
    const formattedTime = departure?.scheduled && arrival?.scheduled
      ? `${new Date(departure.scheduled).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(arrival.scheduled).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`
      : '10:00 - 14:00';

    const result = {
      success: true,
      fromCode,
      toCode,
      flightNumber: flight.flight?.iata || `${airline?.iata || 'XX'}100`,
      airline: airline?.name || 'Unknown Airline',
      airlineCode: airline?.iata || 'XX',
      duration,
      aircraft: flight.aircraft?.iata || 'Unknown',
      price: 'NZ$1,200',
      time: formattedTime,
      date: flightDate,
      rawData: data,
    };

    console.log('[Test Aviationstack] Parsed result:', result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Test Aviationstack] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

