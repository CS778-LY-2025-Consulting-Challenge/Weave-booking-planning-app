'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users, Search, Loader2, Building2, MapPinIcon, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export interface HotelSearchParams {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
}

interface HotelSearchProps {
  onSearch: (params: HotelSearchParams) => void;
  isLoading?: boolean;
}

// Comprehensive global cities and famous hotels database
const WORLD_CITIES_AND_HOTELS = {
  cities: [
    // North America
    { name: 'New York', country: 'USA', region: 'North America' },
    { name: 'Los Angeles', country: 'USA', region: 'North America' },
    { name: 'Miami', country: 'USA', region: 'North America' },
    { name: 'Chicago', country: 'USA', region: 'North America' },
    { name: 'Las Vegas', country: 'USA', region: 'North America' },
    { name: 'San Francisco', country: 'USA', region: 'North America' },
    { name: 'Toronto', country: 'Canada', region: 'North America' },
    { name: 'Vancouver', country: 'Canada', region: 'North America' },
    { name: 'Mexico City', country: 'Mexico', region: 'North America' },
    { name: 'Cancun', country: 'Mexico', region: 'North America' },
    
    // Europe
    { name: 'London', country: 'UK', region: 'Europe' },
    { name: 'Paris', country: 'France', region: 'Europe' },
    { name: 'Barcelona', country: 'Spain', region: 'Europe' },
    { name: 'Madrid', country: 'Spain', region: 'Europe' },
    { name: 'Rome', country: 'Italy', region: 'Europe' },
    { name: 'Venice', country: 'Italy', region: 'Europe' },
    { name: 'Milan', country: 'Italy', region: 'Europe' },
    { name: 'Amsterdam', country: 'Netherlands', region: 'Europe' },
    { name: 'Berlin', country: 'Germany', region: 'Europe' },
    { name: 'Munich', country: 'Germany', region: 'Europe' },
    { name: 'Vienna', country: 'Austria', region: 'Europe' },
    { name: 'Prague', country: 'Czech Republic', region: 'Europe' },
    { name: 'Budapest', country: 'Hungary', region: 'Europe' },
    { name: 'Warsaw', country: 'Poland', region: 'Europe' },
    { name: 'Krakow', country: 'Poland', region: 'Europe' },
    { name: 'Istanbul', country: 'Turkey', region: 'Europe' },
    { name: 'Lisbon', country: 'Portugal', region: 'Europe' },
    { name: 'Dublin', country: 'Ireland', region: 'Europe' },
    { name: 'Edinburgh', country: 'Scotland', region: 'Europe' },
    { name: 'Athens', country: 'Greece', region: 'Europe' },
    { name: 'Santorini', country: 'Greece', region: 'Europe' },
    
    // Asia
    { name: 'Tokyo', country: 'Japan', region: 'Asia' },
    { name: 'Bangkok', country: 'Thailand', region: 'Asia' },
    { name: 'Singapore', country: 'Singapore', region: 'Asia' },
    { name: 'Hong Kong', country: 'Hong Kong', region: 'Asia' },
    { name: 'Shanghai', country: 'China', region: 'Asia' },
    { name: 'Beijing', country: 'China', region: 'Asia' },
    { name: 'Dubai', country: 'UAE', region: 'Asia' },
    { name: 'Abu Dhabi', country: 'UAE', region: 'Asia' },
    { name: 'Mumbai', country: 'India', region: 'Asia' },
    { name: 'Delhi', country: 'India', region: 'Asia' },
    { name: 'Jaipur', country: 'India', region: 'Asia' },
    { name: 'Bangalore', country: 'India', region: 'Asia' },
    { name: 'Bali', country: 'Indonesia', region: 'Asia' },
    { name: 'Jakarta', country: 'Indonesia', region: 'Asia' },
    { name: 'Manila', country: 'Philippines', region: 'Asia' },
    { name: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia' },
    { name: 'Seoul', country: 'South Korea', region: 'Asia' },
    { name: 'Busan', country: 'South Korea', region: 'Asia' },
    { name: 'Chiang Mai', country: 'Thailand', region: 'Asia' },
    { name: 'Phuket', country: 'Thailand', region: 'Asia' },
    
    // Middle East
    { name: 'Doha', country: 'Qatar', region: 'Middle East' },
    { name: 'Riyadh', country: 'Saudi Arabia', region: 'Middle East' },
    { name: 'Beirut', country: 'Lebanon', region: 'Middle East' },
    { name: 'Tehran', country: 'Iran', region: 'Middle East' },
    
    // Africa
    { name: 'Cairo', country: 'Egypt', region: 'Africa' },
    { name: 'Johannesburg', country: 'South Africa', region: 'Africa' },
    { name: 'Cape Town', country: 'South Africa', region: 'Africa' },
    { name: 'Lagos', country: 'Nigeria', region: 'Africa' },
    { name: 'Nairobi', country: 'Kenya', region: 'Africa' },
    { name: 'Marrakech', country: 'Morocco', region: 'Africa' },
    { name: 'Casablanca', country: 'Morocco', region: 'Africa' },
    
    // Oceania
    { name: 'Sydney', country: 'Australia', region: 'Oceania' },
    { name: 'Melbourne', country: 'Australia', region: 'Oceania' },
    { name: 'Brisbane', country: 'Australia', region: 'Oceania' },
    { name: 'Auckland', country: 'New Zealand', region: 'Oceania' },
    { name: 'Fiji', country: 'Fiji', region: 'Oceania' },
    
    // South America
    { name: 'Buenos Aires', country: 'Argentina', region: 'South America' },
    { name: 'Rio de Janeiro', country: 'Brazil', region: 'South America' },
    { name: 'São Paulo', country: 'Brazil', region: 'South America' },
    { name: 'Santiago', country: 'Chile', region: 'South America' },
    { name: 'Lima', country: 'Peru', region: 'South America' },
    { name: 'Bogotá', country: 'Colombia', region: 'South America' },
    { name: 'Cartagena', country: 'Colombia', region: 'South America' },
  ],
  
  hotels: [
    // Luxury International Chains
    { name: 'Four Seasons Hotels', chain: 'Luxury' },
    { name: 'Ritz Carlton', chain: 'Luxury' },
    { name: 'Mandarin Oriental', chain: 'Luxury' },
    { name: 'Peninsula Hotel', chain: 'Luxury' },
    { name: 'Fairmont Hotels', chain: 'Luxury' },
    { name: 'St. Regis', chain: 'Luxury' },
    { name: 'Bulgari Hotels', chain: 'Luxury' },
    { name: 'One&Only', chain: 'Luxury' },
    
    // Premium Brands
    { name: 'Marriott', chain: 'Premium' },
    { name: 'Hilton', chain: 'Premium' },
    { name: 'Hyatt', chain: 'Premium' },
    { name: 'InterContinental', chain: 'Premium' },
    { name: 'Sheraton', chain: 'Premium' },
    { name: 'Westin', chain: 'Premium' },
    { name: 'Park Hyatt', chain: 'Premium' },
    { name: 'Grand Hyatt', chain: 'Premium' },
    
    // Boutique & Contemporary
    { name: 'W Hotels', chain: 'Boutique' },
    { name: 'Ace Hotel', chain: 'Boutique' },
    { name: 'Soho House', chain: 'Boutique' },
    { name: 'NoMad Hotel', chain: 'Boutique' },
    { name: 'Edition Hotels', chain: 'Boutique' },
    { name: 'Kimpton Hotels', chain: 'Boutique' },
    { name: 'Room Mate Hotels', chain: 'Boutique' },
    { name: 'Aman', chain: 'Boutique' },
    
    // Budget & Mid-range
    { name: 'Best Western', chain: 'Mid-range' },
    { name: 'Holiday Inn', chain: 'Mid-range' },
    { name: 'Radisson', chain: 'Mid-range' },
    { name: 'Crowne Plaza', chain: 'Mid-range' },
    { name: 'Ibis Hotels', chain: 'Mid-range' },
    { name: 'Comfort Inn', chain: 'Budget' },
    { name: 'Super 8', chain: 'Budget' },
  ]
};

const POPULAR_LOCATIONS = [
  ...WORLD_CITIES_AND_HOTELS.cities.map(c => ({ name: c.name, type: 'city' as const })),
  ...WORLD_CITIES_AND_HOTELS.hotels.map(h => ({ name: h.name, type: 'hotel' as const }))
];

export function HotelSearch({ onSearch, isLoading = false }: HotelSearchProps) {
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('2');
  const [suggestions, setSuggestions] = useState<typeof POPULAR_LOCATIONS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (location.trim().length > 0) {
      const filtered = POPULAR_LOCATIONS.filter((item) =>
        item.name.toLowerCase().includes(location.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 15)); // Limit to 15 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [location]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: typeof POPULAR_LOCATIONS[0]) => {
    setLocation(suggestion.name);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    // Validation
    if (!location.trim()) {
      toast.error('Please enter a location');
      return;
    }

    if (!checkInDate) {
      toast.error('Please select a check-in date');
      return;
    }

    if (!checkOutDate) {
      toast.error('Please select a check-out date');
      return;
    }

    const checkInDateTime = new Date(checkInDate).getTime();
    const checkOutDateTime = new Date(checkOutDate).getTime();

    if (checkOutDateTime <= checkInDateTime) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (!guests) {
      toast.error('Please select number of guests');
      return;
    }

    onSearch({
      location: location.trim(),
      checkInDate,
      checkOutDate,
      guests: parseInt(guests),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Group suggestions by type
  const citySuggestions = suggestions.filter((s) => s.type === 'city');
  const hotelSuggestions = suggestions.filter((s) => s.type === 'hotel');

  return (
    <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Location Input */}
          <div className="relative">
            <Label className="mb-2 block text-xs tracking-wider text-gray-600 uppercase">
              Location
            </Label>
            <div className="relative">
              <MapPin className="absolute top-3 left-3 size-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder="City or hotel name"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => location.trim().length > 0 && setShowSuggestions(true)}
                onKeyPress={handleKeyPress}
                className="h-12 border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
              >
                {/* Cities Section */}
                {citySuggestions.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <Globe className="size-3" />
                        Cities
                      </p>
                    </div>
                    {citySuggestions.map((suggestion, idx) => (
                      <button
                        key={`city-${idx}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <MapPinIcon className="size-4 text-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{suggestion.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Hotels Section */}
                {hotelSuggestions.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 border-t border-b border-gray-200 sticky top-12">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="size-3" />
                        Hotels
                      </p>
                    </div>
                    {hotelSuggestions.map((suggestion, idx) => (
                      <button
                        key={`hotel-${idx}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <Building2 className="size-4 text-purple-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{suggestion.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* No suggestions message */}
            {showSuggestions && suggestions.length === 0 && location.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <p className="text-sm text-gray-500 text-center">
                  No results for "{location}"
                </p>
              </div>
            )}
          </div>

          {/* Check-in Date */}
          <div>
            <Label className="mb-2 block text-xs tracking-wider text-gray-600 uppercase">
              Check-in
            </Label>
            <div className="relative">
              <Calendar className="absolute top-3 left-3 size-4 text-gray-400" />
              <Input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                onKeyPress={handleKeyPress}
                min={getTodayDate()}
                className="h-12 border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Check-out Date */}
          <div>
            <Label className="mb-2 block text-xs tracking-wider text-gray-600 uppercase">
              Check-out
            </Label>
            <div className="relative">
              <Calendar className="absolute top-3 left-3 size-4 text-gray-400" />
              <Input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                onKeyPress={handleKeyPress}
                min={checkInDate || getTodayDate()}
                className="h-12 border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Guests */}
          <div>
            <Label className="mb-2 block text-xs tracking-wider text-gray-600 uppercase">
              Guests
            </Label>
            <div className="relative">
              <Users className="absolute top-3 left-3 size-4 text-gray-400" />
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                disabled={isLoading}
                className="h-12 w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 size-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
