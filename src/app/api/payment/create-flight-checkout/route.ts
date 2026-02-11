import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      flightId,
      airline,
      from,
      to,
      departure,
      arrival,
      duration,
      passengers,
      totalPrice,
      userId,
      bookingReference,
    } = body;

    // Validate required fields
    if (!airline || !from || !to || totalPrice === undefined || !passengers) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    console.log('[Stripe Flight] Creating checkout session:', {
      airline,
      from,
      to,
      totalPrice,
      passengers,
      bookingReference,
    });

    // Create Stripe checkout session with minimal metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${airline} - Flight Booking`,
              description: `${from} → ${to} | Departure: ${departure} | ${passengers} passenger(s)`,
              images: [
                'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
              ],
            },
            unit_amount: Math.round(totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'flight',
        flightId: flightId || 'flight-booking',
        airline: airline.substring(0, 100), // Limit length
        route: `${from} to ${to}`.substring(0, 100),
        passengers: passengers.toString(),
        userId: userId || 'guest',
        bookingRef: bookingReference || '',
        // Add fields for display
        price: totalPrice.toString(),
        from,
        fromCode: body.fromCode || from.substring(0, 3).toUpperCase(),
        to,
        toCode: body.toCode || to.substring(0, 3).toUpperCase(),
        departureDate: departure, // Save full departure string (date + time)
        arrivalTime: arrival,
        duration: duration,
        flightNumber: 'FL' + Math.floor(Math.random() * 1000), // mocked if not available
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/flight-confirmation?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/flights?status=cancelled`,
    });

    console.log('[Stripe Flight] Checkout session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.error('[Stripe Flight Checkout Error]:', error);
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
