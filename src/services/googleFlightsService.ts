/**
 * Google Flights API Service via SerpAPI
 * Documentation: https://serpapi.com/google-flights-api
 * 
 * Benefits over AviationStack:
 * - More comprehensive flight data from Google Flights
 * - Better pricing information
 * - More airlines and routes covered
 * - Detailed layover information
 * - Carbon emissions data
 * - Price insights and history
 */

// In-memory cache for flight data (expires after 10 minutes)
const flightCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Comprehensive IATA code mapping for major cities worldwide
export const CITY_TO_IATA: Record<string, string> = {
  // Oceania
  'Auckland': 'AKL',
  'Wellington': 'WLG',
  'Christchurch': 'CHC',
  'Queenstown': 'ZQN',
  'Sydney': 'SYD',
  'Melbourne': 'MEL',
  'Brisbane': 'BNE',
  'Perth': 'PER',
  'Adelaide': 'ADL',
  'Gold Coast': 'OOL',
  'Cairns': 'CNS',
  
  // Asia
  'Tokyo': 'NRT',
  'Osaka': 'KIX',
  'Nagoya': 'NGO',
  'Shanghai': 'PVG',
  'Beijing': 'PEK',
  'Hong Kong': 'HKG',
  'Singapore': 'SIN',
  'Bangkok': 'BKK',
  'Seoul': 'ICN',
  'Manila': 'MNL',
  'Kuala Lumpur': 'KUL',
  'Jakarta': 'CGK',
  'Delhi': 'DEL',
  'Mumbai': 'BOM',
  'Bangalore': 'BLR',
  'Hanoi': 'HAN',
  'Ho Chi Minh': 'SGN',
  'Taipei': 'TPE',
  
  // Middle East
  'Dubai': 'DXB',
  'Abu Dhabi': 'AUH',
  'Doha': 'DOH',
  'Riyadh': 'RUH',
  'Jeddah': 'JED',
  'Tel Aviv': 'TLV',
  'Istanbul': 'IST',
  
  // Europe
  'London': 'LHR',
  'Paris': 'CDG',
  'Amsterdam': 'AMS',
  'Frankfurt': 'FRA',
  'Munich': 'MUC',
  'Rome': 'FCO',
  'Milan': 'MXP',
  'Madrid': 'MAD',
  'Barcelona': 'BCN',
  'Lisbon': 'LIS',
  'Vienna': 'VIE',
  'Zurich': 'ZRH',
  'Geneva': 'GVA',
  'Brussels': 'BRU',
  'Copenhagen': 'CPH',
  'Stockholm': 'ARN',
  'Oslo': 'OSL',
  'Helsinki': 'HEL',
  'Athens': 'ATH',
  'Prague': 'PRG',
  'Budapest': 'BUD',
  'Warsaw': 'WAW',
  'Moscow': 'SVO',
  
  // North America
  'New York': 'JFK',
  'Los Angeles': 'LAX',
  'San Francisco': 'SFO',
  'Chicago': 'ORD',
  'Miami': 'MIA',
  'Seattle': 'SEA',
  'Boston': 'BOS',
  'Washington': 'IAD',
  'Las Vegas': 'LAS',
  'Orlando': 'MCO',
  'Denver': 'DEN',
  'Atlanta': 'ATL',
  'Dallas': 'DFW',
  'Houston': 'IAH',
  'Phoenix': 'PHX',
  'Toronto': 'YYZ',
  'Vancouver': 'YVR',
  'Montreal': 'YUL',
  'Mexico City': 'MEX',
  'Cancun': 'CUN',
  
  // South America
  'Sao Paulo': 'GRU',
  'Rio de Janeiro': 'GIG',
  'Buenos Aires': 'EZE',
  'Lima': 'LIM',
  'Bogota': 'BOG',
  'Santiago': 'SCL',
  
  // Africa
  'Cairo': 'CAI',
  'Johannesburg': 'JNB',
  'Cape Town': 'CPT',
  'Nairobi': 'NBO',
  'Lagos': 'LOS',
  'Casablanca': 'CMN',
  
  // Pacific Islands
  'Fiji': 'NAN',
  'Nadi': 'NAN',
  'Suva': 'SUV',
  'Honolulu': 'HNL',
  'Papeete': 'PPT',
};

