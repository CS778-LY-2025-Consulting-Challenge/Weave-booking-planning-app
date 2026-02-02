import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            pkgId,
            pkgName,
            destination,
            startDate,
            endDate,
            travelers,
            price,
            userId,
            userEmail,
            tier,
            addons
        } = body;

        // Validate required fields
        if (!pkgId || !pkgName || !startDate || !endDate || !price) {
            return NextResponse.json(
                { error: 'Missing required booking information' },
                { status: 400 }
            );
        }

        console.log('[Stripe] Creating package checkout session:', {
            pkgName,
            price,
            startDate,
            endDate,
        });

        const lineItems = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Package: ${pkgName} (${tier})`,
                        description: `Destination: ${destination} | ${startDate} to ${endDate} | ${travelers} traveler(s)`,
                        images: [
                            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=3421&auto=format&fit=crop', // Generic travel image or specific package image
                        ],
                    },
                    unit_amount: Math.round(price * 100), // Convert to cents
                },
                quantity: 1,
            },
        ];

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            metadata: {
                type: 'package',
                pkgId: pkgId.toString(),
                pkgName: pkgName.substring(0, 200),
                destination: (destination || '').substring(0, 450),
                startDate,
                endDate,
                travelers: travelers.toString(),
                userId: userId || 'guest',
                userEmail: userEmail || '',
                tier,
                addons: JSON.stringify(addons),
                // Add fields for easier display on confirmation/dashboard
                price: price.toString(),
                bookingName: pkgName,
            },
            customer_email: userEmail,
            payment_intent_data: userEmail ? {
                receipt_email: userEmail,
            } : undefined,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}&status=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/packages/${pkgId}?status=cancelled`,
        });

        console.log('[Stripe] Package checkout session created:', session.id);

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
            clientSecret: session.client_secret,
        });
    } catch (error) {
        console.error('[Stripe Package Checkout Error]:', error);
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
