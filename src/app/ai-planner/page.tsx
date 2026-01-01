'use client';

'use client';

import { useMemo, useState } from 'react';
import { Sparkles, Send, MapPin, Calendar, Users, Globe2, Video, Hotel, Plane, Info, MoreHorizontal } from 'lucide-react';
import CharizardOrb from '@/components/CharizardOrb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

type TripState = {
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

  const destinationLabel = useMemo(() => {
    const dest = plannerState.destination;
    if (Array.isArray(dest)) return dest.join(', ');
    return dest ?? '—';
  }, [plannerState.destination]);

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
      const res = await fetch('/api/ai-planner/itinerary', {
        method: 'POST',
      });
      const data = await res.json();
      setItinerary(data?.data ?? null);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: 'ai', text: 'Unable to generate itinerary. Please try again.' },
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
              {day.activities.map((act, idx) => (
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
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          {/* Left: Chat */}
          <Card className="sticky top-24 self-start max-h-[calc(100vh-7rem)] min-h-[calc(100vh-7rem)] overflow-hidden border border-orange-200/60 bg-white/90 shadow-lg flex flex-col py-0 gap-0">
            <CardHeader className="py-2 pb-0">
              <div className="inline-flex items-center gap-2 px-1 text-slate-900">
                <CharizardOrb size="medium" />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold md:text-base">Plan your trip with Charizard</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 px-4 pt-2 pb-2 min-h-0">
              <div className="flex-1 min-h-0 space-y-2 overflow-y-auto rounded-lg border border-white/60 bg-white/60 p-3">
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
                    <div className="flex items-center gap-1.5 max-w-[80%] rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow">
                      <span className="text-xs font-medium text-slate-400 mr-1">Charizard is thinking</span>
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
          <div className="space-y-4 mt-4 lg:mt-8">
            <Card className="border border-slate-200 bg-white/90 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Trip Overview</CardTitle>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Destination: {destinationLabel}</p>
                  <p>From: {plannerState.departureCity ?? itinerary?.departureCity ?? '—'}</p>
                  <p>
                    Travellers: {plannerState.travellers ?? itinerary?.travellers ?? '—'} • 
                    Purpose: {plannerState.purpose ?? '—'}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700">
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {plannerState.dates?.start ?? itinerary?.dates?.start ?? 'Start ?'} -{' '}
                    {plannerState.dates?.end ?? itinerary?.dates?.end ?? 'End ?'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs">
                    <Users className="h-3 w-3" />
                    {plannerState.travellers ?? itinerary?.travellers ?? '?'} travellers
                  </span>
                  {plannerState.preferences?.length ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs">
                      <Globe2 className="h-3 w-3" />
                      {plannerState.preferences.join(', ')}
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white/90 shadow">
              <CardHeader>
                <CardTitle className="text-lg">Day Plans</CardTitle>
              </CardHeader>
              <CardContent>{renderDayPlans(itinerary?.dayPlans ?? plannerState.dayPlans)}</CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white/90 shadow">
              <CardHeader className="flex flex-row items-center justify-between p-0 px-4 pt-2 pb-1">
                <div className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-slate-700" />
                  <CardTitle className="text-lg">Transportation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-0 px-4 pt-2 pb-3">
                {(itinerary?.transportation ?? plannerState.transportation ?? []).map((leg, idx) => (
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
                        <p className="text-[10px] text-slate-400">Total for {plannerState.travellers ?? 1} travellers</p>
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
                {!(itinerary?.transportation?.length || plannerState.transportation?.length) && (
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
                {(itinerary?.accommodation ?? plannerState.accommodation ?? []).map((stay, idx) => (
                  <div key={`stay-${idx}`} className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col sm:flex-row">
                      {/* Placeholder for Image - in a real app this would be a real URL */}
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
                {!(itinerary?.accommodation?.length || plannerState.accommodation?.length) && (
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
                {(itinerary?.media?.photos ?? []).map((url, idx) => (
                  <div key={`photo-${idx}`} className="relative h-28 w-40 overflow-hidden rounded-md">
                    <img src={url} alt="trip" className="h-full w-full object-cover" />
                  </div>
                ))}
                {(itinerary?.media?.videos ?? []).map((url, idx) => (
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
                {!itinerary?.media?.photos?.length && !itinerary?.media?.videos?.length && (
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