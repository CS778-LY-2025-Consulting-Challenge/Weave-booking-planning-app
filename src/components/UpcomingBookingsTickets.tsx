'use client';

import { useState, useEffect } from 'react';
import { Plane, Hotel, MapPin, Calendar, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { getFlightBooking, getHotelBooking } from '@/lib/bookingUtils';

interface FlightBooking {
  id: string;
  from: string;
  to: string;
  departureDate: string;
  airline: string;
  flightNumber: string;
  cabinClass: string;
  price: number;
}

interface HotelBooking {
  id: string;
  hotelName: string;
  city: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  price: number;
}

export default function UpcomingBookingsTickets() {
  const router = useRouter();
  const [flightBooking, setFlightBooking] = useState<FlightBooking | null>(null);
  const [hotelBooking, setHotelBooking] = useState<HotelBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load bookings from utility functions
    const loadBookings = () => {
      try {
        const flight = getFlightBooking();
        const hotel = getHotelBooking();
        
        console.log('Loading bookings:', { flight, hotel });
        
        if (flight) {
          setFlightBooking(flight);
        }
        if (hotel) {
          setHotelBooking(hotel);
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadBookings();

    // Listen for real-time booking updates from other tabs/components
    const handleStorageChange = (event: StorageEvent) => {
      console.log('Storage event detected:', event.key);
      if (event.key === 'upcomingFlightBooking' || event.key === 'upcomingHotelBooking' || event.key === null) {
        loadBookings();
      }
    };

    // Also listen for custom events from same tab
    const handleCustomBookingEvent = () => {
      console.log('Custom booking event detected');
      loadBookings();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookingUpdated', handleCustomBookingEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookingUpdated', handleCustomBookingEvent);
    };
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateShort = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return null;
  }

  // Show empty state if no bookings
  if (!flightBooking && !hotelBooking) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Empty Flight Ticket */}
          <Card className="relative overflow-hidden border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-8">
              {/* Perforation Effect */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 space-y-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-gray-300"
                  />
                ))}
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <Plane className="size-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No Flight Booked Yet
                </h3>
                <p className="mb-6 text-sm text-gray-600">
                  Book your next adventure and see your flight here!
                </p>
                <Button
                  onClick={() => router.push('/flights')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 size-4" />
                  Book a Flight
                </Button>
              </div>
            </div>
          </Card>

          {/* Empty Hotel Ticket */}
          <Card className="relative overflow-hidden border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-8">
              {/* Perforation Effect */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 space-y-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-gray-300"
                  />
                ))}
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <Hotel className="size-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No Hotel Booked Yet
                </h3>
                <p className="mb-6 text-sm text-gray-600">
                  Find your perfect stay and it will appear here!
                </p>
                <Button
                  onClick={() => router.push('/hotels')}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Plus className="mr-2 size-4" />
                  Book a Hotel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Flight Ticket */}
        {flightBooking ? (
          <Card className="relative overflow-hidden border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            {/* Perforation Effect */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 space-y-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-blue-200"
                />
              ))}
            </div>

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between border-b-2 border-dashed border-blue-200 pb-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Plane className="size-5 text-blue-600" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                      Flight Ticket
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{flightBooking.airline}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500">Flight #</p>
                  <p className="text-sm font-bold text-gray-900">
                    {flightBooking.flightNumber}
                  </p>
                </div>
              </div>

              {/* Route */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">From</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {flightBooking.from}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <ArrowRight className="size-5 text-blue-600" />
                    <p className="text-xs text-gray-500">Direct</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">To</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {flightBooking.to}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="mb-6 grid grid-cols-2 gap-4 border-t-2 border-dashed border-blue-200 pt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(flightBooking.departureDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Class</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {flightBooking.cabinClass}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="pt-4 border-t-2 border-dashed border-blue-200">
                <p className="text-xs text-gray-500 mb-1">Total Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${flightBooking.price}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="relative overflow-hidden border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-8">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 space-y-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-gray-300"
                  />
                ))}
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <Plane className="size-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No Flight Booked Yet
                </h3>
                <p className="mb-6 text-sm text-gray-600">
                  Book your next adventure and see your flight here!
                </p>
                <Button
                  onClick={() => router.push('/flights')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 size-4" />
                  Book a Flight
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Hotel Ticket */}
        {hotelBooking ? (
          <Card className="relative overflow-hidden border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 via-white to-amber-50 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            {/* Perforation Effect */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 space-y-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-amber-200"
                />
              ))}
            </div>

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between border-b-2 border-dashed border-amber-200 pb-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Hotel className="size-5 text-amber-600" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                      Hotel Booking
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{hotelBooking.city}</p>
                </div>
              </div>

              {/* Hotel Name */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-2">Hotel</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hotelBooking.hotelName}
                </p>
              </div>

              {/* Details */}
              <div className="mb-6 grid grid-cols-2 gap-4 border-t-2 border-dashed border-amber-200 pt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Check-In</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDateShort(hotelBooking.checkInDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Check-Out</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDateShort(hotelBooking.checkOutDate)}
                  </p>
                </div>
              </div>

              {/* Room Type */}
              <div className="mb-6 border-t-2 border-dashed border-amber-200 pt-4">
                <p className="text-xs text-gray-500 mb-1">Room Type</p>
                <p className="text-sm font-semibold text-gray-900">
                  {hotelBooking.roomType}
                </p>
              </div>

              {/* Price */}
              <div className="pt-4 border-t-2 border-dashed border-amber-200">
                <p className="text-xs text-gray-500 mb-1">Total Price</p>
                <p className="text-2xl font-bold text-amber-600">
                  ${hotelBooking.price}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="relative overflow-hidden border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-8">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 space-y-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-gray-300"
                  />
                ))}
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <Hotel className="size-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No Hotel Booked Yet
                </h3>
                <p className="mb-6 text-sm text-gray-600">
                  Find your perfect stay and it will appear here!
                </p>
                <Button
                  onClick={() => router.push('/hotels')}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Plus className="mr-2 size-4" />
                  Book a Hotel
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
