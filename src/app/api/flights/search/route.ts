import { NextResponse } from 'next/server';

const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY || 'a173b1b2eb40369a4b71af4317372896';

interface FlightSearchParams {
  from: string;
  to: string;
  date?: string; // ISO date format: YYYY-MM-DD
  passengers?: number;
}

// City/IATA code mapping for common cities
const CITY_TO_IATA: Record<string, string> = {
  'Auckland': 'AKL',
  'Tokyo': 'NRT', // Narita or HND (Haneda)
  'Shanghai': 'PVG',
  'Beijing': 'PEK',
  'Sydney': 'SYD',
  'Melbourne': 'MEL',
  'Brisbane': 'BNE',
  'Wellington': 'WLG',
  'Christchurch': 'CHC',
  'Queenstown': 'ZQN',
  'New York': 'JFK',
  'Los Angeles': 'LAX',
  'San Francisco': 'SFO',
  'London': 'LHR',
  'Paris': 'CDG',
  'Singapore': 'SIN',
  'Bangkok': 'BKK',
  'Seoul': 'ICN',
  'Hong Kong': 'HKG',
  'Dubai': 'DXB',
};

// Extract IATA code from city name
const getIATACode = (cityName: string): string => {
  // Try direct mapping first
  if (CITY_TO_IATA[cityName]) {
    return CITY_TO_IATA[cityName];
  }
  
  // Try case-insensitive match
  const lowerCity = cityName.toLowerCase();
  for (const [city, code] of Object.entries(CITY_TO_IATA)) {
    if (city.toLowerCase() === lowerCity) {
      return code;
    }
  }
  
  // Try partial match (e.g., "Tokyo" in "Tokyo, Japan")
  for (const [city, code] of Object.entries(CITY_TO_IATA)) {
    if (cityName.toLowerCase().includes(city.toLowerCase())) {
      return code;
    }
  }
  
  // If not found, try to use the first 3 uppercase letters as fallback
  return cityName.substring(0, 3).toUpperCase();
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { from, to, date, passengers = 2 }: FlightSearchParams = body;

    if (!from || !to) {
      return NextResponse.json(
        { error: 'from and to are required' },
        { status: 400 }
      );
    }

    const fromCode = getIATACode(from);
    const toCode = getIATACode(to);

    console.log(`[Flights API] Searching flights: ${from} (${fromCode}) → ${to} (${toCode})`);

    // Aviationstack API endpoint for flight search
    // Note: aviationstack provides scheduled flights data
    // For real-time pricing, we'd need a different endpoint or service
    const apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_API_KEY}&dep_iata=${fromCode}&arr_iata=${toCode}&limit=10`;

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Flights API] Aviationstack error:', errorText);
      return NextResponse.json(
        { error: `Flight API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log('[Flights API] No flights found');
      // Return mock data as fallback for demonstration
      return NextResponse.json({
        results: generateMockFlights(from, to, fromCode, toCode, date, passengers),
        fallback: true,
      });
    }

    // Transform aviationstack data to our format
    const flights = data.data.map((flight: any, index: number) => {
      const departure = flight.departure;
      const arrival = flight.arrival;
      const airline = flight.airline;

      return {
        id: flight.flight?.iata || `flight-${index}`,
        flightNumber: flight.flight?.iata || `${airline?.iata || 'XX'}${index + 100}`,
        airline: airline?.name || 'Unknown Airline',
        airlineCode: airline?.iata || 'XX',
        departure: {
          airport: departure?.airport || from,
          iata: departure?.iata || fromCode,
          scheduled: departure?.scheduled || date ? `${date}T10:00:00` : undefined,
        },
        arrival: {
          airport: arrival?.airport || to,
          iata: arrival?.iata || toCode,
          scheduled: arrival?.scheduled || date ? `${date}T14:00:00` : undefined,
        },
        stops: 0, // aviationstack may not always provide this
        duration: calculateDuration(departure?.scheduled, arrival?.scheduled),
        aircraft: flight.aircraft?.iata || 'Unknown',
        status: flight.flight_status || 'scheduled',
        price: generatePriceEstimate(fromCode, toCode, passengers), // Aviationstack doesn't provide pricing
        bookingUrl: generateBookingUrl(fromCode, toCode, date || new Date().toISOString().split('T')[0]),
      };
    });

    // If we got less than 3 results, supplement with mock data
    if (flights.length < 3) {
      const mockFlights = generateMockFlights(from, to, fromCode, toCode, date, passengers);
      flights.push(...mockFlights.slice(flights.length));
    }

    return NextResponse.json({
      results: flights.slice(0, 10), // Limit to 10 results
    });
  } catch (error: any) {
    console.error('[Flights API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search flights', results: [] },
      { status: 500 }
    );
  }
}

