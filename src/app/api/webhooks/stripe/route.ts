import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { saveBooking } from '@/lib/bookings';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        if (!signature || !webhookSecret) {
            console.error('Missing stripe signature or webhook secret');
            return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
        }
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Retrieve metadata
        const { userId, type, ...details } = session.metadata || {};

        if (userId && type) {
            try {
                await saveBooking(userId, {
                    type: type as 'flight' | 'hotel',
                    status: 'confirmed',
                    userId: userId,
                    stripeSessionId: session.id,
                    details: details,
                });
                console.log(`Booking saved via webhook for user: ${userId}`);
            } catch (error) {
                console.error('Error saving booking from webhook:', error);
                return NextResponse.json({ error: 'Error saving booking' }, { status: 500 });
            }
        } else {
            console.warn('Missing userId or type in metadata', session.id);
        }
    }

    return NextResponse.json({ received: true });
}
