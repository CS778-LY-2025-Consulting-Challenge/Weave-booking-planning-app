import { NextResponse } from 'next/server';
import { adminRtdb } from '@/lib/firebase-admin';
import { sendEmail, generateBookingEmailHtml } from '@/lib/email';

export async function POST(request: Request) {
    console.log("Guide Booking API Hit");
    try {
        const body = await request.json();
        const { guide, date, timeSlot, fullName, email, notes } = body;

        if (!guide || !date || !timeSlot || !fullName || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create a Lock Key
        const dateKey = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
        const slotKey = timeSlot.replace(/\s/g, '').replace(/:/g, ''); // 0900-0930
        const lockKey = `${guide.id}_${dateKey}_${slotKey}`;

        const bookingRef = adminRtdb.ref(`guide_bookings/${lockKey}`);

        // CHECK LOCK (Transaction)
        const transactionResult = await bookingRef.transaction((currentData) => {
            if (currentData) {
                return; // Abort if already exists
            }
            // Create booking data if it doesn't exist
            const videoLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/video-call.html?roomID=booking-${lockKey}`;
            return {
                guideId: guide.id,
                guideName: guide.name,
                guideEmail: guide.email || 'guide@example.com',
                userName: fullName,
                userEmail: email,
                date,
                timeSlot,
                notes,
                videoLink,
                createdAt: new Date().toISOString()
            };
        });

        if (!transactionResult.committed) {
            return NextResponse.json({ error: 'This time slot is already booked.' }, { status: 409 });
        }

        const bookingData = transactionResult.snapshot.val();
        const videoLink = bookingData.videoLink;

        // 2. Send Emails
        // To User
        await sendEmail({
            to: email,
            subject: `Booking Confirmed: ${guide.name}`,
            html: generateBookingEmailHtml('user', { ...body, guide }, videoLink)
        });

        // To Guide (test email)
        await sendEmail({
            to: 'vishavjeeton@gmail.com',
            subject: `New Booking Request: ${fullName}`,
            html: generateBookingEmailHtml('guide', { ...body, guide }, videoLink)
        });

        return NextResponse.json({ success: true, bookingId: lockKey, videoLink });

    } catch (error: any) {
        console.error('Booking error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
