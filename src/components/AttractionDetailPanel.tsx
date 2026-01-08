'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Clock, Phone, Globe, Star, Loader2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface AttractionDetails {
  name: string;
  type: string;
  rating?: number;
  reviewCount?: number;
  highlights?: string;
  address?: string;
  phone?: string;
  website?: string;
  hours?: string;
  price?: string;
  duration?: string;
  distance?: string;
  images?: string[];
  description?: string;
  reviews?: Array<{
    author: string;
    authorPhoto?: string;
    rating: number;
    text: string;
    time: string;
    relativeTime?: string;
  }>;
}

interface AttractionDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  attraction: {
    name: string;
    type?: string;
    coords?: { lat: number; lng: number };
    rating?: number;
    reviewCount?: number;
    highlights?: string;
    address?: string;
    price?: string;
    duration?: string;
    distance?: string;
    imageUrl?: string;
  } | null;
}

export default function AttractionDetailPanel({
  isOpen,
  onClose,
  attraction,
}: AttractionDetailPanelProps) {
  const [details, setDetails] = useState<AttractionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);

  // Parse and format opening hours for display
  const formatOpeningHours = (hoursString: string) => {
    if (!hoursString) return null;
    
    const lines = hoursString.split('\n').filter(line => line.trim());
    if (lines.length === 0) return null;

    // Extract time from first line (e.g., "Monday: 9:00 AM – 5:00 PM" -> "9:00 AM – 5:00 PM")
    const firstLine = lines[0];
    const timeMatch = firstLine.match(/:\s*(.+)$/);
    const firstTime = timeMatch ? timeMatch[1].trim() : firstLine;

    // Check if all days have the same hours
    const allSame = lines.every(line => {
      const match = line.match(/:\s*(.+)$/);
      return match && match[1].trim() === firstTime;
    });

    if (allSame) {
      return {
        summary: `Every day: ${firstTime}`,
        details: lines
      };
    }

    // Check for weekday/weekend pattern
    const weekdayLines = lines.slice(0, 5); // Mon-Fri
    const weekendLines = lines.slice(5, 7); // Sat-Sun
    
    const weekdayTimes = weekdayLines.map(line => {
      const match = line.match(/:\s*(.+)$/);
      return match ? match[1].trim() : '';
    });
    
    const weekendTimes = weekendLines.map(line => {
      const match = line.match(/:\s*(.+)$/);
      return match ? match[1].trim() : '';
    });

    const weekdaysSame = weekdayTimes.length > 0 && weekdayTimes.every(t => t === weekdayTimes[0]);
    const weekendsSame = weekendTimes.length > 0 && weekendTimes.every(t => t === weekendTimes[0]);

    if (weekdaysSame && weekendsSame && weekdayTimes[0] !== weekendTimes[0]) {
      return {
        summary: `Mon-Fri: ${weekdayTimes[0]}, Sat-Sun: ${weekendTimes[0]}`,
        details: lines
      };
    } else if (weekdaysSame && weekendsSame && weekdayTimes[0] === weekendTimes[0]) {
      return {
        summary: `Every day: ${weekdayTimes[0]}`,
        details: lines
      };
    }

    // Default: show first line as summary
    return {
      summary: firstLine,
      details: lines
    };
  };

  // Fetch detailed information when panel opens
  useEffect(() => {
    if (!isOpen || !attraction) {
      setDetails(null);
      setCurrentImageIndex(0);
      setIsHoursExpanded(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      
      try {
        // Use Google Places API for accurate, real-time data
        console.log('[AttractionDetailPanel] Fetching from Google Places API:', attraction.name);
        
        const response = await fetch(
          `/api/google-places/details?name=${encodeURIComponent(attraction.name)}&lat=${attraction.coords?.lat || 0}&lng=${attraction.coords?.lng || 0}`
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('[AttractionDetailPanel] API Error:', {
            status: response.status,
            error: errorData
          });
          throw new Error(`Google Places API failed: ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('[AttractionDetailPanel] Google Places data received:', {
          photos: data.photos?.length,
          reviews: data.reviews?.length,
          rating: data.rating
        });
        
        // Use Google Places data with fallbacks to original data
        const combinedDetails: AttractionDetails = {
          name: data.name || attraction.name,
          type: attraction.type || 'attraction',
          rating: data.rating || attraction.rating,
          reviewCount: data.reviewCount || attraction.reviewCount,
          highlights: attraction.highlights,
          address: data.address || attraction.address,
          phone: data.phone,
          website: data.website,
          hours: data.hours,
          price: data.priceLevel || attraction.price,
          duration: attraction.duration,
          distance: attraction.distance,
          images: data.photos && data.photos.length > 0 ? data.photos : (attraction.imageUrl ? [attraction.imageUrl] : []),
          description: data.description || attraction.highlights,
          reviews: data.reviews || []
        };
        
        setDetails(combinedDetails);
      } catch (error) {
        console.error('[AttractionDetailPanel] Error fetching Google Places details:', error);
        
        // Fallback to basic info from attraction data
        setDetails({
          name: attraction.name,
          type: attraction.type || 'attraction',
          rating: attraction.rating,
          reviewCount: attraction.reviewCount,
          highlights: attraction.highlights,
          address: attraction.address,
          price: attraction.price,
          duration: attraction.duration,
          distance: attraction.distance,
          images: attraction.imageUrl ? [attraction.imageUrl] : [],
          description: attraction.highlights,
          reviews: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, attraction]);

  if (!attraction) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col overflow-hidden">
        {/* Hidden title for accessibility */}
        <SheetHeader className="sr-only">
          <SheetTitle>{attraction?.name || 'Attraction Details'}</SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500 mb-4" />
              <p className="text-sm text-slate-600">Loading details...</p>
            </div>
          </div>
        ) : details ? (
          <div className="flex h-full flex-col overflow-y-auto">
            {/* Image Gallery - Now part of scrollable content */}
            <div className="relative h-80 w-full shrink-0 bg-slate-900">
              {details.images && details.images.length > 0 ? (
                <>
                  <img
                    src={details.images[currentImageIndex]}
                    alt={details.name}
                    className="h-full w-full object-cover"
                  />
                  
                  {/* Image navigation */}
                  {details.images.length > 1 && (
                    <>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {details.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-2 w-2 rounded-full transition-all ${
                              idx === currentImageIndex
                                ? 'bg-white w-6'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {currentImageIndex > 0 && (
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur-sm hover:bg-white"
                        >
                          ←
                        </button>
                      )}
                      
                      {currentImageIndex < details.images.length - 1 && (
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev + 1)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur-sm hover:bg-white"
                        >
                          →
                        </button>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-200">
                  <MapPin className="h-20 w-20 text-slate-400" />
                </div>
              )}
            </div>

            {/* Content - Now part of scrollable flow */}
            <div className="flex-1">
              {/* Header */}
              <div className="border-b border-slate-200 bg-white p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                      {details.name}
                    </h1>
                    {details.type && (
                      <Badge className="capitalize mb-3">{details.type}</Badge>
                    )}
                  </div>
                </div>

                {/* Rating */}
                {details.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(details.rating!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                      {details.rating}
                    </span>
                    <span className="text-sm text-slate-500">
                      ({details.reviewCount?.toLocaleString()} reviews)
                    </span>
                  </div>
                )}

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {details.duration && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="h-4 w-4" />
                      <span>{details.duration}</span>
                    </div>
                  )}
                  {details.price && (
                    <div className="flex items-center gap-2 font-semibold text-green-700">
                      <span>💰</span>
                      <span>{details.price}</span>
                    </div>
                  )}
                  {details.distance && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="h-4 w-4" />
                      <span>{details.distance}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {details.description && (
                <div className="border-b border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-3">About</h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {details.description}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              <div className="border-b border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Information</h2>
                <div className="space-y-4">
                  {/* Address */}
                  {details.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Address</p>
                        <p className="text-sm text-slate-600">{details.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Hours */}
                  {details.hours && (() => {
                    const formattedHours = formatOpeningHours(details.hours);
                    if (!formattedHours) return null;

                    return (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700 mb-1">Opening Hours</p>
                          
                          {/* Summary (always visible) */}
                          <div
                            onClick={() => setIsHoursExpanded(!isHoursExpanded)}
                            className="flex items-center justify-between cursor-pointer rounded-md p-2 transition-colors hover:bg-slate-50"
                          >
                            <p className="text-sm text-slate-600">{formattedHours.summary}</p>
                            {formattedHours.details.length > 1 && (
                              isHoursExpanded ? (
                                <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                              )
                            )}
                          </div>

                          {/* Detailed hours (expandable) */}
                          {isHoursExpanded && formattedHours.details.length > 1 && (
                            <div className="mt-2 space-y-1 rounded-md bg-slate-50 p-3">
                              {formattedHours.details.map((line, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                  <span className="font-medium text-slate-600">
                                    {line.split(':')[0]}:
                                  </span>
                                  <span className="text-slate-500">
                                    {line.split(':').slice(1).join(':').trim()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Phone */}
                  {details.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Phone</p>
                        <a
                          href={`tel:${details.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {details.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {details.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Website</p>
                        <a
                          href={details.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          Visit website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Preview */}
              {attraction.coords && (
                <div className="bg-white p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Location</h2>
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+3b82f6(${attraction.coords.lng},${attraction.coords.lat})/${attraction.coords.lng},${attraction.coords.lat},14,0/600x300@2x?access_token=pk.eyJ1IjoibW9vdmFsIiwiYSI6ImNtazJzYmJ1YzA2aDIzcW9xbWlhMGIxencifQ.HicBjVINhGc-IAZVBnsnwg`}
                      alt="Map"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              {details.reviews && details.reviews.length > 0 && (
                <div className="bg-white p-6 border-t border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Reviews ({details.reviewCount?.toLocaleString() || details.reviews.length})
                  </h2>
                  <div className="space-y-6">
                    {details.reviews.map((review, idx) => (
                      <div key={idx} className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
                        {/* Reviewer Info */}
                        <div className="flex items-start gap-3 mb-3">
                          {review.authorPhoto ? (
                            <img
                              src={review.authorPhoto}
                              alt={review.author}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">
                                {review.author.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{review.author}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-slate-200 text-slate-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.relativeTime && (
                                <span className="text-xs text-slate-500">{review.relativeTime}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Review Text */}
                        <p className="text-sm text-slate-700 leading-relaxed">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

