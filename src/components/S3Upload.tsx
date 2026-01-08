'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface S3UploadProps {
  folder?: string; // e.g., "destinations", "guides", "hotels"
  onUploadComplete?: (signedUrl: string, s3Path: string) => void;
  maxSizeMB?: number;
  accept?: string;
}

/**
 * S3Upload Component
 * Handles file selection and upload to S3 via secure API route
 *
 * @example
 * <S3Upload
 *   folder="destinations"
 *   onUploadComplete={(url, path) => {
 *     console.log('Uploaded:', url);
 *     setImageUrl(url);
 *   }}
 * />
 */
export default function S3Upload({
  folder = 'uploads',
  onUploadComplete,
  maxSizeMB = 50,
  accept = 'image/*,video/*,.gif',
}: S3UploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedPath, setUploadedPath] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be smaller than ${maxSizeMB}MB`);
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Show progress if browser supports it
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      // Upload via API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { signedUrl, s3Path } = await response.json();

      setUploadedUrl(signedUrl);
      setUploadedPath(s3Path);
      onUploadComplete?.(signedUrl, s3Path);
      setProgress(100);

      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="file"
          onChange={handleFileChange}
          disabled={isLoading}
          accept={accept}
          className="flex-1"
        />
        <Button disabled={isLoading} className="w-32">
          {isLoading ? `${Math.round(progress)}%` : 'Upload'}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded h-2">
            <div
              className="bg-blue-500 h-2 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
      )}

      {uploadedUrl && (
        <div className="space-y-2">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p className="text-sm font-semibold text-green-900">
              ✓ Upload successful!
            </p>
            <p className="text-xs text-green-700 mt-1">
              Temporary URL (1 hour): {uploadedUrl.substring(0, 50)}...
            </p>
            <p className="text-xs text-gray-600 mt-1">
              S3 Path: {uploadedPath}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(uploadedUrl);
              toast.success('URL copied!');
            }}
          >
            Copy URL
          </Button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Max file size: {maxSizeMB}MB • Temporary URL expires in 1 hour
      </p>
    </div>
  );
}
