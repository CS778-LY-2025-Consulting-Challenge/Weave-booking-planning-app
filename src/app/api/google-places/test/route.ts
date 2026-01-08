import { NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Test endpoint to diagnose Google Places API issues
 * Visit: http://localhost:3000/api/google-places/test
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!GOOGLE_MAPS_API_KEY,
    apiKeyPrefix: GOOGLE_MAPS_API_KEY?.substring(0, 10) + '...',
    tests: []
  };

  if (!GOOGLE_MAPS_API_KEY) {
    diagnostics.error = 'GOOGLE_MAPS_API_KEY is not configured in environment variables';
    return NextResponse.json(diagnostics, { status: 500 });
  }

  // Test 1: Simple Text Search
  try {
    console.log('[Google Places Test] Testing Text Search API...');
    
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName'
      },
      body: JSON.stringify({
        textQuery: 'Tokyo Tower',
        locationBias: {
          circle: {
            center: { latitude: 35.6586, longitude: 139.7454 },
            radius: 1000.0
          }
        }
      })
    });

    const responseText = await searchResponse.text();
    
    if (searchResponse.ok) {
      diagnostics.tests.push({
        test: 'Text Search API',
        status: 'PASS',
        httpStatus: searchResponse.status,
        message: 'API is working correctly'
      });
      
      try {
        const data = JSON.parse(responseText);
        diagnostics.tests[0].foundPlaces = data.places?.length || 0;
      } catch (e) {
        // ignore parse error
      }
    } else {
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch (e) {
        // keep as text
      }

      diagnostics.tests.push({
        test: 'Text Search API',
        status: 'FAIL',
        httpStatus: searchResponse.status,
        httpStatusText: searchResponse.statusText,
        errorDetails: errorDetails,
        possibleReasons: getPossibleReasons(searchResponse.status)
      });
    }
  } catch (error: any) {
    diagnostics.tests.push({
      test: 'Text Search API',
      status: 'ERROR',
      message: error.message,
      stack: error.stack
    });
  }

  // Return diagnostics
  const overallSuccess = diagnostics.tests.every((t: any) => t.status === 'PASS');
  
  return NextResponse.json(diagnostics, { 
    status: overallSuccess ? 200 : 500 
  });
}

function getPossibleReasons(status: number): string[] {
  switch (status) {
    case 403:
      return [
        '❌ Places API (New) is not enabled in your Google Cloud project',
        '❌ API Key does not have permission to access Places API (New)',
        '❌ Billing is not enabled for your Google Cloud project',
        '❌ API Key restrictions are blocking the request',
        '📝 Solution: Go to https://console.cloud.google.com/apis/library/places-backend.googleapis.com and enable the API'
      ];
    case 401:
      return [
        '❌ API Key is invalid or malformed',
        '❌ API Key has been deleted or regenerated',
        '📝 Solution: Check your API Key in Google Cloud Console'
      ];
    case 429:
      return [
        '❌ API quota exceeded',
        '📝 Solution: Check your quota in Google Cloud Console'
      ];
    default:
      return ['Unknown error. Check Google Cloud Console for more details.'];
  }
}

