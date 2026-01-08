import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusToken, getTokenCacheStatus } from '@/lib/amadeus-token-cache';

const AMADEUS_BASE_URL = process.env.AMADEUS_ENVIRONMENT === 'production'
  ? 'https://api.amadeus.com'
  : 'https://test.api.amadeus.com';

interface DiagnosticResult {
  timestamp: string;
  environment: string;
  credentials: {
    clientId: string | null;
    clientSecret: string | null;
    isConfigured: boolean;
  };
  tokenStatus: {
    cached: boolean;
    expiresIn: number;
  };
  tests: {
    tokenFetch: {
      success: boolean;
      message: string;
      token?: string;
      expiresIn?: number;
      error?: string;
    };
    cityLookup: {
      success: boolean;
      message: string;
      city?: string;
      cityCode?: string;
      error?: string;
    };
    hotelLookup: {
      success: boolean;
      message: string;
      hotelCount?: number;
      sampleHotels?: any[];
      error?: string;
    };
    hotelOffers: {
      success: boolean;
      message: string;
      offersCount?: number;
      error?: string;
    };
  };
  summary: {
    status: 'healthy' | 'degraded' | 'error';
    workingEndpoints: string[];
    failedEndpoints: string[];
    recommendations: string[];
  };
}

export async function GET(request: NextRequest) {
  const result: DiagnosticResult = {
    timestamp: new Date().toISOString(),
    environment: process.env.AMADEUS_ENVIRONMENT || 'test',
    credentials: {
      clientId: process.env.AMADEUS_CLIENT_ID ? '***' + process.env.AMADEUS_CLIENT_ID.slice(-4) : null,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET ? '***' : null,
      isConfigured: !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET),
    },
    tokenStatus: getTokenCacheStatus(),
    tests: {
      tokenFetch: { success: false, message: 'Not tested' },
      cityLookup: { success: false, message: 'Not tested' },
      hotelLookup: { success: false, message: 'Not tested' },
      hotelOffers: { success: false, message: 'Not tested' },
    },
    summary: {
      status: 'error',
      workingEndpoints: [],
      failedEndpoints: [],
      recommendations: [],
    },
  };

  try {
    // Check credentials first
    if (!result.credentials.isConfigured) {
      result.summary.recommendations.push(
        'Missing Amadeus API credentials. Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET environment variables.'
      );
      result.summary.status = 'error';
      return NextResponse.json(result, { status: 500 });
    }

    // Test 1: Token Fetch
    console.log('[Diagnostic] Testing token fetch...');
    try {
      const token = await getAmadeusToken();
      const cacheStatus = getTokenCacheStatus();
      
      result.tests.tokenFetch = {
        success: true,
        message: 'Successfully obtained Amadeus token',
        token: token ? token.substring(0, 20) + '...' : undefined,
        expiresIn: cacheStatus.expiresIn,
      };
      result.summary.workingEndpoints.push('Token Authentication');
    } catch (error) {
      result.tests.tokenFetch = {
        success: false,
        message: 'Failed to fetch token',
        error: error instanceof Error ? error.message : String(error),
      };
      result.summary.failedEndpoints.push('Token Authentication');
      result.summary.recommendations.push('Check your Amadeus API credentials (CLIENT_ID and CLIENT_SECRET)');
    }

    // If token fetch failed, skip remaining tests
    if (!result.tests.tokenFetch.success) {
      result.summary.status = 'error';
      return NextResponse.json(result);
    }

    // Test 2: City Lookup
    console.log('[Diagnostic] Testing city lookup...');
    try {
      const token = await getAmadeusToken();
      const cityParams = new URLSearchParams({
        keyword: 'London',
        subType: 'CITY',
        'page[limit]': '1',
      });

      const url = `${AMADEUS_BASE_URL}/v1/reference-data/locations?${cityParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const city = data?.data?.[0];

      result.tests.cityLookup = {
        success: true,
        message: 'City lookup successful',
        city: city?.name,
        cityCode: city?.iataCode,
      };
      result.summary.workingEndpoints.push('City Lookup (Reference Data)');
    } catch (error) {
      result.tests.cityLookup = {
        success: false,
        message: 'City lookup failed',
        error: error instanceof Error ? error.message : String(error),
      };
      result.summary.failedEndpoints.push('City Lookup (Reference Data)');
    }

    // Test 3: Hotel Lookup by City
    console.log('[Diagnostic] Testing hotel lookup...');
    try {
      const token = await getAmadeusToken();
      const hotelParams = new URLSearchParams({
        cityCode: 'LON',
      });

      const url = `${AMADEUS_BASE_URL}/v1/reference-data/locations/hotels/by-city?${hotelParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const hotels = Array.isArray(data?.data) ? data.data : [];

      result.tests.hotelLookup = {
        success: true,
        message: `Successfully fetched ${hotels.length} hotels for London`,
        hotelCount: hotels.length,
        sampleHotels: hotels.slice(0, 2).map((h: any) => ({
          hotelId: h.hotelId,
          name: h.name,
        })),
      };
      result.summary.workingEndpoints.push('Hotel Lookup (By City)');
    } catch (error) {
      result.tests.hotelLookup = {
        success: false,
        message: 'Hotel lookup failed',
        error: error instanceof Error ? error.message : String(error),
      };
      result.summary.failedEndpoints.push('Hotel Lookup (By City)');
    }

    // Test 4: Hotel Offers
    console.log('[Diagnostic] Testing hotel offers...');
    try {
      const token = await getAmadeusToken();
      
      // Use a sample hotel ID for testing
      const offersParams = new URLSearchParams({
        checkInDate: '2026-02-15',
        checkOutDate: '2026-02-18',
        adults: '1',
        hotelIds: 'XXLONLD1', // Sample hotel ID
      });

      const url = `${AMADEUS_BASE_URL}/v3/shopping/hotel-offers?${offersParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const offers = Array.isArray(data?.data) ? data.data : [];

      result.tests.hotelOffers = {
        success: true,
        message: `Successfully fetched hotel offers (${offers.length} results)`,
        offersCount: offers.length,
      };
      result.summary.workingEndpoints.push('Hotel Offers API');
    } catch (error) {
      result.tests.hotelOffers = {
        success: false,
        message: 'Hotel offers API test failed',
        error: error instanceof Error ? error.message : String(error),
      };
      result.summary.failedEndpoints.push('Hotel Offers API');
    }

    // Determine overall status
    const passedTests = Object.values(result.tests).filter(t => t.success).length;
    const totalTests = Object.keys(result.tests).length;

    if (passedTests === totalTests) {
      result.summary.status = 'healthy';
      result.summary.recommendations.push('✅ All Amadeus API endpoints are working correctly!');
    } else if (passedTests > 0) {
      result.summary.status = 'degraded';
      result.summary.recommendations.push(
        `⚠️ ${passedTests}/${totalTests} endpoints working. Some features may be limited.`
      );
    } else {
      result.summary.status = 'error';
      result.summary.recommendations.push(
        '❌ Amadeus API is not responding. Check your credentials and network connection.'
      );
    }

    const statusCode = result.summary.status === 'healthy' ? 200 : result.summary.status === 'degraded' ? 206 : 500;
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('[Diagnostic] Unexpected error:', error);
    result.summary.status = 'error';
    result.summary.recommendations.push(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    );
    return NextResponse.json(result, { status: 500 });
  }
}
