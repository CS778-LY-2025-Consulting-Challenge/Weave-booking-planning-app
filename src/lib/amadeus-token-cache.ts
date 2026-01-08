/**
 * Amadeus OAuth2 Token Cache
 * Stores and manages access tokens with automatic expiry handling
 */

interface TokenData {
  accessToken: string;
  expiresAt: number;
}

// In-memory cache (use Redis in production for distributed systems)
let tokenCache: Map<string, TokenData> = new Map();

const AMADEUS_TOKEN_URL = process.env.AMADEUS_ENVIRONMENT === 'production'
  ? 'https://api.amadeus.com/v1/security/oauth2/token'
  : 'https://test.api.amadeus.com/v1/security/oauth2/token';

export async function getAmadeusToken(): Promise<string> {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Amadeus API credentials in environment variables');
  }

  const cacheKey = `amadeus_${clientId}`;
  const cached = tokenCache.get(cacheKey);

  // Return cached token if still valid (with 60-second buffer)
  if (cached && cached.expiresAt > Date.now() + 60000) {
    console.log('[Amadeus] Using cached token');
    return cached.accessToken;
  }

  console.log('[Amadeus] Fetching new token...');

  try {
    const response = await fetch(AMADEUS_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Amadeus token error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const { access_token, expires_in } = data;

    if (!access_token || !expires_in) {
      throw new Error('Invalid token response from Amadeus');
    }

    // Cache token with expiry time (in milliseconds)
    const expiresAt = Date.now() + expires_in * 1000;
    tokenCache.set(cacheKey, {
      accessToken: access_token,
      expiresAt,
    });

    console.log(`[Amadeus] Token cached until ${new Date(expiresAt).toISOString()}`);
    return access_token;
  } catch (error) {
    console.error('[Amadeus] Token fetch failed:', error);
    throw error;
  }
}

/**
 * Clear token cache (useful for testing or manual token refresh)
 */
export function clearAmadeusTokenCache(): void {
  tokenCache.clear();
  console.log('[Amadeus] Token cache cleared');
}

/**
 * Get cache status (for debugging)
 */
export function getTokenCacheStatus(): { cached: boolean; expiresIn: number } {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const cacheKey = `amadeus_${clientId}`;
  const cached = tokenCache.get(cacheKey);

  if (!cached) {
    return { cached: false, expiresIn: 0 };
  }

  const expiresIn = Math.max(0, cached.expiresAt - Date.now());
  return { cached: true, expiresIn };
}
