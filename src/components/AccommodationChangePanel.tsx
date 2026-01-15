'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import AccommodationSearchChat from './AccommodationSearchChat';
import AccommodationSearchMap from './AccommodationSearchMap';

export interface AccommodationSearchResult {
  name: string;
  location: string;
  city: string;
  coords: { lat: number; lng: number };
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: string;
  totalPrice: string;
  rating?: number;
  reviewCount?: number;
  hotelType?: string;
  amenities?: string[];
  imageQuery?: string;
  imageUrl?: string;
  distance?: string;
}

interface AccommodationChangePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccommodation: {
    name: string;
    location: string;
    city: string;
    coords: { lat: number; lng: number };
    checkIn: string;
    checkOut: string;
    nights: number;
  };
  onReplace: (newAccommodation: any) => void;
  cachedAlternatives?: AccommodationSearchResult[];
}

export default function AccommodationChangePanel({
  isOpen,
  onClose,
  currentAccommodation,
  onReplace,
  cachedAlternatives,
}: AccommodationChangePanelProps) {
  const [searchResults, setSearchResults] = useState<AccommodationSearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AccommodationSearchResult | null>(null);

  const handleResultsUpdate = (results: AccommodationSearchResult[]) => {
    setSearchResults(results);
    setSelectedResult(null);
  };

  const handleSelectResult = (result: AccommodationSearchResult | null) => {
    setSelectedResult(result);
  };

  const handleReplace = () => {
    if (!selectedResult) return;

    // Transform search result to accommodation format
    const newAccommodation = {
      name: selectedResult.name,
      location: selectedResult.location,
      city: selectedResult.city,
      coords: selectedResult.coords,
      checkIn: selectedResult.checkIn,
      checkOut: selectedResult.checkOut,
      nights: selectedResult.nights,
      pricePerNight: selectedResult.pricePerNight,
      totalPrice: selectedResult.totalPrice,
      rating: selectedResult.rating,
      reviewCount: selectedResult.reviewCount,
      hotelType: selectedResult.hotelType,
      amenities: selectedResult.amenities,
      imageQuery: selectedResult.imageQuery,
      imageUrl: selectedResult.imageUrl,
    };

    onReplace(newAccommodation);
    
    // Reset and close
    setSearchResults([]);
    setSelectedResult(null);
    onClose();
  };

  const handleClose = () => {
    setSearchResults([]);
    setSelectedResult(null);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="p-0 sm:max-w-4xl w-full"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-xl font-bold text-slate-900">
                  Find Alternative Accommodation
                </SheetTitle>
                <div className="mt-2 flex items-baseline gap-2">
                  <SheetDescription className="text-base">
                    Current: <span className="font-semibold text-slate-700">{currentAccommodation.name}</span>
                  </SheetDescription>
                  {currentAccommodation.city && (
                    <span className="text-xs text-slate-500">
                      📍 {currentAccommodation.city}
                    </span>
                  )}
                </div>
                <SheetDescription className="text-sm text-slate-500 mt-1">
                  {currentAccommodation.checkIn} - {currentAccommodation.checkOut} · {currentAccommodation.nights} night{currentAccommodation.nights > 1 ? 's' : ''}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Main Content: Chat + Map */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Search Panel (60%) */}
            <div className="flex w-[60%] flex-col border-r border-slate-200 bg-white">
              <AccommodationSearchChat
                city={currentAccommodation.city}
                checkIn={currentAccommodation.checkIn}
                checkOut={currentAccommodation.checkOut}
                nights={currentAccommodation.nights}
                coords={currentAccommodation.coords}
                onResultsUpdate={handleResultsUpdate}
                onSelectResult={handleSelectResult}
                selectedResult={selectedResult}
                cachedAlternatives={cachedAlternatives}
              />
            </div>

            {/* Right: Map Panel (40%) */}
            <div className="flex w-[40%] bg-slate-50">
              <AccommodationSearchMap
                results={searchResults}
                centerCoords={currentAccommodation.coords}
                selectedResult={selectedResult}
                onSelectPlace={handleSelectResult}
              />
            </div>
          </div>

          {/* Footer: Action Buttons */}
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
            <div className="flex items-center gap-3">
              {selectedResult && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Selected:</span>
                  <span className="font-semibold text-slate-900">{selectedResult.name}</span>
                  <span className="text-sm text-purple-600 font-semibold">{selectedResult.totalPrice}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleReplace}
                disabled={!selectedResult}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                Confirm Change
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

