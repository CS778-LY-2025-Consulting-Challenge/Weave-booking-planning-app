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
    // Step 1: Get ACCURATE address using Mapbox Reverse Geocoding (as fallback)
    console.log(`[Places Details API] Step 1: Reverse geocoding for: ${name} at ${lng}, ${lat}`);
    let fallbackAddress = 'Address not available';
    
    try {
      const reverseGeoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
      const geoRes = await fetch(reverseGeoUrl);
      const geoData = await geoRes.json();
      
      if (geoData.features && geoData.features.length > 0) {
        fallbackAddress = geoData.features[0].place_name || fallbackAddress;
      }
    } catch (err) {
      console.error('[Places Details API] Reverse geocoding error:', err);
    }

    // Step 2: Try to get POI details using Foursquare Places API
    console.log(`[Places Details API] Step 2: Searching Foursquare for "${name}"`);
    let poiDetails = {
      category: 'Point of Interest',
      phone: null as string | null,
      website: null as string | null,
      hours: null as string | null,
      description: '',
      address: fallbackAddress,
    };

    try {
      // Foursquare Places Search API with fields parameter to get all data in one request
      const foursquareSearchUrl = `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&query=${encodeURIComponent(name)}&limit=3&radius=1000&fields=fsq_id,name,categories,location,tel,website,hours,description,rating,tips`;
      
      const foursquareRes = await fetch(foursquareSearchUrl, {
        headers: {
          'Authorization': FOURSQUARE_API_KEY || '',
          'Accept': 'application/json',
        },
      });
      
      if (!foursquareRes.ok) {
        throw new Error(`Foursquare API error: ${foursquareRes.status}`);
      }
      
      const foursquareData = await foursquareRes.json();
      console.log(`[Places Details API] Foursquare returned ${foursquareData.results?.length || 0} results`);
      
      if (foursquareData.results && foursquareData.results.length > 0) {
        // Use the first result (Foursquare returns results sorted by relevance and distance)
        const place = foursquareData.results[0];
        console.log(`[Places Details API] Best match: "${place.name}"`);
        
        // Extract data from Foursquare (no need for second API call)
        const location = place.location || {};
        const formattedAddress = [
          location.address,
          location.locality,
          location.region,
          location.postcode,
          location.country
        ].filter(Boolean).join(', ');
        
        // Format opening hours
        let hoursText = null;
        if (place.hours?.display) {
          hoursText = place.hours.display;
        } else if (place.hours?.regular) {
          const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
          const todayHours = place.hours.regular.find((h: any) => h.day === today);
          if (todayHours) {
            hoursText = `Today: ${todayHours.open} - ${todayHours.close}`;
          }
        }
        
        poiDetails = {
          category: place.categories?.[0]?.name || 'Point of Interest',
          phone: place.tel || null,
          website: place.website || null,
          hours: hoursText,
          description: place.description || place.tips?.[0]?.text || '',
          address: formattedAddress || fallbackAddress,
        };
        
        console.log(`[Places Details API] Extracted Foursquare details:`, poiDetails);
      } else {
        console.log(`[Places Details API] No Foursquare results, using fallback address only`);
      }
    } catch (err) {
      console.error('[Places Details API] Foursquare search error:', err);
    }

    // Step 3: Fetch MULTIPLE Unsplash Images (4-6 photos)
    let photos: string[] = [];
    try {
      const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(name)}&orientation=landscape&per_page=6&client_id=${UNSPLASH_ACCESS_KEY}`;
      
      const unsplashRes = await fetch(unsplashUrl);
      const unsplashData = await unsplashRes.json();
      
      if (unsplashData.results && unsplashData.results.length > 0) {
        photos = unsplashData.results.map((photo: any) => photo.urls.regular);
        console.log(`[Places Details API] Found ${photos.length} photos for ${name}`);
      }
    } catch (err) {
      console.error('[Places Details API] Unsplash error:', err);
    }

    // Fallback: if no photos, use a generic one
    if (photos.length === 0) {
      photos = ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'];
    }

    return NextResponse.json({
      name: name,
      address: poiDetails.address,
      category: poiDetails.category,
      phone: poiDetails.phone,
      website: poiDetails.website,
      hours: poiDetails.hours,
      description: poiDetails.description,
      photos: photos,
    });
  } catch (error: any) {
    console.error('[Places Details API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

