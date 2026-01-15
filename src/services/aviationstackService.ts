/**
 * AviationStack API Service
 * Centralized configuration for flight data retrieval
 * Documentation: https://aviationstack.com/documentation
 */

// In-memory cache for flight data (expires after 5 minutes)
const flightCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
  'Tokyo': 'NRT', // Narita International
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
  if (!cityName) return 'XXX';
  
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
  
  // Try partial match (e.g., "Tokyo, Japan" contains "Tokyo")
  for (const [city, code] of Object.entries(CITY_TO_IATA)) {
    if (cityName.toLowerCase().includes(city.toLowerCase())) {
      return code;
    }
  }
  
  // If not found, use the first 3 uppercase letters as fallback
  return cityName.substring(0, 3).toUpperCase();
}

/**
 * Get AviationStack API configuration
 */
export function getAviationStackConfig() {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  
  if (!apiKey) {
    throw new Error('AVIATIONSTACK_API_KEY is not configured in environment variables');
  }
  
  return {
    apiKey,
    baseUrl: 'https://api.aviationstack.com/v1',
  };
}

/**
 * Search for flights using AviationStack API with caching
 */
export async function searchFlights(params: {
  from: string;
  to: string;
  date?: string;
  limit?: number;
}) {
  const { from, to, date, limit = 10 } = params;
  
  const fromCode = getIATACode(from);
  const toCode = getIATACode(to);
  
  // Check cache first
  const cacheKey = `${fromCode}-${toCode}-${date || 'any'}`;
  const cached = flightCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[AviationStack] Cache hit for ${fromCode} → ${toCode}`);
    return cached.data;
  }
  
  try {
    const config = getAviationStackConfig();

    const buildUrl = (includeDate: boolean) => {
      const url = new URL(`${config.baseUrl}/flights`);
      url.searchParams.set('access_key', config.apiKey);
      url.searchParams.set('dep_iata', fromCode);
      url.searchParams.set('arr_iata', toCode);
      url.searchParams.set('limit', limit.toString());
      if (includeDate && date) {
        url.searchParams.set('flight_date', date);
      }
      return url;
    };

    const tryFetch = async (includeDate: boolean) => {
      const url = buildUrl(includeDate);
      console.log(
        `[AviationStack] Searching: ${fromCode} → ${toCode}${includeDate && date ? ` on ${date}` : ''}`
      );
      const response = await fetch(url.toString());
      if (response.ok) {
        return response.json();
      }
      const errorText = await response.text();
      console.error(`[AviationStack] API Error ${response.status}:`, errorText);
      return { error: errorText, status: response.status };
    };

    const initial = await tryFetch(true);
    if (initial && !('status' in initial)) {
      flightCache.set(cacheKey, { data: initial, timestamp: Date.now() });
      cleanCache();
      return initial;
    }

    const errorText = typeof initial.error === 'string' ? initial.error : '';
    const isRestricted =
      initial.status === 403 && errorText.includes('function_access_restricted');

    if (isRestricted && date) {
      const retry = await tryFetch(false);
      if (retry && !('status' in retry)) {
        flightCache.set(cacheKey, { data: retry, timestamp: Date.now() });
        cleanCache();
        return retry;
      }
    }

    throw new Error(`AviationStack API error: ${initial.status || 500}`);
  } catch (error) {
    console.error('[AviationStack] Search failed:', error);
    throw error;
  }
}

/**
 * Get flight status by flight number
 */
export async function getFlightStatus(flightNumber: string, date?: string) {
  try {
    const config = getAviationStackConfig();
    
    const url = new URL(`${config.baseUrl}/flights`);
    url.searchParams.set('access_key', config.apiKey);
    url.searchParams.set('flight_iata', flightNumber);
    
    if (date) {
      url.searchParams.set('flight_date', date);
    }
    
    console.log(`[AviationStack] Getting status for flight ${flightNumber}`);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`AviationStack API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[AviationStack] Flight status check failed:', error);
    throw error;
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
  console.log('[AviationStack] Cache cleared');
}

/**
 * Transform AviationStack API response to standardized format
 */
export function transformFlightData(flight: any, passengers: number = 1) {
  const departure = flight.departure;
  const arrival = flight.arrival;
  const airline = flight.airline;
  
  return {
    id: flight.flight?.iata || `${airline?.iata || 'XX'}${Math.floor(Math.random() * 1000)}`,
    flightNumber: flight.flight?.iata || `${airline?.iata || 'XX'}100`,
    airline: airline?.name || 'Unknown Airline',
    airlineCode: airline?.iata || 'XX',
    departure: {
      airport: departure?.airport || 'Unknown',
      iata: departure?.iata || 'XXX',
      scheduled: departure?.scheduled,
      terminal: departure?.terminal,
      gate: departure?.gate,
    },
    arrival: {
      airport: arrival?.airport || 'Unknown',
      iata: arrival?.iata || 'XXX',
      scheduled: arrival?.scheduled,
      terminal: arrival?.terminal,
      gate: arrival?.gate,
    },
    duration: calculateDuration(departure?.scheduled, arrival?.scheduled),
    aircraft: flight.aircraft?.iata || flight.aircraft?.registration || 'Unknown',
    status: flight.flight_status || 'scheduled',
    // Note: AviationStack doesn't provide pricing, so this would need to come from another source
    price: estimatePrice(departure?.iata, arrival?.iata, passengers),
  };
}

/**
 * Estimate price based on route (placeholder - replace with real pricing API)
 */
function estimatePrice(fromCode: string, toCode: string, passengers: number): string {
  const basePrices: Record<string, number> = {
    'AKL-NRT': 1200,
    'AKL-SYD': 300,
    'SYD-NRT': 800,
    'NRT-PVG': 500,
    'AKL-PVG': 1400,
    'LAX-JFK': 400,
    'LHR-CDG': 150,
    'DXB-SIN': 600,
  };
  
  const route = `${fromCode}-${toCode}`;
  const reverseRoute = `${toCode}-${fromCode}`;
  
  const basePrice = basePrices[route] || basePrices[reverseRoute] || 800;
  const total = basePrice * passengers;
  
  return `NZ$${total.toLocaleString()}`;
}
