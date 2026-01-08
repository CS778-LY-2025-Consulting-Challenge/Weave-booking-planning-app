import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusToken } from '@/lib/amadeus-token-cache';
import Stripe from 'stripe';

const AMADEUS_BASE_URL = process.env.AMADEUS_ENVIRONMENT === 'production'
  ? 'https://api.amadeus.com'
  : 'https://test.api.amadeus.com';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface BookingRequest {
  offerId: string;
  hotelId: string;
  paymentMethodId: string; // Stripe PaymentMethod ID
  travelerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    country?: string;
  };
  roomCount: number;
  guestCount: number;
  totalPrice: number;
  currency: string;
  checkInDate: string;
  checkOutDate: string;
}

interface AmadeusBookingRequest {
  data: {
    offerId: string;
    associatedRecords: Array<{
      reference: string;
      creationDate: string;
    }>;
    travelers: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phones?: Array<{
        deviceType: string;
        countryCallingCode: string;
        number: string;
      }>;
    }>;
    remarks?: {
      general?: Array<{
        subType: string;
        text: string;
      }>;
    };
    contacts?: Array<{
      emailContact: {
        email: string;
      };
      phones?: Array<{
        deviceType: string;
        countryCallingCode: string;
        number: string;
      }>;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();

    // Validate required fields
    const {
      offerId,
      hotelId,
      paymentMethodId,
      travelerInfo,
      roomCount,
      guestCount,
      totalPrice,
      currency,
    } = body;

    if (!offerId || !hotelId || !paymentMethodId || !travelerInfo) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    console.log('[Hotel Booking] Processing booking request:', {
      hotelId,
      offerId,
      totalPrice,
      currency,
    });

    // Step 1: Create Stripe PaymentIntent
    console.log('[Hotel Booking] Creating Stripe PaymentIntent...');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking-confirmation`,
      metadata: {
        offerId,
        hotelId,
        checkInDate: body.checkInDate,
        checkOutDate: body.checkOutDate,
        roomCount,
        guestCount,
      },
      description: `Hotel booking for ${travelerInfo.firstName} ${travelerInfo.lastName}`,
      receipt_email: travelerInfo.email,
    });

    if (paymentIntent.status !== 'succeeded') {
      console.error('[Hotel Booking] Payment intent not confirmed:', paymentIntent.status);
      return NextResponse.json(
        { error: 'Payment processing failed', paymentStatus: paymentIntent.status },
        { status: 402 }
      );
    }

    console.log('[Hotel Booking] Payment succeeded:', paymentIntent.id);

    // Step 2: Create Amadeus booking with payment confirmation
    const token = await getAmadeusToken();

    // Format traveler data for Amadeus
    const traveler = {
      id: '1',
      firstName: travelerInfo.firstName,
      lastName: travelerInfo.lastName,
      email: travelerInfo.email,
      ...(travelerInfo.phone && {
        phones: [
          {
            deviceType: 'MOBILE',
            countryCallingCode: '1', // Default to US, could be parameterized
            number: travelerInfo.phone.replace(/\D/g, ''),
          },
        ],
      }),
    };

    // Build Amadeus booking request
    const amadeusBookingData: AmadeusBookingRequest = {
      data: {
        offerId,
        associatedRecords: [
          {
            reference: paymentIntent.id, // Link payment to booking
            creationDate: new Date().toISOString(),
          },
        ],
        travelers: [traveler],
        remarks: {
          general: [
            {
              subType: 'GENERAL_REMARKS',
              text: `Stripe Payment ID: ${paymentIntent.id}. ${guestCount} guests, ${roomCount} room(s).`,
            },
          ],
        },
        contacts: [
          {
            emailContact: {
              email: travelerInfo.email,
            },
            ...(travelerInfo.phone && {
              phones: [
                {
                  deviceType: 'MOBILE',
                  countryCallingCode: '1',
                  number: travelerInfo.phone.replace(/\D/g, ''),
                },
              ],
            }),
          },
        ],
      },
    };

    const bookingUrl = `${AMADEUS_BASE_URL}/v1/booking/hotel-bookings`;

    console.log('[Hotel Booking] Submitting to Amadeus...');

    const bookingResponse = await fetch(bookingUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(amadeusBookingData),
    });

    // Handle 401 Unauthorized (token expired)
    if (bookingResponse.status === 401) {
      const { clearAmadeusTokenCache } = await import('@/lib/amadeus-token-cache');
      clearAmadeusTokenCache();

      const newToken = await getAmadeusToken();
      const retryResponse = await fetch(bookingUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(amadeusBookingData),
      });

      if (!retryResponse.ok) {
        console.error('[Hotel Booking] Amadeus booking failed after retry:', retryResponse.status);
        throw new Error(`Amadeus booking error after retry: ${retryResponse.status}`);
      }

      const bookingData = await retryResponse.json();
      return NextResponse.json({
        success: true,
        booking: bookingData,
        paymentIntentId: paymentIntent.id,
      });
    }

    if (!bookingResponse.ok) {
      const error = await bookingResponse.json();
      console.error('[Hotel Booking] Amadeus booking error:', error);

      // Refund payment if booking failed
      await stripe.refunds.create({
        payment_intent: paymentIntent.id,
        reason: 'fraudulent',
      });

      throw new Error(`Amadeus booking error: ${bookingResponse.status}`);
    }

    const bookingData = await bookingResponse.json();

    console.log('[Hotel Booking] Booking successful:', bookingData);

    // Return combined response
    return NextResponse.json({
      success: true,
      booking: bookingData,
      paymentIntentId: paymentIntent.id,
      confirmationEmail: travelerInfo.email,
    });
  } catch (error) {
    console.error('[Hotel Booking] Error:', error);

    // Provide detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Booking failed';
    const status =
      errorMessage.includes('Payment') ? 402 :
      errorMessage.includes('Amadeus') ? 502 :
      500;

    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}
