import { NextRequest, NextResponse } from 'next/server';
import { createStripeClient } from '@/lib/stripe-client';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const stripe = createStripeClient();
    if (!stripe) return NextResponse.json({ error: 'Payments are not configured' }, { status: 503 });

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return NextResponse.json({
            session,
            metadata: session.metadata,
            paymentStatus: session.payment_status,
        });
    } catch (error) {
        console.error('Error retrieving Stripe session:', error);
        return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 });
    }
}
