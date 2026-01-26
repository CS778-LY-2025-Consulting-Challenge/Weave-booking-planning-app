import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hotelId,
      hotelName,
      hotelLocation,
      roomId,
      roomName,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      userId,
      userEmail,
    } = body;

    // Validate required fields
    if (!hotelId || !hotelName || !roomId || !checkInDate || !checkOutDate || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    console.log('[Stripe] Creating checkout session:', {
      hotelName,
      roomName,
      totalPrice,
      checkInDate,
      checkOutDate,
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${hotelName} - ${roomName}`,
              description: `Check-in: ${checkInDate} | Check-out: ${checkOutDate} | ${guests} guest(s)`,
              images: [
                'https://images.unsplash.com/photo-1631049307038-da0ec56d8b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
              ],
            },
            unit_amount: Math.round(totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        hotelId,
        hotelName: hotelName.substring(0, 200),
        hotelLocation: (hotelLocation || '').substring(0, 450),
        roomId,
        roomName: (roomName || '').substring(0, 200),
        checkInDate,
        checkOutDate,
        guests: guests.toString(),
        userId: userId || 'guest',
        userEmail: userEmail || '',
      },
      customer_email: userEmail,
      payment_intent_data: userEmail ? {
        receipt_email: userEmail,
      } : undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/hotels?status=cancelled`,
    });

    console.log('[Stripe] Checkout session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url, // This is the URL to redirect to
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.error('[Stripe Checkout Error]:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
