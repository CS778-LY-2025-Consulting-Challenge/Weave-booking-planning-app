'use client';

import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Star, MapPin, Phone, Globe, Clock, Loader2, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaceDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  placeData: {
    name: string;
    lat: number;
    lng: number;
    type?: string;
    rating?: number;
    reviewCount?: number;
    highlights?: string;
    duration?: string;
    price?: string;
  } | null;
}

interface PlaceDetails {
  name: string;
  address: string;
  category: string;
  phone: string | null;
  website: string | null;
  hours: string | null;
  photos: string[];
  description: string;
}

const PlaceDetailPanel: React.FC<PlaceDetailPanelProps> = ({ isOpen, onClose, placeData }) => {
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Helper: Extract real place name from activity description
  const extractPlaceName = (activityName: string | undefined | null): string => {
    // Safety check: return empty string if activityName is undefined or null
    if (!activityName || typeof activityName !== 'string') {
      console.log('[PlaceDetailPanel] Invalid activity name:', activityName);
      return '';
    }
    
    // Remove common activity prefixes like "Dinner at", "Lunch at", "Visit", etc.
    const patterns = [
      /^(Dinner|Lunch|Breakfast|Brunch|Snack|Coffee|Tea|Drinks)\s+at\s+/i,
      /^(Visit|Explore|Tour|See|Discover|Experience)\s+/i,
      /^(Check[- ]in|Stay|Accommodation)\s+at\s+/i,
      /^(Cruise|Walk|Hike|Drive)\s+(on|through|along|at)\s+/i,
    ];
    
    let cleanedName = activityName;
    for (const pattern of patterns) {
      cleanedName = cleanedName.replace(pattern, '');
    }
    
    console.log('[PlaceDetailPanel] Extracted place name:', cleanedName, 'from:', activityName);
    return cleanedName.trim();
  };

  useEffect(() => {
    if (isOpen && placeData) {
      fetchPlaceDetails();
    }
  }, [isOpen, placeData]);

  const fetchPlaceDetails = async () => {
    if (!placeData) return;

    setIsLoading(true);
    try {
      // Extract real place name for better API results
      const realPlaceName = extractPlaceName(placeData.name);
      
      // Use original name as fallback if extraction fails
      const queryName = realPlaceName || placeData.name || 'Unknown Place';
      
      const res = await fetch(
        `/api/places/details?name=${encodeURIComponent(queryName)}&lat=${placeData.lat}&lng=${placeData.lng}`
      );
      const data = await res.json();
      
      // 智能混合描述：AI highlights + Foursquare details
      let combinedDescription = '';
      
      // 1. AI highlights (concise selling points)
      if (placeData.highlights) {
        combinedDescription += `${placeData.highlights}`;
      }
      
      // 2. Add Foursquare's detailed description if available
      if (data.description) {
        // Add separator if we already have highlights
        if (combinedDescription) {
          combinedDescription += `\n\n${data.description}`;
        } else {
          combinedDescription += data.description;
        }
      }
      
      // Fallback
      if (!combinedDescription.trim()) {
        combinedDescription = 'No description available.';
      }
      
      setDetails({
        ...data,
        description: combinedDescription.trim(),
      });
    } catch (err) {
      console.error('[PlaceDetailPanel] Error fetching details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextPhoto = () => {
    if (details && details.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % details.photos.length);
    }
  };

  const prevPhoto = () => {
    if (details && details.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + details.photos.length) % details.photos.length);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Hidden title for accessibility */}
        <SheetHeader className="sr-only">
          <SheetTitle>{placeData?.name || 'Place Details'}</SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : details ? (
          <div className="flex h-full flex-col">
            {/* Photo Gallery */}
            <div className="relative h-64 w-full bg-slate-200">
              <img
                src={details.photos[currentPhotoIndex]}
                alt={details.name}
                className="h-full w-full object-cover"
              />
              
              {/* Photo Navigation */}
              {details.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Photo Indicator */}
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {details.photos.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          idx === currentPhotoIndex ? 'w-6 bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Category Badge */}
              <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                {details.category}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Title & Rating */}
              <div className="mb-4">
                <h2 className="mb-2 text-2xl font-bold text-slate-900">{details.name}</h2>
                <div className="flex items-center gap-2">
                  <div className="flex text-orange-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(placeData?.rating || 4.5) ? 'fill-current' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{placeData?.rating || '4.5'}</span>
                  <span className="text-xs text-slate-400">
                    ({placeData?.reviewCount || '1.2k'} reviews)
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Overview</h3>
                <p className="text-sm leading-relaxed text-slate-600">{details.description}</p>
              </div>

              {/* Duration & Price - Beautiful Cards */}
              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                {/* Duration Card */}
                {placeData?.duration && (
                  <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm">
                    <div className="mb-1 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-xs font-bold uppercase tracking-wide text-blue-700">Duration</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{placeData.duration}</p>
                  </div>
                )}

                {/* Price Card */}
                {placeData?.price && (
                  <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
                    <div className="mb-1 flex items-center gap-2">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-bold uppercase tracking-wide text-green-700">Price</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{placeData.price}</p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="mb-6 space-y-3 border-t border-slate-100 pt-6">
                <h3 className="mb-3 text-sm font-bold text-slate-700">Information</h3>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-600">{details.address}</p>
                  </div>
                </div>

                {/* Hours */}
                {details.hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">{details.hours}</p>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {details.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                    <div className="flex-1">
                      <a href={`tel:${details.phone}`} className="text-sm text-blue-600 hover:underline">
                        {details.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {details.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                    <div className="flex-1">
                      <a
                        href={details.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        {details.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="mb-6 border-t border-slate-100 pt-6">
                <h3 className="mb-3 text-sm font-bold text-slate-700">Location</h3>
                <div className="h-48 w-full overflow-hidden rounded-lg border border-slate-200">
                  <img
                    src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+3b82f6(${placeData?.lng},${placeData?.lat})/${placeData?.lng},${placeData?.lat},14,0/600x300@2x?access_token=pk.eyJ1IjoibW9vdmFsIiwiYSI6ImNtanlhejZvbzZpNXMzZHB1Y3NmODA4eXQifQ.zRCSDUXg9OT2rpdA8tMOYQ`}
                    alt="Location map"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <p className="text-slate-500">No details available</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PlaceDetailPanel;

