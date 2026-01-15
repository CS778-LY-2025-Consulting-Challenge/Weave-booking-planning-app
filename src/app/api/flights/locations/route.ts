import { NextRequest, NextResponse } from 'next/server';
import Amadeus from 'amadeus';

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
  hostname: process.env.AMADEUS_ENVIRONMENT === 'production' ? 'production' : 'test'
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const subType = searchParams.get('subType') || 'AIRPORT,CITY';

    if (!keyword || keyword.length < 2) {
      return NextResponse.json(
        { error: 'Keyword must be at least 2 characters' },
        { status: 400 }
      );
    }

    console.log('[Location Search] Searching for:', keyword);

    // Call Amadeus Location API
    const response = await amadeus.referenceData.locations.get({
      keyword: keyword,
      subType: subType,
      'page[limit]': 10
    });

    const locations = response.data.map((location: any) => ({
      id: location.id,
      type: location.type,
      subType: location.subType,
      name: location.name,
      detailedName: location.detailedName,
      iataCode: location.iataCode,
      address: {
        cityName: location.address?.cityName,
        cityCode: location.address?.cityCode,
        countryName: location.address?.countryName,
        countryCode: location.address?.countryCode,
        regionCode: location.address?.regionCode
      },
      geoCode: location.geoCode,
      timeZoneOffset: location.timeZoneOffset
    }));

    return NextResponse.json({
      success: true,
      data: locations
    });

  } catch (error: any) {
    console.error('[Location Search] Error:', error);
    
    if (error.response) {
      const amadeusError = error.response.body || error.response;
      return NextResponse.json(
        { 
          error: 'Amadeus API error',
          details: amadeusError.errors || amadeusError,
          message: amadeusError.errors?.[0]?.detail || 'Failed to search locations'
        },
        { status: error.response.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to search locations',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
