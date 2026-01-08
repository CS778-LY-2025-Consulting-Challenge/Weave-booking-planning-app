import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Load mapping with relative path
import mapping from "../../public-to-s3-mapping.json";

/**
 * Initialize S3 client with credentials from environment variables
 * These are only used server-side (in API routes or server functions)
 *
 * Supports both:
 * - Permanent IAM credentials (accessKeyId + secretAccessKey)
 * - Temporary SSO credentials (+ sessionToken)
 */
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    ...(process.env.AWS_SESSION_TOKEN && {
      sessionToken: process.env.AWS_SESSION_TOKEN,
    }),
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "";
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || "";

/**
 * Get CDN URL for a file (if CloudFront is configured)
 * Falls back to S3 signed URL if CDN not configured
 *
 * @param key - S3 path (e.g., "destinations/eiffel-tower.jpg")
 * @returns CDN URL if configured, otherwise signed S3 URL
 *
 * @example
 * // With CloudFront configured:
 * const url = await getCdnUrl('destinations/eiffel.jpg');
 * // Returns: https://d123abc.cloudfront.net/destinations/eiffel.jpg
 *
 * // Without CloudFront:
 * const url = await getCdnUrl('destinations/eiffel.jpg');
 * // Returns: https://s3.ap-southeast-2.amazonaws.com/weave-travel-media/destinations/eiffel.jpg?signed...
 */
export async function getCdnUrl(key: string): Promise<string> {
  // If CloudFront is configured, use it for fast delivery
  if (CDN_URL && CDN_URL.trim() !== "") {
    return `${CDN_URL}/${key}`;
  }

  // Fallback to signed S3 URL
  return await getSignedUrlForFile(key, 3600);
}

/**
 * Upload a file to S3
 * Call this from API routes, NOT directly from frontend
 *
 * @param file - File object from input
 * @param key - S3 path (e.g., "destinations/eiffel-tower.jpg")
 * @returns Object with signedUrl (temporary) and permanent S3 path
 */
export async function uploadToS3(
  file: File,
  key: string
): Promise<{
  signedUrl: string;
  s3Path: string;
}> {
  try {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Upload to S3 with AES256 encryption (required by bucket policy)
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: uint8Array,
      ContentType: file.type, // MIME type (image/jpeg, etc.)
      ServerSideEncryption: "AES256", // Required by bucket policy
    });

    await s3Client.send(command);

    // Generate signed URL (expires in 1 hour by default)
    const signedUrl = await getSignedUrlForFile(key, 3600);

    // Return both signed URL and S3 path
    return {
      signedUrl,
      s3Path: key,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
}

/**
 * Get a signed URL for a file (temporary access)
 * Files are private, so we generate temporary URLs that expire
 *
 * @param key - S3 path (e.g., "destinations/eiffel-tower.jpg")
 * @param expiresIn - Seconds until URL expires (default 3600 = 1 hour)
 * @returns Temporary signed URL that anyone can use
 *
 * @example
 * // Generate URL that works for 1 hour
 * const url = await getSignedUrlForFile('destinations/eiffel.jpg', 3600);
 *
 * // Generate URL that works for 7 days
 * const longUrl = await getSignedUrlForFile('guide.pdf', 604800);
 */
export async function getSignedUrlForFile(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    // Validate expiration time (AWS max is 1 week = 604800 seconds)
    if (expiresIn > 604800) {
      expiresIn = 604800; // Cap at 7 days
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Signed URL generation error:", error);
    throw new Error("Failed to generate signed URL");
  }
}

/**
 * Delete a file from S3
 * Call this from API routes only
 *
 * @param key - S3 path to delete
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`Deleted: ${key}`);
  } catch (error) {
    console.error("S3 delete error:", error);
    throw new Error("Failed to delete file from S3");
  }
}

/**
 * Generate a unique S3 key (path) for a file
 * Prevents filename collisions by adding timestamp + random string
 *
 * @param folder - Folder name (e.g., "destinations", "guides")
 * @param originalFileName - Original file name from user
 * @returns Unique S3 path
 *
 * @example
 * // Input: "eiffel-tower.jpg"
 * // Output: "destinations/1704542400000-a1b2c3.jpg"
 */
export function generateS3Key(
  folder: string,
  originalFileName: string
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalFileName.split(".").pop() || "bin";
  const sanitizedFileName = originalFileName
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .substring(0, 20);

  return `${folder}/${timestamp}-${randomString}-${sanitizedFileName}.${extension}`;
}

/**
 * Validate file before upload
 * Check size, type, and other constraints
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default 50)
 * @param allowedTypes - Allowed MIME types (default: images, videos, gifs)
 * @returns Error message if invalid, null if valid
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 50,
  allowedTypes: string[] = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
  ]
): string | null {
  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File must be smaller than ${maxSizeMB}MB`;
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`;
  }

  return null; // Valid
}

/**
 * Create API route handler for uploads
 * Use this in your API routes (src/app/api/upload/route.ts)
 *
 * @example
 * // In src/app/api/upload/route.ts
 * export async function POST(request: Request) {
 *   const formData = await request.formData();
 *   const file = formData.get('file') as File;
 *   const folder = formData.get('folder') as string || 'uploads';
 *
 *   const validation = validateFile(file);
 *   if (validation) {
 *     return Response.json({ error: validation }, { status: 400 });
 *   }
 *
 *   try {
 *     const key = generateS3Key(folder, file.name);
 *     const result = await uploadToS3(file, key);
 *     return Response.json(result);
 *   } catch (error) {
 *     return Response.json({ error: 'Upload failed' }, { status: 500 });
 *   }
 * }
 */

/**
 * Convert old public path to S3 path
 * Used for migrating existing image references
 */
export function getS3PathFromPublic(publicPath: string): string | null {
  const s3Path = mapping[publicPath];
  if (!s3Path) {
    console.warn(`No S3 mapping found for: ${publicPath}`);
    return null;
  }
  return s3Path;
}

/**
 * Get signed URL from old public path
 */
export async function getImageUrlFromPublic(publicPath: string): Promise<string> {
  const s3Path = getS3PathFromPublic(publicPath);
  if (!s3Path) {
    return publicPath; // Fallback to original
  }
  return await getSignedUrlForFile(s3Path, 3600);
}
