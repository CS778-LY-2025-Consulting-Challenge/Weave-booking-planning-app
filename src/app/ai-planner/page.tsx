'use client';

import { useMemo, useState } from 'react';
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
} from 'lucide-react';
import CharizardOrb from '@/components/CharizardOrb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TripMap from '@/components/TripMap';

type Coordinates = { lat: number; lng: number };
type DayPlan = {
  day: number;
  date?: string;
  title: string;
  summary?: string;
  weather?: { text?: string; tempC?: number };
  activities: Array<{
    time?: string;
    title: string;
    desc?: string;
    location?: string;
    coords?: Coordinates;
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

  const activeState = useMemo(() => itinerary || plannerState, [itinerary, plannerState]);

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
            day: day.day
          });
          console.log(`[attractionPoints] Day ${day.day}: ${act.title} (type: ${detectedType}) at [${act.coords.lng}, ${act.coords.lat}]`);
        }
      });
    });
    console.log(`[attractionPoints] Total extracted: ${points.length} attractions`);
    return points;
  }, [activeState.dayPlans]);

  // Unified city points for the map (combine AI mapPoints + mock mapRoute, dedupe by name+coords)
  const mapCityPoints = useMemo(() => {
    const combined: { name: string; lat: number; lng: number }[] = [];

    console.log('[mapCityPoints] Building city points...', {
      hasMapRoute: !!activeState.mapRoute,
      mapRoutePoints: activeState.mapRoute?.points?.length || 0,
      hasMapPoints: !!activeState.mapPoints,
      mapPointsCount: activeState.mapPoints?.length || 0,
    });

    // First: mock route points (e.g., Auckland -> Tokyo -> Kyoto -> Auckland)
    if (activeState.mapRoute?.points) {
      activeState.mapRoute.points.forEach((p) => {
        combined.push({ name: p.name, lat: p.coords.lat, lng: p.coords.lng });
        console.log('[mapCityPoints] Added from mapRoute:', p.name);
      });
    }

    // Then: AI mapPoints (e.g., Tokyo -> Kyoto)
    if (activeState.mapPoints && activeState.mapPoints.length > 0) {
      activeState.mapPoints.forEach((p) => {
        const exists = combined.some(
          (c) => c.name === p.name || (Math.abs(c.lat - p.lat) < 1e-4 && Math.abs(c.lng - p.lng) < 1e-4)
        );
        if (!exists) {
          combined.push(p);
          console.log('[mapCityPoints] Added from mapPoints:', p.name);
        } else {
          console.log('[mapCityPoints] Skipped duplicate:', p.name);
        }
      });
    }

    console.log('[mapCityPoints] Final result:', combined.map(p => p.name).join(' → '));
    return combined;
  }, [activeState.mapPoints, activeState.mapRoute]);

  const destinationLabel = useMemo(() => {
    const dest = activeState.destination;
    if (Array.isArray(dest)) return dest.join(', ');
    return dest ?? '—';
  }, [activeState.destination]);

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

  const renderDayPlans = (plans?: DayPlan[]) => {
    if (!plans?.length) return <p className="text-sm text-gray-500">No day plan yet.</p>;
    return (
      <div className="space-y-3">
        {plans.map((day) => (
          <Card key={day.day} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">
                Day {day.day}: {day.title}{' '}
                {day.weather?.text ? (
                  <span className="text-xs font-normal text-gray-500">• {day.weather.text}</span>
                ) : null}
              </CardTitle>
              {day.summary ? <p className="text-sm text-gray-600">{day.summary}</p> : null}
            </CardHeader>
            <CardContent className="space-y-2">
              {(day.activities ?? []).map((act, idx) => (
                <div key={idx} className="rounded-md bg-slate-50 p-2">
                  <p className="text-sm font-semibold">
                    {act.time ? `${act.time} • ` : ''}
                    {act.title}
                  </p>
                  {act.desc ? <p className="text-xs text-gray-600">{act.desc}</p> : null}
                  {act.location ? (
                    <p className="text-xs text-gray-500">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      {act.location}
                    </p>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
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
            <Card className="min-w-0 border border-slate-200 bg-white/90 shadow-lg">
              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {activeState.tripTitle || 'Your Dream Journey'}
                </CardTitle>
                
                {/* Icons & Counts Summary */}
                <div className="min-w-0 lg:w-[56%] lg:min-w-[520px]">
                  <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{activeState.summary?.days || plannerState.dates?.durationDays || '—'} days</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{activeState.summary?.cities || 1} cities</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-slate-400" />
                      <span>{activeState.summary?.activitiesCount || '—'} activities</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Hotel className="h-4 w-4 text-slate-400" />
                      <span>{activeState.summary?.hotelsCount || '—'} hotels</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Plane className="h-4 w-4 text-slate-400" />
                      <span>{activeState.summary?.transportsCount || '—'} transports</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="min-w-0 overflow-hidden bg-white/90 px-6 py-6">
                <div className="flex min-w-0 flex-col gap-6 lg:flex-row">
                  {/* Left: Route Flow */}
                  <div className="min-w-0 lg:w-[56%] lg:min-w-[520px] lg:pr-6">
                    <div className="relative">
                      <div className="w-full max-w-full overflow-x-auto pb-2 route-scroll">
                        <div className="inline-flex min-w-max items-center gap-2">
                          {(activeState.routeFlow || [
                            activeState.departureCity || 'Departure',
                            destinationLabel,
                          ]).map((city, idx, arr) => (
                            <div key={`${city}-${idx}`} className="flex items-center">
                              <div className="shrink-0">
                                <div
                                  className={`flex h-12 items-center justify-center rounded-2xl px-6 shadow-sm transition-all ${
                                    idx === 0 || idx === arr.length - 1
                                      ? 'border border-slate-200 bg-white'
                                      : 'border border-indigo-200 bg-indigo-100 text-indigo-900'
                                  }`}
                                >
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="whitespace-nowrap text-xs font-bold">{city}</span>
                                    {idx > 0 && idx < arr.length - 1 ? (
                                      <span className="text-[10px] opacity-70">Stop</span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              {idx < arr.length - 1 ? (
                                <div className="flex shrink-0 items-center px-0.5">
                                  <div className="dashed-line h-[2px] w-4 shrink-0 bg-slate-200"></div>
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 shadow-inner">
                                    {idx === 0 ? (
                                      <Plane className="h-3.5 w-3.5 text-slate-400" />
                                    ) : (
                                      <Train className="h-3.5 w-3.5 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="dashed-line h-[2px] w-4 shrink-0 bg-slate-200"></div>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fade hint */}
                      {(activeState.routeFlow?.length ?? 0) > 3 ? (
                        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white/90 to-transparent" />
                      ) : null}
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

            <Card className="border border-slate-200 bg-white/90 shadow">
              <CardHeader>
                <CardTitle className="text-lg">Day Plans</CardTitle>
              </CardHeader>
              <CardContent>{renderDayPlans(activeState.dayPlans)}</CardContent>
            </Card>

            {/* ... Rest of the cards (Transportation, Accommodation, Media) remain same ... */}
            <Card className="border border-slate-200 bg-white/90 shadow">
              <CardHeader className="flex flex-row items-center justify-between p-0 px-4 pt-2 pb-1">
                <div className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-slate-700" />
                  <CardTitle className="text-lg">Transportation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-0 px-4 pt-2 pb-3">
                {(activeState.transportation ?? []).map((leg, idx) => (
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
                {!(activeState.transportation?.length) && (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Plane className="mb-2 h-8 w-8 text-slate-200" />
                    <p className="text-sm text-gray-500">No transportation yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white/90 shadow">
              <CardHeader className="flex flex-row items-center justify-between p-0 px-4 pt-2 pb-1">
                <div className="flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-slate-700" />
                  <CardTitle className="text-lg">Accommodation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-0 px-4 pt-2 pb-3">
                {(activeState.accommodation ?? []).map((stay, idx) => (
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
                {!(activeState.accommodation?.length) && (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Hotel className="mb-2 h-8 w-8 text-slate-200" />
                    <p className="text-sm text-gray-500">No accommodation yet.</p>
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
    </div>
  );
}
