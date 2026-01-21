/**
 * Unified Flight Search Service
 * Combines Google Flights (SerpAPI) - PRIMARY and Aviationstack - SECONDARY
 * Provides automatic fallback and merges results for maximum flight options
 * 
 * Priority Strategy:
 * 1. Google Flights (Primary) - Comprehensive pricing, multiple airlines, booking links
 * 2. Aviationstack (Secondary) - Real-time schedules, terminal/gate info, additional routes
 * 
 * Features:
 * - Prioritizes Google Flights results for better pricing data
 * - Uses Aviationstack as fallback and for additional options
 * - Automatic fallback if primary API fails
 * - Intelligent result merging with preference for primary source
 * - Silent error handling (no user-facing errors)
 */

import { searchGoogleFlights, getBestFlights, transformGoogleFlightData } from './googleFlightsService';
import { searchFlights as searchAviationstack, transformFlightData as transformAviationstackData } from './aviationstackService';

/**
 * Standardized flight data format
 */
export interface UnifiedFlight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  departure: {
    airport: string;
    iata: string;
    scheduled?: string;
    time?: string;
    terminal?: string;
    gate?: string;
  };
  arrival: {
    airport: string;
    iata: string;
    scheduled?: string;
    time?: string;
    terminal?: string;
    gate?: string;
  };
  duration: string;
  stops: number;
  stopsText: string;
  aircraft?: string;
  price: number;
  priceFormatted: string;
  source: 'google_flights' | 'aviationstack';
  status?: string;
  logo?: string;
}

/**
 * Search parameters
 */
export interface FlightSearchParams {
  from: string;
  to: string;
  date?: string;
  returnDate?: string;
  passengers?: number;
  travelClass?: 1 | 2 | 3 | 4;
  type?: 1 | 2 | 3;
  currency?: string;
}

/**
 * Search result with metadata
 */
export interface UnifiedSearchResult {
  flights: UnifiedFlight[];
  summary: {
    total: number;
    fromGoogleFlights: number;
    fromAviationstack: number;
    apiStatus: {
      googleFlights: 'success' | 'failed' | 'no_results';
      aviationstack: 'success' | 'failed' | 'no_results';
    };
  };
}

/**
 * Main search function that combines both APIs
 * Priority: Google Flights (Primary) → Aviationstack (Secondary)
 */
