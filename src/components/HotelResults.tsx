'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Heart, ChevronRight, AlertCircle, Info, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';

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

// Default fallback image - a simpler, more reliable URL
const DEFAULT_HOTEL_IMAGE = 'https://images.unsplash.com/photo-1631049307038-da0ec56d8b4a?w=600&h=500&fit=crop';

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
  // SerpAPI specific fields for hotel details
  property_token?: string;
  serpapi_property_details_link?: string;
}

interface HotelResultsProps {
  hotels: HotelResult[];
  isLoading: boolean;
  error?: string | null;
  onViewDetails?: (hotel: HotelResult) => void;
}

// Image display component with better error handling
function HotelImageDisplay({ 
  src, 
  alt, 
  hotelName 
}: { 
  src: string
  alt: string
  hotelName: string
}) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate and clean image URL
  const validatedSrc = src && src.startsWith('http') ? src : DEFAULT_HOTEL_IMAGE;

  return (
    <div className="relative h-96 sm:h-[450px] md:h-[500px] lg:h-[550px] overflow-hidden bg-gray-200 flex-shrink-0">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center">
          <div className="text-gray-400">
            <Info className="size-8 mx-auto" />
          </div>
        </div>
      )}
      
      {imageError ? (
        <div className="h-full w-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
          <div className="text-center">
            <ImageOff className="size-12 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{hotelName}</p>
          </div>
        </div>
      ) : (
        <img
          src={validatedSrc}
          alt={alt}
          className={`h-full w-full object-cover transition-all duration-700 ${
            isLoading ? 'blur-sm' : 'blur-0'
          }`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            console.warn(`Image failed to load: ${validatedSrc}`);
            setImageError(true);
            setIsLoading(false);
          }}
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </div>
  );
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
        <div className="mb-6 text-center">
          <p className="text-gray-600 mb-4">Searching for hotels...</p>
        </div>
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

  // Error state with helpful information
  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="size-8 text-amber-600" />
        </div>
        <p className="text-amber-900 font-semibold mb-2">Search Issue</p>
        <p className="text-amber-700 text-sm mb-4">{error}</p>
        <p className="text-amber-600 text-xs mb-4">
          💡 Tip: Try searching with a different city name or check your dates
        </p>
        <p className="text-amber-600 text-xs">
          We're showing recommended hotels based on your search criteria
        </p>
      </div>
    );
  }

  // No results state with suggestions
  if (hotels.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <Info className="size-8 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium mb-2">No hotels found</p>
        <p className="text-gray-500 text-sm mb-4">
          Try adjusting your search criteria or dates
        </p>
        <p className="text-gray-400 text-xs">
          Popular cities: New York, London, Paris, Tokyo, Dubai, Sydney, Bangkok
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          Found <span className="font-semibold text-gray-900">{hotels.length}</span> hotels
        </p>
      </div>
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
            <Card className="group overflow-hidden border-0 transition-all duration-500 hover:shadow-2xl h-full flex flex-col">
              <div className="relative overflow-hidden flex-shrink-0">
                <HotelImageDisplay 
                  src={hotel.image} 
                  alt={hotel.name}
                  hotelName={hotel.name}
                />
                <button
                  onClick={() => toggleLike(hotel.id)}
                  className="absolute top-4 right-4 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white z-10"
                  aria-label={likedHotels.has(hotel.id) ? 'Unlike' : 'Like'}
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
                  <Badge className="absolute top-4 left-4 border-0 bg-amber-500 text-white z-10">
                    <Star className="mr-1 size-3" />
                    Featured
                  </Badge>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="mb-2 text-2xl font-semibold">{hotel.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-100">
                    <MapPin className="size-4" />
                    <span>{hotel.city}{hotel.country && hotel.country !== 'Unknown' ? `, ${hotel.country}` : ''}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
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
                    <p className="text-sm">{(hotel.reviews || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Capacity</p>
                    <p className="text-sm">{hotel.guests ? `${hotel.guests}+ guests` : 'Multiple'}</p>
                  </div>
                </div>

                {hotel.description && (
                  <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                    {hotel.description}
                  </p>
                )}

                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {hotel.amenities.slice(0, 3).map((amenity, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-gray-300 text-xs"
                      >
                        {amenity}
                      </Badge>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <Badge
                        variant="outline"
                        className="border-gray-300 text-xs"
                      >
                        +{hotel.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <p className="mb-1 text-xs text-gray-500">From</p>
                    <p className="text-3xl font-bold">
                      ${Math.round(hotel.pricePerNight).toLocaleString()}
                      <span className="text-sm font-normal text-gray-500">/night</span>
                    </p>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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
