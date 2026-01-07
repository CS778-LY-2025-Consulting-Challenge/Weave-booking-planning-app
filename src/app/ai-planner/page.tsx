'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Send,
  MapPin,
  Calendar,
  Users,
  Globe2,
  Video,
  Hotel,
  Plane,
  Info,
  MoreHorizontal,
  Star,
  Train,
  ArrowRight,
  ArrowLeft,
  Clock,
  ChevronRight,
  Loader2,
  Trash2,
  Edit3,
  X,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Plus,
} from 'lucide-react';
import CharizardOrb from '@/components/CharizardOrb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import TripMap from '@/components/TripMap';
import PlaceDetailPanel from '@/components/PlaceDetailPanel';
import ActivityChangePanel from '@/components/ActivityChangePanel';
import AttractionDetailPanel from '@/components/AttractionDetailPanel';
import AccommodationCard from '@/components/AccommodationCard';
import AccommodationChangePanel from '@/components/AccommodationChangePanel';

type Coordinates = { lat: number; lng: number };
type DayPlan = {
  day: number;
  date?: string;
  title: string;
  daySummary?: string; // Short catchy summary of the day (e.g., "Imperial History and Fine Dining")
  summary?: string;
  weather?: { 
    condition?: string; 
    tempRange?: string;
    text?: string; // fallback
    tempC?: number; // fallback
  };
  city?: string; // Added for city filtering
  activities: Array<{
    time?: string;
    title: string;
    highlights?: string;
    location?: string;
    coords?: Coordinates;
    type?: 'attraction' | 'food' | 'hotel';
    duration?: string;
    price?: string;
    rating?: number;
    reviewCount?: number;
    costEstimate?: string;
  }>;
};

type MapPoint = {
  name: string;
  lat: number;
  lng: number;
};

type TripState = {
  tripTitle?: string;
  summary?: {
    days: number;
    cities: number;
    activitiesCount: number;
    hotelsCount: number;
    transportsCount: number;
  };
  routeFlow?: string[];
  mapPoints?: MapPoint[];
  destination?: string | string[];
  departureCity?: string;
  dates?: { start?: string; end?: string; durationDays?: number };
  travellers?: number;
  purpose?: string;
  preferences?: string[];
  dayPlans?: DayPlan[];
  transportation?: Array<{
    mode: string;
    from: string;
    to: string;
    time?: string;
    priceEstimate?: string;
    coords?: Coordinates[];
  }>;
  accommodation?: Array<{
    name: string;
    location: string;
    city?: string;
    checkIn?: string;
    checkOut?: string;
    nights?: number;
    pricePerNight?: string; // Changed to string to match "NZ$350" format
    totalPrice?: string;
    rating?: number;
    reviewCount?: number;
    hotelType?: string;
    amenities?: string[];
    coords?: Coordinates;
    imageQuery?: string;
    imageUrl?: string;
  }>;
  media?: { photos?: string[]; videos?: string[] };
  mapRoute?: { points: Array<{ name: string; coords: Coordinates }> };
};

type ChatMessage = { type: 'ai' | 'user'; text: string };

// Helper: City to Country mapping for smart transport icon detection
const CITY_COUNTRY_MAP: Record<string, string> = {
  // New Zealand
  'Auckland': 'NZ', 'Wellington': 'NZ', 'Christchurch': 'NZ', 'Queenstown': 'NZ',
  // Japan
  'Tokyo': 'JP', 'Kyoto': 'JP', 'Osaka': 'JP', 'Hiroshima': 'JP', 'Nagoya': 'JP', 'Fukuoka': 'JP', 'Sapporo': 'JP', 'Nara': 'JP',
  // China
  'Shanghai': 'CN', 'Beijing': 'CN', 'Guangzhou': 'CN', 'Shenzhen': 'CN', 'Chengdu': 'CN', 'Hangzhou': 'CN', 'Xi\'an': 'CN', 'Suzhou': 'CN',
  // Australia
  'Sydney': 'AU', 'Melbourne': 'AU', 'Brisbane': 'AU', 'Perth': 'AU', 'Adelaide': 'AU',
  // USA
  'New York': 'US', 'Los Angeles': 'US', 'San Francisco': 'US', 'Chicago': 'US', 'Las Vegas': 'US', 'Seattle': 'US', 'Boston': 'US',
  // Europe
  'London': 'GB', 'Paris': 'FR', 'Rome': 'IT', 'Barcelona': 'ES', 'Madrid': 'ES', 'Berlin': 'DE', 'Amsterdam': 'NL', 'Vienna': 'AT',
  // Asia
  'Singapore': 'SG', 'Bangkok': 'TH', 'Seoul': 'KR', 'Hong Kong': 'HK', 'Dubai': 'AE', 'Kuala Lumpur': 'MY',
};

// Helper: Determine if travel between two cities is international (plane) or domestic (train)
const isInternationalTravel = (cityA: string, cityB: string): boolean => {
  const countryA = CITY_COUNTRY_MAP[cityA] || CITY_COUNTRY_MAP[cityA.trim()];
  const countryB = CITY_COUNTRY_MAP[cityB] || CITY_COUNTRY_MAP[cityB.trim()];
  
  // If we can't find country info, assume international for safety if it's a long distance
  if (!countryA || !countryB) return true;
  
  // Different countries = international = plane
  return countryA !== countryB;
};

