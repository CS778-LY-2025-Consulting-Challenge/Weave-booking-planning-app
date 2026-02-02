'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Users,
  Calendar,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { saveBooking } from '@/lib/bookings';

interface BookingConfirmation {
  bookingId: string;
  hotelId?: string;
  hotelName: string;
  hotelLocation?: string;
  roomId?: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  pricePerNight?: number;
  status: 'success' | 'pending' | 'failed' | 'confirmed';
  confirmationEmail?: string;
  nights: number;
  isMockBooking?: boolean;
  bookingDate?: string;
  stripeSessionId?: string;
}

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const bookingId = searchParams.get('bookingId');
  const sessionId = searchParams.get('session_id');
  const status = searchParams.get('status');

  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // First, check for mock booking in localStorage
        if (bookingId) {
          const storedBookings = localStorage.getItem('hotelBookings');
          if (storedBookings) {
            const bookings = JSON.parse(storedBookings);
            const foundBooking = bookings.find((b: any) => b.bookingId === bookingId);

            if (foundBooking) {
              setBooking(foundBooking);
              setIsLoading(false);

              // Consider saving to Firebase if it's a mock booking that just got confirmed? 
              // But mock bookings usually don't go through stripe flow in the same way.
              // We'll focus on the session_id flow primarily for syncing verified bookings.

              // If we are just showing a confirmation page for a booking that was *just* made locally (mock),
              // we might want to sync it if the user is logged in.
              if (user?.id && !foundBooking.syncedToFirebase) {
                try {
                  await saveBooking(user.id, {
                    type: 'hotel',
                    status: foundBooking.status,
                    userId: user.id,
                    stripeSessionId: foundBooking.stripeSessionId || foundBooking.bookingId,
                    details: foundBooking
                  });
                  console.log('Hotel booking synced to Firebase (mock/local flow)');

                  // Mark as synced to avoid duplicates if page reloads
                  foundBooking.syncedToFirebase = true;
                  localStorage.setItem('hotelBookings', JSON.stringify(bookings));
                } catch (err) {
                  console.error("Failed to sync hotel booking", err);
                }
              }

              return;
            }
          }
        }

        // If we have a session ID, fetch from backend (or simulate backend fetch/update)
        if (sessionId) {

          // In a real app we would verifying the session with the backend.
          // Here we might look it up in local storage to find the pending booking
          const storedBookings = localStorage.getItem('hotelBookings');
          let foundBooking: any = null;
          if (storedBookings) {
            const bookings = JSON.parse(storedBookings);
            foundBooking = bookings.find((b: any) => b.stripeSessionId === sessionId);

            if (foundBooking) {
              foundBooking.status = status === 'success' ? 'confirmed' : 'failed';
              localStorage.setItem('hotelBookings', JSON.stringify(bookings));
              setBooking(foundBooking);

              if (status === 'success' && user?.id) {
                try {
                  await saveBooking(user.id, {
                    type: 'hotel',
                    status: 'confirmed',
                    userId: user.id,
                    stripeSessionId: sessionId,
                    details: foundBooking
                  });
                  console.log('Hotel booking synced to Firebase (Stripe flow)');
                } catch (firebaseError) {
                  console.error('Failed to sync hotel booking to Firebase:', firebaseError);
                }
              }
            }
          }

          if (!foundBooking) {
            // Fallback if not found in local storage (e.g. cleared cache) but we have session_id
            // In production, fetch booking details from your backend
            const mockBooking: BookingConfirmation = {
              bookingId: `BK-${Date.now()}`,
              hotelName: 'Luxury City Hotel',
              roomName: 'Deluxe Room',
              checkInDate: '2026-02-01',
              checkOutDate: '2026-02-05',
              guests: 2,
              totalPrice: 1400,
              status: status === 'success' ? 'success' : status === 'cancelled' ? 'failed' : 'pending',
              confirmationEmail: 'guest@example.com',
              nights: 4,
              isMockBooking: false,
            };
            setBooking(mockBooking);
          }


          if (status === 'success') {
            toast.success('Booking confirmed! Check your email for details.');
          } else if (status === 'cancelled') {
            toast.error('Booking was cancelled');
          }
        } else {
          // Only show error if we didn't find anything by bookingId either
          if (!bookingId) {
            setError('No booking information found');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking details');
        toast.error('Failed to load booking confirmation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, sessionId, status, user?.id]);

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
                <Button onClick={() => router.push('/hotels')}>
                  Back to Hotels
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isSuccess = booking.status === 'success' || booking.status === 'confirmed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className={`border-0 ${isSuccess ? 'bg-green-50' : 'bg-yellow-50'}`}>
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
                    Booking Confirmed!
                  </h1>
                  <p className="text-green-700">
                    Your reservation has been successfully confirmed
                  </p>
                </>
              ) : (
                <>
                  <Clock className="mx-auto mb-4 size-20 text-yellow-600" />
                  <h1 className="mb-2 text-3xl font-bold text-yellow-900">
                    Booking Pending
                  </h1>
                  <p className="text-yellow-700">
                    Your booking is being processed
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
                <p className="text-sm text-gray-600">Confirmation Number</p>
                <p className="text-2xl font-bold text-gray-900 break-all">{booking.bookingId}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Save this number for your records
                </p>
              </div>

              {/* Hotel & Room Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Hotel Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 size-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Hotel</p>
                      <p className="font-semibold">{booking.hotelName}</p>
                      {booking.hotelLocation && (
                        <p className="text-sm text-gray-500">{booking.hotelLocation}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room Type</p>
                    <p className="font-semibold">{booking.roomName}</p>
                  </div>
                </div>
              </div>

              {/* Check-in & Check-out */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold">Stay Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-blue-600" />
                      <p className="font-semibold">{booking.checkInDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-blue-600" />
                      <p className="font-semibold">{booking.checkOutDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nights</p>
                    <p className="font-semibold">{booking.nights} nights</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guests</p>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-blue-600" />
                      <p className="font-semibold">{booking.guests} guest(s)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-3 border-t pt-6">
                <h3 className="font-semibold">Price Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nightly rate</span>
                    <span>${(booking.pricePerNight || booking.totalPrice / booking.nights).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of nights</span>
                    <span>{booking.nights}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Amount</span>
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
                    <li>1. Check your email for the complete booking confirmation</li>
                    <li>2. Review the cancellation policy and terms</li>
                    <li>3. Prepare for check-in on {booking.checkInDate}</li>
                    <li>4. Contact the hotel if you have any questions</li>
                  </ol>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 border-t pt-6">
                <Button
                  onClick={() => router.push('/hotels')}
                  className="w-full"
                >
                  Book Another Hotel
                </Button>
                <Button
                  onClick={() => router.push('/profile')}
                  variant="outline"
                  className="w-full"
                >
                  View My Bookings
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
                <h4 className="mb-2 font-semibold">Can I modify my booking?</h4>
                <p className="text-sm text-gray-600">
                  Yes, you can modify your booking up to 24 hours before check-in. Contact the hotel directly using the confirmation number.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">What is the cancellation policy?</h4>
                <p className="text-sm text-gray-600">
                  Free cancellation up to 24 hours before check-in. Refer to your confirmation for specific details.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">When will I receive my confirmation email?</h4>
                <p className="text-sm text-gray-600">
                  You should receive a confirmation email within the next few minutes. Please check your spam folder if you don't see it in your inbox.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
