import { getSignedUrlForFile } from '@/lib/s3';

/**
 * Image proxy - backend fetches signed URL and streams to client
 * Avoids CORS issues entirely
 * 
 * Usage: GET /api/image-proxy?path=home/background.jpg
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const s3Path = url.searchParams.get('path');

    console.log('[image-proxy] Request URL:', request.url);
    console.log('[image-proxy] Search params:', url.search);
    console.log('[image-proxy] S3 path:', s3Path);

    if (!s3Path) {
      console.error('[image-proxy] Missing path parameter');
      return Response.json(
        { error: 'Missing path parameter' },
        { status: 400 }
      );
    }

    // If CDN is configured, redirect to CloudFront path (fast, simple)
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
    if (cdnUrl && cdnUrl.trim() !== '') {
      const redirectUrl = `${cdnUrl}/${s3Path}`;
      console.log('[image-proxy] Redirecting to CDN:', redirectUrl);
      return Response.redirect(redirectUrl, 302);
    }

    // Fallback: redirect to S3 signed URL (avoids server-side fetch issues)
    console.log('[image-proxy] Getting signed URL for:', s3Path);
    const signedUrl = await getSignedUrlForFile(s3Path, 3600);
    console.log('[image-proxy] Generated signed URL, redirecting');
    return Response.redirect(signedUrl, 302);
  } catch (error) {
    console.error('[image-proxy] Error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
