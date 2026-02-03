'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  Sparkles,
  Send,
  MapPin,
  Calendar,
  Users,
  Globe2,
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
  Save,
  Check,
  Share2,
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
import ProgressIndicator, { type ProgressStep, type StepStatus } from '@/components/ProgressIndicator';
import AccommodationCard from '@/components/AccommodationCard';
import AccommodationChangePanel from '@/components/AccommodationChangePanel';
import TransportationCard from '@/components/TransportationCard';
import TravelSafetyCard from '@/components/TravelSafetyCard';
import ThingsToKnowCard from '@/components/ThingsToKnowCard';
import DailyRouteMap from '@/components/DailyRouteMap';

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
    imageUrl?: string;
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
  origin?: string;
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
        if (!res.ok) {
          console.warn('[ActivityCard] Failed to fetch image, status:', res.status);
          return;
        }
        const data = await res.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        // Silently handle image fetch errors - this is not critical functionality
        console.warn('[ActivityCard] Image fetch failed (non-critical):', err instanceof Error ? err.message : 'Unknown error');
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
              className={`flex items-center gap-1 rounded-lg bg-blue-500 px-2 py-1 text-xs font-medium text-white transition-all hover:bg-blue-600 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
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

// Progress indicator steps - defined outside component to avoid re-creation on each render
const GENERATION_STEPS_DATA: ProgressStep[] = [
  { id: 1, label: 'Understanding your preferences', status: 'pending', estimatedDuration: 1200 },
  { id: 2, label: 'Planning destinations and timing', status: 'pending', estimatedDuration: 1800 },
  { id: 3, label: 'Searching places & attractions', status: 'pending', estimatedDuration: 4000 },
  { id: 4, label: 'Checking travel safety updates', status: 'pending', estimatedDuration: 2500 },
  { id: 5, label: 'Generating daily itinerary', status: 'pending', estimatedDuration: 6000 },
];

export default function AIPlanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
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
  const [isSaving, setIsSaving] = useState(false);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null); // City filter state
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // NEW: Selected day for route highlighting
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false); // NEW: Control map dialog
  const [isDailyRouteMapOpen, setIsDailyRouteMapOpen] = useState(false); // NEW: Control daily route map
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isChangePanelOpen, setIsChangePanelOpen] = useState(false);
  const [changingActivity, setChangingActivity] = useState<{
    dayNumber: number;
    activityIndex: number;
    activity: any;
    isAdding?: boolean; // true for add mode, false/undefined for replace mode
  } | null>(null);

  // Share to community state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareForm, setShareForm] = useState<{
    title: string;
    description: string;
    highlights: string[];
    dayGuides: Array<{
      dayNumber: number;
      dayTitle: string;
      guide: string;
      activities: Array<{
        name: string;
        imageUrl?: string;
        time?: string;
        location?: string;
      }>;
    }>;
  }>({
    title: '',
    description: '',
    highlights: [],
    dayGuides: [],
  });
  const [isAttractionDetailOpen, setIsAttractionDetailOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<any>(null);
  const [isAccommodationChangePanelOpen, setIsAccommodationChangePanelOpen] = useState(false);
  const [activityImageCache, setActivityImageCache] = useState<Record<string, string>>({});
  const [changingAccommodation, setChangingAccommodation] = useState<{
    accommodationIndex: number;
    accommodation: any;
  } | null>(null);

  // Progress indicator state
  const GENERATION_STEPS = GENERATION_STEPS_DATA.map(step => ({ ...step }));
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(GENERATION_STEPS);
  const dayPlansRef = useRef<HTMLDivElement>(null);

  // Alternatives cache: { "dayNumber-activityIndex": [...alternatives] }
  const [alternativesCache, setAlternativesCache] = useState<Record<string, any[]>>({});
  const [isCaching, setIsCaching] = useState(false);

  // Accommodation alternatives cache: { "accommodationIndex": [...alternatives] }
  const [accommodationAlternativesCache, setAccommodationAlternativesCache] = useState<Record<string, any[]>>({});
  const [isCachingAccommodation, setIsCachingAccommodation] = useState(false);

  const activeState = useMemo(() => itinerary || plannerState, [itinerary, plannerState]);

  // Save trip function
  const handleSaveTrip = async () => {
    if (!isLoaded || !user) {
      toast.error('Please sign in to save your trip');
      router.push('/auth/signin');
      return;
    }

    if (!activeState.tripTitle || !activeState.destination) {
      toast.error('Please generate an itinerary first');
      return;
    }

    setIsSaving(true);

    try {
      const destination = Array.isArray(activeState.destination)
        ? activeState.destination.join(', ')
        : activeState.destination;

      const response = await fetch('/api/saved-trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeState.tripTitle,
          destination: destination,
          thumbnailUrl: heroImageUrl || null,
          plannerState: JSON.stringify(activeState),
          chatHistory: JSON.stringify(messages),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save trip');
      }

      const savedTrip = await response.json();
      setSavedTripId(savedTrip.id);
      toast.success('Trip saved successfully! 🎉', {
        description: 'You can view it in My Trips',
        action: {
          label: 'View My Trips',
          onClick: () => router.push('/trips/saved'),
        },
      });
    } catch (error) {
      console.error('[Save Trip] Error:', error);
      toast.error('Failed to save trip. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Share to community function
  const handleShareToCommunity = async () => {
    if (!isLoaded || !user) {
      toast.error('Please sign in to share your trip');
      router.push('/auth/signin');
      return;
    }

    if (!activeState.tripTitle || !activeState.destination) {
      toast.error('Please generate an itinerary first');
      return;
    }

    // Prepare day guides from itinerary
    const dayGuides = activeState.dayPlans?.map((day, index) => ({
      dayNumber: index + 1,
      dayTitle: day.title || `Day ${index + 1}`,
      guide: '', // User will fill this
      activities: day.activities?.map(act => ({
        name: act.title || '',
        imageUrl: act.imageUrl || activityImageCache[act.title || ''] || undefined,
        time: act.time,
        location: act.location,
      })) || [],
    })) || [];

    // Open share dialog with pre-filled data
    setShareForm({
      title: shareForm.title || activeState.tripTitle || '',
      description: shareForm.description || '',
      highlights: shareForm.highlights.length > 0 ? shareForm.highlights : [],
      dayGuides: dayGuides,
    });
    setIsShareDialogOpen(true);
  };

  const handleShareSubmit = async () => {
    if (!shareForm.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsSharing(true);

    try {
      const destination = Array.isArray(activeState.destination)
        ? activeState.destination.join(', ')
        : activeState.destination;

      const duration = activeState.summary?.days
        ? `${activeState.summary.days} days`
        : activeState.dates?.durationDays
          ? `${activeState.dates.durationDays} days`
          : '1 day';

      const response = await fetch('/api/community-trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: shareForm.title,
          destination: destination,
          thumbnailUrl: heroImageUrl || null,
          duration: duration,
          description: shareForm.description,
          plannerState: activeState,
          highlights: shareForm.highlights,
          dayGuides: shareForm.dayGuides, // 新增：每天的攻略
          userName: user?.fullName || user?.firstName || 'Anonymous',
          userAvatar: user?.imageUrl || null,
          sourceType: 'ai-planner',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to share trip');
      }

      const sharedTrip = await response.json();
      toast.success('Trip shared to community! 🌟', {
        description: 'Others can now discover your journey',
        action: {
          label: 'View in Community',
          onClick: () => router.push(`/community-trips/${sharedTrip.id}`),
        },
      });

      // Reset all dialog and map states
      setIsShareDialogOpen(false);
      setIsDailyRouteMapOpen(false);
      setSelectedDay(null);

    } catch (error) {
      console.error('[Share Trip] Error:', error);
      toast.error('Failed to share trip. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

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

  // NEW: Generate daily routes for map visualization
  const dayRoutes = useMemo(() => {
    if (!activeState.dayPlans || activeState.dayPlans.length === 0) {
      console.log('[dayRoutes] No day plans available');
      return [];
    }

    const routes = activeState.dayPlans.map((dayPlan) => {
      // Check if activities array exists
      if (!dayPlan.activities || !Array.isArray(dayPlan.activities)) {
        return {
          day: dayPlan.day,
          activities: []
        };
      }

      const activities = dayPlan.activities
        .filter((act) => act.coords && act.coords.lat && act.coords.lng)
        .map((act) => ({
          name: act.title || 'Activity',
          lat: act.coords!.lat,
          lng: act.coords!.lng,
          type: act.type
        }));

      return {
        day: dayPlan.day,
        activities
      };
    }).filter(route => route.activities.length >= 2); // Only include days with at least 2 waypoints

    console.log('[dayRoutes] Generated routes for', routes.length, 'days');
    return routes;
  }, [activeState.dayPlans]);

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

  // Preload activity images when itinerary changes
  useEffect(() => {
    const preloadImages = async () => {
      if (!activeState?.dayPlans || !Array.isArray(activeState.dayPlans)) return;

      const titlesToPreload = activeState.dayPlans.flatMap(day =>
        (day?.activities && Array.isArray(day.activities))
          ? day.activities.map(act => act.title).filter(Boolean)
          : []
      ) as string[];

      console.log('[ImagePreload] Starting preload for', titlesToPreload.length, 'activities');

      // Preload images in background
      for (const title of titlesToPreload) {
        if (title && !activityImageCache[title]) {
          try {
            let query = title;
            const prefixPatterns = [
              /^(Dinner|Lunch|Breakfast|Brunch)\s+at\s+/i,
              /^(Visit|Explore|Tour|See|Discover|Experience)\s+/i,
              /\+.*$/,
              /\s*\(.*\)$/,
            ];

            for (const pattern of prefixPatterns) {
              query = query.replace(pattern, '');
            }

            query = query.split(/[-,]/)[0].trim();
            const words = query.split(' ').slice(0, 4).join(' ');

            const res = await fetch(`/api/unsplash/search?city=${encodeURIComponent(words)}`);
            const data = await res.json();

            if (data.imageUrl) {
              setActivityImageCache(prev => ({ ...prev, [title]: data.imageUrl }));
            }
          } catch (err) {
            console.error('[ImagePreload] Error for', title, ':', err);
          }
        }
      }
    };

    preloadImages();
  }, [activeState?.dayPlans, activityImageCache]);

  // Preload activity alternatives when itinerary is generated or loaded
  useEffect(() => {
    const preloadActivityAlternatives = async () => {
      if (!activeState?.dayPlans || !Array.isArray(activeState.dayPlans)) return;
      if (isCaching) return; // Prevent concurrent caching

      // Extract unique cities from day plans
      const cities = new Set<string>();
      activeState.dayPlans.forEach(day => {
        if (day.city) {
          cities.add(day.city);
        }
      });

      if (cities.size === 0) {
        console.log('[ActivityCache] No cities found in day plans');
        return;
      }

      console.log('[ActivityCache] Starting preload for cities:', Array.from(cities));
      setIsCaching(true);

      try {
        // Preload alternatives for each city
        for (const city of cities) {
          // Check if already cached for this city
          const cacheKey = `city-${city}`;
          if (alternativesCache[cacheKey]) {
            console.log('[ActivityCache] Already cached for:', city);
            continue;
          }

          try {
            console.log('[ActivityCache] Fetching alternatives for:', city);
            const response = await fetch('/api/ai-planner/search-activities', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: 'Popular attractions and activities',
                city,
                context: {},
              }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                setAlternativesCache(prev => ({
                  ...prev,
                  [cacheKey]: data.results,
                }));
                console.log('[ActivityCache] Cached', data.results.length, 'alternatives for:', city);
              }
            }
          } catch (err) {
            console.error('[ActivityCache] Error fetching alternatives for', city, ':', err);
          }

          // Small delay between requests to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } finally {
        setIsCaching(false);
        console.log('[ActivityCache] Preload complete');
      }
    };

    // Only preload when itinerary exists and we haven't cached yet
    if (activeState?.dayPlans?.length && Object.keys(alternativesCache).length === 0) {
      preloadActivityAlternatives();
    }
  }, [activeState?.dayPlans, alternativesCache, isCaching]);

  // Load saved trip from URL parameter (tripId)
  useEffect(() => {
    const tripId = searchParams?.get('tripId');
    if (!tripId || !isLoaded || !user) return;

    const loadSavedTrip = async () => {
      try {
        console.log('[LoadTrip] Loading saved trip:', tripId);
        const response = await fetch(`/api/saved-trips/${tripId}`);

        if (!response.ok) {
          throw new Error('Failed to load trip');
        }

        const savedTrip = await response.json();

        // Restore planner state
        let restoredState: TripState | null = null;
        if (savedTrip.plannerState) {
          restoredState = typeof savedTrip.plannerState === 'string'
            ? JSON.parse(savedTrip.plannerState)
            : savedTrip.plannerState;
          if (restoredState) {
            setPlannerState(restoredState);
            console.log('[LoadTrip] Restored planner state:', restoredState.tripTitle);
          }
        }

        // Restore chat history
        let hasExistingChat = false;
        if (savedTrip.chatHistory) {
          const restoredMessages = typeof savedTrip.chatHistory === 'string'
            ? JSON.parse(savedTrip.chatHistory)
            : savedTrip.chatHistory;

          // Check if there's meaningful chat history (more than just the initial greeting)
          if (restoredMessages.length > 1) {
            setMessages(restoredMessages);
            hasExistingChat = true;
            console.log('[LoadTrip] Restored', restoredMessages.length, 'messages');
          }
        }

        // If no chat history (imported trip or new trip), generate initial greeting with recommendations
        if (!hasExistingChat && restoredState) {
          const destination = Array.isArray(restoredState.destination)
            ? restoredState.destination.join(' and ')
            : restoredState.destination || 'your destination';

          const tripTitle = restoredState.tripTitle || savedTrip.title || 'your trip';
          const duration = restoredState.dates?.durationDays || restoredState.summary?.days;

          let greetingMessage = `Hey! 🔥 Welcome back to **${tripTitle}**!\n\n`;
          greetingMessage += `I see you're planning an adventure to **${destination}**`;

          if (duration) {
            greetingMessage += ` for **${duration} days**`;
          }

          greetingMessage += `! Excited to help you make the most of this journey.\n\n`;
          greetingMessage += `**Here's what I can help you with:**\n`;
          greetingMessage += `✨ Discover hidden gems and local favorites\n`;
          greetingMessage += `🗺️ Optimize your daily routes\n`;
          greetingMessage += `🏨 Find the perfect accommodations\n`;
          greetingMessage += `🍽️ Recommend authentic dining experiences\n`;
          greetingMessage += `💡 Share insider tips and local insights\n\n`;
          greetingMessage += `What would you like to explore or adjust in your itinerary?`;

          setMessages([{
            type: 'ai',
            text: greetingMessage,
          }]);
          console.log('[LoadTrip] Generated initial greeting for imported trip');
        }

        // Mark as already saved
        setSavedTripId(tripId);
        toast.success('Trip loaded successfully!');
      } catch (error) {
        console.error('[LoadTrip] Error:', error);
        toast.error('Failed to load trip');
      }
    };

    loadSavedTrip();
  }, [searchParams, isLoaded, user]);

  // Handle initial message from URL parameter
  useEffect(() => {
    const initialMessage = searchParams?.get('initialMessage');
    const tripId = searchParams?.get('tripId');

    // Don't auto-send message if loading a saved trip
    if (tripId) return;

    if (initialMessage && messages.length === 1) {
      // Only auto-send if we haven't started chatting yet
      setInput(initialMessage);

      // Auto-send the message after a brief delay
      const timer = setTimeout(async () => {
        const userText = initialMessage.trim();
        setMessages((prev) => [...prev, { type: 'user', text: userText }]);
        setInput('');
        setIsChatting(true);

        try {
          const res = await fetch('/api/ai-planner/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{
                type: 'ai',
                text: "Hey there! I'm Charizard 🔥 Your AI travel co-pilot. Ready to ignite your next adventure? Tell me where you're dreaming of going!",
              }],
              input: userText
            }),
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
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchParams, messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { type: 'user', text: userText }]);
    setInput('');

    // Detect if this is likely a trip generation request
    // (when user has filled in key fields like destination, dates, or explicitly asks for itinerary)
    const isLikelyGeneration =
      plannerState.destination ||
      plannerState.dates?.start ||
      /\b(plan|itinerary|trip|generate|create|help me plan|suggest|recommend)\b/i.test(userText);

    if (isLikelyGeneration) {
      setIsGenerating(true);
      setProgressSteps(GENERATION_STEPS_DATA.map(step => ({ ...step, status: 'pending' })));
      simulateProgress();
    } else {
      setIsChatting(true);
    }

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

      // If we weren't already showing progress and API returned plannerState
      if (!isLikelyGeneration && stateUpdate && Object.keys(stateUpdate).length > 0) {
        setIsGenerating(true);
        setProgressSteps(GENERATION_STEPS_DATA.map(step => ({ ...step, status: 'pending' })));
        simulateProgress();
      }

      // API completed - mark all steps as completed
      if (isLikelyGeneration || (stateUpdate && Object.keys(stateUpdate).length > 0)) {
        setProgressSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));

        setTimeout(() => setIsGenerating(false), 500);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { type: 'ai', text: 'Oops, something went wrong.' }]);
      setIsGenerating(false);
    } finally {
      setIsChatting(false);
    }
  };

  // Update progress step status
  const updateStepStatus = useCallback((stepId: number, status: StepStatus) => {
    setProgressSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, status } : step
      )
    );
  }, []);

  // Simulate progress animation - but keep last step loading until API completes
  const simulateProgress = useCallback(() => {
    let cumulativeDelay = 0;

    GENERATION_STEPS_DATA.forEach((step, index) => {
      // Mark as loading
      setTimeout(() => {
        updateStepStatus(step.id, 'loading');
      }, cumulativeDelay);

      // Mark as completed (except the last step - wait for API)
      cumulativeDelay += step.estimatedDuration || 1000;
      if (index < GENERATION_STEPS_DATA.length - 1) {
        setTimeout(() => {
          updateStepStatus(step.id, 'completed');
        }, cumulativeDelay);
      }
    });
  }, [updateStepStatus]);

  const handleGenerate = async () => {
    // Reset progress steps
    setProgressSteps(GENERATION_STEPS_DATA.map(step => ({ ...step, status: 'pending' })));
    setIsGenerating(true);

    // Start progress simulation
    simulateProgress();

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

      // Force complete all steps when API returns
      setProgressSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));

    } catch (err: any) {
      console.error('[handleGenerate] Error:', err);
      setMessages((prev) => [
        ...prev,
        { type: 'ai', text: `Unable to generate itinerary: ${err.message || 'Please try again.'}` },
      ]);
      // Reset progress on error
      setProgressSteps(GENERATION_STEPS_DATA.map(step => ({ ...step, status: 'pending' })));
    } finally {
      // Delay hiding to show completion state
      setTimeout(() => setIsGenerating(false), 500);
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
        {plans
          .filter(day => day.activities && day.activities.length > 0) // Only show days with activities
          .map((day, dayIdx) => {
            const dayNumber = typeof day.day === 'number' ? day.day : dayIdx + 1;
            const dateInfo = getDateForDay(dayNumber);

            return (
              <div key={`${dayNumber}-${day.title ?? 'untitled'}-${dayIdx}`} className="space-y-3">
                {/* Day Header */}
                <div className="space-y-1">
                  <div className="border-b border-slate-100 pb-1 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">
                      Day {dayNumber}: {day.title}
                    </h3>

                    {/* NEW: View Day Route Button */}
                    <button
                      onClick={() => {
                        setSelectedDay(dayNumber);
                        setIsDailyRouteMapOpen(true); // Open daily route map
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200"
                      title="Click to view this day's route on map"
                    >
                      <MapPin className="h-3 w-3" />
                      View route
                    </button>
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
    <div className="relative min-h-screen pt-24 text-black">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/AI-BACKGROUND.jpg')",
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-slate-800/70" />
      </div>

      {/* Content */}
      <div className="relative z-10">
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
      <div className="w-full px-4 pb-6 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[30%_1fr]">
          {/* Left: Chat */}
          <Card className="sticky top-24 flex flex-col self-start border-0 backdrop-blur-xl shadow-2xl shadow-slate-900/20 min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] overflow-hidden rounded-3xl relative">
            {/* nepal.jpg Background with overlay - confined to chat panel only */}
            <div className="absolute inset-0 z-0">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/nepal.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              {/* Lighter overlay for better mountain visibility */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/55 via-slate-800/45 to-slate-900/60 backdrop-blur-[1px]" />
            </div>
            
            <CardHeader className="px-6 pt-6 pb-4 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <img
                  src="/images/Pokémon_Charizard_art.png"
                  alt="Charizard AI Travel Assistant"
                  className="h-12 w-auto object-contain drop-shadow-2xl"
                />
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white tracking-tight drop-shadow-lg">Charizard</span>
                  <span className="text-xs text-slate-300 font-medium drop-shadow">AI Travel Assistant</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 px-6 pt-6 pb-6 min-h-0 relative z-10">
              <div className="flex-1 space-y-5 overflow-y-auto pr-2 min-h-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`max-w-[80%] px-5 py-4 text-[15.5px] leading-[1.6] shadow-sm transition-all ${msg.type === 'user'
                          ? 'rounded-[20px] rounded-tr-sm bg-blue-500 text-white font-medium'
                          : 'rounded-[20px] rounded-tl-sm bg-white text-slate-900 font-normal border border-slate-200'
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isChatting && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-3 rounded-[20px] rounded-tl-sm bg-white border border-slate-200 px-5 py-4 text-sm text-slate-600 shadow-sm">
                      <span className="text-xs font-semibold text-slate-600">Thinking</span>
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Where would you like to go?"
                    className="flex-1 h-14 rounded-[20px] border border-slate-300 bg-white text-[15px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all shadow-sm"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isChatting}
                    className="h-14 w-14 rounded-[20px] bg-blue-500 hover:bg-blue-600 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 p-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-medium">{destinationLabel}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    {isGenerating ? 'Generating...' : 'Generate Plan'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Visualization */}
          <div className="min-w-0 space-y-4 self-start">
            {/* State 1: Idle - Show Static Charizard */}
            {!activeState.tripTitle && !isChatting && !isGenerating && (
              <Card className="sticky top-24 flex flex-col self-start border-0 bg-gradient-to-br from-white via-slate-50/30 to-white backdrop-blur-xl shadow-2xl shadow-slate-200/40 min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] overflow-hidden rounded-3xl">
                <CardContent className="flex min-h-0 flex-1 flex-col items-center justify-center p-12 text-center">
                  {/* Static Charizard Image */}
                  <div className="relative mb-8 flex h-64 w-64 items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl"></div>
                    <img
                      src="/charizard/charizard-static.png"
                      alt="Charizard"
                      className="relative h-full w-full object-contain drop-shadow-2xl"
                    />
                  </div>

                  {/* Welcome Text */}
                  <h2 className="mb-3 text-3xl font-bold text-slate-900 tracking-tight">
                    Ready to Explore?
                  </h2>
                  <p className="mb-8 max-w-md text-base text-slate-600 leading-relaxed">
                    Start chatting to create your perfect AI-powered itinerary
                  </p>

                  {/* Example Prompts */}
                  <div className="space-y-3 w-full max-w-sm">
                    <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50 text-sm text-slate-700 font-medium backdrop-blur-sm hover:shadow-md transition-all cursor-default">
                      "Plan a 5-day trip to Tokyo"
                    </div>
                    <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50 text-sm text-slate-700 font-medium backdrop-blur-sm hover:shadow-md transition-all cursor-default">
                      "I want to visit Paris and Rome"
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* State 2: Thinking - Show Animated Charizard */}
            {(isChatting || isGenerating) && !activeState.tripTitle && (
              <Card className="sticky top-24 flex flex-col self-start border-0 bg-gradient-to-br from-white via-slate-50/30 to-white backdrop-blur-xl shadow-2xl shadow-slate-200/40 min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] overflow-hidden rounded-3xl">
                <CardContent className="flex min-h-0 flex-1 flex-col items-center justify-center p-12 text-center">
                  {/* Animated Charizard */}
                  <div className="relative mb-10 flex h-56 w-56 items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <img
                      src="/charizard/charizard-animated.gif"
                      alt="Charizard thinking"
                      className="relative h-full w-full object-contain drop-shadow-2xl"
                    />
                    {/* Fire effect */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                      <div className="flex gap-2">
                        <span className="animate-bounce text-3xl drop-shadow-lg" style={{ animationDelay: '0ms' }}>🔥</span>
                        <span className="animate-bounce text-3xl drop-shadow-lg" style={{ animationDelay: '150ms' }}>🔥</span>
                        <span className="animate-bounce text-3xl drop-shadow-lg" style={{ animationDelay: '300ms' }}>🔥</span>
                      </div>
                    </div>
                  </div>

                  {/* Conditional Content: Progress for generating, static text for chatting */}
                  {isGenerating ? (
                    <>
                      {/* Generating Trip - Show Progress */}
                      <h2 className="mb-8 text-3xl font-bold text-slate-900 tracking-tight">
                        Crafting your perfect journey
                      </h2>

                      {/* Progress Indicator */}
                      <div className="w-full max-w-md">
                        <ProgressIndicator steps={progressSteps} />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Chatting - Static Content */}
                      <h2 className="mb-3 text-3xl font-bold text-slate-900 tracking-tight">
                        Analyzing your request
                      </h2>
                      <p className="text-base text-slate-600">
                        Getting everything ready for you...
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* State 3: Trip Generated - Show Visualization Cards */}
            {activeState.tripTitle && (
              <Card className="relative min-w-0 overflow-hidden border-0 bg-white shadow-2xl shadow-slate-200/50 rounded-3xl">
                {/* Background photo + gradient (only after we have a trip) */}
                {heroImageUrl ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${heroImageUrl})` }}
                    />
                    {/* Darker gradient overlay for better visibility */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-900/40 to-slate-900/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
                  </>
                ) : null}

                <CardHeader className="relative space-y-4 pb-8 pt-8 px-8">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-4xl font-black tracking-tight text-slate-900 mb-2 leading-tight">
                        {activeState.tripTitle || 'Your Dream Journey'}
                      </CardTitle>
                      
                      {/* Statistics badges */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/50 shadow-sm">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-semibold text-slate-900">{activeState.summary?.days || plannerState.dates?.durationDays || '—'} days</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/50 shadow-sm">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold text-slate-900">{activeState.summary?.cities || 1} cities</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/50 shadow-sm">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-semibold text-slate-900">{activeState.summary?.activitiesCount || '—'} activities</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/50 shadow-sm">
                          <Hotel className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-semibold text-slate-900">{activeState.summary?.hotelsCount || '—'} hotels</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/50 shadow-sm">
                          <Plane className="h-4 w-4 text-sky-600" />
                          <span className="text-sm font-semibold text-slate-900">{activeState.summary?.transportsCount || '—'} flights</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 shrink-0">
                      {/* Save Button */}
                      <Button
                        onClick={handleSaveTrip}
                        disabled={isSaving || savedTripId !== null}
                        className={`h-12 px-6 rounded-2xl font-semibold shadow-lg transition-all hover:scale-105 disabled:hover:scale-100 ${savedTripId
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/30'
                            : 'bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/30'
                          }`}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : savedTripId ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Trip
                          </>
                        )}
                      </Button>

                      {/* Share to Community Button */}
                      <Button
                        onClick={handleShareToCommunity}
                        disabled={!activeState.tripTitle}
                        className="h-12 px-6 rounded-2xl font-semibold bg-white hover:bg-slate-50 text-purple-600 border-2 border-purple-600/30 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all hover:scale-105 disabled:hover:scale-100"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative min-w-0 overflow-hidden px-8 py-8">
                  <div className="flex min-w-0 flex-col gap-8 lg:flex-row">
                    {/* Left: Route Flow */}
                    <div className="min-w-0 lg:w-[60%] lg:min-w-[560px]">
                      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-orange-600" />
                        Your Journey
                      </h3>
                      <div className="relative">
                        <div className="w-full max-w-full overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                          <div className="inline-flex min-w-max items-center gap-3">
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
                                      className={`flex h-14 items-center justify-center rounded-2xl px-6 shadow-md transition-all ${isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-105' : 'cursor-default'
                                        } ${isDeparture || isArrival
                                          ? 'border-2 border-slate-200/80 bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm'
                                          : isSelected
                                            ? 'border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/40'
                                            : 'border-2 border-indigo-200/80 bg-white text-slate-900 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                    >
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="whitespace-nowrap text-sm font-bold">{city}</span>
                                        {isStop ? (
                                          <span className={`text-[10px] font-medium uppercase tracking-wider ${isSelected ? 'opacity-90' : 'opacity-60'}`}>
                                            Stop
                                          </span>
                                        ) : isDeparture ? (
                                          <span className="text-[10px] font-medium uppercase tracking-wider opacity-60">
                                            Start
                                          </span>
                                        ) : isArrival ? (
                                          <span className="text-[10px] font-medium uppercase tracking-wider opacity-60">
                                            End
                                          </span>
                                        ) : null}
                                      </div>
                                    </button>
                                  </div>

                                  {idx < arr.length - 1 ? (
                                    <div className="flex shrink-0 items-center px-2">
                                      <div className="h-0.5 w-6 shrink-0 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full"></div>
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm">
                                        {isInternationalTravel(city, arr[idx + 1]) ? (
                                          <Plane className="h-4 w-4 text-orange-600" />
                                        ) : (
                                          <Train className="h-4 w-4 text-blue-600" />
                                        )}
                                      </div>
                                      <div className="h-0.5 w-6 shrink-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full"></div>
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
                    <div className="min-w-0 lg:w-[40%]">
                      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Globe2 className="h-5 w-5 text-blue-600" />
                        Route Map
                      </h3>
                      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
                        <DialogTrigger asChild>
                          <button className="group relative h-32 w-full overflow-hidden rounded-3xl border-2 border-slate-200 bg-slate-900 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] lg:h-full">
                            {/* Map Image Placeholder / Background */}
                            <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center"></div>

                            {/* Overlay Content */}
                            <div className="relative flex h-full flex-col items-center justify-center text-white">
                              <div className="mb-2 rounded-2xl bg-white/20 p-3 backdrop-blur-md transition-transform group-hover:scale-110">
                                <Globe2 className="h-6 w-6" />
                              </div>
                              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/95">
                                View 3D Map <ArrowRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-slate-950 border-slate-800 rounded-3xl [&_svg]:text-white">
                          <DialogHeader className="absolute top-6 left-8 z-10">
                            <DialogTitle className="text-white text-2xl font-bold bg-slate-900/70 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
                              Your Trip Journey
                            </DialogTitle>
                          </DialogHeader>

                          <div className="h-full w-full">
                            {activeState.mapPoints || activeState.mapRoute ? (
                              <TripMap
                                cityPoints={mapCityPoints}
                                attractionPoints={attractionPoints}
                                dayRoutes={dayRoutes}
                                selectedDay={selectedDay}
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

            {/* Travel Safety Alert - Show when trip is generated */}
            {activeState.tripTitle && activeState.destination && (
              <TravelSafetyCard
                destination={selectedCity || (typeof activeState.destination === 'string' ? activeState.destination : activeState.destination[0])}
                dates={activeState.dates?.start && activeState.dates?.end ? {
                  start: activeState.dates.start,
                  end: activeState.dates.end
                } : undefined}
              />
            )}

            {/* Things to Know - Show when trip is generated */}
            {activeState.tripTitle && activeState.destination && (
              <ThingsToKnowCard
                destination={selectedCity || (typeof activeState.destination === 'string' ? activeState.destination : activeState.destination[0])}
                userOrigin={activeState.origin}
              />
            )}

            {/* Day Plans, Transportation, Accommodation - Only show when trip is generated */}
            {activeState.tripTitle && (
              <>
                <Card id="day-plans-section" className="border-0 bg-white shadow-2xl shadow-slate-200/50 rounded-3xl transition-all duration-500">
                  <CardHeader className="space-y-3 pb-6 px-8 pt-8">
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-slate-900">
                            Day-by-Day Plan
                          </CardTitle>
                          {selectedCity && (
                            <span className="text-sm font-medium text-blue-600 flex items-center gap-1.5 mt-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {selectedCity}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedCity && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCity(null)}
                          className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-4 py-2"
                        >
                          Show All Cities
                        </Button>
                      )}
                    </div>

                    {/* Date Range */}
                    {getDateRange() && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/50 w-fit">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">{getDateRange()}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    {renderDayPlans(filteredDayPlans)}
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-2xl shadow-slate-200/50 rounded-3xl">
                  <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
                        <Plane className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                          Transportation
                        </CardTitle>
                        {selectedCity && (
                          <span className="text-sm font-medium text-blue-600 flex items-center gap-1.5 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {selectedCity}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedCity && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCity(null)}
                        className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-4 py-2"
                      >
                        Show All Cities
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 px-8 pb-8">
                    {(filteredTransportation ?? []).map((leg, idx) => {
                      // Find the original index in the full transportation array
                      const originalIndex = activeState.transportation?.findIndex(
                        t => t.from === leg.from && t.to === leg.to && t.mode === leg.mode
                      ) ?? idx;

                      return (
                        <TransportationCard
                          key={`trans-${originalIndex}`}
                          transportation={{
                            mode: leg.mode || 'flight',
                            from: leg.from,
                            to: leg.to,
                            fromCode: (leg as any).fromCode,
                            toCode: (leg as any).toCode,
                            time: leg.time,
                            date: (leg as any).date,
                            priceEstimate: leg.priceEstimate,
                            price: (leg as any).price,
                            flightNumber: (leg as any).flightNumber,
                            airline: (leg as any).airline,
                            airlineCode: (leg as any).airlineCode,
                            duration: (leg as any).duration,
                            stops: (leg as any).stops,
                            aircraft: (leg as any).aircraft,
                            bookingUrl: (leg as any).bookingUrl,
                            coords: leg.coords,
                          }}
                          travellers={activeState.travellers || 2}
                          onView={() => {
                            // TODO: Could open a detail panel
                            console.log('[AIPlanner] View transportation:', leg);
                          }}
                          onRemove={() => {
                            // TODO: Implement remove functionality
                            console.log('[AIPlanner] Remove transportation:', leg);
                          }}
                        />
                      );
                    })}
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

                <Card className="border-0 bg-white shadow-2xl shadow-slate-200/50 rounded-3xl">
                  <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20">
                        <Hotel className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                          Accommodation
                        </CardTitle>
                        {selectedCity && (
                          <span className="text-sm font-medium text-blue-600 flex items-center gap-1.5 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {selectedCity}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedCity && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCity(null)}
                        className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-4 py-2"
                      >
                        Show All Cities
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 px-8 pb-8">
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
            // Try to get cached alternatives based on the day's city
            const dayPlan = activeState?.dayPlans?.find(d => d.day === changingActivity.dayNumber);
            let cachedResults: any[] | undefined;

            // First, try to get the city from the day plan
            if (dayPlan?.city) {
              const cacheKey = `city-${dayPlan.city}`;
              cachedResults = alternativesCache[cacheKey];
              console.log('[AIPlanner] Using cached alternatives for city:', dayPlan.city, '- Found:', cachedResults?.length || 0);
            }

            // If no cached results, try to extract city from activity location
            if (!cachedResults && changingActivity.activity.location) {
              const extractCity = (location: string): string => {
                const parts = location.split(',').map(s => s.trim());
                return parts[parts.length - 1] || parts[0] || '';
              };
              const city = extractCity(changingActivity.activity.location);
              if (city) {
                const cacheKey = `city-${city}`;
                cachedResults = alternativesCache[cacheKey];
                console.log('[AIPlanner] Using cached alternatives for extracted city:', city, '- Found:', cachedResults?.length || 0);
              }
            }

            console.log('[AIPlanner] All cache keys:', Object.keys(alternativesCache));
            return cachedResults;
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

      {/* NEW: Daily Route Map with Google Maps */}
      {isDailyRouteMapOpen && selectedDay !== null && activeState.dayPlans && (
        <DailyRouteMap
          activities={(() => {
            const day = activeState.dayPlans!.find((_, index) => index + 1 === selectedDay);
            if (!day) return [];

            // Filter activities that have valid coordinates and map to DailyRouteMap format
            return day.activities
              .filter(activity => activity.coords?.lat && activity.coords?.lng)
              .map(activity => ({
                name: activity.title || '',
                lat: activity.coords!.lat,
                lng: activity.coords!.lng,
                type: activity.type,
                imageUrl: activity.imageUrl || activityImageCache[activity.title || ''] || undefined
              }));
          })()}
          dayNumber={selectedDay}
          dayTitle={(() => {
            const day = activeState.dayPlans!.find((_, index) => index + 1 === selectedDay);
            return day?.title || `Day ${selectedDay}`;
          })()}
          onClose={() => {
            setIsDailyRouteMapOpen(false);
            setSelectedDay(null);
          }}
          onActivitiesReorder={(reorderedActivities) => {
            console.log('[AIPlanner] Reordering activities for day', selectedDay, ':', reorderedActivities);

            // Update the activities order in the active state
            if (itinerary?.dayPlans) {
              const updatedDayPlans = itinerary.dayPlans.map((day, index) => {
                if (index + 1 === selectedDay) {
                  // Create a map from activity name to original activity
                  const activityMap = new Map(
                    day.activities.map(act => [act.title || '', act])
                  );

                  // Reorder based on the new order, preserving full activity data
                  const reordered = reorderedActivities
                    .map(reorderedAct => activityMap.get(reorderedAct.name))
                    .filter(Boolean) as typeof day.activities;

                  // Add any activities that weren't in the reordered list (shouldn't happen, but safe)
                  const reorderedNames = new Set(reorderedActivities.map(a => a.name));
                  const remaining = day.activities.filter(
                    act => !reorderedNames.has(act.title || '')
                  );

                  return {
                    ...day,
                    activities: [...reordered, ...remaining],
                  };
                }
                return day;
              });

              setItinerary({ ...itinerary, dayPlans: updatedDayPlans });
              console.log('[AIPlanner] Day plan activities reordered successfully');
            } else if (plannerState?.dayPlans) {
              const updatedDayPlans = plannerState.dayPlans.map((day, index) => {
                if (index + 1 === selectedDay) {
                  const activityMap = new Map(
                    day.activities.map(act => [act.title || '', act])
                  );

                  const reordered = reorderedActivities
                    .map(reorderedAct => activityMap.get(reorderedAct.name))
                    .filter(Boolean) as typeof day.activities;

                  const reorderedNames = new Set(reorderedActivities.map(a => a.name));
                  const remaining = day.activities.filter(
                    act => !reorderedNames.has(act.title || '')
                  );

                  return {
                    ...day,
                    activities: [...reordered, ...remaining],
                  };
                }
                return day;
              });

              setPlannerState({ ...plannerState, dayPlans: updatedDayPlans });
              console.log('[AIPlanner] Day plan activities reordered successfully');
            }
          }}
        />
      )}

      {/* Share to Community Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold">Share to Community</DialogTitle>
          </DialogHeader>

          <div
            className="share-dialog-scroll space-y-4 py-4 overflow-y-auto flex-1 pr-2 pl-1"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'transparent transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.scrollbarColor = '#d1d5db transparent';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.scrollbarColor = 'transparent transparent';
            }}
            onScroll={(e) => {
              const target = e.currentTarget;
              target.classList.add('scrolling');
              clearTimeout((target as any).scrollTimeout);
              (target as any).scrollTimeout = setTimeout(() => {
                target.classList.remove('scrolling');
              }, 1000);
            }}
          >
            {/* Preview Image */}
            {heroImageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={heroImageUrl}
                  alt="Trip preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={shareForm.title}
                onChange={(e) => setShareForm({ ...shareForm, title: e.target.value })}
                placeholder="Give your journey a catchy title..."
                className="text-lg"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={shareForm.description}
                onChange={(e) => setShareForm({ ...shareForm, description: e.target.value })}
                placeholder="Share what makes this trip special..."
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {shareForm.description.length}/500 characters
              </p>
            </div>

            {/* Highlights */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Highlights (Optional)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {shareForm.highlights.map((highlight, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {highlight}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setShareForm({
                          ...shareForm,
                          highlights: shareForm.highlights.filter((_, i) => i !== idx),
                        });
                      }}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a highlight (e.g., 'Family-friendly', 'Budget travel')"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      setShareForm({
                        ...shareForm,
                        highlights: [...shareForm.highlights, e.currentTarget.value.trim()],
                      });
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>

            {/* Day-by-Day Travel Guides */}
            {shareForm.dayGuides.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Daily Travel Guides</label>
                  <p className="text-xs text-muted-foreground">
                    Share your experiences and tips for each day. You can use **bold** or *italic* for formatting.
                  </p>
                </div>

                {shareForm.dayGuides.map((dayGuide, dayIndex) => (
                  <div key={dayIndex} className="space-y-3 p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">
                        Day {dayGuide.dayNumber}
                      </Badge>
                      <h4 className="text-sm font-semibold">{dayGuide.dayTitle}</h4>
                    </div>

                    {/* Show activities preview */}
                    <div className="flex flex-wrap gap-2">
                      {dayGuide.activities.slice(0, 3).map((activity, idx) => (
                        <div key={idx} className="text-xs text-muted-foreground bg-white px-2 py-1 rounded border">
                          📍 {activity.name}
                        </div>
                      ))}
                      {dayGuide.activities.length > 3 && (
                        <div className="text-xs text-muted-foreground bg-white px-2 py-1 rounded border">
                          +{dayGuide.activities.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Guide textarea with formatting help */}
                    <div className="space-y-2">
                      <textarea
                        id={`guide-textarea-${dayIndex}`}
                        value={dayGuide.guide}
                        onChange={(e) => {
                          const newDayGuides = [...shareForm.dayGuides];
                          newDayGuides[dayIndex] = { ...dayGuide, guide: e.target.value };
                          setShareForm({ ...shareForm, dayGuides: newDayGuides });
                        }}
                        placeholder="Share your travel guide for this day... Tips: Use **text** for bold, *text* for italic, - for lists"
                        className="min-h-[120px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        maxLength={1000}
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <button
                            type="button"
                            className="hover:text-foreground px-2 py-1 rounded hover:bg-slate-200"
                            onClick={(e) => {
                              e.preventDefault();
                              const textarea = document.getElementById(`guide-textarea-${dayIndex}`) as HTMLTextAreaElement;
                              if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const text = textarea.value;
                                const selectedText = text.substring(start, end);
                                const newText = text.substring(0, start) + `**${selectedText || 'bold text'}**` + text.substring(end);
                                const newDayGuides = [...shareForm.dayGuides];
                                newDayGuides[dayIndex] = { ...dayGuide, guide: newText };
                                setShareForm({ ...shareForm, dayGuides: newDayGuides });
                                // Set cursor position after inserted text
                                setTimeout(() => {
                                  const newPos = start + (selectedText ? selectedText.length + 4 : 11);
                                  textarea.setSelectionRange(newPos, newPos);
                                  textarea.focus();
                                }, 0);
                              }
                            }}
                          >
                            <strong>B</strong> Bold
                          </button>
                          <button
                            type="button"
                            className="hover:text-foreground px-2 py-1 rounded hover:bg-slate-200 italic"
                            onClick={(e) => {
                              e.preventDefault();
                              const textarea = document.getElementById(`guide-textarea-${dayIndex}`) as HTMLTextAreaElement;
                              if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const text = textarea.value;
                                const selectedText = text.substring(start, end);
                                const newText = text.substring(0, start) + `*${selectedText || 'italic text'}*` + text.substring(end);
                                const newDayGuides = [...shareForm.dayGuides];
                                newDayGuides[dayIndex] = { ...dayGuide, guide: newText };
                                setShareForm({ ...shareForm, dayGuides: newDayGuides });
                                // Set cursor position after inserted text
                                setTimeout(() => {
                                  const newPos = start + (selectedText ? selectedText.length + 2 : 13);
                                  textarea.setSelectionRange(newPos, newPos);
                                  textarea.focus();
                                }, 0);
                              }
                            }}
                          >
                            <em>I</em> Italic
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {dayGuide.guide.length}/1000
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="rounded-lg bg-purple-50 p-4 text-sm text-purple-900">
              <p className="font-medium mb-1">Your trip will be shared with the community</p>
              <p className="text-purple-700">
                Other travelers can view, like, comment, and import your itinerary to create their own version.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsShareDialogOpen(false);
                setIsDailyRouteMapOpen(false);
                setSelectedDay(null);
              }}
              disabled={isSharing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShareSubmit}
              disabled={isSharing || !shareForm.title.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share to Community
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