/**
 * Get IATA code from city name with smart matching
 */
export function getIATACode(cityName: string): string {
  if (!cityName) return '';
  
  // Remove common suffixes
  const cleanName = cityName
    .replace(/\s*\([A-Z]{3}\)$/i, '') // Remove airport code in parentheses
    .trim();
  
  // Try direct mapping first
  if (CITY_TO_IATA[cleanName]) {
    return CITY_TO_IATA[cleanName];
  }
  
  // Try case-insensitive match
  const lowerCity = cleanName.toLowerCase();
  for (const [city, code] of Object.entries(CITY_TO_IATA)) {
    if (city.toLowerCase() === lowerCity) {
      return code;
    }
  }
  
  // Try partial match
  for (const [city, code] of Object.entries(CITY_TO_IATA)) {
    if (cleanName.toLowerCase().includes(city.toLowerCase())) {
      return code;
    }
  }
  
  // If the input already looks like an IATA code, return it
  if (/^[A-Z]{3}$/i.test(cleanName)) {
    return cleanName.toUpperCase();
  }
  
  return '';
}

/**
 * Get SerpAPI configuration
 */
function getSerpAPIConfig() {
  const apiKey = process.env.SERPAPI_API_KEY;
  
  if (!apiKey) {
    console.error('[GoogleFlights] SERPAPI_API_KEY not found in environment variables');
    throw new Error('SERPAPI_API_KEY is not configured. Please add it to your .env.local file. Get your API key from https://serpapi.com/');
  }
  
  // Check if it's a placeholder value
  if (apiKey === 'your_serpapi_key_here' || apiKey.length < 20) {
    console.error('[GoogleFlights] Invalid SERPAPI_API_KEY detected');
    throw new Error('SERPAPI_API_KEY appears to be invalid. Please add your real API key from https://serpapi.com/');
  }
  
  return {
    apiKey,
    baseUrl: 'https://serpapi.com/search.json',
  };
}

/**
 * Search for flights using Google Flights via SerpAPI with caching
 */