// Activity Card Component for visual list
const ActivityCard = ({ 
  activity, 
  onClick, 
  onRemove, 
  onChange 
}: { 
  activity: any, 
  onClick: () => void,
  onRemove: () => void,
  onChange: () => void,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Safety check: ensure activity.title exists
        if (!activity.title || typeof activity.title !== 'string') {
          setIsLoadingImage(false);
          return;
        }

        // Extract core keywords from title (remove prefixes like "Dinner at", "Visit", etc.)
        let query = activity.title;
        const prefixPatterns = [
          /^(Dinner|Lunch|Breakfast|Brunch)\s+at\s+/i,
          /^(Visit|Explore|Tour|See|Discover|Experience)\s+/i,
          /\+.*$/,  // Remove everything after "+" (e.g., "Sky Tower + SkyWalk" -> "Sky Tower")
          /\s*\(.*\)$/,  // Remove content in parentheses
        ];
        
        for (const pattern of prefixPatterns) {
          query = query.replace(pattern, '');
        }
        
        // Only use the first part if there's a dash or comma
        query = query.split(/[-,]/)[0].trim();
        
        // Limit to first 3-4 words for better matching
        const words = query.split(' ').slice(0, 4).join(' ');
        
        console.log('[ActivityCard] Searching image for:', words, '(original:', activity.title + ')');
        
        const res = await fetch(`/api/unsplash/search?city=${encodeURIComponent(words)}`);
        const data = await res.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        console.error('Error fetching activity image:', err);
      } finally {
        setIsLoadingImage(false);
      }
    };
    fetchImage();
  }, [activity.title, activity.location]);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-200"
    >
      {/* Left: Image */}
      <div 
        onClick={onClick}
        className="relative h-28 w-32 shrink-0 cursor-pointer overflow-hidden bg-slate-100 sm:h-32 sm:w-40"
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={activity.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
            {activity.type === 'food' ? <Info className="h-8 w-8 opacity-20" /> : <MapPin className="h-8 w-8 opacity-20" />}
          </div>
        )}
        
        {/* Restaurant Badge on Image */}
        {activity.type === 'food' && (
          <div className="absolute top-2 left-2">
            <Badge className="text-[10px] px-1.5 py-0.5 bg-orange-500/90 text-white border-0 shadow-sm backdrop-blur-sm">
              Restaurant
            </Badge>
          </div>
        )}
        
        {isLoadingImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {/* Right: Info */}
      <div 
        onClick={onClick}
        className="flex flex-1 cursor-pointer flex-col p-3 sm:p-4"
      >
        <div className="mb-1 flex items-start justify-between gap-2">
          <h4 className="line-clamp-1 text-sm font-bold text-slate-900 sm:text-base">
            {activity.title}
          </h4>
          
          {/* Action Buttons - Right Top Corner */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Change Button - Shows on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange();
              }}
              className={`flex items-center gap-1 rounded-lg bg-blue-500 px-2 py-1 text-xs font-medium text-white transition-all hover:bg-blue-600 ${
                isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Edit3 className="h-3 w-3" />
              <span>Change</span>
            </button>
            
            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Remove</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {activity.rating && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-green-600">{activity.rating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-2.5 w-2.5 ${i < Math.floor(activity.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">({activity.reviewCount})</span>
            </div>
          )}
          {activity.duration && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock className="h-3 w-3" />
              <span>{activity.duration}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{activity.location}</span>
          </div>
          {activity.price && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400">From </span>
              <span className="text-sm font-bold text-slate-900">{activity.price}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AIPlanner() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'ai',
      text: "Hey there! I'm Charizard 🔥 Your AI travel co-pilot. Ready to ignite your next adventure? Tell me where you're dreaming of going!",
    },
  ]);
  const [input, setInput] = useState('');
  const [plannerState, setPlannerState] = useState<TripState>({});
  const [itinerary, setItinerary] = useState<TripState | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null); // City filter state
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isChangePanelOpen, setIsChangePanelOpen] = useState(false);
  const [changingActivity, setChangingActivity] = useState<{
    dayNumber: number;
    activityIndex: number;
    activity: any;
    isAdding?: boolean; // true for add mode, false/undefined for replace mode
  } | null>(null);
  const [isAttractionDetailOpen, setIsAttractionDetailOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<any>(null);
  const [isAccommodationChangePanelOpen, setIsAccommodationChangePanelOpen] = useState(false);
  const [changingAccommodation, setChangingAccommodation] = useState<{
    accommodationIndex: number;
    accommodation: any;
  } | null>(null);
  const dayPlansRef = useRef<HTMLDivElement>(null);

  // Alternatives cache: { "dayNumber-activityIndex": [...alternatives] }
  const [alternativesCache, setAlternativesCache] = useState<Record<string, any[]>>({});
  const [isCaching, setIsCaching] = useState(false);
  
  // Accommodation alternatives cache: { "accommodationIndex": [...alternatives] }
  const [accommodationAlternativesCache, setAccommodationAlternativesCache] = useState<Record<string, any[]>>({});
  const [isCachingAccommodation, setIsCachingAccommodation] = useState(false);

  const activeState = useMemo(() => itinerary || plannerState, [itinerary, plannerState]);

  // Filter day plans by selected city
  const filteredDayPlans = useMemo(() => {
    if (!selectedCity || !activeState.dayPlans) return activeState.dayPlans;
    
    return activeState.dayPlans.filter(dayPlan => {
      // Priority 1: Check if the day plan has a 'city' field (AI explicitly assigned)
      if (dayPlan.city) {
        return dayPlan.city.toLowerCase().includes(selectedCity.toLowerCase());
      }
      
      // Priority 2: Fallback to checking activity locations (for backward compatibility)
      // Add safety check for activities array
      if (!dayPlan.activities || !Array.isArray(dayPlan.activities)) {
        return false;
      }
      
      return dayPlan.activities.some(activity => {
        const location = activity.location || '';
        return location.toLowerCase().includes(selectedCity.toLowerCase());
      });
    });
  }, [activeState.dayPlans, selectedCity]);

  // Filter transportation by selected city
  const filteredTransportation = useMemo(() => {
    if (!selectedCity || !activeState.transportation) return activeState.transportation;
    
    return activeState.transportation.filter(transport => {
      const from = transport.from || '';
      const to = transport.to || '';
      return (
        from.toLowerCase().includes(selectedCity.toLowerCase()) ||
        to.toLowerCase().includes(selectedCity.toLowerCase())
      );
    });
  }, [activeState.transportation, selectedCity]);

  // Filter accommodation by selected city
  const filteredAccommodation = useMemo(() => {
    if (!selectedCity || !activeState.accommodation) return activeState.accommodation;
    
    return activeState.accommodation.filter(hotel => {
      const location = hotel.location || '';
      return location.toLowerCase().includes(selectedCity.toLowerCase());
    });
  }, [activeState.accommodation, selectedCity]);

  // Find the next city in the route flow for navigation buttons
  const nextCity = useMemo(() => {
    if (!selectedCity || !activeState.routeFlow) return null;
    
    // Only "stops" (cities in the middle of the routeFlow) are clickable/filterable
    const stops = activeState.routeFlow.filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    const currentIndex = stops.indexOf(selectedCity);
    
    if (currentIndex !== -1 && currentIndex < stops.length - 1) {
      return stops[currentIndex + 1];
    }
    return null;
  }, [selectedCity, activeState.routeFlow]);

  // Find the previous city in the route flow for navigation buttons
  const previousCity = useMemo(() => {
    if (!selectedCity || !activeState.routeFlow) return null;
    
    // Only "stops" (cities in the middle of the routeFlow) are clickable/filterable
    const stops = activeState.routeFlow.filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    const currentIndex = stops.indexOf(selectedCity);
    
    if (currentIndex !== -1 && currentIndex > 0) {
      return stops[currentIndex - 1];
    }
    return null;
  }, [selectedCity, activeState.routeFlow]);

  // Extract all attraction points from dayPlans for 3D Globe
  const attractionPoints = useMemo(() => {
    const points: any[] = [];
    activeState.dayPlans?.forEach((day) => {
      day.activities?.forEach((act: any) => {
        if (act.coords) {
          // Smart type detection based on title keywords
          let detectedType = act.type || 'attraction';
          
          if (!act.type) {
            const title = act.title.toLowerCase();
            const location = (act.location || '').toLowerCase();
            const highlights = (act.highlights || '').toLowerCase();
            const combined = `${title} ${location} ${highlights}`;
            
            // Food/Restaurant keywords
            const foodKeywords = ['food', 'restaurant', 'dinner', 'lunch', 'breakfast', 'brunch', 'cafe', 'coffee', 'dining', 'eat', 'meal', 'sushi', 'ramen', 'cuisine', 'kitchen', 'bar', 'izakaya', 'market', 'snack'];
            // Hotel/Accommodation keywords
            const hotelKeywords = ['hotel', 'accommodation', 'check-in', 'check in', 'hostel', 'inn', 'resort', 'lodge', 'stay'];
            
            if (foodKeywords.some(keyword => combined.includes(keyword))) {
              detectedType = 'food';
            } else if (hotelKeywords.some(keyword => combined.includes(keyword))) {
              detectedType = 'hotel';
            }
          }
          
          points.push({
            name: act.title,
            lat: act.coords.lat,
            lng: act.coords.lng,
            type: detectedType,
            day: day.day,
            rating: act.rating,
            reviewCount: act.reviewCount
          });
          console.log(`[attractionPoints] Day ${day.day}: ${act.title} (type: ${detectedType}) at [${act.coords.lng}, ${act.coords.lat}]`);
        }
      });
    });
    console.log(`[attractionPoints] Total extracted: ${points.length} attractions`);
    return points;
  }, [activeState.dayPlans]);

  // Unified city points for the map - builds route from routeFlow and mapPoints
  const mapCityPoints = useMemo(() => {
    console.log('[mapCityPoints] Building city points...', {
      hasMapRoute: !!activeState.mapRoute,
      mapRoutePoints: activeState.mapRoute?.points?.length || 0,
      hasMapPoints: !!activeState.mapPoints,
      mapPointsCount: activeState.mapPoints?.length || 0,
      hasRouteFlow: !!activeState.routeFlow,
      routeFlowLength: activeState.routeFlow?.length || 0,
    });

    // Strategy: Use routeFlow (with order and duplicates) + mapPoints (with coordinates)
    // This ensures round trips are correctly displayed
    
    if (activeState.routeFlow && activeState.routeFlow.length > 0 && activeState.mapPoints && activeState.mapPoints.length > 0) {
      // Build ordered route from routeFlow using coordinates from mapPoints
      const orderedRoute: { name: string; lat: number; lng: number }[] = [];
      
      activeState.routeFlow.forEach((cityName) => {
        const cityData = activeState.mapPoints!.find(p => p.name === cityName);
        if (cityData) {
          orderedRoute.push(cityData);
          console.log('[mapCityPoints] Added from routeFlow:', cityName);
        } else {
          console.warn('[mapCityPoints] City in routeFlow not found in mapPoints:', cityName);
        }
      });
      
      console.log('[mapCityPoints] Final route from routeFlow:', orderedRoute.map(p => p.name).join(' → '));
      return orderedRoute;
    }
    
    // Fallback: Use mapRoute if available (for backward compatibility)
    if (activeState.mapRoute?.points) {
      const route = activeState.mapRoute.points.map((p) => ({
        name: p.name,
        lat: p.coords.lat,
        lng: p.coords.lng
      }));
      console.log('[mapCityPoints] Using mapRoute fallback:', route.map(p => p.name).join(' → '));
      return route;
    }
    
    // Fallback: Just use mapPoints as-is
    if (activeState.mapPoints && activeState.mapPoints.length > 0) {
      console.log('[mapCityPoints] Using mapPoints only:', activeState.mapPoints.map(p => p.name).join(' → '));
      return activeState.mapPoints;
    }

    console.log('[mapCityPoints] No route data available');
    return [];
  }, [activeState.mapPoints, activeState.mapRoute, activeState.routeFlow]);

  const destinationLabel = useMemo(() => {
    const dest = activeState.destination;
    if (Array.isArray(dest)) return dest.join(', ');
    return dest ?? '—';
  }, [activeState.destination]);

  const heroCity = useMemo(() => {
    const route = activeState.routeFlow ?? [];
    const departure = activeState.departureCity;

    console.log('[heroCity] Calculating...', {
      routeFlow: route,
      departure,
      destination: activeState.destination,
    });

    // Prefer the first city after departure that isn't the departure city (e.g., Auckland -> Tokyo -> ...)
    const firstStop =
      route.find((c, idx) => idx > 0 && (!departure || c.toLowerCase() !== departure.toLowerCase())) ?? null;

    if (firstStop) {
      console.log('[heroCity] Using first stop after departure:', firstStop);
      return firstStop;
    }

    // Fallback to destination field
    const dest = activeState.destination;
    if (Array.isArray(dest) && dest.length > 0) {
      console.log('[heroCity] Using first destination from array:', dest[0]);
      return dest[0];
    }
    if (typeof dest === 'string' && dest.trim()) {
      console.log('[heroCity] Using destination string:', dest);
      return dest;
    }

    // Last fallback: destinationLabel (may be "—")
    const result = destinationLabel !== '—' ? destinationLabel : null;
    console.log('[heroCity] Final result:', result);
    return result;
  }, [activeState.routeFlow, activeState.departureCity, activeState.destination, destinationLabel]);

  // Fetch hero image from Unsplash API
  useEffect(() => {
    if (!heroCity) {
      console.log('[Unsplash] No hero city, clearing image');
      setHeroImageUrl(null);
      return;
    }

    console.log('[Unsplash] Fetching image for:', heroCity);
    
    const fetchImage = async () => {
      try {
        const res = await fetch(`/api/unsplash/search?city=${encodeURIComponent(heroCity)}`);
        const data = await res.json();
        
        if (data.imageUrl) {
          console.log('[Unsplash] Image URL received:', data.imageUrl);
          setHeroImageUrl(data.imageUrl);
        } else {
          console.warn('[Unsplash] No image URL in response');
          setHeroImageUrl(null);
        }
      } catch (err) {
        console.error('[Unsplash] Error fetching image:', err);
        // Use fallback image on error
        setHeroImageUrl('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80');
      }
    };

    fetchImage();
  }, [heroCity]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { type: 'user', text: userText }]);
    setInput('');
    setIsChatting(true);
    try {
      const res = await fetch('/api/ai-planner/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, input: userText }),
      });
      const data = await res.json();
      const reply = data?.reply ?? 'Got it!';
      const stateUpdate = data?.plannerState ?? {};
      setMessages((prev) => [...prev, { type: 'ai', text: reply }]);
      setPlannerState((prev) => ({ ...prev, ...stateUpdate }));
    } catch (err) {
      setMessages((prev) => [...prev, { type: 'ai', text: 'Oops, something went wrong.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      console.log('[handleGenerate] Sending plannerState to API:', plannerState);
      const res = await fetch('/api/ai-planner/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannerState }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';
      let overview: any = null;
      const dayPlans: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const message = JSON.parse(jsonStr);
              
              if (message.type === 'overview') {
                overview = message.data;
                // Update itinerary with overview first
                setItinerary({
                  ...overview,
                  dayPlans: [],
                });
                console.log('[handleGenerate] Received overview');
              } else if (message.type === 'day') {
                dayPlans.push(message.data);
                // Update itinerary progressively with each day
                if (overview) {
                  setItinerary({
                    ...overview,
                    dayPlans: [...dayPlans],
                  });
                  console.log(`[handleGenerate] Received day ${dayPlans.length}`);
                }
              } else if (message.type === 'complete') {
                console.log('[handleGenerate] Itinerary complete');
              }
            } catch (e) {
              console.error('[handleGenerate] Failed to parse SSE message:', e);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('[handleGenerate] Error:', err);
      setMessages((prev) => [
        ...prev,
        { type: 'ai', text: `Unable to generate itinerary: ${err.message || 'Please try again.'}` },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Preload alternatives cache for all activities
  const preloadAlternativesCache = useCallback(async (dayPlans: DayPlan[]) => {
    if (!dayPlans || dayPlans.length === 0) return;
    
    console.log('[AIPlanner] Starting to preload alternatives cache...');
    setIsCaching(true);

    const cachePromises: Promise<void>[] = [];

    dayPlans.forEach((day) => {
      day.activities?.forEach((activity, activityIndex) => {
        const cacheKey = `${day.day}-${activityIndex}`;
        
        // Extract city from location
        const extractCity = (location?: string): string => {
          if (!location) return '';
          const parts = location.split(',').map(s => s.trim());
          return parts[parts.length - 1] || parts[0] || '';
        };

        const city = day.city || extractCity(activity.location);
        
        console.log(`[AIPlanner] Preloading cache for ${cacheKey}: ${activity.title} in ${city}`);
        
        const promise = fetch('/api/ai-planner/search-activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'Popular attractions and activities',
            city,
            coords: activity.coords,
            context: {},
          }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.results && data.results.length > 0) {
              setAlternativesCache(prev => {
                // Check if already cached in the latest state
                if (prev[cacheKey]) {
                  console.log(`[AIPlanner] Cache already exists for ${cacheKey}, skipping update`);
                  return prev;
                }
                console.log(`[AIPlanner] Cached ${data.results.length} alternatives for ${cacheKey}`);
                return {
                  ...prev,
                  [cacheKey]: data.results,
                };
              });
            }
          })
          .catch(err => {
            console.warn(`[AIPlanner] Failed to cache alternatives for ${cacheKey}:`, err);
          });

        cachePromises.push(promise);
      });
    });

    try {
      await Promise.all(cachePromises);
      console.log('[AIPlanner] Alternatives cache preloading complete');
    } catch (err) {
      console.error('[AIPlanner] Error during cache preloading:', err);
    } finally {
      setIsCaching(false);
    }
  }, []); // Empty deps since we use functional setState

  // Trigger preload when itinerary is fully generated
  const hasPreloadedRef = useRef(false);
  
  useEffect(() => {
    // Use activeState to check both itinerary and plannerState
    const dayPlans = activeState?.dayPlans;
    
    console.log('[AIPlanner] Preload effect triggered:', {
      hasDayPlans: !!dayPlans,
      dayPlansLength: dayPlans?.length || 0,
      isCaching,
      hasPreloaded: hasPreloadedRef.current,
      hasItinerary: !!itinerary?.dayPlans,
      hasPlannerState: !!plannerState?.dayPlans,
      willPreload: dayPlans && 
                   dayPlans.length > 0 && 
                   !isCaching && 
                   !hasPreloadedRef.current
    });
    
    if (
      dayPlans && 
      dayPlans.length > 0 && 
      !isCaching && 
      !hasPreloadedRef.current
    ) {
      console.log('[AIPlanner] Trip ready, scheduling cache preload for', dayPlans.length, 'days');
      hasPreloadedRef.current = true;
      
      // Delay preloading slightly to avoid blocking UI
      const timer = setTimeout(() => {
        preloadAlternativesCache(dayPlans);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [activeState?.dayPlans, isCaching, preloadAlternativesCache, itinerary?.dayPlans, plannerState?.dayPlans]);
  
  // Preload accommodation alternatives cache
  const preloadAccommodationCache = useCallback(async (accommodation: TripState['accommodation']) => {
    if (!accommodation || accommodation.length === 0) return;
    
    console.log('[AIPlanner] Starting to preload accommodation alternatives cache...');
    setIsCachingAccommodation(true);

    const cachePromises: Promise<void>[] = [];

    accommodation.forEach((stay, index) => {
      const cacheKey = String(index);
      
      console.log(`[AIPlanner] Preloading accommodation cache for ${cacheKey}: ${stay.name} in ${stay.city}`);
      
      const promise = fetch('/api/ai-planner/search-accommodations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Popular hotels and accommodations',
          city: stay.city || stay.location,
          checkIn: stay.checkIn || '',
          checkOut: stay.checkOut || '',
          nights: stay.nights || 1,
          context: {},
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            setAccommodationAlternativesCache(prev => {
              // Check if already cached
              if (prev[cacheKey]) {
                console.log(`[AIPlanner] Accommodation cache already exists for ${cacheKey}, skipping update`);
                return prev;
              }
              console.log(`[AIPlanner] Cached ${data.results.length} accommodation alternatives for ${cacheKey}`);
              return {
                ...prev,
                [cacheKey]: data.results,
              };
            });
          }
        })
        .catch(err => {
          console.warn(`[AIPlanner] Failed to cache accommodation alternatives for ${cacheKey}:`, err);
        });

      cachePromises.push(promise);
    });

    try {
      await Promise.all(cachePromises);
      console.log('[AIPlanner] Accommodation cache preloading complete');
    } catch (err) {
      console.error('[AIPlanner] Error during accommodation cache preloading:', err);
    } finally {
      setIsCachingAccommodation(false);
    }
  }, []); // Empty deps since we use functional setState

  // Trigger accommodation preload when itinerary is fully generated
  const hasPreloadedAccommodationRef = useRef(false);
  
  useEffect(() => {
    const accommodation = activeState?.accommodation;
    
    console.log('[AIPlanner] Accommodation preload effect triggered:', {
      hasAccommodation: !!accommodation,
      accommodationLength: accommodation?.length || 0,
      isCachingAccommodation,
      hasPreloaded: hasPreloadedAccommodationRef.current,
    });
    
    if (
      accommodation && 
      accommodation.length > 0 && 
      !isCachingAccommodation && 
      !hasPreloadedAccommodationRef.current
    ) {
      console.log('[AIPlanner] Trip ready, scheduling accommodation cache preload for', accommodation.length, 'stays');
      hasPreloadedAccommodationRef.current = true;
      
      // Delay preloading slightly to avoid blocking UI, and start after activity cache
      const timer = setTimeout(() => {
        preloadAccommodationCache(accommodation);
      }, 2000); // Start 1s after activity cache
      
      return () => clearTimeout(timer);
    }
  }, [activeState?.accommodation, isCachingAccommodation, preloadAccommodationCache, itinerary?.accommodation, plannerState?.accommodation]);
  
  // Reset accommodation preload flag when trip changes or cleared
  useEffect(() => {
    const accommodationLength = activeState?.accommodation?.length || 0;
    
    if (accommodationLength === 0 && hasPreloadedAccommodationRef.current) {
      console.log('[AIPlanner] Accommodation cleared, resetting preload flag and cache.');
      hasPreloadedAccommodationRef.current = false;
      setAccommodationAlternativesCache({});
    }
  }, [activeState?.accommodation]);

  // Reset preload flag when trip changes or cleared
  useEffect(() => {
    const dayPlansLength = activeState?.dayPlans?.length || 0;
    
    console.log('[AIPlanner] Trip change detected:', {
      hasDayPlans: !!activeState?.dayPlans,
      length: dayPlansLength
    });
    
    if (dayPlansLength === 0) {
      console.log('[AIPlanner] Resetting cache and preload flag');
      hasPreloadedRef.current = false;
      setAlternativesCache({}); // Clear cache when starting new trip
    }
  }, [activeState?.dayPlans?.length]);

  const handleActivityClick = (activity: any) => {
    console.log('[AIPlanner] Activity clicked:', activity);
    
    // Transform activity data to match AttractionDetailPanel's expected format
    const attractionData = {
      name: activity.title || 'Unknown Place',
      coords: activity.coords || { lat: 0, lng: 0 },
      type: activity.type || 'attraction',
      rating: activity.rating,
      reviewCount: activity.reviewCount,
      highlights: activity.highlights || activity.desc,
      duration: activity.duration,
      price: activity.price,
      address: activity.location,
      imageUrl: activity.imageUrl,
    };
    
    console.log('[AIPlanner] Opening attraction detail:', attractionData);
    setSelectedAttraction(attractionData);
    setIsAttractionDetailOpen(true);
  };

  const handleRemoveActivity = (dayNumber: number, activityIndex: number) => {
    console.log('[AIPlanner] Removing activity:', { dayNumber, activityIndex });
    
    // Update itinerary if it exists, otherwise update plannerState
    if (itinerary?.dayPlans) {
      const updatedDayPlans = itinerary.dayPlans.map((day) => {
        if (day.day === dayNumber) {
          return {
            ...day,
            activities: day.activities.filter((_, idx) => idx !== activityIndex),
          };
        }
        return day;
      });
      setItinerary({ ...itinerary, dayPlans: updatedDayPlans });
    } else if (plannerState.dayPlans) {
      const updatedDayPlans = plannerState.dayPlans.map((day) => {
        if (day.day === dayNumber) {
          return {
            ...day,
            activities: day.activities.filter((_, idx) => idx !== activityIndex),
          };
        }
        return day;
      });
      setPlannerState({ ...plannerState, dayPlans: updatedDayPlans });
    }
  };

  const handleChangeActivity = (dayNumber: number, activityIndex: number) => {
    console.log('[AIPlanner] Change activity requested:', { dayNumber, activityIndex });
    
    // Find the activity to change
    const dayPlan = activeState.dayPlans?.find((d) => d.day === dayNumber);
    const activity = dayPlan?.activities?.[activityIndex];
    
    if (!activity) {
      console.error('[AIPlanner] Activity not found:', { dayNumber, activityIndex });
      return;
    }
    
    setChangingActivity({
      dayNumber,
      activityIndex,
      activity,
      isAdding: false, // Replace mode
    });
    setIsChangePanelOpen(true);
  };

  const handleAddActivity = (dayNumber: number) => {
    console.log('[AIPlanner] Add activity requested for day:', dayNumber);
    
    // Find the day plan to get city and coords for context
    const dayPlan = activeState.dayPlans?.find((d) => d.day === dayNumber);
    
    if (!dayPlan) {
      console.error('[AIPlanner] Day plan not found:', dayNumber);
      return;
    }
    
    // Use the last activity's location as reference, or day's city
    const lastActivity = dayPlan.activities?.[dayPlan.activities.length - 1];
    const referenceActivity = lastActivity || {
      title: 'New Activity',
      coords: { lat: 0, lng: 0 },
      location: dayPlan.city || '',
    };
    
    setChangingActivity({
      dayNumber,
      activityIndex: -1, // -1 indicates add mode
      activity: referenceActivity,
      isAdding: true, // Add mode
    });
    setIsChangePanelOpen(true);
  };

  const handleReplaceActivity = (dayNumber: number, activityIndex: number, newActivity: any, isAdding: boolean = false) => {
    console.log('[AIPlanner]', isAdding ? 'Adding' : 'Replacing', 'activity:', { dayNumber, activityIndex, newActivity });
    
    // Update itinerary if it exists, otherwise update plannerState
    if (itinerary?.dayPlans) {
      const updatedDayPlans = itinerary.dayPlans.map((day) => {
        if (day.day === dayNumber) {
          const updatedActivities = [...(day.activities || [])];
          if (isAdding) {
            // Add new activity at the end
            updatedActivities.push(newActivity);
          } else {
            // Replace existing activity
            updatedActivities[activityIndex] = {
              ...updatedActivities[activityIndex],
              ...newActivity,
            };
          }
          return {
            ...day,
            activities: updatedActivities,
          };
        }
        return day;
      });
      setItinerary({ ...itinerary, dayPlans: updatedDayPlans });
    } else if (plannerState.dayPlans) {
      const updatedDayPlans = plannerState.dayPlans.map((day) => {
        if (day.day === dayNumber) {
          const updatedActivities = [...(day.activities || [])];
          if (isAdding) {
            // Add new activity at the end
            updatedActivities.push(newActivity);
          } else {
            // Replace existing activity
            updatedActivities[activityIndex] = {
              ...updatedActivities[activityIndex],
              ...newActivity,
            };
          }
          return {
            ...day,
            activities: updatedActivities,
          };
        }
        return day;
      });
      setPlannerState({ ...plannerState, dayPlans: updatedDayPlans });
    }
    
    // Show success message
    setMessages((prev) => [
      ...prev,
      { 
        type: 'ai', 
        text: isAdding 
          ? `Great! I've added "${newActivity.title}" to your itinerary!` 
          : `Great! I've replaced the activity with "${newActivity.title}". Your itinerary has been updated!` 
      },
    ]);
  };

  // Handle accommodation change
  const handleChangeAccommodation = (accommodationIndex: number) => {
    const accommodation = activeState.accommodation?.[accommodationIndex];
    if (!accommodation) return;

    setChangingAccommodation({
      accommodationIndex,
      accommodation,
    });
    setIsAccommodationChangePanelOpen(true);
  };

  const handleReplaceAccommodation = (newAccommodation: any) => {
    if (changingAccommodation === null) return;

    console.log('[AIPlanner] Replacing accommodation:', { 
      index: changingAccommodation.accommodationIndex, 
      newAccommodation,
      currentAccommodation: changingAccommodation.accommodation
    });

    // Update itinerary if it exists, otherwise update plannerState
    if (itinerary?.accommodation) {
      const updatedAccommodation = [...itinerary.accommodation];
      // Completely replace the accommodation at this index
      updatedAccommodation[changingAccommodation.accommodationIndex] = newAccommodation;
      console.log('[AIPlanner] Updated itinerary accommodation:', updatedAccommodation);
      setItinerary({ ...itinerary, accommodation: updatedAccommodation });
    } else if (plannerState.accommodation) {
      const updatedAccommodation = [...plannerState.accommodation];
      // Completely replace the accommodation at this index
      updatedAccommodation[changingAccommodation.accommodationIndex] = newAccommodation;
      console.log('[AIPlanner] Updated plannerState accommodation:', updatedAccommodation);
      setPlannerState({ ...plannerState, accommodation: updatedAccommodation });
    }

    // Show success message
    setMessages((prev) => [
      ...prev,
      { 
        type: 'ai', 
        text: `Great! I've updated your accommodation to "${newAccommodation.name}". Your trip has been updated!` 
      },
    ]);

    setChangingAccommodation(null);
  };

  const handleRemoveAccommodation = (accommodationIndex: number) => {
    console.log('[AIPlanner] Removing accommodation:', accommodationIndex);

    if (itinerary?.accommodation) {
      const updatedAccommodation = itinerary.accommodation.filter((_, idx) => idx !== accommodationIndex);
      setItinerary({ ...itinerary, accommodation: updatedAccommodation });
    } else if (plannerState.accommodation) {
      const updatedAccommodation = plannerState.accommodation.filter((_, idx) => idx !== accommodationIndex);
      setPlannerState({ ...plannerState, accommodation: updatedAccommodation });
    }

    setMessages((prev) => [
      ...prev,
      { type: 'ai', text: `The accommodation has been removed from your trip.` },
    ]);
  };

  // Helper: Robust date parsing (supports ISO + "10 Jan"/"10 January"/"Jan 10")
  const parseDateLoose = (raw?: string | null): Date | null => {
    if (!raw || typeof raw !== 'string') return null;
    const s = raw.trim();
    if (!s) return null;

    // ISO: 2026-01-10
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(`${s}T00:00:00`);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    // Try native parse first
    const native = new Date(s);
    if (!Number.isNaN(native.getTime())) return native;

    const monthMap: Record<string, number> = {
      jan: 0, january: 0,
      feb: 1, february: 1,
      mar: 2, march: 2,
      apr: 3, april: 3,
      may: 4,
      jun: 5, june: 5,
      jul: 6, july: 6,
      aug: 7, august: 7,
      sep: 8, sept: 8, september: 8,
      oct: 9, october: 9,
      nov: 10, november: 10,
      dec: 11, december: 11,
    };

    // "10 January" / "10 Jan" / "10 January 2026"
    let m = s.match(/^(\d{1,2})\s+([A-Za-z]+)(?:\s*,?\s*(\d{4}))?$/);
    if (m) {
      const day = Number(m[1]);
      const monKey = m[2].toLowerCase();
      const year = m[3] ? Number(m[3]) : new Date().getFullYear();
      const mon = monthMap[monKey];
      if (mon !== undefined && day >= 1 && day <= 31) {
        const d = new Date(year, mon, day);
        return Number.isNaN(d.getTime()) ? null : d;
      }
    }

    // "January 10" / "Jan 10" / "January 10, 2026"
    m = s.match(/^([A-Za-z]+)\s+(\d{1,2})(?:\s*,?\s*(\d{4}))?$/);
    if (m) {
      const monKey = m[1].toLowerCase();
      const day = Number(m[2]);
      const year = m[3] ? Number(m[3]) : new Date().getFullYear();
      const mon = monthMap[monKey];
      if (mon !== undefined && day >= 1 && day <= 31) {
        const d = new Date(year, mon, day);
        return Number.isNaN(d.getTime()) ? null : d;
      }
    }

    return null;
  };

  const getTripStartDate = (): Date | null => {
    const startStr = plannerState.dates?.start || (activeState as any)?.dates?.start;
    return parseDateLoose(startStr);
  };

  const getTripEndDate = (): Date | null => {
    const endStr = plannerState.dates?.end || (activeState as any)?.dates?.end;
    const parsedEnd = parseDateLoose(endStr);
    if (parsedEnd) return parsedEnd;

    // If end date missing, infer from durationDays
    const start = getTripStartDate();
    const duration =
      plannerState.dates?.durationDays ??
      (activeState as any)?.dates?.durationDays ??
      (activeState as any)?.summary?.days;
    if (!start || !duration || typeof duration !== 'number') return null;

    const d = new Date(start);
    d.setDate(start.getDate() + (duration - 1));
    return Number.isNaN(d.getTime()) ? null : d;
  };

  // Helper: Calculate date for each day based on start date
  const getDateForDay = (dayNumber: number): { date: string; weekday: string } | null => {
    const startDate = getTripStartDate();
    if (!startDate) return null;

    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + (dayNumber - 1));
    if (Number.isNaN(targetDate.getTime())) return null;

    const dateStr = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekdayStr = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
    return { date: dateStr, weekday: weekdayStr };
  };

  // Helper: Format date range for Day Plans header
  const getDateRange = (): string => {
    const startDate = getTripStartDate();
    const endDate = getTripEndDate();
    if (!startDate || !endDate) return '';

    const startFormatted = startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const endFormatted = endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return `${startFormatted} – ${endFormatted}`;
  };

  // Helper: Get weather icon based on condition string
  const getWeatherIcon = (condition?: string) => {
    const iconClass = "h-4 w-4 stroke-[2.5px]";
    if (!condition) return <Cloud className={`${iconClass} text-slate-400`} />;
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return <Sun className={`${iconClass} text-amber-500`} />;
    if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain className={`${iconClass} text-blue-500`} />;
    if (cond.includes('snow') || cond.includes('ice')) return <CloudSnow className={`${iconClass} text-sky-300`} />;
    if (cond.includes('storm') || cond.includes('lightning')) return <CloudLightning className={`${iconClass} text-indigo-500`} />;
    if (cond.includes('wind')) return <Wind className={`${iconClass} text-slate-400`} />;
    return <Cloud className={`${iconClass} text-slate-400`} />;
  };

  const renderDayPlans = (plans?: DayPlan[]) => {
    // Show skeleton loading during streaming
    if (isGenerating && !plans?.length) {
      return (
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              {/* Day header skeleton */}
              <div className="flex items-baseline gap-3 border-b border-slate-100 pb-1">
                <div className="h-6 w-32 bg-slate-200 rounded"></div>
                <div className="h-4 w-24 bg-slate-100 rounded"></div>
              </div>
              {/* Activity card skeletons */}
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                  <div className="h-28 w-32 sm:h-32 sm:w-40 bg-slate-100"></div>
                  <div className="flex-1 p-3 sm:p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                    <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                    <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    
    if (!plans?.length) {
      if (selectedCity) {
        return (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-2">No activities found in {selectedCity}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCity(null)}
              className="text-xs"
            >
              Show all cities
            </Button>
          </div>
        );
      }
      return <p className="text-sm text-gray-500">No day plan yet.</p>;
    }
    return (
      <div className="space-y-6">
        {plans.map((day, dayIdx) => {
          const dayNumber = typeof day.day === 'number' ? day.day : dayIdx + 1;
          const dateInfo = getDateForDay(dayNumber);
          
          return (
          <div key={`${dayNumber}-${day.title ?? 'untitled'}-${dayIdx}`} className="space-y-3">
            {/* Day Header */}
            <div className="space-y-1">
              <div className="border-b border-slate-100 pb-1">
                <h3 className="text-lg font-bold text-slate-800">
                  Day {dayNumber}: {day.title}
                </h3>
              </div>
              
              {/* Date, Weekday and Weather */}
              <div className="flex items-center gap-2 px-1">
                {dateInfo && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-900">{dateInfo.date}</span>
                    <span className="text-xs font-medium text-slate-500">{dateInfo.weekday}</span>
                  </div>
                )}
                
                {day.weather && (
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="text-slate-300">·</span>
                    {getWeatherIcon(day.weather.condition)}
                    <span className="text-sm font-semibold text-slate-700">
                      {day.weather.tempRange || (day.weather.tempC ? `${day.weather.tempC}°C` : '')}
                    </span>
                  </div>
                )}
              </div>

              {/* Activity Count (Moved below date) */}
              {day.activities && day.activities.length > 0 && (
                <div className="flex items-center gap-1.5 px-1 text-xs text-slate-500">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200">
                    <span className="text-[10px] font-bold text-slate-600">{day.activities.length}</span>
                  </div>
                  <span>{day.activities.length === 1 ? 'activity' : 'activities'}</span>
                </div>
              )}
            </div>

            <div className="grid gap-3">
              {(day.activities ?? []).map((act, idx) => (
                <ActivityCard 
                  key={`${day.day}-${idx}`} 
                  activity={act} 
                  onClick={() => handleActivityClick(act)}
                  onRemove={() => handleRemoveActivity(day.day, idx)}
                  onChange={() => handleChangeActivity(day.day, idx)}
                />
              ))}
              
              {/* Add Activity Button */}
              <button
                onClick={() => handleAddActivity(day.day)}
                className="group flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 transition-all hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-500">
                  <Plus className="h-5 w-5 text-blue-600 transition-colors group-hover:text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-600 transition-colors group-hover:text-blue-600">
                  Add Activity
                </span>
              </button>
            </div>
          </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-24 text-black">
      <style jsx>{`
        .route-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent; /* slate-300 */
        }
        .route-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .route-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .route-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e1; /* slate-300 */
          border-radius: 9999px;
        }
        .route-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8; /* slate-400 */
        }
      `}</style>
      <div className="mx-auto max-w-screen-xl px-4 pb-6 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          {/* Left: Chat */}
          <Card className="sticky top-24 flex flex-col self-start border border-orange-200/60 bg-white/90 py-0 shadow-lg min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] overflow-hidden gap-0">
            <CardHeader className="py-2 pb-0">
              <div className="inline-flex items-center gap-2 px-1 text-slate-900">
                <CharizardOrb size="medium" />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold md:text-base">Plan your trip with Charizard</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 px-4 pt-2 pb-2 min-h-0">
              <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-white/60 bg-white/60 p-3 min-h-0">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isChatting && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[80%] items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow">
                      <span className="mr-1 text-xs font-medium text-slate-400">Charizard is thinking</span>
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Tell me destination, dates, travellers, preferences..."
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={isChatting}>
                    <Send className="mr-1 h-4 w-4" />
                    Send
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Destination: {destinationLabel}</span>
                  <Button size="sm" variant="secondary" onClick={handleGenerate} disabled={isGenerating}>
                    <Sparkles className="mr-1 h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate itinerary'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Visualization */}
          <div className="min-w-0 space-y-4 self-start">
            {/* State 1: Idle - Show Static Charizard */}
            {!activeState.tripTitle && !isChatting && !isGenerating && (
              <Card className="sticky top-24 flex flex-col self-start border border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50 py-0 shadow-lg min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] overflow-hidden gap-0">
                <CardContent className="flex min-h-0 flex-1 flex-col items-center justify-center p-8 text-center">
                  {/* Static Charizard Image */}
                  <div className="relative mb-6 flex h-48 w-48 items-center justify-center overflow-hidden">
                    <img 
                      src="/charizard/charizard-static.png" 
                      alt="Charizard" 
                      className="h-full w-full object-contain"
                    />
                  </div>
                  
                  {/* Welcome Text */}
                  <h2 className="mb-2 text-2xl font-bold text-slate-900">
                    Ready to Plan Your Adventure?
                  </h2>
                  <p className="mb-4 max-w-md text-base text-slate-600">
                    Chat with Charizard on the left to start creating your dream itinerary!
                  </p>
                  
                  {/* Example Prompts */}
                  <div className="space-y-2 text-sm text-slate-500">
                    <p className="italic">"Plan a 5-day trip to Tokyo"</p>
                    <p className="italic">"I want to visit Paris and Rome"</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* State 2: Thinking - Show Animated Charizard */}
            {(isChatting || isGenerating) && !activeState.tripTitle && (
              <Card className="sticky top-24 flex flex-col self-start border border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50 py-0 shadow-lg min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] overflow-hidden gap-0">
                <CardContent className="flex min-h-0 flex-1 flex-col items-center justify-center p-8 text-center">
                  {/* Animated Charizard */}
                  <div className="relative mb-6 flex h-48 w-48 items-center justify-center overflow-hidden">
                    <img 
                      src="/charizard/charizard-animated.gif" 
                      alt="Charizard thinking" 
                      className="h-full w-full object-contain"
                    />
                    {/* Fire effect */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                      <div className="flex gap-1">
                        <span className="animate-bounce text-2xl" style={{ animationDelay: '0ms' }}>🔥</span>
                        <span className="animate-bounce text-2xl" style={{ animationDelay: '150ms' }}>🔥</span>
                        <span className="animate-bounce text-2xl" style={{ animationDelay: '300ms' }}>🔥</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Thinking Text */}
                  <h2 className="mb-3 text-2xl font-bold text-slate-900">
                    Charizard is crafting your perfect journey...
                  </h2>
                  <p className="max-w-md text-base text-slate-600">
                    Analyzing destinations, finding the best activities, and creating your personalized itinerary ✨
                  </p>
                  
                  {/* Loading dots */}
                  <div className="mt-6 flex gap-2">
                    <div className="h-3 w-3 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-3 w-3 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-3 w-3 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* State 3: Trip Generated - Show Visualization Cards */}
            {activeState.tripTitle && (
              <Card className="relative min-w-0 overflow-hidden border border-slate-200 bg-white/90 shadow-lg">
              {/* Background photo + gradient (only after we have a trip) */}
              {heroImageUrl ? (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImageUrl})` }}
                  />
                  {/* Darker gradient overlay for better visibility */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-900/30 to-slate-900/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent" />
                </>
              ) : null}

              <CardHeader className="relative space-y-3 pb-6">
                <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {activeState.tripTitle || 'Your Dream Journey'}
                </CardTitle>
                
                {/* Icons & Counts Summary */}
                <div className="min-w-0 lg:w-[56%] lg:min-w-[520px]">
                  <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-900" />
                      <span>{activeState.summary?.days || plannerState.dates?.durationDays || '—'} days</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-900" />
                      <span>{activeState.summary?.cities || 1} cities</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-slate-900" />
                      <span>{activeState.summary?.activitiesCount || '—'} activities</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Hotel className="h-4 w-4 text-slate-900" />
                      <span>{activeState.summary?.hotelsCount || '—'} hotels</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Plane className="h-4 w-4 text-slate-900" />
                      <span>{activeState.summary?.transportsCount || '—'} transports</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative min-w-0 overflow-hidden px-6 py-6">
                <div className="flex min-w-0 flex-col gap-6 lg:flex-row">
                  {/* Left: Route Flow */}
                  <div className="min-w-0 lg:w-[56%] lg:min-w-[520px] lg:pr-6">
                    <div className="relative">
                      <div className="w-full max-w-full overflow-x-auto pb-2 route-scroll">
                        <div className="inline-flex min-w-max items-center gap-2">
                          {(activeState.routeFlow || [
                            activeState.departureCity || 'Departure',
                            destinationLabel,
                          ]).map((city, idx, arr) => {
                            const isDeparture = idx === 0;
                            const isArrival = idx === arr.length - 1;
                            const isStop = idx > 0 && idx < arr.length - 1;
                            const isSelected = selectedCity === city;
                            const isClickable = isStop; // Only stops are clickable

                            return (
                              <div key={`${city}-${idx}`} className="flex items-center">
                                <div className="shrink-0">
                                  <button
                                    onClick={() => {
                                      if (isClickable) {
                                        setSelectedCity(isSelected ? null : city);
                                      }
                                    }}
                                    disabled={!isClickable}
                                    className={`flex h-12 items-center justify-center rounded-2xl px-6 shadow-sm transition-all ${
                                      isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                                    } ${
                                      isDeparture || isArrival
                                        ? 'border border-slate-200 bg-white'
                                        : isSelected
                                        ? 'border-2 border-blue-500 bg-blue-500 text-white'
                                        : 'border border-indigo-200 bg-white text-slate-900 hover:border-blue-400'
                                    }`}
                                  >
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span className="whitespace-nowrap text-xs font-bold">{city}</span>
                                      {isStop ? (
                                        <span className={`text-[10px] ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
                                          Stop
                                        </span>
                                      ) : null}
                                    </div>
                                  </button>
                                </div>

                              {idx < arr.length - 1 ? (
                                <div className="flex shrink-0 items-center px-0.5">
                                  <div className="dashed-line h-[2px] w-4 shrink-0 bg-slate-200"></div>
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 shadow-inner">
                                    {isInternationalTravel(city, arr[idx + 1]) ? (
                                      <Plane className="h-3.5 w-3.5 text-slate-400" />
                                    ) : (
                                      <Train className="h-3.5 w-3.5 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="dashed-line h-[2px] w-4 shrink-0 bg-slate-200"></div>
                                </div>
                              ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Map Thumbnail + Dialog */}
                  <div className="min-w-0 lg:w-[44%]">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="group relative h-24 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm transition-all hover:shadow-md lg:h-full">
                          {/* Map Image Placeholder / Background */}
                          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center"></div>
                          
                          {/* Overlay Content */}
                          <div className="relative flex h-full flex-col items-center justify-center text-white">
                            <div className="mb-1 rounded-full bg-white/20 p-2 backdrop-blur-md transition-transform group-hover:scale-110">
                              <Globe2 className="h-5 w-5" />
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
                              View full map <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden bg-slate-950 border-slate-800 [&_svg]:text-white">
                        <DialogHeader className="absolute top-4 left-6 z-10">
                          <DialogTitle className="text-white text-xl font-bold bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                            3D Trip Journey
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="h-full w-full">
                          {activeState.mapPoints || activeState.mapRoute ? (
                            <TripMap 
                              cityPoints={mapCityPoints} 
                              attractionPoints={attractionPoints}
                              isDetailPanelOpen={isDetailPanelOpen}
                              setIsDetailPanelOpen={setIsDetailPanelOpen}
                              selectedPlace={selectedPlace}
                              setSelectedPlace={setSelectedPlace}
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center text-white space-y-4">
                              <Globe2 className="h-12 w-12 text-slate-500 animate-pulse" />
                              <p className="text-slate-400">Waiting for route data to ignite the map...</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Day Plans, Transportation, Accommodation - Only show when trip is generated */}
            {activeState.tripTitle && (
            <>
            <Card id="day-plans-section" className="border border-slate-200 bg-white/90 shadow transition-all duration-500">
              <CardHeader className="space-y-2 pb-4">
                <div className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    Day Plans
                    {selectedCity && (
                      <span className="ml-2 text-sm font-normal text-blue-600">
                        • {selectedCity}
                      </span>
                    )}
                  </CardTitle>
                  {selectedCity && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCity(null)}
                      className="text-xs text-slate-600 hover:text-slate-900"
                    >
                      Show All
                    </Button>
                  )}
                </div>
                
                {/* Date Range */}
                {getDateRange() && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>{getDateRange()}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {renderDayPlans(filteredDayPlans)}
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white/90 shadow">
              <CardHeader className="flex flex-row items-center justify-between p-0 px-4 pt-2 pb-1">
                <div className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-slate-700" />
                  <CardTitle className="text-lg">
                    Transportation
                    {selectedCity && (
                      <span className="ml-2 text-sm font-normal text-blue-600">
                        • {selectedCity}
                      </span>
                    )}
                  </CardTitle>
                </div>
                {selectedCity && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCity(null)}
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Show All
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4 p-0 px-4 pt-2 pb-3">
                {(filteredTransportation ?? []).map((leg, idx) => (
                  <div
                    key={`trans-${idx}`}
                    className="relative rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600"
                      >
                        {leg.mode || 'Transport'}
                      </Badge>
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </div>
                    
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-1 flex-col">
                        <h4 className="text-sm font-bold text-slate-900">
                          {(leg.mode || '').toLowerCase().includes('flight')
                            ? `Flight from ${leg.from} to ${leg.to}`
                            : `${leg.from} → ${leg.to}`}
                        </h4>
                        <p className="text-xs text-slate-500">{leg.time ?? 'Flexible time'}</p>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-bold text-slate-900">{leg.priceEstimate ?? '—'}</p>
                        <p className="text-[10px] text-slate-400">Total for {activeState.travellers ?? 1} travellers</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 border-t border-slate-50 pt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                        <span>{leg.to}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>Economy</span>
                      </div>
                    </div>
                  </div>
                ))}
                {!(filteredTransportation?.length) && (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Plane className="mb-2 h-8 w-8 text-slate-200" />
                    {selectedCity ? (
                      <>
                        <p className="text-sm text-gray-500 mb-2">No transportation found for {selectedCity}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCity(null)}
                          className="text-xs"
                        >
                          Show all cities
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No transportation yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white/90 shadow">
              <CardHeader className="flex flex-row items-center justify-between p-0 px-4 pt-2 pb-1">
                <div className="flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-slate-700" />
                  <CardTitle className="text-lg">
                    Accommodation
                    {selectedCity && (
                      <span className="ml-2 text-sm font-normal text-blue-600">
                        • {selectedCity}
                      </span>
                    )}
                  </CardTitle>
                </div>
                {selectedCity && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCity(null)}
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Show All
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4 p-0 px-4 pt-2 pb-3">
                {(filteredAccommodation ?? []).map((stay, idx) => {
                  // Find the original index in the full accommodation array (for proper caching/updating)
                  const originalIndex = activeState.accommodation?.findIndex(a => a.name === stay.name && a.location === stay.location) ?? idx;
                  
                  return (
                    <AccommodationCard
                      key={`stay-${originalIndex}`}
                      accommodation={{
                        name: stay.name,
                        location: stay.location,
                        city: stay.city || '',
                        checkIn: stay.checkIn || '',
                        checkOut: stay.checkOut || '',
                        nights: stay.nights || 1,
                        pricePerNight: stay.pricePerNight || 'NZ$0',
                        totalPrice: stay.totalPrice || 'NZ$0',
                        rating: stay.rating,
                        reviewCount: stay.reviewCount,
                        hotelType: stay.hotelType,
                        amenities: stay.amenities,
                        coords: stay.coords || { lat: 0, lng: 0 },
                        imageQuery: stay.imageQuery,
                        imageUrl: stay.imageUrl,
                      }}
                      onView={() => {
                        // TODO: Could open a detail panel similar to AttractionDetailPanel
                        console.log('[AIPlanner] View accommodation:', stay.name);
                      }}
                      onChange={() => handleChangeAccommodation(originalIndex)}
                      onRemove={() => handleRemoveAccommodation(originalIndex)}
                    />
                  );
                })}
                {!(filteredAccommodation?.length) && (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Hotel className="mb-2 h-8 w-8 text-slate-200" />
                    {selectedCity ? (
                      <>
                        <p className="text-sm text-gray-500 mb-2">No accommodation found in {selectedCity}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCity(null)}
                          className="text-xs"
                        >
                          Show all cities
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No accommodation yet.</p>
                    )}
                  </div>
                )}
                
                {/* Navigation Buttons */}
                {(previousCity || nextCity) && (
                  <div className="mt-2 flex justify-center gap-3 border-t border-slate-100 pt-2 -mb-2">
                    {/* Previous City Button */}
                    {previousCity && (
                      <Button 
                        onClick={() => {
                          setSelectedCity(previousCity);
                          // Smooth scroll back to top of section
                          document.getElementById('day-plans-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="group flex items-center gap-2.5 bg-slate-600 px-5 py-4 text-white hover:bg-slate-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="rounded-full bg-white/20 p-1.5 group-hover:-translate-x-1 transition-transform">
                          <ArrowLeft className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-[9px] uppercase tracking-wide opacity-70">Previous Destination</p>
                          <p className="text-base font-bold">View {previousCity} Plan</p>
                        </div>
                      </Button>
                    )}
                    
                    {/* Next City Button */}
                    {nextCity && (
                      <Button 
                        onClick={() => {
                          setSelectedCity(nextCity);
                          // Smooth scroll back to top of section
                          document.getElementById('day-plans-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="group flex items-center gap-2.5 bg-blue-600 px-5 py-4 text-white hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="text-left">
                          <p className="text-[9px] uppercase tracking-wide opacity-70">Next Destination</p>
                          <p className="text-base font-bold">View {nextCity} Plan</p>
                        </div>
                        <div className="rounded-full bg-white/20 p-1.5 group-hover:translate-x-1 transition-transform">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white/90 shadow">
              <CardHeader>
                <CardTitle className="text-lg">Media</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {(activeState.media?.photos ?? []).map((url, idx) => (
                  <div key={`photo-${idx}`} className="relative h-28 w-40 overflow-hidden rounded-md">
                    <img src={url} alt="trip" className="h-full w-full object-cover" />
                  </div>
                ))}
                {(activeState.media?.videos ?? []).map((url, idx) => (
                  <a
                    key={`video-${idx}`}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs text-blue-700"
                  >
                    <Video className="h-3 w-3" />
                    Video {idx + 1}
                  </a>
                ))}
                {!activeState.media?.photos?.length && !activeState.media?.videos?.length && (
                  <p className="text-sm text-gray-500">No media yet.</p>
                )}
              </CardContent>
            </Card>
            </>
            )}
          </div>
        </div>
      </div>

      {/* Shared Detail Panel */}
      <PlaceDetailPanel
        isOpen={isDetailPanelOpen}
        onClose={() => setIsDetailPanelOpen(false)}
        placeData={selectedPlace}
      />

      {/* Attraction Detail Panel (from Day Plans) */}
      <AttractionDetailPanel
        isOpen={isAttractionDetailOpen}
        onClose={() => setIsAttractionDetailOpen(false)}
        attraction={selectedAttraction}
      />

      {/* Activity Change Panel */}
      {changingActivity && (
        <ActivityChangePanel
          isOpen={isChangePanelOpen}
          onClose={() => {
            setIsChangePanelOpen(false);
            setChangingActivity(null);
          }}
          currentActivity={changingActivity.activity}
          dayNumber={changingActivity.dayNumber}
          activityIndex={changingActivity.activityIndex}
          onReplace={handleReplaceActivity}
          isAdding={changingActivity.isAdding || false}
          cachedAlternatives={(() => {
            const cacheKey = `${changingActivity.dayNumber}-${changingActivity.activityIndex}`;
            const cached = alternativesCache[cacheKey];
            console.log('[AIPlanner] Passing cached alternatives:', {
              cacheKey,
              cached: cached?.length || 0,
              allCacheKeys: Object.keys(alternativesCache),
            });
            return cached;
          })()}
        />
      )}

      {/* Accommodation Change Panel */}
      {changingAccommodation && (
        <AccommodationChangePanel
          isOpen={isAccommodationChangePanelOpen}
          onClose={() => {
            setIsAccommodationChangePanelOpen(false);
            setChangingAccommodation(null);
          }}
          currentAccommodation={{
            name: changingAccommodation.accommodation.name,
            location: changingAccommodation.accommodation.location,
            city: changingAccommodation.accommodation.city || '',
            coords: changingAccommodation.accommodation.coords || { lat: 0, lng: 0 },
            checkIn: changingAccommodation.accommodation.checkIn || '',
            checkOut: changingAccommodation.accommodation.checkOut || '',
            nights: changingAccommodation.accommodation.nights || 1,
          }}
          onReplace={handleReplaceAccommodation}
          cachedAlternatives={(() => {
            const cacheKey = String(changingAccommodation.accommodationIndex);
            const cached = accommodationAlternativesCache[cacheKey];
            console.log('[AIPlanner] Passing cached accommodation alternatives:', {
              cacheKey,
              cached: cached?.length || 0,
            });
            return cached;
          })()}
        />
      )}
    </div>
  );
}
