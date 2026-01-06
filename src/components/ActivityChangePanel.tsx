'use client';

import { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import ActivitySearchChat from './ActivitySearchChat';
import ActivitySearchMap from './ActivitySearchMap';

interface SearchResult {
  name: string;
  type: 'attraction' | 'food' | 'hotel';
  coords: { lat: number; lng: number };
  rating?: number;
  reviewCount?: number;
  duration?: string;
  price?: string;
  highlights?: string;
  address?: string;
  distance?: string;
}

interface ActivityChangePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentActivity: {
    title: string;
    location?: string;
    coords?: { lat: number; lng: number };
    type?: string;
  };
  dayNumber: number;
  activityIndex: number;
  onReplace: (dayNumber: number, activityIndex: number, newActivity: any) => void;
}

export default function ActivityChangePanel({
  isOpen,
  onClose,
  currentActivity,
  dayNumber,
  activityIndex,
  onReplace,
}: ActivityChangePanelProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  // Extract city from location (e.g., "Victoria Street West, Auckland CBD" -> "Auckland")
  const extractCity = (location?: string): string => {
    if (!location) return '';
    const parts = location.split(',').map(s => s.trim());
    return parts[parts.length - 1] || parts[0] || '';
  };

  const city = extractCity(currentActivity.location);

  const handleResultsUpdate = (results: SearchResult[]) => {
    setSearchResults(results);
    setSelectedResult(null); // Reset selection when new results arrive
  };

  const handleSelectResult = (result: SearchResult | null) => {
    setSelectedResult(result);
  };

  const handleReplace = () => {
    if (!selectedResult) return;

    // Transform search result to activity format
    const newActivity = {
      title: selectedResult.name,
      location: selectedResult.address || currentActivity.location,
      coords: selectedResult.coords,
      type: selectedResult.type,
      rating: selectedResult.rating,
      reviewCount: selectedResult.reviewCount,
      duration: selectedResult.duration,
      price: selectedResult.price,
      highlights: selectedResult.highlights,
    };

    onReplace(dayNumber, activityIndex, newActivity);
    
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
        className="p-0 sm:max-w-6xl w-full"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-xl">Find Alternative Activity</SheetTitle>
                <SheetDescription className="mt-1 text-sm">
                  Current: <span className="font-semibold text-slate-700">{currentActivity.title}</span>
                </SheetDescription>
                {city && (
                  <div className="mt-1 text-xs text-slate-500">
                    📍 {city}
                  </div>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* Main Content: Chat + Map */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Chat Panel (40%) */}
            <div className="flex w-2/5 flex-col border-r border-slate-200 bg-white">
              <ActivitySearchChat
                city={city}
                coords={currentActivity.coords}
                onResultsUpdate={handleResultsUpdate}
                onSelectResult={handleSelectResult}
                selectedResult={selectedResult}
              />
            </div>

            {/* Right: Map Panel (60%) */}
            <div className="w-3/5 bg-slate-50">
              <ActivitySearchMap
                results={searchResults}
                centerCoords={currentActivity.coords}
                selectedResult={selectedResult}
                onSelectPlace={handleSelectResult}
              />
            </div>
          </div>

          {/* Footer: Action Buttons */}
          <div className="border-t border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {selectedResult ? (
                  <span className="font-medium text-slate-900">
                    ✓ Selected: {selectedResult.name}
                  </span>
                ) : (
                  <span>Select an activity from the list or map</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReplace}
                  disabled={!selectedResult}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Replace Activity
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

