import { NextResponse } from 'next/server';

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

    const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY || 'a173b1b2eb40369a4b71af4317372896';

    // Helper function to get IATA code
    const getIATACode = (cityName: string): string => {
      const CITY_TO_IATA: Record<string, string> = {
        'Auckland': 'AKL', 'Tokyo': 'NRT', 'Shanghai': 'PVG', 'Beijing': 'PEK',
        'Sydney': 'SYD', 'Melbourne': 'MEL', 'Brisbane': 'BNE',
        'Wellington': 'WLG', 'Christchurch': 'CHC', 'Queenstown': 'ZQN',
        'New York': 'JFK', 'Los Angeles': 'LAX', 'San Francisco': 'SFO',
        'London': 'LHR', 'Paris': 'CDG', 'Singapore': 'SIN',
        'Bangkok': 'BKK', 'Seoul': 'ICN', 'Hong Kong': 'HKG', 'Dubai': 'DXB',
      };
      
      if (CITY_TO_IATA[cityName]) return CITY_TO_IATA[cityName];
      const lowerCity = cityName.toLowerCase();
      for (const [city, code] of Object.entries(CITY_TO_IATA)) {
        if (city.toLowerCase() === lowerCity || cityName.toLowerCase().includes(city.toLowerCase())) {
          return code;
        }
      }
      return cityName.substring(0, 3).toUpperCase();
    };

    const fromCode = getIATACode(from);
    const toCode = getIATACode(to);

    console.log('[Test Aviationstack] Testing flight search:', { from, to, fromCode, toCode });
    console.log('[Test Aviationstack] API Key:', AVIATIONSTACK_API_KEY.substring(0, 8) + '...');

    // Call Aviationstack API
    const apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_API_KEY}&dep_iata=${fromCode}&arr_iata=${toCode}&limit=3`;
    
    console.log('[Test Aviationstack] Calling:', apiUrl.replace(AVIATIONSTACK_API_KEY, 'API_KEY_HIDDEN'));

    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log('[Test Aviationstack] Response status:', response.status);
    console.log('[Test Aviationstack] Response data:', JSON.stringify(data).substring(0, 200));

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: `API returned ${response.status}`,
          details: data,
          fromCode,
          toCode,
        },
        { status: 500 }
      );
    }

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
    let duration = '10h 30m';
    let depDate: Date | null = null;
    let arrDate: Date | null = null;

    if (departure?.scheduled && arrival?.scheduled) {
      try {
        depDate = new Date(departure.scheduled);
        arrDate = new Date(arrival.scheduled);
        const diffMs = arrDate.getTime() - depDate.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        duration = `${hours}h ${minutes}m`;
      } catch (e) {
        console.warn('[Test Aviationstack] Duration calculation failed:', e);
      }
    }

    // Get departure date
    const flightDate = depDate 
      ? depDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

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

