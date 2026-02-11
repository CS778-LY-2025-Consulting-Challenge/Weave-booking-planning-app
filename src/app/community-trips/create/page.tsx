'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  GripVertical,
  ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  X,
  Eye,
  Send,
  Utensils,
  Camera,
  Landmark,
  ShoppingBag,
  TreePine,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Activity {
  id: string;
  title: string;
  time: string;      // Morning, Afternoon, Evening, or specific time
  location: string;
  type: string;       // attraction, food, activity, shopping, nature
  duration: string;
  highlights: string; // tips/description
  imageUrl?: string;
}

interface DayPlan {
  id: string;
  day: number;
  title: string;
  guide: string;       // Travel tips markdown
  activities: Activity[];
}

interface TripForm {
  title: string;
  destination: string;
  duration: number;     // number of days
  description: string;
  thumbnailUrl: string;
  highlights: string[];
  days: DayPlan[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const TYPE_OPTIONS = [
  { value: 'attraction', label: 'Attraction', icon: Landmark },
  { value: 'food', label: 'Food & Dining', icon: Utensils },
  { value: 'activity', label: 'Activity', icon: Compass },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { value: 'nature', label: 'Nature', icon: TreePine },
  { value: 'photo', label: 'Photography', icon: Camera },
];

const STEP_LABELS = ['Basic Info', 'Daily Itinerary', 'Travel Guide', 'Preview & Publish'];

const uid = () => Math.random().toString(36).slice(2, 10);

const emptyActivity = (): Activity => ({
  id: uid(),
  title: '',
  time: 'Morning',
  location: '',
  type: 'attraction',
  duration: '',
  highlights: '',
});

const emptyDay = (dayNum: number): DayPlan => ({
  id: uid(),
  day: dayNum,
  title: `Day ${dayNum}`,
  guide: '',
  activities: [emptyActivity()],
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreateJourneyPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  const [form, setForm] = useState<TripForm>({
    title: '',
    destination: '',
    duration: 3,
    description: '',
    thumbnailUrl: '',
    highlights: [],
    days: [emptyDay(1), emptyDay(2), emptyDay(3)],
  });

  // ─── Duration sync: keep days array in sync with duration number
  useEffect(() => {
    setForm(prev => {
      const target = prev.duration;
      const current = prev.days.length;
      if (target === current) return prev;

      let newDays = [...prev.days];
      if (target > current) {
        for (let i = current + 1; i <= target; i++) {
          newDays.push(emptyDay(i));
        }
      } else {
        newDays = newDays.slice(0, target);
      }
      return { ...prev, days: newDays };
    });
  }, [form.duration]);

  // ─── Auto-fetch cover image from Unsplash
  useEffect(() => {
    if (!form.destination) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/unsplash/search?city=${encodeURIComponent(form.destination)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            setForm(prev => ({ ...prev, thumbnailUrl: data.imageUrl }));
          }
        }
      } catch { /* ignore */ }
    }, 800);
    return () => clearTimeout(timeout);
  }, [form.destination]);

  // ─── Auto-fetch activity images
  const fetchActivityImage = useCallback(async (title: string) => {
    if (!title || imageCache[title]) return;
    try {
      // Clean up the title for better search
      let query = title
        .replace(/^(Dinner|Lunch|Breakfast|Brunch)\s+at\s+/i, '')
        .replace(/^(Visit|Explore|Tour|See|Discover|Experience)\s+/i, '')
        .split(/[-,]/)[0].trim();
      const words = query.split(' ').slice(0, 4).join(' ');

      const res = await fetch(`/api/unsplash/search?city=${encodeURIComponent(words)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          setImageCache(prev => ({ ...prev, [title]: data.imageUrl }));
        }
      }
    } catch { /* ignore */ }
  }, [imageCache]);

  // ─── Form updaters
  const updateDay = (dayId: string, updates: Partial<DayPlan>) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.map(d => d.id === dayId ? { ...d, ...updates } : d),
    }));
  };

  const updateActivity = (dayId: string, actId: string, updates: Partial<Activity>) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? {
              ...d,
              activities: d.activities.map(a =>
                a.id === actId ? { ...a, ...updates } : a
              ),
            }
          : d
      ),
    }));
  };

  const addActivity = (dayId: string) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, activities: [...d.activities, emptyActivity()] }
          : d
      ),
    }));
  };

  const removeActivity = (dayId: string, actId: string) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, activities: d.activities.filter(a => a.id !== actId) }
          : d
      ),
    }));
  };

  // ─── Validation
  const validateStep = (s: number): string | null => {
    switch (s) {
      case 0:
        if (!form.title.trim()) return 'Please enter a title';
        if (!form.destination.trim()) return 'Please enter a destination';
        if (form.duration < 1 || form.duration > 30) return 'Duration must be 1-30 days';
        return null;
      case 1:
        for (const day of form.days) {
          if (day.activities.length === 0) return `Day ${day.day} needs at least one activity`;
          for (const act of day.activities) {
            if (!act.title.trim()) return `Day ${day.day}: Activity name is required`;
          }
        }
        return null;
      case 2:
        return null; // guide text is optional
      default:
        return null;
    }
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) { toast.error(err); return; }
    setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  // ─── Submit
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Build plannerState (compatible with AI Planner import)
      const plannerState = {
        tripTitle: form.title,
        destination: form.destination,
        dates: { durationDays: form.duration },
        dayPlans: form.days.map(day => ({
          day: day.day,
          title: day.title,
          daySummary: day.guide.slice(0, 200),
          city: form.destination,
          activities: day.activities.map(act => ({
            title: act.title,
            time: act.time,
            location: act.location,
            type: act.type,
            duration: act.duration,
            highlights: act.highlights,
            imageUrl: imageCache[act.title] || undefined,
            coords: undefined, // will be resolved by AI planner on import
          })),
        })),
      };

      // Build dayGuides (for the Travel Guide view)
      const dayGuides = form.days.map(day => ({
        dayNumber: day.day,
        dayTitle: day.title,
        guide: day.guide,
        activities: day.activities.map(act => ({
          name: act.title,
          imageUrl: imageCache[act.title] || undefined,
          time: act.time,
          location: act.location,
        })),
      }));

      const duration = form.duration === 1
        ? '1 day'
        : `${form.duration} days & ${form.duration - 1} nights`;

      const res = await fetch('/api/community-trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          destination: form.destination,
          thumbnailUrl: form.thumbnailUrl,
          duration,
          description: form.description,
          plannerState,
          highlights: form.highlights,
          dayGuides,
          userName: user?.fullName || user?.firstName || 'Anonymous',
          userAvatar: user?.imageUrl || null,
          sourceType: 'user_created',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to publish');
      }

      const created = await res.json();
      toast.success('Journey published successfully! 🎉');
      router.push(`/community-trips/${created.id}`);
    } catch (err: any) {
      console.error('[CreateJourney] Error:', err);
      toast.error(err.message || 'Failed to publish journey');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <h1 className="font-cormorant text-xl font-semibold text-zinc-800">Create Journey</h1>
          <div className="w-16" /> {/* spacer */}
        </div>

        {/* Step Progress */}
        <div className="mx-auto max-w-5xl px-4 pb-4">
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex flex-1 items-center gap-2">
                <button
                  onClick={() => {
                    if (i < step) setStep(i);
                  }}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    i === step
                      ? 'bg-zinc-800 text-white'
                      : i < step
                        ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 cursor-pointer'
                        : 'bg-zinc-100 text-zinc-400'
                  }`}
                >
                  {i < step ? (
                    <Check className="size-3" />
                  ) : (
                    <span className="flex size-4 items-center justify-center rounded-full text-[10px]">
                      {i + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`h-px flex-1 ${i < step ? 'bg-zinc-400' : 'bg-zinc-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <StepBasicInfo form={form} setForm={setForm} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <StepItinerary
                form={form}
                updateDay={updateDay}
                updateActivity={updateActivity}
                addActivity={addActivity}
                removeActivity={removeActivity}
                fetchActivityImage={fetchActivityImage}
                imageCache={imageCache}
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <StepGuide form={form} updateDay={updateDay} imageCache={imageCache} />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <StepPreview form={form} imageCache={imageCache} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-zinc-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <span className="text-xs text-zinc-400">
            Step {step + 1} of {STEP_LABELS.length}
          </span>
          {step < 3 ? (
            <Button onClick={nextStep} className="gap-2 bg-zinc-800 hover:bg-zinc-700">
              Next
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Publish Journey
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Bottom spacer for fixed nav */}
      <div className="h-20" />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Step 1: Basic Info
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function StepBasicInfo({
  form,
  setForm,
}: {
  form: TripForm;
  setForm: React.Dispatch<React.SetStateAction<TripForm>>;
}) {
  const [highlightInput, setHighlightInput] = useState('');

  const addHighlight = () => {
    const h = highlightInput.trim();
    if (!h) return;
    setForm(prev => ({ ...prev, highlights: [...prev.highlights, h] }));
    setHighlightInput('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-cormorant text-3xl font-semibold text-zinc-800">Basic Information</h2>
        <p className="mt-1 text-sm text-zinc-500">Tell us about your journey</p>
      </div>

      {/* Cover Image Preview */}
      <div className="relative h-56 overflow-hidden rounded-2xl bg-zinc-100">
        {form.thumbnailUrl ? (
          <>
            <img
              src={form.thumbnailUrl}
              alt="Cover"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xs opacity-80">Cover image auto-loaded from destination</p>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-zinc-400">
            <ImageIcon className="size-12 mb-2 opacity-40" />
            <p className="text-sm">Enter a destination to auto-load a cover image</p>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Journey Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. A Week in Tokyo: Food, Culture & Nature"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
        </div>

        {/* Destination */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Destination <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={form.destination}
              onChange={e => setForm(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="e.g. Tokyo, Japan"
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Duration (days) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="number"
              min={1}
              max={30}
              value={form.duration}
              onChange={e => setForm(prev => ({ ...prev, duration: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)) }))}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-700">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Share a brief summary of your travel experience..."
            rows={3}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 resize-none"
          />
        </div>

        {/* Highlights */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Highlights <span className="text-xs text-zinc-400">(optional tags)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={highlightInput}
              onChange={e => setHighlightInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(); } }}
              placeholder="e.g. Street Food, Temples, Sunset Views..."
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
            <Button variant="outline" size="sm" onClick={addHighlight} className="px-4">
              <Plus className="size-4" />
            </Button>
          </div>
          {form.highlights.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.highlights.map((h, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="gap-1 pl-3 pr-1 py-1 text-xs bg-zinc-100 hover:bg-zinc-200"
                >
                  {h}
                  <button
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        highlights: prev.highlights.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="ml-1 rounded-full p-0.5 hover:bg-zinc-300 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Step 2: Daily Itinerary
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function StepItinerary({
  form,
  updateDay,
  updateActivity,
  addActivity,
  removeActivity,
  fetchActivityImage,
  imageCache,
}: {
  form: TripForm;
  updateDay: (dayId: string, updates: Partial<DayPlan>) => void;
  updateActivity: (dayId: string, actId: string, updates: Partial<Activity>) => void;
  addActivity: (dayId: string) => void;
  removeActivity: (dayId: string, actId: string) => void;
  fetchActivityImage: (title: string) => void;
  imageCache: Record<string, string>;
}) {
  const [activeDay, setActiveDay] = useState(0);
  const day = form.days[activeDay];

  if (!day) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cormorant text-3xl font-semibold text-zinc-800">Daily Itinerary</h2>
        <p className="mt-1 text-sm text-zinc-500">Add your activities for each day</p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {form.days.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActiveDay(i)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              i === activeDay
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      {/* Day Title */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">Day Title</label>
        <input
          type="text"
          value={day.title}
          onChange={e => updateDay(day.id, { title: e.target.value })}
          placeholder={`e.g. Arrival in ${form.destination || 'the city'}`}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
        />
      </div>

      {/* Activities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-700">
            Activities ({day.activities.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addActivity(day.id)}
            className="gap-1 text-xs"
          >
            <Plus className="size-3" />
            Add Activity
          </Button>
        </div>

        {day.activities.map((act, actIdx) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-sm"
          >
            {/* Activity Number & Remove */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-white">
                  {actIdx + 1}
                </span>
                <span className="text-xs text-zinc-400">Activity</span>
              </div>
              {day.activities.length > 1 && (
                <button
                  onClick={() => removeActivity(day.id, act.id)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Activity Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={act.title}
                  onChange={e => {
                    updateActivity(day.id, act.id, { title: e.target.value });
                  }}
                  onBlur={() => {
                    if (act.title.trim()) fetchActivityImage(act.title.trim());
                  }}
                  placeholder="e.g. Sky Tower + SkyWalk Experience"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition-all focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
                />
                {/* Image preview */}
                {imageCache[act.title] && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                    <Check className="size-3" />
                    Image auto-loaded
                    <img src={imageCache[act.title]} alt="" className="size-6 rounded object-cover ml-auto" />
                  </div>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Time of Day</label>
                <div className="flex gap-1.5 flex-wrap">
                  {TIME_OPTIONS.map(t => (
                    <button
                      key={t}
                      onClick={() => updateActivity(day.id, act.id, { time: t })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        act.time === t
                          ? 'bg-zinc-800 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Type</label>
                <div className="flex gap-1.5 flex-wrap">
                  {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updateActivity(day.id, act.id, { type: value })}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                        act.type === value
                          ? 'bg-zinc-800 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      <Icon className="size-3" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={act.location}
                    onChange={e => updateActivity(day.id, act.id, { location: e.target.value })}
                    placeholder="e.g. Shibuya, Tokyo"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 py-2.5 text-sm outline-none transition-all focus:border-zinc-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Duration</label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={act.duration}
                    onChange={e => updateActivity(day.id, act.id, { duration: e.target.value })}
                    placeholder="e.g. 2-3 hours"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 py-2.5 text-sm outline-none transition-all focus:border-zinc-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Tips / Highlights */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Tips & Notes <span className="text-xs text-zinc-400">(optional)</span>
                </label>
                <textarea
                  value={act.highlights}
                  onChange={e => updateActivity(day.id, act.id, { highlights: e.target.value })}
                  placeholder="Share your tips: best time to visit, what to try, what to avoid..."
                  rows={2}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition-all focus:border-zinc-400 focus:bg-white resize-none"
                />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add activity button (bottom) */}
        <button
          onClick={() => addActivity(day.id)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-4 text-sm text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600"
        >
          <Plus className="size-4" />
          Add another activity
        </button>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Step 3: Travel Guide
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function StepGuide({
  form,
  updateDay,
  imageCache,
}: {
  form: TripForm;
  updateDay: (dayId: string, updates: Partial<DayPlan>) => void;
  imageCache: Record<string, string>;
}) {
  const [activeDay, setActiveDay] = useState(0);
  const day = form.days[activeDay];

  if (!day) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cormorant text-3xl font-semibold text-zinc-800">Travel Guide</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Write travel tips and guides for each day. This will appear as the &quot;Travel Tips&quot; section in your published journey.
        </p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {form.days.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActiveDay(i)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              i === activeDay
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Day {d.day}
            {d.guide.trim() && <Check className="inline ml-1.5 size-3" />}
          </button>
        ))}
      </div>

      {/* Two column: Activities summary + Guide editor */}
      <div className="grid gap-6 md:grid-cols-5">
        {/* Left: Activity summary */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700 mb-2">{day.title}</h3>
          {day.activities.map((act, i) => (
            <div key={act.id} className="flex gap-3 rounded-xl bg-zinc-50 p-3">
              {imageCache[act.title] ? (
                <img
                  src={imageCache[act.title]}
                  alt={act.title}
                  className="size-14 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-zinc-200">
                  <MapPin className="size-5 text-zinc-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-800 truncate">{act.title || 'Untitled'}</p>
                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <Clock className="size-3" />
                  {act.time}
                  {act.location && (
                    <>
                      <span className="mx-1">·</span>
                      <MapPin className="size-3" />
                      <span className="truncate">{act.location}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Guide editor */}
        <div className="md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Travel Tips for Day {day.day}
          </label>
          <p className="mb-3 text-xs text-zinc-400">
            Write about your experience: overall impressions, practical advice, what to expect, etc.
            You can describe each activity in detail with tips.
          </p>
          <textarea
            value={day.guide}
            onChange={e => updateDay(day.id, { guide: e.target.value })}
            placeholder={`Day ${day.day} focuses on...

━━━━━

🗼 ${day.activities[0]?.title || 'Activity Name'}

⏰ ${day.activities[0]?.duration || '2-3 hours'} | 📍 ${day.activities[0]?.location || 'Location'}

Write about this activity — what makes it special, practical tips for visitors, best times to go...

Tips: • Tip 1 • Tip 2 • Tip 3`}
            rows={16}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 leading-relaxed outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 resize-none font-mono"
          />
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Step 4: Preview & Publish
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function StepPreview({
  form,
  imageCache,
}: {
  form: TripForm;
  imageCache: Record<string, string>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-cormorant text-3xl font-semibold text-zinc-800">Preview</h2>
        <p className="mt-1 text-sm text-zinc-500">Review your journey before publishing</p>
      </div>

      {/* Hero Preview */}
      <div className="relative h-64 overflow-hidden rounded-2xl bg-zinc-100">
        {form.thumbnailUrl ? (
          <>
            <img
              src={form.thumbnailUrl}
              alt={form.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-200 to-zinc-300" />
        )}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <Badge className="mb-2 bg-white/20 backdrop-blur-sm border-0 text-white">
            {form.duration} {form.duration === 1 ? 'day' : 'days'}
          </Badge>
          <h3 className="font-cormorant text-3xl font-bold">{form.title || 'Untitled Journey'}</h3>
          <div className="mt-2 flex items-center gap-2 text-sm opacity-80">
            <MapPin className="size-4" />
            {form.destination || 'No destination'}
          </div>
        </div>
      </div>

      {/* Description */}
      {form.description && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-600 leading-relaxed">{form.description}</p>
        </div>
      )}

      {/* Highlights */}
      {form.highlights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {form.highlights.map((h, i) => (
            <Badge key={i} variant="secondary" className="bg-zinc-100 text-zinc-700">
              {h}
            </Badge>
          ))}
        </div>
      )}

      {/* Day-by-day Preview (Travel Guide style) */}
      <div className="space-y-8">
        <h3 className="font-cormorant text-2xl font-semibold text-zinc-800 border-b border-zinc-200 pb-3">
          Travel Guide
        </h3>

        {form.days.map(day => (
          <div key={day.id} className="space-y-4">
            {/* Day badge */}
            <div className="inline-block rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-700">
              DAY {day.day}
            </div>

            {/* Day title */}
            <h4 className="text-xl font-bold text-zinc-800 border-l-4 border-zinc-800 pl-4">
              {day.title}
            </h4>

            <div className="grid gap-6 md:grid-cols-5">
              {/* Left: Activity cards */}
              <div className="md:col-span-2 space-y-3">
                {day.activities.map((act, i) => (
                  <div key={act.id} className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                    {/* Activity number */}
                    <div className="absolute top-3 right-3 z-10 flex size-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-white">
                      {i + 1}
                    </div>
                    {imageCache[act.title] && (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={imageCache[act.title]}
                          alt={act.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-zinc-800">{act.title}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="size-3" />
                        {act.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Guide text */}
              <div className="md:col-span-3 border-l border-dashed border-zinc-200 pl-6">
                {day.guide ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Compass className="size-5 text-zinc-500" />
                      <h5 className="font-semibold text-zinc-800">Travel Tips</h5>
                    </div>
                    <div className="prose prose-sm max-w-none text-zinc-600">
                      {day.guide.split('\n').map((line, i) => (
                        <p key={i} className={line.trim() ? 'mb-2' : 'mb-4'}>
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-zinc-400 py-8">
                    <Sparkles className="size-4" />
                    No travel guide written for this day
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
