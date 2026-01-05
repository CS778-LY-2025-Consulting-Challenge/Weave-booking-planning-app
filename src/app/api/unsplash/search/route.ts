import { NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Simple in-memory cache (optional, to reduce API calls)
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json({ error: 'City parameter required' }, { status: 400 });
  }

  if (!UNSPLASH_ACCESS_KEY) {
    console.error('[Unsplash API] No access key configured');
    return NextResponse.json({ error: 'Unsplash API not configured' }, { status: 500 });
  }

  try {
    // Check cache first
    const cached = imageCache.get(city);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[Unsplash API] Cache hit for ${city}`);
      return NextResponse.json({ imageUrl: cached.url, cached: true });
    }

    // Call Unsplash API
    console.log(`[Unsplash API] Fetching photo for ${city}...`);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(city)}&orientation=landscape&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`,
      {
        headers: {
          'Accept-Version': 'v1',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log(`[Unsplash API] No results for "${city}", trying generic query...`);
      
      // Try a more generic search by taking only the first word
      const genericQuery = city.split(' ')[0];
      if (genericQuery !== city && genericQuery.length > 2) {
        console.log(`[Unsplash API] Retrying with: "${genericQuery}"`);
        const retryResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(genericQuery)}&orientation=landscape&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`,
          {
            headers: {
              'Accept-Version': 'v1',
            },
          }
        );
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          if (retryData.results && retryData.results.length > 0) {
            const photo = retryData.results[0];
            const imageUrl = `${photo.urls.regular}&w=1600&q=80`;
            imageCache.set(city, { url: imageUrl, timestamp: Date.now() });
            console.log(`[Unsplash API] Found photo for ${genericQuery}`);
            return NextResponse.json({
              imageUrl,
              photographer: photo.user.name,
              photographerUrl: photo.user.links.html,
              cached: false,
            });
          }
        }
      }
      
      // Final fallback to generic travel image
      console.log(`[Unsplash API] Using fallback image for ${city}`);
      const fallbackUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80';
      return NextResponse.json({ imageUrl: fallbackUrl, fallback: true });
    }

    const photo = data.results[0];
    const imageUrl = `${photo.urls.regular}&w=1600&q=80`;
    const photographer = photo.user.name;
    const photographerUrl = photo.user.links.html;

    // Cache the result
    imageCache.set(city, { url: imageUrl, timestamp: Date.now() });

    console.log(`[Unsplash API] Found photo for ${city} by ${photographer}`);

    return NextResponse.json({
      imageUrl,
      photographer,
      photographerUrl,
      cached: false,
    });
  } catch (error: any) {
    console.error('[Unsplash API] Error:', error);
    // Return fallback image on error
    return NextResponse.json({
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
      fallback: true,
      error: error.message,
    });
  }
}