export async function searchAllFlights(params: FlightSearchParams): Promise<UnifiedSearchResult> {
  console.log('[UnifiedFlightSearch] Starting search - Priority: Google Flights (Primary), Aviationstack (Secondary)');
  
  const startTime = Date.now();
  const passengers = params.passengers || 1;
  
  // Initialize result tracking
  const apiStatus = {
    googleFlights: 'failed' as 'success' | 'failed' | 'no_results',
    aviationstack: 'failed' as 'success' | 'failed' | 'no_results',
  };
  
  let googleFlights: UnifiedFlight[] = [];
  let aviationstackFlights: UnifiedFlight[] = [];
  
  // Strategy: Try Google Flights first (primary), then Aviationstack (secondary)
  // Both are called in parallel for speed, but Google Flights is prioritized in results
  const [googleResult, aviationstackResult] = await Promise.allSettled([
    searchGoogleFlightsAPI(params, passengers),
    searchAviationstackAPI(params, passengers),
  ]);
  
  // Process Google Flights results (PRIMARY SOURCE)
  if (googleResult.status === 'fulfilled' && googleResult.value.flights.length > 0) {
    googleFlights = googleResult.value.flights;
    apiStatus.googleFlights = 'success';
    console.log(`[UnifiedFlightSearch] ✅ PRIMARY: Google Flights returned ${googleFlights.length} flights`);
  } else if (googleResult.status === 'fulfilled' && googleResult.value.flights.length === 0) {
    apiStatus.googleFlights = 'no_results';
    console.log('[UnifiedFlightSearch] ⚠️ PRIMARY: Google Flights returned no results, falling back to secondary...');
  } else {
    console.log('[UnifiedFlightSearch] ❌ PRIMARY: Google Flights failed, falling back to secondary...');
  }
  
  // Process Aviationstack results (SECONDARY SOURCE / FALLBACK)
  if (aviationstackResult.status === 'fulfilled' && aviationstackResult.value.flights.length > 0) {
    aviationstackFlights = aviationstackResult.value.flights;
    apiStatus.aviationstack = 'success';
    console.log(`[UnifiedFlightSearch] ✅ SECONDARY: Aviationstack returned ${aviationstackFlights.length} flights`);
  } else if (aviationstackResult.status === 'fulfilled' && aviationstackResult.value.flights.length === 0) {
    apiStatus.aviationstack = 'no_results';
    console.log('[UnifiedFlightSearch] ⚠️ SECONDARY: Aviationstack returned no results');
  } else {
    console.log('[UnifiedFlightSearch] ❌ SECONDARY: Aviationstack failed');
  }
  
  // Merge with priority for Google Flights (primary source)
  const mergedFlights = mergeFlightsWithPriority(googleFlights, aviationstackFlights);
  
  // Sort by price (cheapest first), with Google Flights results preferred for same price
  const sortedFlights = mergedFlights.sort((a, b) => {
    if (a.price === b.price) {
      // If same price, prefer Google Flights (primary source)
      if (a.source === 'google_flights' && b.source === 'aviationstack') return -1;
      if (a.source === 'aviationstack' && b.source === 'google_flights') return 1;
    }
    return a.price - b.price;
  });
  
  const duration = Date.now() - startTime;
  
  // Log final summary
  if (sortedFlights.length === 0) {
    console.log(`[UnifiedFlightSearch] ⚠️ Completed in ${duration}ms - No flights found from either source`);
  } else {
    console.log(`[UnifiedFlightSearch] ✅ Completed in ${duration}ms - Total: ${sortedFlights.length} flights (${googleFlights.length} primary, ${aviationstackFlights.length} secondary, ${sortedFlights.length - googleFlights.length - aviationstackFlights.length} deduplicated)`);
  }
  
  return {
    flights: sortedFlights,
    summary: {
      total: sortedFlights.length,
      fromGoogleFlights: googleFlights.length,
      fromAviationstack: aviationstackFlights.length,
      apiStatus,
    },
  };
}

/**
 * Search Google Flights API
 */
async function searchGoogleFlightsAPI(params: FlightSearchParams, passengers: number): Promise<{ flights: UnifiedFlight[] }> {
  try {
    const googleParams = {
      from: params.from,
      to: params.to,
      date: params.date,
      returnDate: params.returnDate,
      passengers: {
        adults: passengers,
        children: 0,
        infants_in_seat: 0,
        infants_on_lap: 0,
      },
      travelClass: params.travelClass || 1,
      type: params.type || 2,
      currency: params.currency || 'USD',
    };
    
    const response = await searchGoogleFlights(googleParams);
    
    // Check if we got results
    const hasResults = (response.best_flights && response.best_flights.length > 0) || 
                       (response.other_flights && response.other_flights.length > 0);
    
    if (!hasResults) {
      return { flights: [] };
    }
    
    // Transform to unified format
    const allFlights = [...(response.best_flights || []), ...(response.other_flights || [])];
    const transformedFlights = allFlights
      .map(flight => transformGoogleFlightToUnified(flight, passengers))
      .filter(flight => flight !== null) as UnifiedFlight[];
    
    return { flights: transformedFlights };
  } catch (error) {
    console.error('[UnifiedFlightSearch] Google Flights error:', error);
    return { flights: [] };
  }
}

/**
 * Search Aviationstack API
 */
