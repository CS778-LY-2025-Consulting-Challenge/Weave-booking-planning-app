'use client';

import { useState, useEffect, useMemo } from 'react';
import { Edit3, MoreHorizontal, Trash2, Star, MapPin, Calendar, Users, ExternalLink, Loader2, Hotel } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Accommodation {
  name: string;
  location: string;
  city: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: string;
  totalPrice: string;
  rating?: number;
  reviewCount?: number;
  hotelType?: string;
  amenities?: string[];
  coords: { lat: number; lng: number };
  imageQuery?: string;
  imageUrl?: string;
}

interface AccommodationCardProps {
  accommodation: Accommodation;
  onView: () => void;
  onChange: () => void;
  onRemove: () => void;
}

export default function AccommodationCard({
  accommodation,
  onView,
  onChange,
  onRemove,
}: AccommodationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(accommodation.imageUrl || null);
  const [isLoadingImage, setIsLoadingImage] = useState(!accommodation.imageUrl);
  const [website, setWebsite] = useState<string | null>(null);
  const [isLoadingWebsite, setIsLoadingWebsite] = useState(false);

  // Fetch image from Unsplash - update when accommodation changes
  // Use stable memoized keys to track accommodation changes
  const accommodationKey = useMemo(() => {
    return `${accommodation.name || ''}-${accommodation.location || ''}-${accommodation.city || ''}`;
  }, [accommodation.name, accommodation.location, accommodation.city]);
  
  const imageKey = useMemo(() => {
    return `${accommodation.imageUrl || ''}-${accommodation.imageQuery || ''}`;
  }, [accommodation.imageUrl, accommodation.imageQuery]);
  
  useEffect(() => {
    // If accommodation has an imageUrl, use it directly
    if (accommodation.imageUrl) {
      console.log('[AccommodationCard] Using provided imageUrl for', accommodation.name, ':', accommodation.imageUrl);
      setImageUrl(accommodation.imageUrl);
      setIsLoadingImage(false);
      return;
    }

    // If no imageUrl, fetch from Unsplash using imageQuery or hotel name
    setIsLoadingImage(true);
    setImageUrl(null); // Reset to show loading state
    
    const fetchImage = async () => {
      try {
        // Use imageQuery if available, otherwise use hotel name + city
        const searchQuery = accommodation.imageQuery || `${accommodation.name} ${accommodation.city} hotel`;
        console.log('[AccommodationCard] Fetching image for', accommodation.name, 'with query:', searchQuery);
        
        const response = await fetch(`/api/unsplash/search?city=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (data.imageUrl) {
          console.log('[AccommodationCard] Got image for', accommodation.name, ':', data.imageUrl);
          setImageUrl(data.imageUrl);
        } else {
          console.warn('[AccommodationCard] No image found for', accommodation.name);
        }
      } catch (error) {
        console.error('[AccommodationCard] Failed to fetch image for', accommodation.name, ':', error);
      } finally {
        setIsLoadingImage(false);
      }
    };
    
    fetchImage();
  }, [accommodationKey, imageKey]); // Use stable keys instead of individual fields

  // Fetch hotel website from Google Places
  const fetchWebsite = async () => {
    if (isLoadingWebsite || website) return;

    setIsLoadingWebsite(true);
    try {
      const response = await fetch(
        `/api/google-places/details?name=${encodeURIComponent(accommodation.name)}&lat=${accommodation.coords.lat}&lng=${accommodation.coords.lng}`
      );
      const data = await response.json();
      if (data.website) {
        setWebsite(data.website);
        // Open the website
        window.open(data.website, '_blank', 'noopener,noreferrer');
      } else {
        // Fallback to Google search
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(accommodation.name + ' ' + accommodation.city + ' official website')}`;
        window.open(searchUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('[AccommodationCard] Failed to fetch website:', error);
      // Fallback to Google search
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(accommodation.name + ' ' + accommodation.city + ' official website')}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsLoadingWebsite(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-row overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm transition-all hover:shadow-md hover:border-purple-300"
    >
      {/* Image Section - Left Side */}
      <div
        onClick={onView}
        className="relative h-40 w-48 shrink-0 cursor-pointer overflow-hidden bg-slate-100"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={accommodation.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-purple-50 text-purple-300">
            <Hotel className="h-10 w-10 opacity-20" />
          </div>
        )}
        {isLoadingImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}
        
        {/* Hotel Type Badge */}
        {accommodation.hotelType && (
          <Badge className="absolute top-2 left-2 bg-purple-500/90 backdrop-blur-sm text-[10px] px-1.5 py-0.5 text-white shadow-sm">
            {accommodation.hotelType}
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <div
        onClick={onView}
        className="flex flex-1 cursor-pointer flex-col p-3 pr-12"
      >
        {/* Header: Name and Change Button Area */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
              {accommodation.name}
            </h4>
            
            {accommodation.rating && (
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="text-xs font-bold text-green-600">{accommodation.rating}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-2.5 w-2.5 ${
                        i < Math.floor(accommodation.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">
                  ({accommodation.reviewCount?.toLocaleString()})
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons - Absolute Positioned in Top Right of Card */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange();
              }}
              className={`flex items-center gap-1 rounded-lg bg-blue-500 px-2 py-1 text-[10px] font-medium text-white transition-all hover:bg-blue-600 ${
                isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Edit3 className="h-3 w-3" />
              <span>Change</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600 text-xs"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  <span>Remove</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Info Rows */}
        <div className="mt-2 space-y-1">
          <div className="flex items-start gap-1.5 text-[10px] text-slate-500">
            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{accommodation.location}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              {formatDate(accommodation.checkIn)} - {formatDate(accommodation.checkOut)}
            </span>
            <span className="text-slate-300">|</span>
            <span>{accommodation.nights} night{accommodation.nights > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Amenities */}
        {accommodation.amenities && (
          <div className="mt-2 flex flex-wrap gap-1">
            {accommodation.amenities.slice(0, 3).map((amenity, idx) => (
              <Badge key={idx} variant="secondary" className="text-[9px] px-1.5 py-0 bg-slate-50 text-slate-500 border-none font-normal">
                {amenity}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer: Price and CTA */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] text-slate-400">From</span>
            <span className="text-sm font-bold text-slate-900">{accommodation.pricePerNight}</span>
            <span className="text-[10px] text-slate-400">/night</span>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              fetchWebsite();
            }}
            disabled={isLoadingWebsite}
            className="h-7 bg-purple-500 hover:bg-purple-600 text-white text-[10px] px-3 shadow-sm"
            size="sm"
          >
            {isLoadingWebsite ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <ExternalLink className="mr-1.5 h-3 w-3" />
                Get Live Prices
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

