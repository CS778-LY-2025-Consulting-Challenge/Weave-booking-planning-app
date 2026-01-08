'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, MapPin, Star, Clock, DollarSign, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AttractionDetailPanel from './AttractionDetailPanel';

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
  imageUrl?: string;
  imageQuery?: string;
}

interface ActivitySearchChatProps {
  city?: string;
  coords?: { lat: number; lng: number };
  onResultsUpdate: (results: SearchResult[]) => void;
  onSelectResult: (result: SearchResult) => void;
  selectedResult?: SearchResult | null;
  cachedAlternatives?: SearchResult[]; // Preloaded alternatives
}

export default function ActivitySearchChat({
  city,
  coords,
  onResultsUpdate,
  onSelectResult,
  selectedResult,
  cachedAlternatives,
}: ActivitySearchChatProps) {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<SearchResult | null>(null);

  // Use cached alternatives if available, otherwise load defaults
  useEffect(() => {
    if (cachedAlternatives && cachedAlternatives.length > 0) {
      console.log('[ActivitySearchChat] Using cached alternatives:', cachedAlternatives.length);
      setResults(cachedAlternatives);
      onResultsUpdate(cachedAlternatives);
    } else if (city && coords) {
      loadDefaultRecommendations();
    }
  }, [city, coords, cachedAlternatives]);

  const loadDefaultRecommendations = async () => {
    try {
      setIsSearching(true);
      const response = await fetch('/api/ai-planner/search-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Popular attractions and activities',
          city,
          coords,
          context: {},
        }),
      });

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        onResultsUpdate(data.results);
      }
    } catch (error) {
      console.error('[ActivitySearchChat] Error loading defaults:', error);
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
      const response = await fetch('/api/ai-planner/search-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          city,
          coords,
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
      console.error('[ActivitySearchChat] Error:', error);
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

  // Quick search buttons
  const quickSearches = [
    'Must-see landmarks',
    'Cultural attractions',
    'Family-friendly activities',
  ];

  const handleQuickSearch = (query: string) => {
    setInput(query);
    setIsSearching(true);
    setHasSearched(true);

    fetch('/api/ai-planner/search-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        city,
        coords,
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
      .catch(error => {
        console.error('[ActivitySearchChat] Error:', error);
      })
      .finally(() => {
        setIsSearching(false);
      });
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header Section with Search */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-blue-50 to-purple-50 px-6 py-5">
        <p className="text-sm text-slate-600 mb-3">
          Search for activities{city ? ` in ${city}` : ''} or choose from suggestions below
        </p>

        {/* Search Bar */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={`e.g., "Must-see landmarks" or "Best restaurants"...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!input.trim() || isSearching}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Search Buttons - Single row */}
        <div className="flex gap-2">
          {quickSearches.map((query) => (
            <button
              key={query}
              onClick={() => handleQuickSearch(query)}
              disabled={isSearching}
              className="flex-1 rounded-full bg-white px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-blue-50 hover:text-blue-700 hover:shadow disabled:opacity-50 whitespace-nowrap"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isSearching && !hasSearched ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500 mb-3" />
              <p className="text-sm text-slate-600">Loading recommendations...</p>
            </div>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              {results.map((result, idx) => (
                <Card
                  key={`${result.name}-${idx}`}
                  className={`group cursor-pointer overflow-hidden transition-all hover:shadow-xl ${
                    selectedResult?.name === result.name
                      ? 'ring-4 ring-green-500 shadow-xl'
                      : 'hover:ring-2 hover:ring-blue-300'
                  }`}
                  onClick={() => onSelectResult(result)}
                >
                  {/* Image Section - 70% height */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-200">
                    {result.imageUrl ? (
                      <>
                        <img
                          src={result.imageUrl}
                          alt={result.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        {/* Title overlay on image */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="text-lg font-bold text-white mb-1 line-clamp-1 drop-shadow-lg">
                            {result.name}
                          </h4>
                          {result.rating && (
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      i < Math.floor(result.rating!)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-white/30 text-white/30'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-white drop-shadow">
                                {result.rating}
                              </span>
                              <span className="text-xs text-white/90 drop-shadow">
                                ({result.reviewCount?.toLocaleString()})
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <MapPin className="h-12 w-12 text-slate-400" />
                      </div>
                    )}
                    
                    {/* Number badge */}
                    <div className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-base font-bold text-blue-600 shadow-lg">
                      {idx + 1}
                    </div>

                    {/* Type badge */}
                    {result.type && (
                      <div className="absolute right-3 top-3">
                        <Badge className="bg-white/90 backdrop-blur-sm text-slate-700 capitalize shadow-md">
                          {result.type}
                        </Badge>
                      </div>
                    )}

                    {/* Selected checkmark */}
                    {selectedResult?.name === result.name && (
                      <div className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 shadow-lg">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info Section - 30% height, compact */}
                  <CardContent className="p-3">
                    {/* Meta Info - Compact two rows */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-3">
                          {result.duration && (
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="h-3.5 w-3.5" />
                              {result.duration}
                            </span>
                          )}
                          {result.price && (
                            <span className="flex items-center gap-1 font-medium text-green-700">
                              <DollarSign className="h-3.5 w-3.5" />
                              {result.price}
                            </span>
                          )}
                        </div>
                        {result.distance && (
                          <span className="flex items-center gap-1 font-medium text-slate-500">
                            <MapPin className="h-3.5 w-3.5" />
                            {result.distance}
                          </span>
                        )}
                      </div>
                      
                      {/* View Details button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAttraction(result);
                          setDetailPanelOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : hasSearched ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-slate-100 p-4 mb-3">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">No results found</p>
            <p className="text-xs text-slate-500 text-center max-w-xs">
              Try a different search term or select one of the quick search options above
            </p>
          </div>
        ) : null}
      </div>

      {/* Attraction Detail Panel */}
      <AttractionDetailPanel
        isOpen={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        attraction={selectedAttraction}
      />
    </div>
  );
}
