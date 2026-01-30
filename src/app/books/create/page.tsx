'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import MediaUploader from '@/components/CreateBook/MediaUploader';
import JobStatusTracker from '@/components/CreateBook/JobStatusTracker';
import { toast } from 'sonner';

export default function CreateBookPage() {
    const { user } = useUser();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [mediaItems, setMediaItems] = useState<{ s3Key: string; type: 'image' | 'video' }[]>([]);
    const [title, setTitle] = useState(`${new Date().getFullYear()} Adventure`);
    const [description, setDescription] = useState('');
    const [jobId, setJobId] = useState<string | null>(null);

    const handleUploadComplete = (items: { s3Key: string; type: 'image' | 'video' }[]) => {
        setMediaItems(items);
        setStep(2);
    };

    const handleCreateJob = async () => {
        try {
            const res = await fetch('/api/books/create-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    title,
                    description,
                    mediaItems
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create job');

            setJobId(data.jobId);
            setStep(3);

            // Trigger worker immediately for this prototype
            fetch('/api/workers/generate-book', { method: 'POST' }).catch(console.error);

        } catch (error) {
            console.error(error);
            toast.error('Failed to start book generation');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 px-4 pb-12">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-gray-900">Create Travel Book</h1>
                        <p className="text-gray-500">Turn your photos into a beautiful story with AI</p>
                    </div>
                </div>

                {/* Step 1: Upload */}
                {step === 1 && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-6">1. Upload your memories</h2>
                        <MediaUploader onUploadComplete={handleUploadComplete} />
                    </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-6">2. Book Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Summer in Italy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="A brief note about this trip..."
                                        className="h-24"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button
                                onClick={handleCreateJob}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                <Wand2 className="mr-2 h-4 w-4" />
                                Generate Book
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Processing Status */}
                {step === 3 && jobId && (
                    <JobStatusTracker jobId={jobId} />
                )}

            </div>
        </div>
    );
}
