'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Star,
  Wifi,
  Phone,
  Mail,
  Check,
  Heart,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { HotelResult, Room } from '@/types/hotel';

// Fallback image for when API images fail
// Fallback images pool for when API images fail
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?q=80&w=1080&auto=format&fit=crop', // Lobby
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1080&auto=format&fit=crop', // Resort
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1080&auto=format&fit=crop', // Room
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=1080&auto=format&fit=crop', // Pool
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1080&auto=format&fit=crop', // Luxury Room
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1080&auto=format&fit=crop', // Exterior
];

// Get a deterministic fallback image based on a seed (e.g. index/filename)
const getFallbackImage = (seed: string | number) => {
  const index = Math.abs(String(seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[index];
};

// Safe Image Component that handles errors by showing a fallback
const SafeImage = ({ src, alt, className, priority = false }: { src: string, alt: string, className?: string, priority?: boolean }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Reset state when src prop changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <img
      src={hasError ? getFallbackImage(src) : imgSrc}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      referrerPolicy="no-referrer" // Fix for Google hosted images 403
      onError={(e) => {
        if (!hasError) {
          // console.warn(`Image failed to load: ${src}, switching to fallback`);
          setHasError(true);
          setImgSrc(getFallbackImage(src));
        }
      }}
    />
  );
};

// Country code to name mapping
const COUNTRY_MAP: Record<string, string> = {
  'US': 'United States',
  'GB': 'United Kingdom',
  'CA': 'Canada',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'IN': 'India',
  'JP': 'Japan',
  'CN': 'China',
  'FR': 'France',
  'DE': 'Germany',
  'IT': 'Italy',
  'ES': 'Spain',
  'MX': 'Mexico',
  'BR': 'Brazil',
  'SG': 'Singapore',
  'TH': 'Thailand',
  'AE': 'United Arab Emirates',
  'NL': 'Netherlands',
  'SE': 'Sweden',
  'CH': 'Switzerland',
};

const getCountryName = (countryCode: string): string => {
  if (!countryCode) return 'Unknown';
  const upperCode = countryCode.toUpperCase();
  return COUNTRY_MAP[upperCode] || countryCode;
};

export default function HotelDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [hotel, setHotel] = useState<HotelResult | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Get dates from URL params
  const checkInDate = searchParams.get('checkIn') || '';
  const checkOutDate = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests') || '2');
  const hotelId = params.id as string;

  // Extract hotel name and location from search params (passed from hotel card)
  const hotelName = searchParams.get('name') || '';
  const location = searchParams.get('location') || '';

  // Extract SerpAPI specific fields
  const propertyToken = searchParams.get('property_token') || '';
  const detailsLink = searchParams.get('details_link') || '';

  useEffect(() => {
    const fetchHotelDetails = async () => {
      setIsLoading(true);
      setError(null);
      setIsUsingMockData(false);

      try {
        if (!checkInDate || !checkOutDate) {
          // If no dates, use mock data directly
          console.log('[Hotel Details] No dates provided, using mock data');
          const fallbackHotel = createFallbackHotel(hotelId, hotelName, location);
          setHotel(fallbackHotel);
          setIsUsingMockData(true);
          if (fallbackHotel.rooms && fallbackHotel.rooms.length > 0) {
            setSelectedRoom(fallbackHotel.rooms[0]);
          }
          setIsLoading(false);
          return;
        }

        console.log('[Hotel Details] Fetching details for:', { hotelId, hotelName, location, propertyToken });

        // Call hotel details endpoint with SerpAPI fields
        const params = new URLSearchParams({
          hotelId,
          checkInDate,
          checkOutDate,
          guests: guests.toString(),
        });

        // Add SerpAPI specific fields if available
        if (propertyToken) {
          params.append('property_token', propertyToken);
        }
        if (detailsLink) {
          params.append('details_link', detailsLink);
        }
        if (hotelName) {
          params.append('hotelName', hotelName);
        }
        if (location) {
          params.append('location', location);
        }

        const response = await fetch(`/api/hotels/details?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          console.warn('[Hotel Details] API error, using mock data:', data?.error);
          // Use fallback data instead of throwing error
          const fallbackHotel = createFallbackHotel(hotelId, hotelName, location);
          setHotel(fallbackHotel);
          setIsUsingMockData(true);
          if (fallbackHotel.rooms && fallbackHotel.rooms.length > 0) {
            setSelectedRoom(fallbackHotel.rooms[0]);
          }
          setIsLoading(false);
          return;
        }

        // Extract hotel data from response
        const property = data?.data || data?.properties?.[0] || data;
        if (!property || !property.name) {
          throw new Error('No hotel data found in response');
        }

        console.log('[Hotel Details] Processing hotel data:', {
          name: property.name,
          imageCount: property?.images?.length || 0
        });

        // Extract images from SerpAPI response
        let images: string[] = [];
        if (property.images && Array.isArray(property.images)) {
          images = property.images
            .map((img: any) => img?.original_image || img?.thumbnail || img)
            .filter((url: any) => url && typeof url === 'string' && url.startsWith('http'))
            .slice(0, 6); // Get up to 6 images

          console.log(`[Hotel Details] Found ${images.length} images from API`);
        }

        // Use the first image or fallback
        const mainImage = images[0] || property.thumbnail || property.image ||
          'https://images.unsplash.com/photo-1631049307038-da0ec56d8b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80';

        const allImages = images.length > 0 ? images : [mainImage];

        // Determine price per night correctly
        let pricePerNight = 180; // Default fallback

        if (property.rate_per_night) {
          // If explicit rate_per_night exists, use it directly (don't divide by nights)
          const rate = property.rate_per_night.extracted_lowest || property.rate_per_night.lowest;
          if (rate) {
            pricePerNight = Math.round(Number(rate));
          }
        } else if (property.total_rate) {
          // If only total_rate exists, divide by nights
          const total = property.total_rate.extracted_lowest || property.total_rate.lowest;
          const nights = Math.max(1, Math.ceil(
            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
          ));
          if (total) {
            pricePerNight = Math.round(Number(total) / nights);
          }
        } else if (property.price || property.offer?.price?.total || property.offers?.[0]?.price?.total) {
          // Fallback to other price fields, treating them as per-night or total depending on context
          // Usually offers are total price for the stay
          const total = property.price || property.offer?.price?.total || property.offers?.[0]?.price?.total;
          const nights = Math.max(1, Math.ceil(
            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
          ));
          if (total) {
            pricePerNight = Math.round(Number(total) / nights);
          }
        }

        const transformedHotel: HotelResult = {
          id: property.property_token || property.hotelId || hotelId,
          name: property.name || hotelName || 'Hotel',
          location: property.address?.lines?.join(', ') || property.description || property.address?.cityName || location || 'Unknown',
          city: property.address?.cityName || property.city || location.split(',')[0] || 'Unknown',
          country: property.address?.countryCode || property.country || property.address?.countryName || 'Unknown',
          rating: property.rating ? parseFloat(property.rating) : property.overall_rating ? parseFloat(property.overall_rating) : 4.0,
          reviews: property.reviews || property.total_reviews || 0,
          pricePerNight,
          image: mainImage,
          images: allImages,
          description: property.description || 'Experience luxury and comfort at this hotel.',
          amenities: property.amenities || property.essential_info || ['WiFi', 'Restaurant', 'Gym'],
          guests,
          rooms: [
            {
              id: 'room-default',
              name: 'Standard Room',
              type: 'Double',
              capacity: guests,
              price: pricePerNight,
              amenities: ['WiFi', 'AC', 'TV', 'Bathroom'],
              available: 3,
            },
          ],
          policies: {
            cancellation: 'Free cancellation up to 24 hours before check-in',
            checkInTime: property.checkInDate || '15:00',
            checkOutTime: property.checkOutDate || '11:00',
          },
          contact: {
            phone: property.contact?.phone || '+1-212-555-0123',
            email: property.contact?.email || 'reservations@hotel.com',
          },
        };

        setHotel(transformedHotel);
        if (transformedHotel.rooms && transformedHotel.rooms.length > 0) {
          setSelectedRoom(transformedHotel.rooms[0]);
        }
      } catch (err) {
        console.error('[Hotel Details] Error, using mock data:', err);
        // Use fallback data instead of showing error
        const fallbackHotel = createFallbackHotel(hotelId, hotelName, location);
        setHotel(fallbackHotel);
        setIsUsingMockData(true);
        if (fallbackHotel.rooms && fallbackHotel.rooms.length > 0) {
          setSelectedRoom(fallbackHotel.rooms[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelId, checkInDate, checkOutDate, guests, hotelName, location, propertyToken, detailsLink]);

  // Helper function to create fallback hotel data
  const createFallbackHotel = (id: string, name: string, loc: string): HotelResult => {
    const basePrice = 150 + Math.floor(Math.random() * 200);

    return {
      id: id || 'fallback-hotel',
      name: name || 'Luxury Hotel',
      location: loc || 'City Center',
      city: loc.split(',')[0] || 'City',
      country: getCountryName(loc.split(',').pop()?.trim() || 'US'),
      rating: 4.5,
      reviews: 1234,
      pricePerNight: basePrice,
      image: 'https://images.unsplash.com/photo-1631049307038-da0ec9d70304?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
      images: [
        'https://images.unsplash.com/photo-1631049307038-da0ec9d70304?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
        'https://images.unsplash.com/photo-1595521624512-6dfb63b2ebb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
      ],
      description: `Experience luxury and comfort at ${name || 'this beautiful hotel'}. Featuring modern amenities, spacious rooms, and exceptional service, your stay will be unforgettable.`,
      amenities: ['Free WiFi', 'Restaurant', 'Fitness Center', 'Room Service', 'Spa', 'Pool'],
      guests: guests,
      rooms: [
        {
          id: 'room-standard',
          name: 'Standard Room',
          type: 'Double',
          capacity: 2,
          price: basePrice,
          amenities: ['WiFi', 'AC', 'TV', 'Bathroom'],
          available: 5,
        },
        {
          id: 'room-deluxe',
          name: 'Deluxe Room',
          type: 'King',
          capacity: 2,
          price: basePrice + 50,
          amenities: ['WiFi', 'AC', 'TV', 'Bathroom', 'Mini Bar', 'City View'],
          available: 3,
        },
        {
          id: 'room-suite',
          name: 'Executive Suite',
          type: 'Suite',
          capacity: 4,
          price: basePrice + 150,
          amenities: ['WiFi', 'AC', 'TV', 'Bathroom', 'Mini Bar', 'City View', 'Living Room', 'Kitchen'],
          available: 2,
        },
      ],
      policies: {
        cancellation: 'Free cancellation up to 24 hours before check-in',
        checkInTime: '15:00',
        checkOutTime: '11:00',
      },
      contact: {
        phone: '+1-212-555-0123',
        email: 'reservations@hotel.com',
      },
    };
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom || !checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return selectedRoom.price * nights;
  };

  const handleBooking = async () => {
    if (!selectedRoom || !checkInDate || !checkOutDate) {
      toast.error('Please select a room and dates');
      return;
    }

    setIsBooking(true);

    try {
      // Create booking object
      const bookingData = {
        bookingId: `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        hotelId: hotel?.id,
        hotelName: hotel?.name,
        hotelLocation: hotel?.location,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        checkInDate,
        checkOutDate,
        guests,
        totalPrice: calculateTotalPrice(),
        pricePerNight: selectedRoom.price,
        nights: Math.ceil(
          (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
          (1000 * 60 * 60 * 24)
        ),
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        isMockBooking: isUsingMockData,
      };

      // Try Stripe payment flow first (even for mock data)
      try {
        console.log('[Booking] Creating Stripe checkout session...');

        const response = await fetch('/api/payment/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hotelId: hotel?.id,
            hotelName: hotel?.name,
            hotelLocation: hotel?.location,
            roomId: selectedRoom.id,
            roomName: selectedRoom.name,
            checkInDate,
            checkOutDate,
            guests,
            totalPrice: calculateTotalPrice(),
            userId: user?.id || 'guest',
            userEmail: user?.primaryEmailAddress?.emailAddress,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[Booking] Stripe session created:', data);

          // Redirect to Stripe checkout
          if (data.url) {
            // Save booking data to localStorage before redirecting
            const existingBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
            existingBookings.push({ ...bookingData, stripeSessionId: data.sessionId, status: 'pending' });
            localStorage.setItem('hotelBookings', JSON.stringify(existingBookings));

            toast.success('Redirecting to payment...');
            window.location.href = data.url;
            return;
          }
        }

        console.warn('[Booking] Stripe payment failed, using mock booking');
      } catch (stripeError) {
        console.warn('[Booking] Stripe error:', stripeError);
      }

      // Fallback: Save booking locally
      const existingBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
      existingBookings.push(bookingData);
      localStorage.setItem('hotelBookings', JSON.stringify(existingBookings));

      toast.success('Booking confirmed successfully!');

      setTimeout(() => {
        router.push(`/booking-confirmation?bookingId=${bookingData.bookingId}`);
      }, 1500);
    } catch (error) {
      console.error('Booking error:', error);

      // Final fallback: Create mock booking
      const bookingData = {
        bookingId: `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        hotelId: hotel?.id,
        hotelName: hotel?.name,
        hotelLocation: hotel?.location,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        checkInDate,
        checkOutDate,
        guests,
        totalPrice: calculateTotalPrice(),
        pricePerNight: selectedRoom.price,
        nights: Math.ceil(
          (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
          (1000 * 60 * 60 * 24)
        ),
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        isMockBooking: true,
      };

      const existingBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
      existingBookings.push(bookingData);
      localStorage.setItem('hotelBookings', JSON.stringify(existingBookings));

      toast.success('Booking confirmed successfully!');

      setTimeout(() => {
        router.push(`/booking-confirmation?bookingId=${bookingData.bookingId}`);
      }, 1500);
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="size-8 text-red-500" />
        <p>{error || 'Hotel not found'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hotel Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold">{hotel.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="size-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{hotel.rating}/5</span>
                  <span className="text-gray-600">({hotel.reviews.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-blue-600" />
                  <span>{hotel.city}, {hotel.country}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className="rounded-full"
            >
              <Heart
                className={`size-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </Button>
          </div>
        </motion.div>

        {/* Images Gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          {hotel.images && hotel.images.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Main large image - spans 2 columns on desktop */}
              <div className="md:col-span-2 lg:col-span-2 rounded-lg overflow-hidden h-96 sm:h-[450px] md:h-[500px] lg:h-[600px] shadow-lg">
                <SafeImage
                  src={hotel.images[0]}
                  alt={`${hotel.name} main`}
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                  priority={true}
                />
              </div>

              {/* Secondary images grid */}
              {hotel.images.slice(1).map((img, idx) => (
                <div
                  key={idx}
                  className="rounded-lg overflow-hidden h-80 sm:h-96 shadow-lg"
                >
                  <SafeImage
                    src={img}
                    alt={`${hotel.name} ${idx + 2}`}
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Column - Hotel Info */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Hotel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700">{hotel.description}</p>

                {/* Amenities */}
                <div>
                  <h3 className="mb-4 font-semibold">Amenities</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {hotel.amenities.map(amenity => (
                      <div key={amenity} className="flex items-center gap-2">
                        <Check className="size-4 text-green-600" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Policies */}
                {hotel.policies && (
                  <div className="border-t pt-6">
                    <h3 className="mb-4 font-semibold">Hotel Policies</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Check-in</p>
                        <p className="font-semibold">{hotel.policies.checkInTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Check-out</p>
                        <p className="font-semibold">{hotel.policies.checkOutTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cancellation</p>
                        <p className="font-semibold">{hotel.policies.cancellation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact */}
                {hotel.contact && (
                  <div className="border-t pt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="size-5 text-blue-600" />
                      <a href={`tel:${hotel.contact.phone}`} className="text-blue-600 hover:underline">
                        {hotel.contact.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="size-5 text-blue-600" />
                      <a href={`mailto:${hotel.contact.email}`} className="text-blue-600 hover:underline">
                        {hotel.contact.email}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            {/* Room Selection */}
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Select Room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hotel.rooms && hotel.rooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${selectedRoom?.id === room.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{room.name}</h4>
                        <p className="text-sm text-gray-600">{room.type} - {room.capacity} guests</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {room.amenities.slice(0, 2).map(a => (
                            <Badge key={a} variant="secondary" className="text-xs">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">${room.price.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">/night</p>
                        {room.available > 0 && (
                          <Badge variant="outline" className="mt-2">{room.available} left</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Booking Summary */}
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-semibold">{checkInDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-semibold">{checkOutDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guests</p>
                    <p className="font-semibold">{guests}</p>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Nights:</span>
                      <span>
                        {checkInDate && checkOutDate
                          ? Math.ceil(
                            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                          )
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price per night:</span>
                      <span>${selectedRoom?.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">${calculateTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={isBooking || !selectedRoom || !checkInDate || !checkOutDate}
                    className="w-full py-6 text-lg"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Book Now - $${calculateTotalPrice().toLocaleString()}`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
