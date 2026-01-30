'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface MediaItem {
    file: File;
    id: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    s3Key?: string;
}

interface MediaUploaderProps {
    onUploadComplete: (items: { s3Key: string; type: 'image' | 'video' }[]) => void;
}

export default function MediaUploader({ onUploadComplete }: MediaUploaderProps) {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map((file) => ({
                file,
                id: Math.random().toString(36).substring(7),
                progress: 0,
                status: 'pending' as const,
            }));
            setMediaItems((prev) => [...prev, ...newFiles]);
        }
    };

    // Remove file from list
    const removeFile = (id: string) => {
        if (isUploading) return;
        setMediaItems((prev) => prev.filter((item) => item.id !== id));
    };

    // Upload a single file using backend-driven approach (FormData)
    const uploadFile = async (item: MediaItem): Promise<string> => {
        try {
            // Create FormData with file and folder
            const formData = new FormData();
            formData.append('file', item.file);
            formData.append('folder', 'trip-media');

            // Upload to backend (which handles S3 upload)
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `Upload failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const s3Path = data.s3Path;
            
            if (!s3Path) {
                throw new Error('No S3 path returned from server');
            }

            console.log('[MediaUploader] File uploaded successfully:', s3Path);
            return s3Path;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error('[MediaUploader] Upload Error:', errorMsg);
            throw error;
        }
    };

    // Start Batch Upload
    const startUpload = async () => {
        if (mediaItems.length === 0) return;

        setIsUploading(true);
        const uploadedKeys: { s3Key: string; type: 'image' | 'video' }[] = [];

        // Process sequentially
        for (let i = 0; i < mediaItems.length; i++) {
            const item = mediaItems[i];

            // Skip already completed
            if (item.status === 'completed' && item.s3Key) {
                uploadedKeys.push({
                    s3Key: item.s3Key,
                    type: item.file.type.startsWith('video') ? 'video' : 'image'
                });
                continue;
            }

            setMediaItems(prev => prev.map((m, idx) => idx === i ? { ...m, status: 'uploading', progress: 10 } : m));

            try {
                const key = await uploadFile(item);

                setMediaItems(prev => prev.map((m, idx) => idx === i ? { ...m, status: 'completed', progress: 100, s3Key: key } : m));
                uploadedKeys.push({
                    s3Key: key,
                    type: item.file.type.startsWith('video') ? 'video' : 'image'
                });
                toast.success(`${item.file.name} uploaded successfully`);

            } catch (error) {
                setMediaItems(prev => prev.map((m, idx) => idx === i ? { ...m, status: 'error', progress: 0 } : m));
                const errorMsg = error instanceof Error ? error.message : 'Upload failed';
                toast.error(`Failed to upload ${item.file.name}: ${errorMsg}`);
            }
        }

        setIsUploading(false);

        // If all successful (or at least some), notify parent
        if (uploadedKeys.length > 0) {
            onUploadComplete(uploadedKeys);
        }
    };

    return (
        <div className="space-y-6">
            <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Click to Upload Photos & Videos</h3>
                <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG, MP4</p>
                <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            {mediaItems.length > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm text-gray-700">Selected Files ({mediaItems.length})</h4>
                        {mediaItems.some(i => i.status !== 'completed') && !isUploading && (
                            <Button onClick={startUpload} disabled={isUploading}>
                                {isUploading ? 'Uploading...' : 'Start Upload'}
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {mediaItems.map((item) => (
                            <Card key={item.id} className="relative overflow-hidden">
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <ImageIcon className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.file.name}</p>
                                        <p className="text-xs text-gray-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        {(item.status === 'uploading' || item.status === 'completed') && (
                                            <Progress value={item.progress} className="h-1 mt-2" />
                                        )}
                                    </div>
                                    <div>
                                        {item.status === 'completed' ? (
                                            <Check className="h-5 w-5 text-green-500" />
                                        ) : item.status === 'error' ? (
                                            <X className="h-5 w-5 text-red-500" />
                                        ) : item.status === 'uploading' ? (
                                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                        ) : (
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}>
                                                <X className="h-4 w-4 text-gray-400" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
