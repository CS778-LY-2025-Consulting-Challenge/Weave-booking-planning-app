import { NextRequest, NextResponse } from 'next/server';
import Amadeus from 'amadeus';
import Stripe from 'stripe';

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
  hostname: process.env.AMADEUS_ENVIRONMENT === 'production' ? 'production' : 'test'
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface TravelerInfo {
  id: string;
  dateOfBirth: string;
  name: {
    firstName: string;
    lastName: string;
  };
  gender: 'MALE' | 'FEMALE';
  contact: {
    emailAddress: string;
    phones: Array<{
      deviceType: 'MOBILE' | 'LANDLINE';
      countryCallingCode: string;
      number: string;
    }>;
  };
  documents?: Array<{
    documentType: 'PASSPORT' | 'IDENTITY_CARD';
    birthPlace?: string;
    issuanceLocation?: string;
    issuanceDate?: string;
    number: string;
    expiryDate: string;
    issuanceCountry: string;
    validityCountry: string;
    nationality: string;
    holder: boolean;
  }>;
}

interface BookingRequest {
  flightOffer: any;
  travelers: TravelerInfo[];
  remarks?: {
    general?: Array<{
      subType: string;
      text: string;
    }>;
  };
  ticketingAgreement?: {
    option: 'DELAY_TO_CANCEL' | 'DELAY_TO_QUEUE' | 'CONFIRM';
    delay?: string;
  };
  contacts?: Array<{
    addresseeName: {
      firstName: string;
      lastName: string;
    };
    companyName?: string;
    purpose: 'STANDARD' | 'INVOICE' | 'STANDARD_WITHOUT_TRANSMISSION';
    phones: Array<{
      deviceType: 'MOBILE' | 'LANDLINE';
      countryCallingCode: string;
      number: string;
    }>;
    emailAddress: string;
    address?: {
      lines: string[];
      postalCode: string;
      cityName: string;
      countryCode: string;
    };
  }>;
  paymentAmount: number;
  paymentCurrency: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();
    
    const {
      flightOffer,
      travelers,
      remarks,
      ticketingAgreement,
      contacts,
      paymentAmount,
      paymentCurrency
    } = body;

    // Validation
    if (!flightOffer || !travelers || travelers.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters: flightOffer or travelers' },
        { status: 400 }
      );
    }

    console.log('[Flight Booking] Starting booking process for:', {
      offerId: flightOffer.id,
      travelers: travelers.length,
      amount: paymentAmount,
      currency: paymentCurrency
    });

    // Step 1: Create Stripe Payment Intent
    console.log('[Flight Booking] Creating Stripe payment intent...');
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Stripe expects amount in cents
      currency: paymentCurrency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: 'flight_booking',
        offerId: flightOffer.id,
        travelers: travelers.length.toString(),
      },
      description: `Flight booking from ${flightOffer.itineraries[0].segments[0].departure.iataCode} to ${flightOffer.itineraries[0].segments[flightOffer.itineraries[0].segments.length - 1].arrival.iataCode}`,
      receipt_email: travelers[0].contact.emailAddress,
    });

    console.log('[Flight Booking] Payment intent created:', paymentIntent.id);

    // Step 2: Confirm payment (in production, this would be done on the client side)
    // For now, we'll simulate successful payment
    if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_payment_method') {
      console.error('[Flight Booking] Payment intent not in expected state:', paymentIntent.status);
    }

    // Step 3: Create Amadeus Flight Order (booking)
    console.log('[Flight Booking] Creating flight order with Amadeus...');

    const bookingData = {
      data: {
        type: 'flight-order',
        flightOffers: [flightOffer],
        travelers: travelers,
        remarks: remarks || {
          general: [
            {
              subType: 'GENERAL_MISCELLANEOUS',
              text: `Payment ID: ${paymentIntent.id}`
            }
          ]
        },
        ticketingAgreement: ticketingAgreement || {
          option: 'DELAY_TO_CANCEL',
          delay: '6D'
        },
        contacts: contacts || [
          {
            addresseeName: {
              firstName: travelers[0].name.firstName,
              lastName: travelers[0].name.lastName
            },
            purpose: 'STANDARD',
            phones: travelers[0].contact.phones,
            emailAddress: travelers[0].contact.emailAddress
          }
        ]
      }
    };

    const orderResponse = await amadeus.booking.flightOrders.post(
      JSON.stringify(bookingData)
    );

    const flightOrder = orderResponse.data;

    console.log('[Flight Booking] Flight order created successfully:', {
      orderId: flightOrder.id,
      associatedRecords: flightOrder.associatedRecords
    });

    // Return combined response with booking confirmation and payment details
    return NextResponse.json({
      success: true,
      booking: {
        id: flightOrder.id,
        type: flightOrder.type,
        associatedRecords: flightOrder.associatedRecords,
        flightOffers: flightOrder.flightOffers,
        travelers: flightOrder.travelers,
        bookingReference: flightOrder.associatedRecords?.[0]?.reference,
        creationDate: flightOrder.associatedRecords?.[0]?.creationDateTime
      },
      payment: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentAmount,
        currency: paymentCurrency,
        clientSecret: paymentIntent.client_secret
      },
      confirmationEmail: travelers[0].contact.emailAddress
    });

  } catch (error: any) {
    console.error('[Flight Booking] Error:', error);
    
    // Handle Amadeus API errors
    if (error.response) {
      const amadeusError = error.response.body || error.response;
      
      // If this is a booking error after payment, we should handle refund
      // In production, implement proper error handling and refund logic
      
      return NextResponse.json(
        { 
          error: 'Amadeus API error',
          details: amadeusError.errors || amadeusError,
          message: amadeusError.errors?.[0]?.detail || 'Failed to create booking'
        },
        { status: error.response.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create booking',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