export async function searchGoogleFlights(params: {
  from: string;
  to: string;
  date?: string;
  returnDate?: string;
  passengers?: {
    adults?: number;
    children?: number;
    infants_in_seat?: number;
    infants_on_lap?: number;
  };
  travelClass?: 1 | 2 | 3 | 4; // 1=Economy, 2=Premium Economy, 3=Business, 4=First
  type?: 1 | 2 | 3; // 1=Round trip, 2=One way, 3=Multi-city
  currency?: string;
}) {
  const {
    from,
    to,
    date,
    returnDate,
    passengers = { adults: 1 },
    travelClass = 1,
    type = 2, // Default to one-way
    currency = 'USD',
  } = params;
  
  const fromCode = getIATACode(from);
  const toCode = getIATACode(to);
  
  if (!fromCode || !toCode) {
    const errorMsg = `Invalid airport codes: ${from} (${fromCode || 'NOT FOUND'}) → ${to} (${toCode || 'NOT FOUND'}). Please use major city names or IATA codes.`;
    console.error(`[GoogleFlights] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  // Validate date format if provided
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date format: ${date}. Expected format: YYYY-MM-DD`);
  }
  
  if (returnDate && !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
    throw new Error(`Invalid return date format: ${returnDate}. Expected format: YYYY-MM-DD`);
  }
  
  // Check cache first
  const cacheKey = `${fromCode}-${toCode}-${date}-${returnDate}-${type}-${JSON.stringify(passengers)}`;
  const cached = flightCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[GoogleFlights] Cache hit for ${fromCode} → ${toCode}`);
    return cached.data;
  }
  
  try {
    const config = getSerpAPIConfig();
    
    const url = new URL(config.baseUrl);
    url.searchParams.set('engine', 'google_flights');
    url.searchParams.set('api_key', config.apiKey);
    url.searchParams.set('departure_id', fromCode);
    url.searchParams.set('arrival_id', toCode);
    url.searchParams.set('currency', currency);
    url.searchParams.set('hl', 'en');
    url.searchParams.set('type', type.toString());
    
    if (date) {
      url.searchParams.set('outbound_date', date);
    }
    
    if (returnDate && type === 1) {
      url.searchParams.set('return_date', returnDate);
    }
    
    if (travelClass !== 1) {
      url.searchParams.set('travel_class', travelClass.toString());
    }
    
    // Add passenger counts
    if (passengers.adults && passengers.adults > 1) {
      url.searchParams.set('adults', passengers.adults.toString());
    }
    if (passengers.children) {
      url.searchParams.set('children', passengers.children.toString());
    }
    if (passengers.infants_in_seat) {
      url.searchParams.set('infants_in_seat', passengers.infants_in_seat.toString());
    }
    if (passengers.infants_on_lap) {
      url.searchParams.set('infants_on_lap', passengers.infants_on_lap.toString());
    }
    
    console.log(`[GoogleFlights] Searching: ${fromCode} → ${toCode}${date ? ` on ${date}` : ''}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error(`[GoogleFlights] API Error ${response.status}:`, errorText);
      } catch (e) {
        console.error(`[GoogleFlights] API Error ${response.status}: Unable to read error response`);
      }
      
      // Handle specific error codes
      if (response.status === 401) {
        throw new Error('Invalid SerpAPI key. Please check your SERPAPI_API_KEY in .env.local');
      } else if (response.status === 403) {
        throw new Error('SerpAPI access forbidden. Your API key may have exceeded its quota or is invalid.');
      } else if (response.status === 429) {
        throw new Error('SerpAPI rate limit exceeded. Please wait a moment and try again or upgrade your plan.');
      } else if (response.status >= 500) {
        throw new Error('SerpAPI service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`Google Flights API error: ${response.status}. ${errorText || 'Unknown error'}`);
      }
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      console.error('[GoogleFlights] Invalid API response structure:', data);
      throw new Error('Invalid response from Google Flights API');
    }
    
    // Check for API errors in response - but handle "no results" gracefully
    if (data.error) {
      console.error('[GoogleFlights] API returned error:', data.error);
      
      // Check if it's a "no results" error (this is not a fatal error)
      const errorMsg = data.error.toLowerCase();
      if (errorMsg.includes('no results') || 
          errorMsg.includes("hasn't returned any results") ||
          errorMsg.includes('no flights found')) {
        console.warn(`[GoogleFlights] No flights found for ${fromCode} → ${toCode}`);
        // Return empty structure for "no results" case
        return {
          best_flights: [],
          other_flights: [],
          search_metadata: data.search_metadata || {},
          search_parameters: data.search_parameters || {
            departure_id: fromCode,
            arrival_id: toCode,
            outbound_date: date,
            return_date: returnDate,
          },
          error_info: {
            message: 'No flights found for your search criteria',
            suggestion: 'Try adjusting your dates or destinations'
          }
        };
      }
      
      // For other errors, throw
      throw new Error(`Google Flights API error: ${data.error}`);
    }
    
    // Check if we have flight data
    const hasFlights = (data.best_flights && data.best_flights.length > 0) || 
                       (data.other_flights && data.other_flights.length > 0);
    
    if (!hasFlights) {
      console.warn(`[GoogleFlights] No flights found for ${fromCode} → ${toCode}`);
      // Return empty structure instead of throwing error
      return {
        best_flights: [],
        other_flights: [],
        search_metadata: data.search_metadata || {},
        search_parameters: data.search_parameters || {
          departure_id: fromCode,
          arrival_id: toCode,
          outbound_date: date,
          return_date: returnDate,
        },
      };
    }
    
    // Cache the result
    flightCache.set(cacheKey, { data, timestamp: Date.now() });
    
    // Clean up old cache entries
    cleanCache();
    
    console.log(`[GoogleFlights] Success: Found ${(data.best_flights?.length || 0) + (data.other_flights?.length || 0)} flights`);
    
    return data;
  } catch (error) {
    console.error('[GoogleFlights] Search failed:', error);
    
    // Re-throw with more context if it's not already a detailed error
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to search flights. Please try again later.');
  }
}

