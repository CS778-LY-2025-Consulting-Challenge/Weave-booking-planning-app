import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';
import { collection, query, where, limit, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';

// Mock AI generation function (Replace with real OpenAI call later)
async function generateBookContent(title: string, mediaCount: number) {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
        title: `The Story of ${title}`,
        description: "A beautiful journey captured in time.",
        coverImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
        chapters: [
            {
                day: "Day 1",
                title: "Arrival & First Impressions",
                content: "The journey began with excitement. The air was crisp, and the sights were welcoming. We explored the local streets and found hidden gems around every corner.",
                mediaIndex: [0] // Index of mediaItems
            },
            {
                day: "Day 2",
                title: "The Adventure Continues",
                content: "Deep diving into the culture today. The colors, the sounds, the tastes - everything was overwhelming in the best way possible.",
                mediaIndex: []
            }
        ]
    };
}

export async function POST(req: Request) {
    try {
        // 1. Find a queued job
        const jobsRef = collection(firestore, 'bookJobs');
        const q = query(jobsRef, where("status", "==", "queued"), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return NextResponse.json({ message: 'No queued jobs found' });
        }

        const jobDoc = querySnapshot.docs[0];
        const jobData = jobDoc.data();
        const jobId = jobDoc.id;

        console.log(`Processing job ${jobId}`);

        // 2. Mark as processing
        await updateDoc(doc(firestore, 'bookJobs', jobId), {
            status: 'processing'
        });

        try {
            // 3. Generate Book Content (Mock for now)
            const aiResult = await generateBookContent(jobData.title, jobData.mediaItems?.length || 0);

            // 4. Create Book Record
            const bookData = {
                userId: jobData.userId,
                jobId: jobId,
                title: aiResult.title,
                description: aiResult.description,
                coverImage: aiResult.coverImage,
                chapters: aiResult.chapters,
                status: 'draft',
                createdAt: serverTimestamp(),
                // Map back the original media items to the chapters if needed
                mediaRef: jobData.mediaItems
            };

            const bookRef = await addDoc(collection(firestore, 'generatedBooks'), bookData);

            // 5. Mark Job as Ready
            await updateDoc(doc(firestore, 'bookJobs', jobId), {
                status: 'ready',
                resultBookId: bookRef.id
            });

            return NextResponse.json({
                success: true,
                message: `Job ${jobId} processed successfully`,
                bookId: bookRef.id
            });

        } catch (err: any) {
            console.error(`Error processing job ${jobId}:`, err);

            await updateDoc(doc(firestore, 'bookJobs', jobId), {
                status: 'failed',
                error: err.message
            });

            return NextResponse.json({ error: `Job processing failed: ${err.message}` }, { status: 500 });
        }

    } catch (error) {
        console.error('Worker error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
