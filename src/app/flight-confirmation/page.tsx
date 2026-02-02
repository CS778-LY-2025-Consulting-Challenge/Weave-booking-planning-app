'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  Plane,
  Users,
  Calendar,
  Loader2,
  MapPin,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { saveBooking } from '@/lib/bookings';
import { useUser } from '@clerk/nextjs';

interface FlightBookingConfirmation {
  bookingReference: string;
  flight: {
    id: string;
    airline: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
    duration: string;
    stops: string;
    cabin: string;
    price: number;
  };
  passengers: Array<{
    fullName: string;
    email: string;
  }>;
  totalPrice: number;
  status: 'success' | 'pending' | 'failed';
  bookingDate: string;
  stripeSessionId?: string;
}

export default function FlightConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const sessionId = searchParams.get('session_id');
  const status = searchParams.get('status');

  const [booking, setBooking] = useState<FlightBookingConfirmation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // Fetch booking from localStorage
        const storedBookings = localStorage.getItem('flightBookings');
        if (storedBookings) {
          const bookings = JSON.parse(storedBookings);
          const foundBooking = bookings.find((b: any) => b.stripeSessionId === sessionId);

          if (foundBooking) {
            // Update status to success
            foundBooking.status = status === 'success' ? 'success' : 'failed';

            // Update in localStorage
            const updatedBookings = bookings.map((b: any) =>
              b.stripeSessionId === sessionId ? foundBooking : b
            );
            localStorage.setItem('flightBookings', JSON.stringify(updatedBookings));

            setBooking(foundBooking);

            if (status === 'success') {
              // Save to Firebase if user is logged in
              if (user?.id) {
                try {
                  await saveBooking(user.id, {
                    type: 'flight',
                    status: 'confirmed',
                    userId: user.id,
                    stripeSessionId: sessionId || foundBooking.bookingReference,
                    details: {
                      ...foundBooking.flight,
                      passengers: foundBooking.passengers,
                      bookingReference: foundBooking.bookingReference
                    }
                  });
                  console.log('Booking synced to Firebase');
                } catch (firebaseError) {
                  console.error('Failed to sync booking to Firebase:', firebaseError);
                }
              }

              toast.success('Flight booked successfully! Check your email for details.');
            }
          } else {
            setError('Booking not found');
          }
        } else {
          setError('No booking information found');
        }
      } catch (err) {
        console.error('Error loading booking details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load booking details');
        toast.error('Failed to load booking confirmation');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchBookingDetails();
    } else {
      setError('No session ID provided');
      setIsLoading(false);
    }
  }, [sessionId, status, user?.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="mx-auto mb-4 size-16 text-red-600" />
                <h1 className="mb-2 text-2xl font-bold text-red-900">Booking Not Found</h1>
                <p className="mb-6 text-red-700">{error || 'Unable to find your booking'}</p>
                <Button onClick={() => router.push('/flights')}>
                  Back to Flights
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isSuccess = booking.status === 'success';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className={`border-0 ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
            <CardContent className="pt-8 text-center">
              {isSuccess ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <CheckCircle className="mx-auto mb-4 size-20 text-green-600" />
                  </motion.div>
                  <h1 className="mb-2 text-3xl font-bold text-green-900">
                    Flight Booked Successfully!
                  </h1>
                  <p className="text-green-700">
                    Your flight has been confirmed
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="mx-auto mb-4 size-20 text-red-600" />
                  <h1 className="mb-2 text-3xl font-bold text-red-900">
                    Booking Failed
                  </h1>
                  <p className="text-red-700">
                    Payment was not completed
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Confirmation Number */}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Booking Reference</p>
                <p className="text-2xl font-bold text-gray-900 break-all">{booking.bookingReference}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Save this number for your records
                </p>
              </div>

              {/* Flight Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Flight Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Plane className="mt-1 size-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Airline</p>
                      <p className="font-semibold">{booking.flight.airline}</p>
                      <p className="text-sm text-gray-500">{booking.flight.cabin}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 size-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Route</p>
                      <p className="font-semibold">{booking.flight.from} → {booking.flight.to}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Schedule */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold">Flight Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Departure</p>
                    <p className="font-semibold">{booking.flight.departure}</p>
                    <p className="text-sm text-gray-500">{booking.flight.from}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Arrival</p>
                    <p className="font-semibold">{booking.flight.arrival}</p>
                    <p className="text-sm text-gray-500">{booking.flight.to}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{booking.flight.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Stops</p>
                    <p className="font-semibold">{booking.flight.stops}</p>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold">Passengers</h3>
                <div className="space-y-2">
                  {booking.passengers.map((passenger, idx) => (
                    <div key={idx} className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-blue-600" />
                        <p className="font-semibold">{passenger.fullName}</p>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">{passenger.email}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-3 border-t pt-6">
                <h3 className="font-semibold">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount Paid</span>
                    <span className="text-blue-600">${booking.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Booking Date */}
              {booking.bookingDate && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-600">
                    Booked on: <span className="font-semibold">
                      {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </p>
                </div>
              )}

              {/* What's Next */}
              {isSuccess && (
                <div className="space-y-3 border-t pt-6">
                  <h3 className="font-semibold">What's Next?</h3>
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li>1. Check your email for the e-ticket and boarding pass</li>
                    <li>2. Check-in online 24 hours before departure</li>
                    <li>3. Arrive at the airport at least 2 hours before departure</li>
                    <li>4. Have your booking reference and ID ready</li>
                  </ol>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 border-t pt-6">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  View My Dashboard 🎫
                </Button>
                <Button
                  onClick={() => router.push('/flights')}
                  variant="outline"
                  className="w-full"
                >
                  Book Another Flight
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 font-semibold">Can I change my flight?</h4>
                <p className="text-sm text-gray-600">
                  Yes, flight changes are subject to availability and fare difference. Contact the airline directly using your booking reference.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">What is the cancellation policy?</h4>
                <p className="text-sm text-gray-600">
                  Cancellation policies vary by airline and fare type. Check your e-ticket for specific details.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">When will I receive my e-ticket?</h4>
                <p className="text-sm text-gray-600">
                  You should receive your e-ticket via email within the next few minutes. Please check your spam folder if you don't see it.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
