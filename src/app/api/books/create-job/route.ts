import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { firestore } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, mediaItems } = await req.json();

        if (!mediaItems || !Array.isArray(mediaItems) || mediaItems.length === 0) {
            return NextResponse.json({ error: 'No media items provided' }, { status: 400 });
        }

        // Rate Limiting (Optional - omitting for MVP/Prototype safety but noted in plan)
        // TODO: Check if user has too many active jobs.

        const jobData = {
            userId,
            title: title || 'My Travel Book',
            description: description || '',
            status: 'queued',
            createdAt: serverTimestamp(),
            mediaItems: mediaItems.map((item: any) => ({
                s3Key: item.s3Key,
                type: item.type || 'image',
                timestamp: item.timestamp || Date.now(),
                caption: item.caption || ''
            })),
        };

        const docRef = await addDoc(collection(firestore, 'bookJobs'), jobData);

        return NextResponse.json({
            success: true,
            jobId: docRef.id,
            message: 'Travel book generation queued'
        });

    } catch (error) {
        console.error('Error creating book message:', error);
        return NextResponse.json(
            { error: 'Failed to queue job' },
            { status: 500 }
        );
    }
}
