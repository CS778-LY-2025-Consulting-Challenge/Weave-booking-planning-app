'use client';

import { useState } from 'react';
import S3Upload from '@/components/S3Upload';
import S3Image from '@/components/S3Image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Example: Upload and display destination images via S3
 * This demonstrates the complete flow:
 * 1. Upload image → S3Upload component
 * 2. Store S3 path in state
 * 3. Display with S3Image component
 */
export default function DestinationUploadExample() {
  const [imageData, setImageData] = useState<{
    signedUrl: string;
    s3Path: string;
  } | null>(null);

  const handleUploadComplete = (signedUrl: string, s3Path: string) => {
    setImageData({ signedUrl, s3Path });
    console.log('Image uploaded to S3:', s3Path);
    // Here you would save s3Path to your database
  };

  return (
    <div className="space-y-8 p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Upload Destination Image</h1>

      {/* Step 1: Upload */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Step 1: Upload to S3</h2>
        <S3Upload
          folder="destinations"
          onUploadComplete={handleUploadComplete}
          maxSizeMB={50}
          accept="image/*"
        />
      </Card>

      {/* Step 2: Display */}
      {imageData && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Display from S3</h2>
          <S3Image
            s3Path={imageData.s3Path}
            alt="Uploaded destination"
            width={400}
            height={300}
            className="rounded-lg"
          />
        </Card>
      )}

      {/* Step 3: Save to Database */}
      {imageData && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-4">Step 3: Save to Database</h2>
          <p className="text-gray-700 mb-4">
            In your API route or server action, save the S3 path to your database:
          </p>
          <code className="bg-gray-900 text-green-400 p-4 rounded block text-sm overflow-x-auto">
            {`// Save in database
const destination = await db.destination.create({
  title: "Eiffel Tower",
  imageS3Path: "${imageData.s3Path}",
  description: "Beautiful landmark in Paris"
});`}
          </code>

          <Button
            onClick={() => {
              navigator.clipboard.writeText(imageData.s3Path);
              console.log('S3 path copied:', imageData.s3Path);
            }}
            className="mt-4"
          >
            Copy S3 Path
          </Button>
        </Card>
      )}

      {/* Info Box */}
      <Card className="p-6 bg-amber-50 border-amber-200">
        <h3 className="font-semibold mb-2">ℹ️ How It Works</h3>
        <ul className="text-sm space-y-2 text-gray-700">
          <li>• Upload file → Goes to `/api/upload` → Stored in S3 bucket</li>
          <li>• Temp URL returned → Expires in 1 hour (for preview)</li>
          <li>• Save S3 path to database → Later fetch with fresh signed URL</li>
          <li>• Display → `S3Image` auto-refreshes URLs before expiry</li>
        </ul>
      </Card>
    </div>
  );
}
