'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';
import { useCdnUrl } from '@/lib/cdn-utils';

interface S3ImageProps {
  s3Path: string; // e.g., "destinations/1704542400000-a1b2c3-eiffel-tower.jpg"
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onError?: () => void;
}

/**
 * S3Image Component
 * Displays images stored in private S3 bucket
 * 
 * Uses CloudFront CDN if configured (via NEXT_PUBLIC_CDN_URL)
 * Falls back to signed URLs if CDN not configured
 * Signed URLs automatically refresh before they expire (1 hour default)
 *
 * @example
 * <S3Image
 *   s3Path="destinations/1704542400000-a1b2c3-eiffel-tower.jpg"
 *   alt="Eiffel Tower"
 *   width={400}
 *   height={300}
 * />
 */
export default function S3Image({
  s3Path,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  onError,
}: S3ImageProps) {
  // Get CDN URL (if configured) - this is instant, no API call needed
  const cdnUrl = useCdnUrl(s3Path);
  
  // If CloudFront is configured, use it directly
  const isCdnConfigured = process.env.NEXT_PUBLIC_CDN_URL && process.env.NEXT_PUBLIC_CDN_URL.trim() !== "";
  
  const [imageUrl, setImageUrl] = useState<string | null>(isCdnConfigured ? cdnUrl : null);
  const [isLoading, setIsLoading] = useState(!isCdnConfigured);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch new signed URL from API (only if CDN not configured)
   * Signed URLs expire in 1 hour, so we refresh 5 minutes before expiry
   */
  useEffect(() => {
    // If CDN is configured, skip signed URL fetch
    if (isCdnConfigured) {
      setImageUrl(cdnUrl);
      setIsLoading(false);
      return;
    }

    const fetchSignedUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Call API to get signed URL
        const response = await fetch('/api/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            s3Path,
            expiresIn: 3600, // 1 hour
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get signed URL');
        }

        const { signedUrl } = await response.json();
        setImageUrl(signedUrl);

        // Refresh URL 55 minutes from now (before 1 hour expiry)
        const refreshTimeout = setTimeout(() => {
          fetchSignedUrl();
        }, 55 * 60 * 1000);

        return () => clearTimeout(refreshTimeout);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error loading image';
        setError(message);
        console.error('Failed to fetch signed URL:', err);
        onError?.();
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [s3Path, onError, cdnUrl, isCdnConfigured]);

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <p className="text-sm text-gray-600">Failed to load image</p>
      </div>
    );
  }

  if (isLoading || !imageUrl) {
    return <Skeleton className={className} style={{ width, height }} />;
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized // AWS S3 signed URLs require unoptimized
    />
  );
}
