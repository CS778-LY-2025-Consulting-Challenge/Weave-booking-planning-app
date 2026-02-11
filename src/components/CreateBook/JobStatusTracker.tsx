'use client';

import { useEffect, useState } from 'react';
import { firestore } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface JobStatusTrackerProps {
    jobId: string;
}

export default function JobStatusTracker({ jobId }: JobStatusTrackerProps) {
    const [status, setStatus] = useState<'queued' | 'processing' | 'ready' | 'failed'>('queued');
    const [progress, setProgress] = useState(0);
    const [bookId, setBookId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!jobId) return;

        const unsubscribe = onSnapshot(doc(firestore, 'bookJobs', jobId), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setStatus(data.status);
                if (data.status === 'ready' && data.resultBookId) {
                    setBookId(data.resultBookId);
                    setProgress(100);
                } else if (data.status === 'processing') {
                    setProgress(50); // Indeterminate usually, but set to 50 for visual
                } else if (data.status === 'failed') {
                    setProgress(0);
                }
            }
        });

        return () => unsubscribe();
    }, [jobId]);

    // Fake progressive loading for visual comfort
    useEffect(() => {
        if (status === 'processing') {
            const interval = setInterval(() => {
                setProgress(prev => Math.min(prev + 1, 90));
            }, 500); // Slow crawl up to 90%
            return () => clearInterval(interval);
        }
    }, [status]);

    return (
        <Card className="max-w-md mx-auto mt-8 border-blue-100 shadow-md">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    {status === 'ready' ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    )}
                </div>
                <CardTitle>
                    {status === 'queued' && 'Waiting in queue...'}
                    {status === 'processing' && 'Writing your story...'}
                    {status === 'ready' && 'Your book is ready!'}
                    {status === 'failed' && 'Something went wrong'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <Progress value={progress} className="h-2" />

                <div className="text-center space-y-2">
                    <p className="text-sm text-gray-500">
                        {status === 'queued' && 'We are preparing your assets.'}
                        {status === 'processing' && 'AI is analyzing your photos and crafting the narrative.'}
                        {status === 'ready' && 'Click below to view your personalized travel book.'}
                    </p>

                    {status === 'ready' && bookId && (
                        <Button
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600"
                            onClick={() => router.push(`/books/${bookId}`)}
                        >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Open Book
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
