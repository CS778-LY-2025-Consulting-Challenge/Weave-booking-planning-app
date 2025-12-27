'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Heart, ChevronRight } from 'lucide-react';
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
  onViewDetails?: (hotel: HotelResult) => void;
}

export function HotelResults({
  hotels,
  isLoading,
  error,
  onViewDetails,
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
    <div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {hotels.map((hotel, index) => (
          <motion.div
            key={hotel.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
            }}
          >
            <Card className="group overflow-hidden border-0 transition-all duration-500 hover:shadow-2xl">
              <div className="relative h-80 overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button
                  onClick={() => toggleLike(hotel.id)}
                  className="absolute top-4 right-4 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white"
                >
                  <Heart
                    className={`size-5 ${
                      likedHotels.has(hotel.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
                {hotel.rating >= 4.5 && (
                  <Badge className="absolute top-4 left-4 border-0 bg-amber-500 text-white">
                    <Star className="mr-1 size-3" />
                    Featured
                  </Badge>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="mb-2 text-2xl">{hotel.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-200">
                    <MapPin className="size-4" />
                    <span>{hotel.city}, {hotel.country}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="mb-4 grid grid-cols-3 gap-4 border-b pb-4">
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <p className="text-sm font-medium">{hotel.rating.toFixed(1)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Reviews</p>
                    <p className="text-sm">{hotel.reviews}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Guests</p>
                    <p className="text-sm">{hotel.guests || 2} max</p>
                  </div>
                </div>

                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {hotel.amenities.map((amenity, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-gray-300"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-xs text-gray-500">From</p>
                    <p className="text-3xl">
                      ${hotel.pricePerNight}
                      <span className="text-sm text-gray-500">/night</span>
                    </p>
                  </div>
                  <Button
                    className="bg-black hover:bg-gray-800"
                    onClick={() => onViewDetails?.(hotel)}
                  >
                    View Details
                    <ChevronRight className="ml-2 size-4" />
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
