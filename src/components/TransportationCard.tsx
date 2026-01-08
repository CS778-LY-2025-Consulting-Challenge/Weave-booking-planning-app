'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Trash2, Plane, ExternalLink, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Transportation {
  mode: string;
  from: string;
  to: string;
  fromCode?: string;
  toCode?: string;
  time?: string;
  date?: string;
  priceEstimate?: string;
  price?: string;
  flightNumber?: string;
  airline?: string;
  airlineCode?: string;
  duration?: string;
  stops?: number;
  aircraft?: string;
  bookingUrl?: string;
  coords?: Array<{ lat: number; lng: number }>;
}

interface TransportationCardProps {
  transportation: Transportation;
  travellers?: number;
  onView?: () => void;
  onRemove?: () => void;
}

// Helper: Format date to "Sat, Jan 10" format
const formatFlightDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateStr;
  }
};

// Helper: Get airline logo URL - Multiple sources
const getAirlineLogo = (airlineName?: string, airlineCode?: string): string => {
  if (!airlineCode && !airlineName) return '';
  
  // Determine the IATA code
  let code = airlineCode?.toUpperCase() || '';
  
  // Extended airline name to code mapping
  const airlineCodeMap: Record<string, string> = {
    'Air New Zealand': 'NZ',
    'Singapore Airlines': 'SQ',
    'Qantas': 'QF',
    'Cathay Pacific': 'CX',
    'Japan Airlines': 'JL',
    'Air China': 'CA',
    'China Eastern': 'MU',
    'China Southern': 'CZ',
    'United Airlines': 'UA',
    'American Airlines': 'AA',
    'Delta': 'DL',
    'Lufthansa': 'LH',
    'British Airways': 'BA',
    'Emirates': 'EK',
    'Hawaiian Airlines': 'HA',
    'Air France': 'AF',
    'KLM': 'KL',
    'Turkish Airlines': 'TK',
    'Qatar Airways': 'QR',
    'Etihad Airways': 'EY',
    'ANA': 'NH',
    'EVA Air': 'BR',
    'Thai Airways': 'TG',
    'Korean Air': 'KE',
    'Asiana': 'OZ',
  };
  
  // If no code provided, try to map from airline name
  if (!code && airlineName) {
    code = airlineCodeMap[airlineName] || '';
  }
  
  if (!code) return '';
  
  // Try multiple logo sources
  // Option 1: Airhex (comprehensive, free)
  return `https://content.airhex.com/content/logos/airlines_${code}_50_50_s.png`;
};

// Helper: Extract times from time string or calculate from date
const extractTimes = (timeStr?: string, fromCode?: string, toCode?: string): { dep: string; arr: string } => {
  if (timeStr) {
    // Format: "HH:MM - HH:MM" or "HH:MM HH:MM"
    const parts = timeStr.split(/[-→→]/).map(s => s.trim());
    if (parts.length >= 2) {
      return {
        dep: parts[0].substring(0, 5) || '10:00',
        arr: parts[1].substring(0, 5) || '14:00',
      };
    }
  }
  return { dep: '10:00', arr: '14:00' };
};

