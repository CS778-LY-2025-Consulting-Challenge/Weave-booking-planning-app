'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, Star, Hotel, Eye, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AccommodationSearchResult } from './AccommodationChangePanel';

interface AccommodationSearchChatProps {
  city: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  coords: { lat: number; lng: number };
  onResultsUpdate: (results: AccommodationSearchResult[]) => void;
  onSelectResult: (result: AccommodationSearchResult) => void;
  selectedResult?: AccommodationSearchResult | null;
  cachedAlternatives?: AccommodationSearchResult[];
}

export default function AccommodationSearchChat({
  city,
  checkIn,
  checkOut,
  nights,
  coords,
  onResultsUpdate,
  onSelectResult,
  selectedResult,
  cachedAlternatives,
}: AccommodationSearchChatProps) {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<AccommodationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Use cached alternatives if available, otherwise load defaults
  useEffect(() => {
    if (cachedAlternatives && cachedAlternatives.length > 0) {
      console.log('[AccommodationSearchChat] Using cached alternatives:', cachedAlternatives.length);
      setResults(cachedAlternatives);
      onResultsUpdate(cachedAlternatives);
    } else if (city) {
      loadDefaultRecommendations();
    }
  }, [city, cachedAlternatives]);

  // Scroll to selected card when selection changes (e.g., from map click)
  useEffect(() => {
    if (selectedResult && results.length > 0) {
      const cardKey = `${selectedResult.name}-${selectedResult.location}`;
      const cardElement = cardRefs.current.get(cardKey);
      
      if (cardElement) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          cardElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 100);
      }
    }
  }, [selectedResult, results]);

  const loadDefaultRecommendations = async () => {
    try {
      setIsSearching(true);
      const response = await fetch('/api/ai-planner/search-accommodations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Show me popular hotels',
          city,
          checkIn,
          checkOut,
          nights,
          context: {},
        }),
      });

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        onResultsUpdate(data.results);
      }
    } catch (error) {
      console.error('[AccommodationSearchChat] Error loading defaults:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!input.trim() || isSearching) return;

    const userQuery = input.trim();
    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/ai-planner/search-accommodations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          city,
          checkIn,
          checkOut,
          nights,
          context: {},
        }),
      });

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setResults(data.results);
        onResultsUpdate(data.results);
      } else {
        setResults([]);
        onResultsUpdate([]);
      }
    } catch (error) {
      console.error('[AccommodationSearchChat] Error:', error);
      setResults([]);
      onResultsUpdate([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  // Quick search buttons for hotels
  const quickSearches = [
    'Luxury hotels near center',
    'Budget-friendly options',
    'Hotels with pool and spa',
  ];

  const handleQuickSearch = (query: string) => {
    setInput(query);
    setIsSearching(true);
    setHasSearched(true);

    fetch('/api/ai-planner/search-accommodations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        city,
        checkIn,
        checkOut,
        nights,
        context: {},
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          setResults(data.results);
          onResultsUpdate(data.results);
        }
      })
      .catch(err => console.error('[AccommodationSearchChat] Quick search error:', err))
      .finally(() => setIsSearching(false));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Search Section */}
      <div className="border-b border-slate-200 bg-white p-4">
        {/* Search Input */}
        <div className="mb-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., 5-star hotels near airport"
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isSearching || !input.trim()}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Quick Search Buttons */}
        <div className="flex flex-wrap gap-2">
          {quickSearches.map((query, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSearch(query)}
              disabled={isSearching}
              className="text-xs"
            >
              {query}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
        {isSearching && results.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-purple-500" />
              <p className="text-sm text-slate-600">Searching for hotels...</p>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((result, idx) => {
              const cardKey = `${result.name}-${result.location}`;
              return (
                <div
                  key={cardKey}
                  ref={(el) => {
                    if (el) {
                      cardRefs.current.set(cardKey, el);
                    } else {
                      cardRefs.current.delete(cardKey);
                    }
                  }}
                >
                  <Card
                    className={`group relative overflow-hidden rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                      selectedResult?.name === result.name && selectedResult?.location === result.location
                        ? 'ring-4 ring-purple-500 shadow-xl'
                        : 'hover:ring-2 hover:ring-purple-300'
                    }`}
                    onClick={() => onSelectResult(result)}
                  >
                {/* Hotel Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                  {result.imageUrl ? (
                    <>
                      <img
                        src={result.imageUrl}
                        alt={result.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Hotel className="h-12 w-12 text-slate-400" />
                    </div>
                  )}

                  {/* Number badge */}
                  <div className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-base font-bold text-purple-600 shadow-lg">
                    {idx + 1}
                  </div>

                  {/* Hotel Type badge */}
                  {result.hotelType && (
                    <div className="absolute right-3 top-3">
                      <Badge className="bg-white/90 backdrop-blur-sm text-slate-700 capitalize shadow-md">
                        {result.hotelType}
                      </Badge>
                    </div>
                  )}

                  {/* Name and Rating Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h4 className="text-lg font-bold mb-1 line-clamp-2">
                      {result.name}
                    </h4>
                    {result.rating && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(result.rating!)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-white/50 text-white/50'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{result.rating}</span>
                        <span className="text-white/80">({result.reviewCount?.toLocaleString()})</span>
                      </div>
                    )}
                  </div>

                  {/* Selected checkmark */}
                  {selectedResult?.name === result.name && selectedResult?.location === result.location && (
                    <div className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 shadow-lg">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Hotel Info */}
                <CardContent className="p-4 pt-3">
                  {/* Location */}
                  <div className="mb-2 flex items-start gap-1.5 text-xs text-slate-600">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-1">{result.location}</span>
                  </div>

                  {/* Amenities */}
                  {result.amenities && result.amenities.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {result.amenities.slice(0, 4).map((amenity, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600">
                          {amenity}
                        </Badge>
                      ))}
                      {result.amenities.length > 4 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600">
                          +{result.amenities.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Price and Distance */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">From</p>
                      <p className="text-lg font-bold text-purple-600">{result.totalPrice}</p>
                      <p className="text-xs text-slate-500">{result.pricePerNight} /night</p>
                    </div>
                    {result.distance && (
                      <span className="text-xs text-slate-500">
                        {result.distance}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
                </div>
              );
            })}
          </div>
        ) : hasSearched ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-slate-600">No hotels found. Try a different search.</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

