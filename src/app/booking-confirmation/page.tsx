'use client';

import { useEffect, useState, useRef } from 'react';
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
  type: 'hotel' | 'package';
  // Hotel fields
  hotelId?: string;
  hotelName?: string;
  hotelLocation?: string;
  roomId?: string;
  roomName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  // Package fields
  pkgId?: string;
  pkgName?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  tier?: string;
  // Common
  guests: number;
  totalPrice: number;
  status: 'success' | 'pending' | 'failed' | 'confirmed';
  confirmationEmail?: string;
  nights?: number;
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

  // Track processed session to prevent duplicate saves
  const processedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // 1. If we have a session ID, fetch from API
        if (sessionId) {
          try {
            const res = await fetch(`/api/payment/get-session?session_id=${sessionId}`);
            const data = await res.json();

            if (res.ok && data.metadata) {
              const meta = data.metadata;
              const isSuccess = data.paymentStatus === 'paid' || status === 'success';

              const confirmedBooking: BookingConfirmation = {
                bookingId: `BK-${sessionId.substring(0, 8).toUpperCase()}`,
                type: meta.type || 'hotel',
                guests: Number(meta.guests || meta.travelers || 1),
                totalPrice: Number(meta.price || 0),
                status: isSuccess ? 'confirmed' : 'pending',
                stripeSessionId: sessionId,
                bookingDate: new Date().toISOString(),
              };

              if (meta.type === 'package') {
                confirmedBooking.pkgId = meta.pkgId;
                confirmedBooking.pkgName = meta.pkgName;
                confirmedBooking.destination = meta.destination;
                confirmedBooking.startDate = meta.startDate;
                confirmedBooking.endDate = meta.endDate;
                confirmedBooking.tier = meta.tier;
              } else {
                confirmedBooking.hotelId = meta.hotelId;
                confirmedBooking.hotelName = meta.hotelName;
                confirmedBooking.hotelLocation = meta.hotelLocation;
                confirmedBooking.roomId = meta.roomId;
                confirmedBooking.roomName = meta.roomName;
                confirmedBooking.checkInDate = meta.checkInDate;
                confirmedBooking.checkOutDate = meta.checkOutDate;
                // Calculate nights
                if (meta.checkInDate && meta.checkOutDate) {
                  const start = new Date(meta.checkInDate);
                  const end = new Date(meta.checkOutDate);
                  confirmedBooking.nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                }
              }

              if (meta.userEmail) {
                confirmedBooking.confirmationEmail = meta.userEmail;
              }

              setBooking(confirmedBooking);
              return;
            }
          } catch (err) {
            console.error("Error fetching session:", err);
          }
        }

        // 2. Fallback: LocalStorage (Mock Hotel Flow)
        if (bookingId) {
          const storedBookings = localStorage.getItem('hotelBookings');
          if (storedBookings) {
            const bookings = JSON.parse(storedBookings);
            const foundBooking = bookings.find((b: any) => b.bookingId === bookingId);
            if (foundBooking) {
              setBooking({ ...foundBooking, type: 'hotel' });
              setIsLoading(false);
              return;
            }
          }
        }

        if (!bookingId && !sessionId) {
          setError('No booking information found');
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, sessionId, status]);

  // Separate effect to handle saving once user is loaded and booking is ready
  useEffect(() => {
    if (user?.id && booking && booking.status === 'confirmed' && booking.stripeSessionId) {
      // Prevent duplicate saves for the same session
      if (processedSessionRef.current === booking.stripeSessionId) {
        return;
      }

      const syncToFirebase = async () => {
        try {
          await saveBooking(user.id, {
            type: booking.type || 'hotel',
            status: 'confirmed',
            userId: user.id,
            stripeSessionId: booking.stripeSessionId!,
            details: booking
          });
          console.log('Booking synced to Firebase for user:', user.id);
          processedSessionRef.current = booking.stripeSessionId!; // Mark as processed
          toast.success('Booking saved to your profile!');
        } catch (err) {
          console.error('Failed to sync booking to Firebase:', err);
          toast.error('Failed to save booking to profile');
        }
      };

      syncToFirebase();
    }
  }, [user?.id, booking]);

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
                <Button onClick={() => router.push('/')}>
                  Back to Home
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
              </div>

              {/* Package/Hotel Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">{booking.type === 'package' ? 'Package Information' : 'Hotel Information'}</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 size-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">{booking.type === 'package' ? 'Destination' : 'Hotel'}</p>
                      <p className="font-semibold">{booking.type === 'package' ? booking.pkgName : booking.hotelName}</p>
                      {(booking.hotelLocation || booking.destination) && (
                        <p className="text-sm text-gray-500">{booking.destination || booking.hotelLocation}</p>
                      )}
                    </div>
                  </div>
                  {booking.type === 'hotel' && (
                    <div>
                      <p className="text-sm text-gray-600">Room Type</p>
                      <p className="font-semibold">{booking.roomName}</p>
                    </div>
                  )}
                  {booking.type === 'package' && booking.tier && (
                    <div>
                      <p className="text-sm text-gray-600">Experience Tier</p>
                      <p className="font-semibold">{booking.tier}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold">Trip Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-blue-600" />
                      <p className="font-semibold">{booking.type === 'package' ? booking.startDate : booking.checkInDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-blue-600" />
                      <p className="font-semibold">{booking.type === 'package' ? booking.endDate : booking.checkOutDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Travelers</p>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-blue-600" />
                      <p className="font-semibold">{booking.guests}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-3 border-t pt-6">
                <h3 className="font-semibold">Price Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Amount</span>
                    <span className="text-blue-600">${booking.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 border-t pt-6">
                <Button
                  onClick={() => router.push(booking.type === 'package' ? '/packages' : '/hotels')}
                  className="w-full"
                >
                  Book Another {booking.type === 'package' ? 'Package' : 'Hotel'}
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
