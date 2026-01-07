import { NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  // Check if API key is available
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('[Google Places] ERROR: GOOGLE_MAPS_API_KEY is not set in environment variables');
    return NextResponse.json({ 
      error: 'Google Maps API key is not configured. Please add GOOGLE_MAPS_API_KEY to your .env.local file.' 
    }, { status: 500 });
  }

  if (!name || !lat || !lng) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    console.log(`[Google Places] Searching for: ${name} at ${lat},${lng}`);
    console.log(`[Google Places] Using API Key: ${GOOGLE_MAPS_API_KEY.substring(0, 10)}...`);

    // Step 1: Search for place using Text Search (New)
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.name'
      },
      body: JSON.stringify({
        textQuery: name,
        locationBias: {
          circle: {
            center: { 
              latitude: parseFloat(lat), 
              longitude: parseFloat(lng) 
            },
            radius: 1000.0
          }
        }
      })
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('[Google Places] Search API Error:', {
        status: searchResponse.status,
        statusText: searchResponse.statusText,
        body: errorText
      });
      
      // Try to parse error as JSON for better error messages
      let errorMessage = `HTTP ${searchResponse.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
        console.error('[Google Places] Detailed error:', errorJson);
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(`Search failed: ${searchResponse.status} - ${errorMessage}`);
    }

    const searchData = await searchResponse.json();
    console.log('[Google Places] Search results:', searchData.places?.length || 0);

    if (!searchData.places || searchData.places.length === 0) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    // The 'name' field contains the full resource name in format "places/PLACE_ID"
    // The 'id' field contains just the place ID
    const placeResourceName = searchData.places[0].name || `places/${searchData.places[0].id}`;
    console.log('[Google Places] Found place resource name:', placeResourceName);
    console.log('[Google Places] Place data:', JSON.stringify(searchData.places[0], null, 2));

    // Step 2: Get detailed information
    const detailsUrl = `https://places.googleapis.com/v1/${placeResourceName}`;
    
    const fieldMask = [
      'id',
      'displayName',
      'formattedAddress',
      'internationalPhoneNumber',
      'websiteUri',
      'regularOpeningHours',
      'rating',
      'userRatingCount',
      'priceLevel',
      'reviews',
      'photos',
      'editorialSummary',
      'types',
      'location'
    ].join(',');

    console.log('[Google Places] Fetching details from:', detailsUrl);
    console.log('[Google Places] Field mask:', fieldMask);

    const detailsResponse = await fetch(detailsUrl, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': fieldMask
      }
    });

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error('[Google Places] Details API Error:', {
        status: detailsResponse.status,
        statusText: detailsResponse.statusText,
        body: errorText
      });
      throw new Error(`Details fetch failed: ${detailsResponse.status} - ${errorText}`);
    }

    const details = await detailsResponse.json();
    console.log('[Google Places] Got details for:', details.displayName?.text);

    // Format opening hours
    let formattedHours = null;
    if (details.regularOpeningHours?.weekdayDescriptions) {
      formattedHours = details.regularOpeningHours.weekdayDescriptions.join('\n');
    }

    // Format reviews
    const reviews = details.reviews?.slice(0, 5).map((review: any) => ({
      author: review.authorAttribution?.displayName || 'Anonymous',
      authorPhoto: review.authorAttribution?.photoUri,
      rating: review.rating,
      text: review.text?.text || review.originalText?.text,
      time: review.publishTime,
      relativeTime: review.relativePublishTimeDescription
    })) || [];

    // Format photos - get high quality URLs
    const photos = details.photos?.slice(0, 10).map((photo: any) => {
      const photoName = photo.name;
      return `https://places.googleapis.com/v1/${photoName}/media?key=${GOOGLE_MAPS_API_KEY}&maxHeightPx=1200&maxWidthPx=1200`;
    }) || [];

    // Price level to string
    let priceString = null;
    if (details.priceLevel) {
      const priceMap: { [key: string]: string } = {
        'PRICE_LEVEL_FREE': 'Free',
        'PRICE_LEVEL_INEXPENSIVE': '$',
        'PRICE_LEVEL_MODERATE': '$$',
        'PRICE_LEVEL_EXPENSIVE': '$$$',
        'PRICE_LEVEL_VERY_EXPENSIVE': '$$$$'
      };
      priceString = priceMap[details.priceLevel] || null;
    }

    // Build response
    const response = {
      name: details.displayName?.text || name,
      address: details.formattedAddress,
      phone: details.internationalPhoneNumber,
      website: details.websiteUri,
      rating: details.rating,
      reviewCount: details.userRatingCount,
      priceLevel: priceString,
      hours: formattedHours,
      description: details.editorialSummary?.text,
      reviews: reviews,
      photos: photos,
      types: details.types || []
    };

    console.log('[Google Places] Returning data with', photos.length, 'photos and', reviews.length, 'reviews');

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[Google Places] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch place details',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

