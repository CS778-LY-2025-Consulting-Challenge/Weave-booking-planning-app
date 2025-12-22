'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Heart } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

export interface HotelResult {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  image: string;
  description?: string;
  amenities?: string[];
  guests?: number;
}

interface HotelResultsProps {
  hotels: HotelResult[];
  isLoading: boolean;
  error?: string | null;
  onBooking?: (hotel: HotelResult) => void;
}

export function HotelResults({
  hotels,
  isLoading,
  error,
  onBooking,
}: HotelResultsProps) {
  const [likedHotels, setLikedHotels] = useState<Set<string>>(new Set());

  const toggleLike = (hotelId: string) => {
    setLikedHotels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(hotelId)) {
        newSet.delete(hotelId);
      } else {
        newSet.add(hotelId);
      }
      return newSet;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg bg-gray-200 h-80"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800 font-medium mb-2">Unable to load hotels</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  // No results state
  if (hotels.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <p className="text-gray-600 font-medium mb-2">No hotels found</p>
        <p className="text-gray-500 text-sm">
          Try adjusting your search criteria or dates
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {hotels.length} Hotels Found
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hotels.map((hotel, index) => (
          <motion.div
            key={hotel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Hotel Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <button
                  onClick={() => toggleLike(hotel.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors"
                >
                  <Heart
                    className={`size-5 ${
                      likedHotels.has(hotel.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>

                {/* Rating Badge */}
                {hotel.rating >= 4 && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-white">
                    <Star className="size-4 fill-white" />
                    {hotel.rating.toFixed(1)}
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                {/* Hotel Name */}
                <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                  {hotel.name}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                  <MapPin className="size-4" />
                  <span>{hotel.city}, {hotel.country}</span>
                </div>

                {/* Rating and Reviews */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${
                          i < Math.floor(hotel.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    {hotel.reviews} reviews
                  </span>
                </div>

                {/* Description */}
                {hotel.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {hotel.description}
                  </p>
                )}

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {hotel.amenities.slice(0, 3).map((amenity, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{hotel.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Price per night</p>
                    <p className="text-xl font-bold text-blue-600">
                      ${hotel.pricePerNight}
                    </p>
                  </div>
                  <Button
                    onClick={() => onBooking?.(hotel)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
