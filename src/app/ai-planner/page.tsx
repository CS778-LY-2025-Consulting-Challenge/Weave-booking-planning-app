'use client';

'use client';

import { useMemo, useState } from 'react';
import { Sparkles, Send, MapPin, Calendar, Users, Globe2, Video, Hotel } from 'lucide-react';
import CharizardOrb from '@/components/CharizardOrb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      text: "Hi, I'm your AI trip planner. Tell me where/when you want to go and what you like.",
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
          <Card className="sticky top-24 self-start max-h-[calc(100vh-7rem)] min-h-[calc(100vh-7rem)] overflow-hidden border border-orange-200/60 bg-white/90 shadow-lg flex flex-col py-0">
            <CardHeader className="pb-2 pt-4">
              <div className="inline-flex items-center gap-2 px-1 py-1 text-slate-900">
                <CharizardOrb />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold md:text-base">Plan your trip with Charizard</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-2">
              <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-white/60 bg-white/60 p-3">
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
                    {isGenerating ? 'Generating...' : 'Generate itinerary (mock)'}
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
                <p className="text-sm text-gray-600">
                  Destination: {destinationLabel} • Travellers:{' '}
                  {plannerState.travellers ?? itinerary?.travellers ?? '—'} • Purpose:{' '}
                  {plannerState.purpose ?? '—'}
                </p>
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
              <CardHeader>
                <CardTitle className="text-lg">Transportation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(itinerary?.transportation ?? []).map((leg, idx) => (
                  <div key={idx} className="rounded-md bg-slate-50 p-2 text-sm text-gray-700">
                    <p className="font-semibold">
                      {leg.mode.toUpperCase()}: {leg.from} → {leg.to}
                    </p>
                    <p className="text-xs text-gray-600">
                      {leg.time ?? '—'} {leg.priceEstimate ? `• ${leg.priceEstimate}` : ''}
                    </p>
                  </div>
                ))}
                {(itinerary?.transportation ?? []).length === 0 && (
                  <p className="text-sm text-gray-500">No transportation yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white/90 shadow">
              <CardHeader>
                <CardTitle className="text-lg">Accommodation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(itinerary?.accommodation ?? []).map((stay, idx) => (
                  <div key={idx} className="rounded-md bg-slate-50 p-2 text-sm text-gray-700">
                    <p className="font-semibold">
                      <Hotel className="mr-1 inline h-4 w-4" />
                      {stay.name}
                    </p>
                    <p className="text-xs text-gray-600">{stay.location}</p>
                    {stay.pricePerNight ? (
                      <p className="text-xs text-gray-500">
                        {stay.nights ? `${stay.nights} nights • ` : ''}${stay.pricePerNight}/night
                      </p>
                    ) : null}
                  </div>
                ))}
                {(itinerary?.accommodation ?? []).length === 0 && (
                  <p className="text-sm text-gray-500">No accommodation yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white/90 shadow">
              <CardHeader>
                <CardTitle className="text-lg">Media</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {(itinerary?.media?.photos ?? []).map((url, idx) => (
                  <div key={idx} className="relative h-28 w-40 overflow-hidden rounded-md">
                    <img src={url} alt="trip" className="h-full w-full object-cover" />
                  </div>
                ))}
                {(itinerary?.media?.videos ?? []).map((url, idx) => (
                  <a
                    key={idx}
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