'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
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

export function HotelSearch({ onSearch, isLoading = false }: HotelSearchProps) {
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('2');

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

  return (
    <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Location Input */}
          <div>
            <Label className="mb-2 block text-xs tracking-wider text-gray-600 uppercase">
              Location
            </Label>
            <div className="relative">
              <MapPin className="absolute top-3 left-3 size-4 text-gray-400" />
              <Input
                placeholder="City or hotel name"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
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
