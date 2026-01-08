import { uploadToS3, generateS3Key, validateFile } from "@/lib/s3";

/**
 * POST /api/upload
 * Secure server-side upload endpoint
 *
 * Request body (FormData):
 * - file: File object
 * - folder: String (optional, default: "uploads")
 *
 * Response:
 * - signedUrl: Temporary URL (1 hour)
 * - s3Path: Permanent S3 path
 *
 * @example
 * const formData = new FormData();
 * formData.append('file', file);
 * formData.append('folder', 'destinations');
 *
 * const response = await fetch('/api/upload', {
 *   method: 'POST',
 *   body: formData,
 * });
 * const { signedUrl, s3Path } = await response.json();
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return Response.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      return Response.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Generate unique S3 key
    const s3Key = generateS3Key(folder, file.name);

    // Upload to S3
    const result = await uploadToS3(file, s3Key);

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