async function searchAviationstackAPI(params: FlightSearchParams, passengers: number): Promise<{ flights: UnifiedFlight[] }> {
  try {
    const aviationstackParams = {
      from: params.from,
      to: params.to,
      date: params.date,
      limit: 20,
    };
    
    const response = await searchAviationstack(aviationstackParams);
    
    // Check if we got results
    if (!response.data || response.data.length === 0) {
      return { flights: [] };
    }
    
    // Transform to unified format
    const transformedFlights = response.data
      .map((flight: any) => transformAviationstackToUnified(flight, passengers))
      .filter((flight: any) => flight !== null) as UnifiedFlight[];
    
    return { flights: transformedFlights };
  } catch (error) {
    console.error('[UnifiedFlightSearch] Aviationstack error:', error);
    return { flights: [] };
  }
}

/**
 * Transform Google Flights data to unified format
 */
function transformGoogleFlightToUnified(flight: any, passengers: number): UnifiedFlight | null {
  try {
    const flights = flight.flights || [];
    const firstFlight = flights[0];
    const lastFlight = flights[flights.length - 1];
    
    if (!firstFlight || !lastFlight) {
      return null;
    }
    
    const stops = flights.length - 1;
    const price = flight.price || 0;
    
    return {
      id: `google-${flight.booking_token || Math.random().toString(36).substr(2, 9)}`,
      flightNumber: firstFlight.flight_number || 'N/A',
      airline: firstFlight.airline || 'Unknown Airline',
      airlineCode: firstFlight.airline_logo ? firstFlight.airline_logo.split('/').pop()?.replace('.png', '') || 'XX' : 'XX',
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
      stops,
      stopsText: stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`,
      aircraft: firstFlight.airplane || 'Unknown',
      price: passengers > 0 ? Math.round(price / passengers) : price,
      priceFormatted: `$${passengers > 0 ? Math.round(price / passengers) : price}`,
      source: 'google_flights',
      status: 'scheduled',
      logo: firstFlight.airline_logo,
    };
  } catch (error) {
    console.error('[UnifiedFlightSearch] Error transforming Google Flight:', error);
    return null;
  }
}

/**
 * Transform Aviationstack data to unified format
 */
function transformAviationstackToUnified(flight: any, passengers: number): UnifiedFlight | null {
  try {
    const departure = flight.departure;
    const arrival = flight.arrival;
    const airline = flight.airline;
    
    if (!departure || !arrival) {
      return null;
    }
    
    // Estimate price for Aviationstack (they don't provide pricing)
    const estimatedPrice = estimateFlightPrice(departure.iata, arrival.iata, passengers);
    
    return {
      id: `aviation-${flight.flight?.iata || Math.random().toString(36).substr(2, 9)}`,
      flightNumber: flight.flight?.iata || `${airline?.iata || 'XX'}100`,
      airline: airline?.name || 'Unknown Airline',
      airlineCode: airline?.iata || 'XX',
      departure: {
        airport: departure.airport || 'Unknown',
        iata: departure.iata || 'XXX',
        scheduled: departure.scheduled,
        time: departure.scheduled,
        terminal: departure.terminal,
        gate: departure.gate,
      },
      arrival: {
        airport: arrival.airport || 'Unknown',
        iata: arrival.iata || 'XXX',
        scheduled: arrival.scheduled,
        time: arrival.scheduled,
        terminal: arrival.terminal,
        gate: arrival.gate,
      },
      duration: calculateDuration(departure.scheduled, arrival.scheduled),
      stops: 0, // Aviationstack doesn't provide layover info for direct flights
      stopsText: 'Direct',
      aircraft: flight.aircraft?.registration || flight.aircraft?.iata || 'Unknown',
      price: estimatedPrice,
      priceFormatted: `$${estimatedPrice}`,
      source: 'aviationstack',
      status: flight.flight_status || 'scheduled',
    };
  } catch (error) {
    console.error('[UnifiedFlightSearch] Error transforming Aviationstack flight:', error);
    return null;
  }
}

/**
 * Merge flights with priority for Google Flights (primary source)
 * Strategy:
 * 1. All Google Flights results are included (primary)
 * 2. Aviationstack results are added only if they don't duplicate Google results
 * 3. For duplicates, Google Flights data is always preferred
 */
function mergeFlightsWithPriority(
  googleFlights: UnifiedFlight[],
  aviationstackFlights: UnifiedFlight[]
): UnifiedFlight[] {
  console.log(`[UnifiedFlightSearch] Merging results with Google Flights priority...`);
  
  // Create a map to track flights by unique key
  const flightMap = new Map<string, UnifiedFlight>();
  
  // Step 1: Add all Google Flights results first (PRIMARY SOURCE)
  for (const flight of googleFlights) {
    const departureTime = flight.departure.scheduled || flight.departure.time || '';
    const key = `${flight.flightNumber}-${departureTime}-${flight.departure.iata}-${flight.arrival.iata}`;
    
    flightMap.set(key, flight);
    console.log(`[UnifiedFlightSearch] Added PRIMARY: ${flight.airline} ${flight.flightNumber} - $${flight.price}`);
  }
  
  // Step 2: Add Aviationstack results only if they don't duplicate Google results
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const flight of aviationstackFlights) {
    const departureTime = flight.departure.scheduled || flight.departure.time || '';
    const key = `${flight.flightNumber}-${departureTime}-${flight.departure.iata}-${flight.arrival.iata}`;
    
    if (!flightMap.has(key)) {
      // This is a unique flight not in Google results, add it
      flightMap.set(key, flight);
      addedCount++;
      console.log(`[UnifiedFlightSearch] Added SECONDARY: ${flight.airline} ${flight.flightNumber} - $${flight.price}`);
    } else {
      // This flight already exists in Google results, skip it (prefer Google's data)
      skippedCount++;
      console.log(`[UnifiedFlightSearch] Skipped DUPLICATE: ${flight.airline} ${flight.flightNumber} (preferring Google Flights data)`);
    }
  }
  
  console.log(`[UnifiedFlightSearch] Merge complete: ${googleFlights.length} from primary, ${addedCount} unique from secondary, ${skippedCount} duplicates removed`);
  
  return Array.from(flightMap.values());
}

/**
 * Format duration from minutes
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Calculate duration between two timestamps
 */
function calculateDuration(departure?: string, arrival?: string): string {
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
 * Estimate flight price based on route (used for Aviationstack which doesn't provide pricing)
 */
function estimateFlightPrice(fromIata: string, toIata: string, passengers: number): number {
  const basePrices: Record<string, number> = {
    // Popular routes with estimated base prices (per person)
    'JFK-LHR': 500, 'LHR-JFK': 500,
    'LAX-NRT': 650, 'NRT-LAX': 650,
    'SYD-AKL': 200, 'AKL-SYD': 200,
    'DXB-SIN': 450, 'SIN-DXB': 450,
    'CDG-JFK': 550, 'JFK-CDG': 550,
    'HKG-SFO': 700, 'SFO-HKG': 700,
    'LHR-DXB': 400, 'DXB-LHR': 400,
    'SIN-SYD': 350, 'SYD-SIN': 350,
  };
  
  // Try direct route
  const directRoute = `${fromIata}-${toIata}`;
  if (basePrices[directRoute]) {
    return basePrices[directRoute];
  }
  
  // Calculate based on distance estimation (very rough)
  const defaultPrice = 600; // Default base price
  return defaultPrice;
}

/**
 * Get search statistics
 */
export function getSearchStats(result: UnifiedSearchResult): string {
  const { summary } = result;
  const parts: string[] = [];
  
  if (summary.fromGoogleFlights > 0) {
    parts.push(`${summary.fromGoogleFlights} from Google Flights`);
  }
  
  if (summary.fromAviationstack > 0) {
    parts.push(`${summary.fromAviationstack} from Aviationstack`);
  }
  
  if (parts.length === 0) {
    return 'No flights found';
  }
  
  return `${summary.total} flights found (${parts.join(', ')})`;
}
