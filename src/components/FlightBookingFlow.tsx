'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowRight,
  ChevronLeft,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Briefcase,
  CreditCard,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface Flight {
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
  logo: string;
  fromCode?: string;
  toCode?: string;
  departureTime: 'morning' | 'afternoon' | 'evening';
}

interface Passenger {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  passportNumber?: string;
}

interface BookingState {
  flight: Flight | null;
  passengers: Passenger[];
  extras: {
    seatUpgrade: boolean;
    mealOption: string;
    baggageUpgrade: boolean;
    insurance: boolean;
  };
  payment: {
    cardholderName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  };
  bookingReference: string;
}

const INITIAL_BOOKING_STATE: BookingState = {
  flight: null,
  passengers: [],
  extras: {
    seatUpgrade: false,
    mealOption: 'standard',
    baggageUpgrade: false,
    insurance: false,
  },
  payment: {
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  },
  bookingReference: '',
};

interface FlightBookingFlowProps {
  flight: Flight;
  totalPassengers: number;
  onClose: () => void;
  selectedDate: Date;
}

export function FlightBookingFlow({
  flight,
  totalPassengers,
  onClose,
  selectedDate,
}: FlightBookingFlowProps) {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<BookingState>({
    ...INITIAL_BOOKING_STATE,
    flight,
    passengers: Array(totalPassengers)
      .fill(null)
      .map(() => ({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phone: '',
        passportNumber: '',
      })),
  });

  const calculatePrices = () => {
    if (!booking.flight) return { baseFare: 0, taxes: 0, extras: 0, total: 0 };

    const baseFare = booking.flight.price * totalPassengers;
    const taxes = Math.round(baseFare * 0.15);
    let extras = 0;

    if (booking.extras.seatUpgrade) extras += 50 * totalPassengers;
    if (booking.extras.baggageUpgrade) extras += 75 * totalPassengers;
    if (booking.extras.mealOption !== 'standard')
      extras += 30 * totalPassengers;
    if (booking.extras.insurance) extras += 25 * totalPassengers;

    return {
      baseFare,
      taxes,
      extras,
      total: baseFare + taxes + extras,
    };
  };

  const prices = calculatePrices();

  const handlePassengerChange = (
    index: number,
    field: keyof Passenger,
    value: string
  ) => {
    const newPassengers = [...booking.passengers];
    newPassengers[index] = {
      ...newPassengers[index],
      [field]: value,
    };
    setBooking({ ...booking, passengers: newPassengers });
  };

  const validatePassengers = () => {
    for (const passenger of booking.passengers) {
      if (
        !passenger.fullName ||
        !passenger.dateOfBirth ||
        !passenger.gender ||
        !passenger.email ||
        !passenger.phone
      ) {
        toast.error('Please fill in all required passenger details');
        return false;
      }
    }
    return true;
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleConfirmBooking = async () => {
    setIsProcessingPayment(true);

    try {
      console.log('[Flight Booking] Initiating Stripe checkout...');

      // Generate booking reference before creating checkout session
      const bookingRef = `WV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Validate selectedDate first - ensure it's a valid Date object
      let validDate: Date;
      if (!selectedDate || isNaN(new Date(selectedDate).getTime())) {
        console.warn('[FlightBooking] Invalid selectedDate received, using current date as fallback');
        validDate = new Date();
      } else {
        validDate = new Date(selectedDate);
      }

      // Construct proper date object combining selectedDate and flight time
      // flight.departure is like "10:30 AM"
      const timeString = booking.flight?.departure || '12:00 PM';
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':');

      const flightDate = new Date(validDate);

      // Determine hour and minute
      let hour = 12;
      let minute = 0;

      if (hours && !isNaN(parseInt(hours))) {
        hour = parseInt(hours);
      }

      if (minutes && !isNaN(parseInt(minutes))) {
        minute = parseInt(minutes);
      }

      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      // Check if flightDate is valid before setting hours
      if (isNaN(flightDate.getTime())) {
        console.warn('[FlightBooking] Invalid selectedDate, defaulting to now');
        // Reset to current date if invalid
        flightDate.setTime(Date.now());
      }

      flightDate.setHours(hour, minute, 0, 0);

      // Final check
      let formattedDepartureDate: string;
      if (isNaN(flightDate.getTime())) {
        formattedDepartureDate = new Date().toISOString();
      } else {
        formattedDepartureDate = flightDate.toISOString();
      }

      // Save booking data to localStorage BEFORE redirecting to Stripe
      const bookingData = {
        bookingReference: bookingRef,
        flight: {
          ...booking.flight,
          departure: formattedDepartureDate // Use proper ISO date
        },
        passengers: booking.passengers,
        extras: booking.extras,
        totalPrice: prices.total,
        status: 'pending',
        bookingDate: new Date().toISOString(),
        stripeSessionId: '', // Initialize stripeSessionId
      };

      // Create Stripe checkout session for flight (without full booking data in metadata)
      const response = await fetch('/api/payment/create-flight-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: booking.flight?.id,
          airline: booking.flight?.airline,
          from: booking.flight?.from,
          fromCode: booking.flight?.fromCode,
          to: booking.flight?.to,
          toCode: booking.flight?.toCode,
          departure: formattedDepartureDate, // Pass proper ISO date to API
          arrival: booking.flight?.arrival,
          duration: booking.flight?.duration,
          passengers: totalPassengers,
          totalPrice: prices.total,
          userId: user?.id || 'guest', // Use actual user ID
          bookingReference: bookingRef, // Include booking reference for tracking
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      console.log('[Flight Booking] Stripe session created:', data.sessionId);

      // Add Stripe session ID to booking data
      bookingData.stripeSessionId = data.sessionId;

      const existingBookings = JSON.parse(localStorage.getItem('flightBookings') || '[]');
      existingBookings.push(bookingData);
      localStorage.setItem('flightBookings', JSON.stringify(existingBookings));

      // Redirect to Stripe checkout
      if (data.url) {
        toast.success('Redirecting to payment...');
        window.location.href = data.url;
        return;
      } else {
        throw new Error('No checkout URL received from Stripe');
      }
    } catch (error) {
      console.error('[Flight Booking] Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Flight Booking</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div
              key={stepNum}
              className={`flex-1 h-2 rounded-full transition-all ${stepNum <= step
                ? 'bg-blue-600'
                : stepNum === step + 1
                  ? 'bg-blue-300'
                  : 'bg-gray-200'
                }`}
            />
          ))}
        </div>

        {/* Step 1: Review Flight Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold">Step 1: Review Flight Details</h3>

            {booking.flight && (
              <div className="space-y-4">
                {/* Flight Card */}
                <div className="rounded-lg bg-gray-50 p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-lg border">
                      <img
                        src={booking.flight.logo}
                        alt={booking.flight.airline}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">
                        {booking.flight.airline}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {booking.flight.cabin}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                      <p className="mb-2 text-sm text-gray-500">From</p>
                      <p className="font-semibold">{booking.flight.from}</p>
                      <p className="text-lg text-blue-600">
                        {booking.flight.departure}
                      </p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm text-gray-500">To</p>
                      <p className="font-semibold">{booking.flight.to}</p>
                      <p className="text-lg text-blue-600">
                        {booking.flight.arrival}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold">{booking.flight.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stops</p>
                      <p className="font-semibold">{booking.flight.stops}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Passengers</p>
                      <p className="font-semibold">{totalPassengers}</p>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex justify-between mb-2">
                    <p>Base Fare ({totalPassengers} passengers)</p>
                    <p className="font-semibold">${prices.baseFare}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Taxes & Fees</p>
                    <p className="font-semibold">${prices.taxes}</p>
                  </div>
                  <div className="my-3 h-px bg-blue-200" />
                  <div className="flex justify-between text-lg">
                    <p className="font-bold">Subtotal</p>
                    <p className="font-bold text-blue-600">
                      ${prices.baseFare + prices.taxes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                <ChevronLeft className="mr-2 size-4" />
                Back to Flights
              </Button>
              <Button className="flex-1" onClick={() => setStep(2)}>
                Continue to Passenger Details
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Passenger Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold">Step 2: Passenger Details</h3>

            <div className="space-y-6">
              {booking.passengers.map((passenger, idx) => (
                <Card key={idx} className="border-gray-200">
                  <CardContent className="p-6">
                    <h4 className="mb-4 font-bold">
                      Passenger {idx + 1}
                      {idx === 0 && ' (Primary)'}
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Full Name *</Label>
                        <Input
                          placeholder="John Doe"
                          value={passenger.fullName}
                          onChange={(e) =>
                            handlePassengerChange(idx, 'fullName', e.target.value)
                          }
                          className="border-gray-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2 block">Date of Birth *</Label>
                          <Input
                            type="date"
                            value={passenger.dateOfBirth}
                            onChange={(e) =>
                              handlePassengerChange(
                                idx,
                                'dateOfBirth',
                                e.target.value
                              )
                            }
                            className="border-gray-300"
                          />
                        </div>
                        <div>
                          <Label className="mb-2 block">Gender *</Label>
                          <Select
                            value={passenger.gender}
                            onValueChange={(value) =>
                              handlePassengerChange(idx, 'gender', value)
                            }
                          >
                            <SelectTrigger className="border-gray-300">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Email Address *</Label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={passenger.email}
                          onChange={(e) =>
                            handlePassengerChange(idx, 'email', e.target.value)
                          }
                          className="border-gray-300"
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Phone Number *</Label>
                        <Input
                          placeholder="+1 (555) 000-0000"
                          value={passenger.phone}
                          onChange={(e) =>
                            handlePassengerChange(idx, 'phone', e.target.value)
                          }
                          className="border-gray-300"
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">
                          Passport Number (International flights)
                        </Label>
                        <Input
                          placeholder="Optional"
                          value={passenger.passportNumber || ''}
                          onChange={(e) =>
                            handlePassengerChange(
                              idx,
                              'passportNumber',
                              e.target.value
                            )
                          }
                          className="border-gray-300"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="mr-2 size-4" />
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (validatePassengers()) {
                    setStep(3);
                  }
                }}
              >
                Continue to Extras
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Extras */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold">Step 3: Add-ons & Extras</h3>

            <div className="space-y-4">
              {/* Seat Upgrade */}
              <Card className="border-gray-200 cursor-pointer hover:border-blue-400"
                onClick={() =>
                  setBooking({
                    ...booking,
                    extras: {
                      ...booking.extras,
                      seatUpgrade: !booking.extras.seatUpgrade,
                    },
                  })
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">Seat Upgrade</h4>
                      <p className="text-sm text-gray-600">
                        Extra legroom and premium seating
                      </p>
                    </div>
                    <div className="text-right">
                      <input
                        type="checkbox"
                        checked={booking.extras.seatUpgrade}
                        onChange={() => { }}
                        className="h-4 w-4"
                      />
                      <p className="text-sm font-semibold mt-2">
                        +${50 * totalPassengers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meal Option */}
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <h4 className="mb-3 font-semibold">Meal Option</h4>
                  <Select
                    value={booking.extras.mealOption}
                    onValueChange={(value) =>
                      setBooking({
                        ...booking,
                        extras: { ...booking.extras, mealOption: value },
                      })
                    }
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard (Included)
                      </SelectItem>
                      <SelectItem value="premium">
                        Premium Meal (+$30 per person)
                      </SelectItem>
                      <SelectItem value="vegan">
                        Vegan Meal (+$30 per person)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Baggage Upgrade */}
              <Card className="border-gray-200 cursor-pointer hover:border-blue-400"
                onClick={() =>
                  setBooking({
                    ...booking,
                    extras: {
                      ...booking.extras,
                      baggageUpgrade: !booking.extras.baggageUpgrade,
                    },
                  })
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">Extra Baggage</h4>
                      <p className="text-sm text-gray-600">
                        Additional checked bag (up to 50 lbs)
                      </p>
                    </div>
                    <div className="text-right">
                      <input
                        type="checkbox"
                        checked={booking.extras.baggageUpgrade}
                        onChange={() => { }}
                        className="h-4 w-4"
                      />
                      <p className="text-sm font-semibold mt-2">
                        +${75 * totalPassengers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insurance */}
              <Card className="border-gray-200 cursor-pointer hover:border-blue-400"
                onClick={() =>
                  setBooking({
                    ...booking,
                    extras: {
                      ...booking.extras,
                      insurance: !booking.extras.insurance,
                    },
                  })
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">Travel Insurance</h4>
                      <p className="text-sm text-gray-600">
                        Coverage for trip cancellations and delays
                      </p>
                    </div>
                    <div className="text-right">
                      <input
                        type="checkbox"
                        checked={booking.extras.insurance}
                        onChange={() => { }}
                        className="h-4 w-4"
                      />
                      <p className="text-sm font-semibold mt-2">
                        +${25 * totalPassengers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Updated Price Summary */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex justify-between mb-2">
                <p>Base Fare</p>
                <p className="font-semibold">${prices.baseFare}</p>
              </div>
              <div className="flex justify-between mb-2">
                <p>Taxes & Fees</p>
                <p className="font-semibold">${prices.taxes}</p>
              </div>
              {prices.extras > 0 && (
                <div className="flex justify-between mb-2">
                  <p>Extras</p>
                  <p className="font-semibold">${prices.extras}</p>
                </div>
              )}
              <div className="my-3 h-px bg-blue-200" />
              <div className="flex justify-between text-lg">
                <p className="font-bold">Total</p>
                <p className="font-bold text-blue-600">${prices.total}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                <ChevronLeft className="mr-2 size-4" />
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(4)}>
                Continue to Payment
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Payment Details */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold">Step 4: Payment Details</h3>

            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-6">
                <h4 className="mb-4 font-semibold">Order Summary</h4>
                <div className="space-y-2 text-sm mb-4 pb-4 border-b">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Base Fare</p>
                    <p>${prices.baseFare}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Taxes & Fees</p>
                    <p>${prices.taxes}</p>
                  </div>
                  {prices.extras > 0 && (
                    <div className="flex justify-between">
                      <p className="text-gray-600">Extras</p>
                      <p>${prices.extras}</p>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <p>Total Amount Due</p>
                    <p className="text-blue-600">${prices.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-6">
                <h4 className="mb-2 font-semibold">Secure Stripe Checkout</h4>
                <p className="text-sm text-gray-600">
                  You will be redirected to Stripe to complete payment securely.
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(3)}
                disabled={isProcessingPayment}
              >
                <ChevronLeft className="mr-2 size-4" />
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmBooking}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 size-4" />
                    Proceed to Stripe Checkout
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 size-16 text-green-600" />
              <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600">
                Your flight has been successfully booked
              </p>
            </div>

            {/* Booking Reference */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Booking Reference</p>
                <p className="text-3xl font-bold text-green-600">
                  {booking.bookingReference}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Check your email for confirmation details
                </p>
              </CardContent>
            </Card>

            {/* Flight Summary */}
            {booking.flight && (
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <h4 className="mb-4 font-bold">Flight Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <p className="text-gray-600">Airline</p>
                      <p className="font-semibold">{booking.flight.airline}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Route</p>
                      <p className="font-semibold">
                        {booking.flight.from} → {booking.flight.to}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Departure</p>
                      <p className="font-semibold">
                        {booking.flight.departure}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Arrival</p>
                      <p className="font-semibold">{booking.flight.arrival}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Passengers</p>
                      <p className="font-semibold">{totalPassengers}</p>
                    </div>
                    <div className="my-3 h-px bg-gray-200" />
                    <div className="flex justify-between text-lg">
                      <p className="font-bold">Total Amount Paid</p>
                      <p className="font-bold text-green-600">
                        ${prices.total}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Passenger List */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h4 className="mb-4 font-bold">Passengers</h4>
                <div className="space-y-2">
                  {booking.passengers.map((passenger, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-semibold">{passenger.fullName}</p>
                      <p className="text-gray-600">{passenger.email}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.print()}
              >
                Download Itinerary
              </Button>
              <Button
                className="flex-1"
                onClick={onClose}
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
