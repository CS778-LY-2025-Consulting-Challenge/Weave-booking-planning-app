/**
 * CDN/S3 URL Utilities
 * 
 * Centralized helper functions for working with CloudFront CDN and S3 storage
 * 
 * Usage:
 * 
 * Server-side (API routes, server components):
 * ```typescript
 * import { getCdnUrl } from '@/lib/s3';
 * 
 * const imageUrl = await getCdnUrl('destinations/paris.jpg');
 * ```
 * 
 * Client-side (use Image component):
 * ```typescript
 * import { useCdnUrl } from '@/lib/cdn-utils';
 * 
 * const CdnImage = () => {
 *   const imageUrl = useCdnUrl('destinations/paris.jpg');
 *   return <img src={imageUrl} alt="Paris" />;
 * };
 * ```
 */

/**
 * Get CDN URL for a file (client-side)
 * Uses environment variable NEXT_PUBLIC_CDN_URL if CloudFront is configured
 * 
 * @param key - S3 path (e.g., "destinations/eiffel-tower.jpg")
 * @returns CDN URL or fallback URL
 * 
 * @example
 * const url = useCdnUrl('destinations/paris.jpg');
 * // With CloudFront: https://d123abc.cloudfront.net/destinations/paris.jpg
 * // Without CloudFront: https://weave-travel-media.s3.ap-southeast-2.amazonaws.com/destinations/paris.jpg
 */
export function useCdnUrl(key: string): string {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

  // If CloudFront is configured, use it
  if (cdnUrl && cdnUrl.trim() !== "") {
    return `${cdnUrl}/${key}`;
  }

  // Fallback to S3 direct URL (note: this won't work for private buckets)
  // For private buckets, you need to get a signed URL from the server
  const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";
  const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "";

  if (!bucket) {
    console.warn("S3 bucket not configured");
    return key;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Check if CloudFront is configured
 * @returns true if NEXT_PUBLIC_CDN_URL is set
 */
export function isCdnConfigured(): boolean {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  return !!(cdnUrl && cdnUrl.trim() !== "");
}

/**
 * Get CDN statistics for monitoring
 * Use this to check if CDN is working properly
 * 
 * @returns Object with CDN configuration info
 */
export function getCdnInfo(): {
  configured: boolean;
  url: string | null;
  type: "cloudfront" | "s3" | "none";
} {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;

  if (cdnUrl && cdnUrl.trim() !== "") {
    return {
      configured: true,
      url: cdnUrl,
      type: "cloudfront",
    };
  }

  if (bucket) {
    const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";
    return {
      configured: true,
      url: `https://${bucket}.s3.${region}.amazonaws.com`,
      type: "s3",
    };
  }

  return {
    configured: false,
    url: null,
    type: "none",
  };
}

/**
 * S3 Key Builders
 * Consistently formatted paths for different content types
 */

export const S3_PATHS = {
  /**
   * Destination images
   * @example: destinations/paris-eiffel-tower.jpg
   */
  destination: (slug: string, filename: string) =>
    `destinations/${slug}/${filename}`,

  /**
   * Guide profile photos
   * @example: guides/john-smith-12345.jpg
   */
  guide: (slug: string, filename: string) =>
    `guides/${slug}/${filename}`,

  /**
   * Hotel images
   * @example: hotels/paris-hilton-room-view.jpg
   */
  hotel: (hotelId: string, filename: string) =>
    `hotels/${hotelId}/${filename}`,

  /**
   * Journey/Package images
   * @example: journeys/paris-weekend-getaway.jpg
   */
  journey: (journeyId: string, filename: string) =>
    `journeys/${journeyId}/${filename}`,

  /**
   * User uploads (profile pics, documents, etc)
   * @example: users/user-123-avatar.jpg
   */
  user: (userId: string, type: string, filename: string) =>
    `users/${userId}/${type}/${filename}`,

  /**
   * Miscellaneous uploads
   * @example: misc/banner-2024-01.jpg
   */
  misc: (filename: string) => `misc/${filename}`,
};

/**
 * Cache Control Headers
 * Use these when uploading to S3 for CloudFront optimization
 */

export const CACHE_HEADERS = {
  /** 24 hours - for content that changes occasionally */
  standard: {
    "Cache-Control": "public, max-age=86400, s-maxage=86400",
  },

  /** 1 year - for versioned/static assets that never change */
  immutable: {
    "Cache-Control": "public, max-age=31536000, immutable, s-maxage=31536000",
  },

  /** 5 minutes - for frequently updated content */
  short: {
    "Cache-Control": "public, max-age=300, s-maxage=300",
  },

  /** 1 hour - for moderately changing content */
  medium: {
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
  },

  /** No cache - for content that should always be fresh */
  nocache: {
    "Cache-Control": "public, max-age=0, must-revalidate, s-maxage=0",
  },
};