// Helper: Generate mock flights for demonstration
function generateMockFlights(
  from: string,
  to: string,
  fromCode: string,
  toCode: string,
  date?: string,
  passengers: number = 2
) {
  const airlines = [
    { name: 'Air New Zealand', code: 'NZ' },
    { name: 'Singapore Airlines', code: 'SQ' },
    { name: 'Qantas', code: 'QF' },
    { name: 'Cathay Pacific', code: 'CX' },
    { name: 'Japan Airlines', code: 'JL' },
    { name: 'Air China', code: 'CA' },
  ];

  const departureDate = date || new Date().toISOString().split('T')[0];
  const basePrices: Record<string, number> = {
    'AKL-NRT': 1200,
    'AKL-SYD': 300,
    'SYD-NRT': 800,
    'NRT-PVG': 500,
    'AKL-PVG': 1400,
  };

  const route = `${fromCode}-${toCode}`;
  const basePrice = basePrices[route] || 1000;

  return airlines.slice(0, 3).map((airline, index) => {
    const departureHour = 8 + index * 4; // 8am, 12pm, 4pm
    const duration = route.includes('AKL') && route.includes('NRT') ? 11 : 9;
    
    return {
      id: `mock-${airline.code}-${index}`,
      flightNumber: `${airline.code}${100 + index}`,
      airline: airline.name,
      airlineCode: airline.code,
      departure: {
        airport: from,
        iata: fromCode,
        scheduled: `${departureDate}T${String(departureHour).padStart(2, '0')}:00:00`,
      },
      arrival: {
        airport: to,
        iata: toCode,
        scheduled: `${departureDate}T${String((departureHour + duration) % 24).padStart(2, '0')}:00:00`,
      },
      stops: index === 2 ? 1 : 0, // Third flight has a stop
      duration: `${duration}h ${index * 20}m`,
      aircraft: 'Boeing 777',
      status: 'scheduled',
      price: `NZ$${(basePrice + index * 200) * passengers}`,
      bookingUrl: generateBookingUrl(fromCode, toCode, departureDate),
    };
  });
}

// Helper: Calculate flight duration
function calculateDuration(departure?: string, arrival?: string): string {
  if (!departure || !arrival) return '10h 30m';
  
  try {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  } catch {
    return '10h 30m';
  }
}

// Helper: Generate price estimate based on route
function generatePriceEstimate(fromCode: string, toCode: string, passengers: number): string {
  const route = `${fromCode}-${toCode}`;
  const basePrices: Record<string, number> = {
    'AKL-NRT': 1200,
    'AKL-SYD': 300,
    'SYD-NRT': 800,
    'NRT-PVG': 500,
    'AKL-PVG': 1400,
    'NRT-AKL': 1200,
    'SYD-AKL': 300,
    'PVG-NRT': 500,
    'PVG-AKL': 1400,
  };
  
  const basePrice = basePrices[route] || 1000;
  const total = basePrice * passengers;
  
  return `NZ$${total.toLocaleString()}`;
}

// Helper: Generate booking URL
function generateBookingUrl(fromCode: string, toCode: string, date: string): string {
  // Generate Google Flights search URL
  const params = new URLSearchParams({
    q: `${fromCode} to ${toCode}`,
    date: date,
  });
  return `https://www.google.com/travel/flights?${params.toString()}`;
}

