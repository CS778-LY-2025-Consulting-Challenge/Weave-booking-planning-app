'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Check,
  CreditCard,
  Download,
  Hotel,
  Mail,
  MapPin,
  Package,
  Plane,
  Printer,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BookingDetails {
  type: 'flight' | 'hotel' | 'package';
  confirmationNumber: string;
  bookingDate: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  price: number;
  name?: string;
  email?: string;
  phone?: string;
  flightDetails?: {
    from: string;
    to: string;
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    class: string;
  };
  hotelDetails?: {
    name: string;
    address: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
  };
  packageDetails?: {
    name: string;
    duration: string;
    includes: string[];
  };
}

export default function BookingConfirmation() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);

  useEffect(() => {
    // Get booking details from navigation state or localStorage
    const bookingData =
      // location.state?.booking ||
      localStorage.getItem('latestBooking');
    if (bookingData) {
      setBooking(
        typeof bookingData === 'string' ? JSON.parse(bookingData) : bookingData
      );
    } else {
      // Mock booking if none exists (for testing)
      setBooking({
        type: 'package',
        confirmationNumber:
          'WV' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        bookingDate: new Date().toISOString().split('T')[0],
        destination: 'Maldives',
        startDate: '2026-01-15',
        endDate: '2026-01-22',
        travelers: 2,
        price: 2499,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        packageDetails: {
          name: 'Tropical Paradise Getaway',
          duration: '7 Days / 6 Nights',
          includes: [
            'Round-trip flights',
            '6 nights in 5-star resort',
            'All meals included',
            'Water sports activities',
            'Spa treatment',
          ],
        },
      });
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  const handlePrint = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  const handleDownload = () => {
    toast.success('Booking receipt downloaded!');
  };

  const handleEmail = () => {
    toast.success('Confirmation email sent to ' + booking?.email);
  };

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-gray-500">No booking found</p>
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const getBookingIcon = () => {
    switch (booking.type) {
      case 'flight':
        return Plane;
      case 'hotel':
        return Hotel;
      case 'package':
        return Package;
    }
  };

  const BookingIcon = getBookingIcon();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50 to-white px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your {booking.type} has been successfully booked
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap justify-center gap-3"
        >
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handleEmail} variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            Email Receipt
          </Button>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6 pt-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 pt-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookingIcon className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-white">
                      Booking Confirmation
                    </CardTitle>
                    <p className="mt-1 text-sm text-blue-100">
                      Confirmation #: {booking.confirmationNumber}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">Confirmed</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* QR Code Section */}
              <div className="mb-6 flex justify-center">
                <div className="text-center">
                  <div className="flex h-40 w-40 items-center justify-center rounded-lg border-2 border-gray-200 bg-gray-100">
                    {/* QR Code placeholder - in production, use a QR code library */}
                    <svg className="h-32 w-32" viewBox="0 0 100 100">
                      <rect x="0" y="0" width="100" height="100" fill="white" />
                      <rect x="5" y="5" width="20" height="20" fill="black" />
                      <rect x="75" y="5" width="20" height="20" fill="black" />
                      <rect x="5" y="75" width="20" height="20" fill="black" />
                      <rect x="35" y="15" width="5" height="5" fill="black" />
                      <rect x="45" y="15" width="5" height="5" fill="black" />
                      <rect x="55" y="15" width="5" height="5" fill="black" />
                      <rect x="35" y="35" width="30" height="30" fill="black" />
                      <rect x="40" y="40" width="20" height="20" fill="white" />
                      <rect x="15" y="45" width="5" height="5" fill="black" />
                      <rect x="75" y="35" width="5" height="5" fill="black" />
                      <rect x="85" y="45" width="5" height="5" fill="black" />
                      <rect x="35" y="75" width="5" height="5" fill="black" />
                      <rect x="45" y="85" width="5" height="5" fill="black" />
                      <rect x="75" y="75" width="5" height="5" fill="black" />
                      <rect x="85" y="85" width="5" height="5" fill="black" />
                    </svg>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Scan for mobile boarding pass
                  </p>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Traveler Information */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-gray-900">
                  Traveler Information
                </h3>
                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{booking.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{booking.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{booking.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Number of Travelers</p>
                    <p className="font-medium">
                      {booking.travelers}{' '}
                      {booking.travelers === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Trip Details */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-gray-900">
                  Trip Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Destination</p>
                      <p className="font-medium">{booking.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Travel Dates</p>
                      <p className="font-medium">
                        {new Date(booking.startDate).toLocaleDateString(
                          'en-US',
                          { month: 'long', day: 'numeric', year: 'numeric' }
                        )}{' '}
                        -{' '}
                        {new Date(booking.endDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Booking Date</p>
                      <p className="font-medium">
                        {new Date(booking.bookingDate).toLocaleDateString(
                          'en-US',
                          { month: 'long', day: 'numeric', year: 'numeric' }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type-specific Details */}
              {booking.flightDetails && (
                <>
                  <Separator className="mb-6" />
                  <div className="mb-6">
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Flight Information
                    </h3>
                    <div className="space-y-2 rounded-lg bg-blue-50 p-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Airline:</span>
                        <span className="font-medium">
                          {booking.flightDetails.airline}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Flight Number:</span>
                        <span className="font-medium">
                          {booking.flightDetails.flightNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Class:</span>
                        <span className="font-medium">
                          {booking.flightDetails.class}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Departure:</span>
                        <span className="font-medium">
                          {booking.flightDetails.departureTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Arrival:</span>
                        <span className="font-medium">
                          {booking.flightDetails.arrivalTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {booking.hotelDetails && (
                <>
                  <Separator className="mb-6" />
                  <div className="mb-6">
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Hotel Information
                    </h3>
                    <div className="space-y-2 rounded-lg bg-purple-50 p-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hotel:</span>
                        <span className="font-medium">
                          {booking.hotelDetails.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">
                          {booking.hotelDetails.address}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Type:</span>
                        <span className="font-medium">
                          {booking.hotelDetails.roomType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">
                          {booking.hotelDetails.checkIn}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">
                          {booking.hotelDetails.checkOut}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {booking.packageDetails && (
                <>
                  <Separator className="mb-6" />
                  <div className="mb-6">
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Package Information
                    </h3>
                    <div className="rounded-lg bg-green-50 p-4 text-sm">
                      <p className="mb-2 font-medium text-gray-900">
                        {booking.packageDetails.name}
                      </p>
                      <p className="mb-3 text-gray-600">
                        {booking.packageDetails.duration}
                      </p>
                      <div>
                        <p className="mb-2 text-gray-600">Includes:</p>
                        <ul className="space-y-1">
                          {booking.packageDetails.includes.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator className="mb-6" />

              {/* Price Summary */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ${booking.price.toLocaleString()}
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">
                    ${(booking.price * 0.15).toFixed(2)}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total Paid</span>
                  <span className="text-2xl font-bold text-green-600">
                    $
                    {(booking.price * 1.15).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Important Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>
                • Please arrive at least 2 hours before your scheduled departure
                time for international flights.
              </p>
              <p>
                • A valid passport is required for international travel. Please
                ensure your passport is valid for at least 6 months beyond your
                travel dates.
              </p>
              <p>
                • Cancellation and modification policies apply. Please review
                your booking terms.
              </p>
              <p>
                • For any questions or changes to your booking, contact our 24/7
                support team.
              </p>
              <p>
                • Keep this confirmation number handy for check-in and
                inquiries.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button onClick={() => router.push('/dashboard')} className="gap-2">
            View in Dashboard
          </Button>
          <Button onClick={() => router.push('/')} variant="outline">
            Return to Home
          </Button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .max-w-4xl, .max-w-4xl * {
            visibility: visible;
          }
          .max-w-4xl {
            position: absolute;
            left: 0;
            top: 0;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