/**
 * Calculate flight duration from departure and arrival times
 */
export function calculateDuration(departure?: string, arrival?: string): string {
  if (!departure || !arrival) return '10h 30m';
  
  try {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    
    if (diffMs < 0) return '10h 30m';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  } catch {
    return '10h 30m';
  }
}

/**
 * Format duration from minutes to readable string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Clean expired cache entries
 */
function cleanCache() {
  const now = Date.now();
  for (const [key, value] of flightCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      flightCache.delete(key);
    }
  }
}

/**
 * Clear all cache (useful for testing)
 */
export function clearCache() {
  flightCache.clear();
  console.log('[GoogleFlights] Cache cleared');
}

/**
 * Transform Google Flights API response to standardized format
 */
export function transformGoogleFlightData(flight: any, passengers: number = 1) {
  const flights = flight.flights || [];
  const firstFlight = flights[0];
  const lastFlight = flights[flights.length - 1];
  
  if (!firstFlight || !lastFlight) {
    return null;
  }
  
  // Calculate total stops
  const stops = flights.length - 1;
  
  return {
    id: flight.booking_token || `flight-${Math.random().toString(36).substr(2, 9)}`,
    flightNumber: firstFlight.flight_number || 'N/A',
    airline: firstFlight.airline || 'Unknown Airline',
    airlineCode: firstFlight.airline_logo ? firstFlight.airline_logo.split('/').pop()?.replace('.png', '') : 'XX',
    airlineLogo: firstFlight.airline_logo,
    departure: {
      airport: firstFlight.departure_airport?.name || 'Unknown',
      iata: firstFlight.departure_airport?.id || '',
      scheduled: firstFlight.departure_airport?.time,
      time: firstFlight.departure_airport?.time,
    },
    arrival: {
      airport: lastFlight.arrival_airport?.name || 'Unknown',
      iata: lastFlight.arrival_airport?.id || '',
      scheduled: lastFlight.arrival_airport?.time,
      time: lastFlight.arrival_airport?.time,
    },
    duration: formatDuration(flight.total_duration || 0),
    totalDurationMinutes: flight.total_duration || 0,
    stops,
    stopsText: stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`,
    layovers: flight.layovers || [],
    aircraft: firstFlight.airplane || 'Unknown',
    travelClass: firstFlight.travel_class || 'Economy',
    price: flight.price || 0,
    pricePerPerson: passengers > 0 ? Math.round(flight.price / passengers) : flight.price,
    priceFormatted: `$${flight.price || 0}`,
    carbonEmissions: flight.carbon_emissions,
    extensions: flight.extensions || [],
    legs: flights.map((leg: any) => ({
      flightNumber: leg.flight_number,
      airline: leg.airline,
      departure: {
        airport: leg.departure_airport?.name,
        iata: leg.departure_airport?.id,
        time: leg.departure_airport?.time,
      },
      arrival: {
        airport: leg.arrival_airport?.name,
        iata: leg.arrival_airport?.id,
        time: leg.arrival_airport?.time,
      },
      duration: formatDuration(leg.duration || 0),
      aircraft: leg.airplane,
      legroom: leg.legroom,
    })),
    bookingToken: flight.booking_token,
    departureToken: flight.departure_token,
  };
}

/**
 * Get best flights from API response
 */
export function getBestFlights(apiResponse: any, passengers: number = 1) {
  const bestFlights = apiResponse.best_flights || [];
  const otherFlights = apiResponse.other_flights || [];
  
  const allFlights = [...bestFlights, ...otherFlights];
  
  return allFlights
    .map(flight => transformGoogleFlightData(flight, passengers))
    .filter(flight => flight !== null);
}

/**
 * Get price insights from API response
 */
export function getPriceInsights(apiResponse: any) {
  return apiResponse.price_insights || null;
}

/**
 * Get airport information from API response
 */
export function getAirportInfo(apiResponse: any) {
  return apiResponse.airports || [];
}
