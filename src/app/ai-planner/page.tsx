'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import CharizardOrb from '@/components/CharizardOrb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TripMap from '@/components/TripMap';
import PlaceDetailPanel from '@/components/PlaceDetailPanel';

type Coordinates = { lat: number; lng: number };
type DayPlan = {
  day: number;
  date?: string;
  title: string;
  summary?: string;
  weather?: { text?: string; tempC?: number };
  city?: string; // Added for city filtering
  activities: Array<{
    time?: string;
    title: string;
    desc?: string;
    location?: string;
    coords?: Coordinates;
    type?: 'attraction' | 'food' | 'hotel';
    rating?: number;
    reviewCount?: number;
    duration?: string;
    price?: string;
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
    pricePerNight?: number;
    nights?: number;
    coords?: Coordinates;
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
const ActivityCard = ({ activity, onClick }: { activity: any, onClick: () => void }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
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
      onClick={onClick}
      className="group flex cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md"
    >
      {/* Left: Image */}
      <div className="relative h-28 w-32 shrink-0 overflow-hidden bg-slate-100 sm:h-32 sm:w-40">
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
        {isLoadingImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {/* Right: Info */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h4 className="line-clamp-1 text-sm font-bold text-slate-900 sm:text-base">
            {activity.title}
          </h4>
          <MoreHorizontal className="h-4 w-4 shrink-0 text-slate-300" />
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
  const dayPlansRef = useRef<HTMLDivElement>(null);

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
            const desc = (act.desc || '').toLowerCase();
            const combined = `${title} ${location} ${desc}`;
            
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
      const data = await res.json();
      console.log('[handleGenerate] Received itinerary:', data);
      if (data.error) {
        throw new Error(data.error);
      }
      setItinerary(data?.data ?? null);
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

  const handleActivityClick = (activity: any) => {
    console.log('[AIPlanner] Activity clicked:', activity.title);
    setSelectedPlace(activity);
    setIsDetailPanelOpen(true);
  };

  const renderDayPlans = (plans?: DayPlan[]) => {
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
        {plans.map((day) => (
          <div key={day.day} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-100"></div>
              <h3 className="text-base font-bold text-slate-800">
                Day {day.day}: {day.title}
              </h3>
              <div className="h-px flex-1 bg-slate-100"></div>
            </div>
            
            {day.summary && (
              <p className="px-2 text-xs text-slate-500 italic">{day.summary}</p>
            )}

            <div className="grid gap-3">
              {(day.activities ?? []).map((act, idx) => (
                <ActivityCard 
                  key={`${day.day}-${idx}`} 
                  activity={act} 
                  onClick={() => handleActivityClick(act)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-10 text-black">
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
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-10">
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
          <div className="mt-4 min-w-0 space-y-4 lg:mt-8">
            {/* Trip Overview Refactored */}
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

            <Card id="day-plans-section" className="border border-slate-200 bg-white/90 shadow transition-all duration-500">
              <CardHeader className="flex flex-row items-center justify-between">
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
                {(filteredAccommodation ?? []).map((stay, idx) => (
                  <div key={`stay-${idx}`} className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col sm:flex-row">
                      <div className="h-32 w-full bg-slate-100 sm:h-auto sm:w-32 flex items-center justify-center">
                        <Hotel className="h-8 w-8 text-slate-300" />
                      </div>
                      
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-1 flex items-start justify-between">
                          <h4 className="text-sm font-bold text-slate-900">{stay.name}</h4>
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </div>
                        
                        <div className="mb-3 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" />
                          <span>{stay.location}</span>
                        </div>

                        <div className="mt-auto flex items-end justify-between">
                          <div className="flex items-center gap-1 text-[11px] font-medium text-green-600">
                            <span className="rounded bg-green-50 px-1.5 py-0.5">9.2 Wonderful</span>
                            <span className="text-slate-400 font-normal underline">1,240 reviews</span>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">
                              {stay.pricePerNight ? `NZ$${stay.pricePerNight}` : '—'}
                            </p>
                            <p className="text-[10px] text-slate-400">/per night</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
          </div>
        </div>
      </div>

      {/* Shared Detail Panel */}
      <PlaceDetailPanel
        isOpen={isDetailPanelOpen}
        onClose={() => setIsDetailPanelOpen(false)}
        placeData={selectedPlace}
      />
    </div>
  );
}
