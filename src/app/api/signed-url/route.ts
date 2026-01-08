import { getSignedUrlForFile } from "@/lib/s3";

/**
 * POST /api/signed-url
 * Generate signed URL for private S3 files
 *
 * Request body:
 * - s3Path: String (e.g., "destinations/file.jpg")
 * - expiresIn: Number (seconds, default 3600 = 1 hour, max 604800 = 7 days)
 *
 * Response:
 * - signedUrl: Temporary URL with embedded credentials
 *
 * @example
 * const response = await fetch('/api/signed-url', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     s3Path: 'destinations/eiffel-tower.jpg',
 *     expiresIn: 3600,
 *   }),
 * });
 * const { signedUrl } = await response.json();
 */
export async function POST(request: Request) {
  try {
    const { s3Path, expiresIn = 3600 } = await request.json();

    if (!s3Path) {
      return Response.json(
        { error: "s3Path is required" },
        { status: 400 }
      );
    }

    // Validate expiration time
    if (typeof expiresIn !== 'number' || expiresIn < 60 || expiresIn > 604800) {
      return Response.json(
        { error: "expiresIn must be between 60 and 604800 seconds" },
        { status: 400 }
      );
    }

    // Generate signed URL
    const signedUrl = await getSignedUrlForFile(s3Path, expiresIn);

    return Response.json({ signedUrl }, { status: 200 });
  } catch (error) {
    console.error("Signed URL error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}

/**
 * Image proxy - backend fetches signed URL and streams to client
 * Avoids CORS issues entirely
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const s3Path = searchParams.get('path');

  if (!s3Path) {
    return new Response('Missing path parameter', { status: 400 });
  }

  try {
    // Get signed URL on the backend (safe, credentials not exposed)
    const signedUrl = await getSignedUrlForFile(s3Path, 3600);

    // Fetch the actual image from S3
    const response = await fetch(signedUrl);

    if (!response.ok) {
      return new Response('Failed to fetch image', { status: response.status });
    }

    // Stream the image back to client
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