export default function TransportationCard({
  transportation,
  travellers = 2,
  onView,
  onRemove,
}: TransportationCardProps) {
  const [airlineLogoUrl, setAirlineLogoUrl] = useState<string>('');
  const [logoLoadError, setLogoLoadError] = useState(false);

  const isFlight = transportation.mode?.toLowerCase().includes('flight') || transportation.mode === 'flight';
  const { dep: departureTime, arr: arrivalTime } = extractTimes(
    transportation.time,
    transportation.fromCode,
    transportation.toCode
  );
  
  const fromCode = transportation.fromCode || transportation.from.substring(0, 3).toUpperCase();
  const toCode = transportation.toCode || transportation.to.substring(0, 3).toUpperCase();
  const flightDate = formatFlightDate(transportation.date);

  // Debug: Log transportation data
  useEffect(() => {
    console.log('[TransportationCard] Transportation data:', {
      airline: transportation.airline,
      airlineCode: transportation.airlineCode,
      flightNumber: transportation.flightNumber,
      duration: transportation.duration,
      stops: transportation.stops,
      aircraft: transportation.aircraft,
      date: transportation.date,
      time: transportation.time,
      price: transportation.price,
    });
  }, [transportation]);

  // Load airline logo
  useEffect(() => {
    if (transportation.airlineCode || transportation.airline) {
      const logoUrl = getAirlineLogo(transportation.airline, transportation.airlineCode);
      console.log('[TransportationCard] Airline logo URL:', {
        airline: transportation.airline,
        code: transportation.airlineCode,
        logoUrl,
      });
      
      if (logoUrl) {
        setAirlineLogoUrl(logoUrl);
        setLogoLoadError(false);
      } else {
        console.log('[TransportationCard] No logo URL generated');
        setLogoLoadError(true);
      }
    } else {
      console.log('[TransportationCard] No airline info available');
      setLogoLoadError(true);
    }
  }, [transportation.airline, transportation.airlineCode]);

  const handleBookFlight = () => {
    if (transportation.bookingUrl) {
      window.open(transportation.bookingUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to Google Flights
      const fromCode = transportation.fromCode || transportation.from.substring(0, 3).toUpperCase();
      const toCode = transportation.toCode || transportation.to.substring(0, 3).toUpperCase();
      const date = transportation.date || new Date().toISOString().split('T')[0];
      const url = `https://www.google.com/travel/flights?q=${fromCode}+to+${toCode}&date=${date}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="group relative flex flex-row overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-300"
    >
      {/* Left: Airline Logo Section */}
      <div className="flex h-32 w-24 shrink-0 items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 border-r border-blue-100">
        {airlineLogoUrl && !logoLoadError ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white border-2 border-blue-100 shadow-sm">
            <img
              src={airlineLogoUrl}
              alt={transportation.airline || 'Airline'}
              className="h-full w-full object-contain p-2"
              onError={(e) => {
                console.log('[TransportationCard] Logo load failed, URL:', airlineLogoUrl);
                setLogoLoadError(true);
              }}
              onLoad={() => {
                console.log('[TransportationCard] Logo loaded successfully:', airlineLogoUrl);
              }}
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100 border-2 border-blue-200 shadow-sm">
            {transportation.airlineCode || transportation.airline ? (
              <div className="flex flex-col items-center">
                <Plane className="h-7 w-7 text-blue-600 mb-1" />
                <span className="text-[9px] font-bold text-blue-700 uppercase">
                  {transportation.airlineCode || (transportation.airline?.substring(0, 2) || 'XX')}
                </span>
              </div>
            ) : (
              <Plane className="h-7 w-7 text-blue-600" />
            )}
          </div>
        )}
      </div>

      {/* Middle: Flight Details */}
      <div className="flex flex-1 cursor-pointer flex-col p-3" onClick={onView}>
        {/* Header: Badge */}
        <div className="flex items-start justify-between mb-2">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider"
          >
            {transportation.mode || 'Flight'}
          </Badge>

          {/* Action Menu - Absolute Positioned in Top Right */}
          {onRemove && (
            <div className="absolute top-3 right-3">
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
          )}
        </div>

        {/* Flight Route Title with Date */}
        <div className="mb-2">
          <h4 className="text-sm font-bold text-slate-900">
            {transportation.from} → {transportation.to}
          </h4>
          {flightDate && (
            <p className="text-xs text-slate-500 mt-0.5">{flightDate}</p>
          )}
        </div>

        {/* Flight Details - Compact Layout */}
        {isFlight && (
          <div className="space-y-1.5">
            {/* Airline Name and Flight Number */}
            {transportation.airline && (
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <span className="font-semibold">{transportation.airline}</span>
                {transportation.flightNumber && (
                  <span className="text-slate-400">• {transportation.flightNumber}</span>
                )}
              </div>
            )}

            {/* Flight Times with Airport Codes */}
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base">{departureTime}</span>
                <span className="text-xs text-slate-500 font-normal uppercase">{fromCode}</span>
              </div>
              <span className="text-blue-500 text-lg font-bold">→</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base">{arrivalTime}</span>
                <span className="text-xs text-slate-500 font-normal uppercase">{toCode}</span>
              </div>
            </div>

            {/* Duration and Stops */}
            <div className="flex items-center gap-3 text-xs text-slate-700">
              {transportation.duration ? (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-semibold">{transportation.duration}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-semibold text-slate-400">Duration TBD</span>
                </div>
              )}
              {transportation.stops !== undefined && (
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                  {transportation.stops === 0 ? 'Non-stop' : `${transportation.stops} stop${transportation.stops > 1 ? 's' : ''}`}
                </span>
              )}
              {transportation.aircraft && (
                <span className="text-slate-500">• {transportation.aircraft}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Price and CTA */}
      <div className="flex flex-col items-end justify-center gap-2 p-3 pr-4 border-l border-slate-100 bg-slate-50/50">
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] text-slate-400">From</span>
            <span className="text-base font-bold text-slate-900">
              {transportation.price || transportation.priceEstimate || '—'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">per person</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Total for {travellers} traveller{travellers > 1 ? 's' : ''}</p>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleBookFlight();
          }}
          className="h-7 bg-blue-500 hover:bg-blue-600 text-white text-[10px] px-3 shadow-sm whitespace-nowrap"
          size="sm"
        >
          <ExternalLink className="mr-1.5 h-3 w-3" />
          Book Flights
        </Button>
      </div>
    </div>
  );
}

