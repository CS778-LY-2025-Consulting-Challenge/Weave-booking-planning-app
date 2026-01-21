import { NextRequest, NextResponse } from 'next/server';
import Amadeus from 'amadeus';

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
  hostname: process.env.AMADEUS_ENVIRONMENT === 'production' ? 'production' : 'test'
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightOffer } = body;

    if (!flightOffer) {
      return NextResponse.json(
        { error: 'Missing required parameter: flightOffer' },
        { status: 400 }
      );
    }

    console.log('[Amadeus Flight Price] Confirming price for offer:', flightOffer.id);

    // Call Amadeus Flight Offers Price API to confirm availability and price
    const response = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer]
        }
      })
    );

    const pricedOffer = response.data.flightOffers[0];

    console.log('[Amadeus Flight Price] Price confirmed:', {
      offerId: pricedOffer.id,
      price: pricedOffer.price.grandTotal,
      currency: pricedOffer.price.currency
    });

    return NextResponse.json({
      success: true,
      data: pricedOffer,
      message: 'Price confirmed'
    });

  } catch (error: any) {
    console.error('[Amadeus Flight Price] Error:', error);
    
    // Handle Amadeus API errors
    if (error.response) {
      const amadeusError = error.response.body || error.response;
      return NextResponse.json(
        { 
          error: 'Amadeus API error',
          details: amadeusError.errors || amadeusError,
          message: amadeusError.errors?.[0]?.detail || 'Failed to confirm price'
        },
        { status: error.response.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to confirm price',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
