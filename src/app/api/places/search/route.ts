import { NextResponse } from 'next/server';

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;

// Helper: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!name || !lat || !lng) {
    return NextResponse.json({ error: 'Name, lat, and lng are required' }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  try {
    // Step 1: Get ACCURATE address using Reverse Geocoding (coordinate-based)
    console.log(`[Places API] Step 1: Reverse geocoding for coordinates: ${lng}, ${lat}`);
    let accurateAddress = 'Address not available';
    
    try {
      const reverseGeoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
      const geoRes = await fetch(reverseGeoUrl);
      const geoData = await geoRes.json();
      
      if (geoData.features && geoData.features.length > 0) {
        accurateAddress = geoData.features[0].place_name || accurateAddress;
        console.log(`[Places API] Accurate address: ${accurateAddress}`);
      }
    } catch (err) {
      console.error('[Places API] Reverse geocoding error:', err);
    }

    // Step 2: For preview card, we skip Foursquare to keep it fast
    // Only use basic info from Mapbox
    console.log(`[Places API] Step 2: Using Mapbox only for fast preview`);
    let poiDetails = {
      category: 'Point of Interest',
      phone: null as string | null,
      website: null as string | null,
      hours: null as string | null,
    };
    
    // Note: We intentionally don't call Foursquare here to keep preview card fast
    // Detailed info will be fetched when user clicks "View Details"

    // Step 3: Fetch Unsplash Image
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(name)}&orientation=landscape&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;
    
    const unsplashRes = await fetch(unsplashUrl);
    const unsplashData = await unsplashRes.json();
    const photoUrl = unsplashData.results?.[0]?.urls?.regular;

    return NextResponse.json({
      name: name,
      address: accurateAddress, // Always use the accurate address from reverse geocoding
      category: poiDetails.category,
      phone: poiDetails.phone,
      website: poiDetails.website,
      hours: poiDetails.hours,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    });
  } catch (error: any) {
    console.error('Places API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

