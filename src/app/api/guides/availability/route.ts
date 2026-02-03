import { NextResponse } from 'next/server';
import { adminRtdb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const guideId = searchParams.get('guideId');
    const date = searchParams.get('date');

    if (!guideId || !date) {
        return NextResponse.json({ error: 'Missing guideId or date' }, { status: 400 });
    }

    try {
        // Construct the date key to query
        // The booking keys are format: `${guideId}_${dateKey}_${slotKey}`
        // We can query purely by prefix or just fetch all for the day if we stored them nicely.
        // But our structure is flat `guide_bookings/${lockKey}`. 
        // We need to query by startAt and endAt or filter.
        // `adminRtdb` allows querying.

        // Key format: GUIDEID_YYYY-MM-DD_SLOT
        const dateKey = new Date(date).toISOString().split('T')[0];
        const startKey = `${guideId}_${dateKey}_`;
        const endKey = `${guideId}_${dateKey}_\uf8ff`;

        const bookingsRef = adminRtdb.ref('guide_bookings');
        const query = bookingsRef.orderByKey().startAt(startKey).endAt(endKey);

        const snapshot = await query.once('value');
        const bookedSlots: string[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const val = child.val();
                if (val.timeSlot) {
                    bookedSlots.push(val.timeSlot);
                }
            });
        }

        return NextResponse.json({ bookedSlots });
    } catch (error: any) {
        console.error('Availability fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
