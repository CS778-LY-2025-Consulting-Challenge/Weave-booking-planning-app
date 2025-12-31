'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Calendar,
  Camera,
  ChevronDown,
  Cloud,
  Compass,
  Filter,
  Heart,
  Map,
  MapPin,
  Sun,
  X,
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Journeys() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<Set<string>>(new Set());
  const [selectedWeather, setSelectedWeather] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedDurations, setSelectedDurations] = useState<Set<string>>(new Set());
  const [wishlistAnimating, setWishlistAnimating] = useState<number | null>(null);

  const journeys = [
    {
      id: 1,
      title: 'New Zealand Explorer',
      author: 'James T.',
      destination: 'New Zealand',
      season: 'Spring',
      weather: 'Clear',
      duration: '18 Days',
      type: 'Adventure',
      image:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB6ZWFsYW5kfGVufDB8fHx8fDE3NzA1MjYyNjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        "A transformative journey through Aotearoa's most iconic landscapes. Navigate the Fiordland cruises, experience adrenaline-pumping activities in Queenstown, and contemplate majesty at Milford Sound. Where adventure meets serenity.",
      likes: 567,
    },
    {
      id: 2,
      title: 'Bali Adventure',
      author: 'Sarah M.',
      destination: 'Bali, Indonesia',
      season: 'Summer',
      weather: 'Sunny',
      duration: '10 Days',
      type: 'Adventure',
      image:
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwaW5kb25lc2lhfGVufDF8fHx8MTc2NDUzNzMxMXww&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        'Sacred temples whisper ancient wisdom while emerald rice paddies stretch endlessly. Dive into cenote pools, embrace spiritual ceremonies, and discover the art of slow travel through Balinese hospitality.',
      likes: 234,
    },
    {
      id: 3,
      title: 'European Grand Tour',
      author: 'Mike R.',
      destination: 'Multiple Cities, Europe',
      season: 'Spring',
      weather: 'Mild',
      duration: '21 Days',
      type: 'Culture',
      image:
        'https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NDQ3MTg2NHww&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        'A scholarly pilgrimage through Europe\'s cultural heart. From Renaissance masterpieces in Florence to Gothic grandeur in Paris, experience centuries of art, architecture, and storytelling in seven countries.',
      likes: 456,
    },
    {
      id: 4,
      title: 'Mountain Trekking Nepal',
      author: 'Emma K.',
      destination: 'Himalayas, Nepal',
      season: 'Autumn',
      weather: 'Clear',
      duration: '14 Days',
      type: 'Adventure',
      image:
        'https://images.unsplash.com/photo-1669986480140-2c90b8edb443?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGFkdmVudHVyZSUyMHRyYXZlbHxlbnwxfHx8fDE3NjQ1MTI0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        'Summit your inner peak amid the world\'s highest mountains. Through alpine meadows and prayer flag-adorned passes, witness crystalline skies and find profound silence that only the Himalayas can offer.',
      likes: 189,
    },
    {
      id: 5,
      title: 'Tokyo Food Tour',
      author: 'David L.',
      destination: 'Tokyo, Japan',
      season: 'Spring',
      weather: 'Mild',
      duration: '7 Days',
      type: 'Food & Culture',
      image:
        'https://images.unsplash.com/photo-1591194233688-dca69d406068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGphcGFuJTIwY2l0eXxlbnwxfHx8fDE3NjQ1MjYyNjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        "Taste the soul of Japan through Michelin-starred precision and street-corner perfection. From omakase temples to midnight ramen sanctuaries, discover how Tokyo elevates every meal into ritual.",
      likes: 312,
    },
    {
      id: 6,
      title: 'Greek Island Hopping',
      author: 'Lisa P.',
      destination: 'Greek Islands',
      season: 'Summer',
      weather: 'Sunny',
      duration: '12 Days',
      type: 'Beach & Relaxation',
      image:
        'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2V8ZW58MXx8fHwxNzY0NDIxNzYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        'Island-hop through the Aegean where whitewashed villages meet azure waters. Each island unveils its own mythology, flavors, and the timeless rhythm of Mediterranean living.',
      likes: 278,
    },
    {
      id: 7,
      title: 'New York City Explorer',
      author: 'Tom W.',
      destination: 'New York, USA',
      season: 'Fall',
      weather: 'Cool',
      duration: '5 Days',
      type: 'City Break',
      image:
        'https://images.unsplash.com/photo-1543716091-a840c05249ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwY2l0eXxlbnwxfHx8fDE3NjQ1MjUyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        'Immerse in the electric choreography of the city that never sleeps. From Broadway\'s golden lights to Central Park\'s autumn foliage, experience the pulse of ambition and culture.',
      likes: 201,
    },
  ];

  const toggleFavorite = (id: number) => {
    setWishlistAnimating(id);
    setTimeout(() => setWishlistAnimating(null), 600);
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const toggleInSet = (setter: (s: Set<string>) => void, setVal: Set<string>, value: string, checked: boolean) => {
    const next = new Set(Array.from(setVal));
    if (checked) {
      next.add(value);
    } else {
      next.delete(value);
    }
    setter(next);
  };

  const parseDays = (durationStr: string) => {
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const durationBucket = (days: number) => {
    if (days < 7) return '< 1 week';
    if (days >= 7 && days < 14) return '1-2 weeks';
    if (days >= 14 && days < 21) return '2-3 weeks';
    return '> 3 weeks';
  };

  const matchesFilters = (j: typeof journeys[number]) => {
    const seasonOk = selectedSeasons.size === 0 || selectedSeasons.has(j.season);
    const weatherOk = selectedWeather.size === 0 || selectedWeather.has(j.weather);
    const typeOk = selectedTypes.size === 0 || selectedTypes.has(j.type);
    const dur = durationBucket(parseDays(j.duration));
    const durationOk = selectedDurations.size === 0 || selectedDurations.has(dur);
    return seasonOk && weatherOk && typeOk && durationOk;
  };

  const weatherIcons = {
    Sunny: Sun,
    Mild: Cloud,
    Clear: Sun,
    Cool: Cloud,
  };

  const scrollToJourneys = () => {
    document
      .getElementById('journeys-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasActiveFilters = 
    selectedSeasons.size > 0 || 
    selectedWeather.size > 0 || 
    selectedTypes.size > 0 || 
    selectedDurations.size > 0;

  const clearAllFilters = () => {
    setSelectedSeasons(new Set());
    setSelectedWeather(new Set());
    setSelectedTypes(new Set());
    setSelectedDurations(new Set());
  };

  const removeFilter = (category: 'season' | 'weather' | 'type' | 'duration', value: string) => {
    switch (category) {
      case 'season':
        toggleInSet(setSelectedSeasons, selectedSeasons, value, false);
        break;
      case 'weather':
        toggleInSet(setSelectedWeather, selectedWeather, value, false);
        break;
      case 'type':
        toggleInSet(setSelectedTypes, selectedTypes, value, false);
        break;
      case 'duration':
        toggleInSet(setSelectedDurations, selectedDurations, value, false);
        break;
    }
  };

  const FilterSection = ({ title, items, selectedSet, setter, category }: { 
    title: string; 
    items: string[]; 
    selectedSet: Set<string>; 
    setter: (s: Set<string>) => void;
    category: 'season' | 'weather' | 'type' | 'duration';
  }) => (
    <div>
      <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = selectedSet.has(item);
          return (
            <motion.button
              key={item}
              onClick={() => toggleInSet(setter, selectedSet, item, !isSelected)}
              className={`
                rounded-full px-4 py-2 text-sm font-light tracking-wide transition-all duration-300
                ${isSelected 
                  ? 'bg-zinc-900 text-white shadow-lg' 
                  : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {item}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50/30 to-white">
      {/* HERO COVER SECTION */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-zinc-900/60 via-zinc-800/50 to-amber-900/40" />
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920"
            alt="Travel background"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Floating Elements - More Subtle */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 3, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 text-white/10"
        >
          <Compass className="size-28" strokeWidth={0.5} />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-10 bottom-20 text-white/10"
        >
          <Camera className="size-20" strokeWidth={0.5} />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-20 mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-8 inline-block"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-400/30 opacity-60 blur-3xl" />
                <Map
                  className="relative size-16 text-white/90"
                  strokeWidth={1}
                />
              </div>
            </motion.div>

            <h1 className="font-cormorant mb-8 text-7xl font-light tracking-tight text-white md:text-8xl lg:text-9xl">
              Featured Journeys
            </h1>

            <p className="font-inter mx-auto mb-6 max-w-3xl text-xl font-light leading-relaxed tracking-wide text-white/90 md:text-2xl">
              Curated stories from discerning travelers
            </p>

            <p className="font-inter mx-auto mb-16 max-w-2xl text-base font-light leading-loose text-white/60 md:text-lg">
              Discover authentic experiences crafted by explorers who seek more than destinations — they seek transformation
            </p>

            {/* Stats */}
            <div className="mb-16 flex flex-wrap justify-center gap-12 md:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-center"
              >
                <div className="font-cormorant mb-2 text-5xl font-light text-white md:text-6xl">
                  150+
                </div>
                <div className="font-inter text-xs font-light uppercase tracking-[0.2em] text-white/60">
                  Journeys
                </div>
              </motion.div>

              <div className="h-16 w-px bg-white/20" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-center"
              >
                <div className="font-cormorant mb-2 text-5xl font-light text-white md:text-6xl">
                  80+
                </div>
                <div className="font-inter text-xs font-light uppercase tracking-[0.2em] text-white/60">
                  Countries
                </div>
              </motion.div>

              <div className="h-16 w-px bg-white/20" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-center"
              >
                <div className="font-cormorant mb-2 text-5xl font-light text-white md:text-6xl">
                  10k+
                </div>
                <div className="font-inter text-xs font-light uppercase tracking-[0.2em] text-white/60">
                  Travelers
                </div>
              </motion.div>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Button
                size="lg"
                onClick={scrollToJourneys}
                className="font-inter group rounded-full border border-white/20 bg-white/10 px-10 py-7 text-base font-light tracking-widest uppercase text-white backdrop-blur-md transition-all duration-500 hover:bg-white hover:text-zinc-900 hover:shadow-2xl hover:shadow-white/20"
              >
                Explore Collection
                <ChevronDown className="ml-3 size-4 transition-transform duration-300 group-hover:translate-y-1" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute right-0 bottom-0 left-0 z-10 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* JOURNEYS SECTION */}
      <section id="journeys-section" className="py-24">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center"
          >
            <p className="font-inter mb-4 text-xs font-light uppercase tracking-[0.25em] text-zinc-500">
              Handpicked Selection
            </p>
            <h2 className="font-cormorant mb-6 text-6xl font-light tracking-tight text-zinc-900 md:text-7xl">
              Signature Experiences
            </h2>
            <p className="font-inter mx-auto max-w-2xl text-lg font-light leading-loose text-zinc-600">
              Each journey represents a carefully curated narrative of discovery, luxury, and authentic connection
            </p>
          </motion.div>

          <div className="flex gap-12 lg:gap-16">
            {/* Filters Sidebar - Desktop */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="hidden w-80 flex-shrink-0 lg:block"
            >
              <div className="sticky top-24">
                <div className="rounded-3xl border border-zinc-200/60 bg-white/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm">
                  <div className="mb-8 flex items-center gap-3">
                    <div className="rounded-full bg-zinc-900 p-2">
                      <Filter className="size-4 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-cormorant text-2xl font-light text-zinc-900">Refine</h3>
                  </div>

                  <div className="space-y-8">
                    {/* Elegant Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                    <FilterSection 
                      title="Season"
                      items={['Summer', 'Spring', 'Fall', 'Winter']}
                      selectedSet={selectedSeasons}
                      setter={setSelectedSeasons}
                      category="season"
                    />

                    <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                    <FilterSection 
                      title="Weather"
                      items={['Sunny', 'Rainy', 'Mild', 'Cool']}
                      selectedSet={selectedWeather}
                      setter={setSelectedWeather}
                      category="weather"
                    />

                    <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                    <FilterSection 
                      title="Experience"
                      items={['Adventure', 'Beach & Relaxation', 'Culture', 'Food & Culture', 'Family', 'City Break']}
                      selectedSet={selectedTypes}
                      setter={setSelectedTypes}
                      category="type"
                    />

                    <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                    <FilterSection 
                      title="Duration"
                      items={['< 1 week', '1-2 weeks', '2-3 weeks', '> 3 weeks']}
                      selectedSet={selectedDurations}
                      setter={setSelectedDurations}
                      category="duration"
                    />
                  </div>

                  {hasActiveFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-8"
                    >
                      <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent mb-6" />
                      <Button
                        variant="ghost"
                        onClick={clearAllFilters}
                        className="font-inter w-full rounded-full border border-zinc-200 py-6 text-sm font-light tracking-wide text-zinc-600 transition-all duration-300 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                      >
                        Clear All Filters
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Mobile Filter Button */}
            <div className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    size="lg" 
                    className="font-inter rounded-full bg-zinc-900 px-8 py-6 text-sm font-light uppercase tracking-widest text-white shadow-2xl transition-all duration-300 hover:bg-zinc-800 hover:shadow-zinc-900/50"
                  >
                    <Filter className="mr-2 size-4" strokeWidth={1.5} />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-amber-500 text-xs font-medium text-zinc-900">
                        {selectedSeasons.size + selectedWeather.size + selectedTypes.size + selectedDurations.size}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[90vw] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="font-cormorant text-3xl font-light">Refine</SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 space-y-8">
                    <FilterSection 
                      title="Season"
                      items={['Summer', 'Spring', 'Fall', 'Winter']}
                      selectedSet={selectedSeasons}
                      setter={setSelectedSeasons}
                      category="season"
                    />
                    <div className="h-px bg-zinc-200" />
                    <FilterSection 
                      title="Weather"
                      items={['Sunny', 'Rainy', 'Mild', 'Cool']}
                      selectedSet={selectedWeather}
                      setter={setSelectedWeather}
                      category="weather"
                    />
                    <div className="h-px bg-zinc-200" />
                    <FilterSection 
                      title="Experience"
                      items={['Adventure', 'Beach & Relaxation', 'Culture', 'Food & Culture', 'Family', 'City Break']}
                      selectedSet={selectedTypes}
                      setter={setSelectedTypes}
                      category="type"
                    />
                    <div className="h-px bg-zinc-200" />
                    <FilterSection 
                      title="Duration"
                      items={['< 1 week', '1-2 weeks', '2-3 weeks', '> 3 weeks']}
                      selectedSet={selectedDurations}
                      setter={setSelectedDurations}
                      category="duration"
                    />
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        onClick={clearAllFilters}
                        className="font-inter w-full rounded-full py-6"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Journey Grid */}
            <div className="flex-1">
              {/* Active Filters Bar */}
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="mb-8 rounded-2xl border border-zinc-200/60 bg-white/60 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-inter text-sm font-light tracking-wide text-zinc-600">
                      Active Filters
                    </p>
                    <button 
                      onClick={clearAllFilters}
                      className="font-inter text-xs font-light uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedSeasons).map((season) => (
                      <motion.div
                        key={`active-season-${season}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-light text-zinc-700"
                      >
                        {season}
                        <button 
                          onClick={() => removeFilter('season', season)}
                          className="transition-transform hover:scale-110"
                        >
                          <X className="size-3" />
                        </button>
                      </motion.div>
                    ))}
                    {Array.from(selectedWeather).map((weather) => (
                      <motion.div
                        key={`active-weather-${weather}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-light text-zinc-700"
                      >
                        {weather}
                        <button 
                          onClick={() => removeFilter('weather', weather)}
                          className="transition-transform hover:scale-110"
                        >
                          <X className="size-3" />
                        </button>
                      </motion.div>
                    ))}
                    {Array.from(selectedTypes).map((type) => (
                      <motion.div
                        key={`active-type-${type}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-light text-zinc-700"
                      >
                        {type}
                        <button 
                          onClick={() => removeFilter('type', type)}
                          className="transition-transform hover:scale-110"
                        >
                          <X className="size-3" />
                        </button>
                      </motion.div>
                    ))}
                    {Array.from(selectedDurations).map((duration) => (
                      <motion.div
                        key={`active-duration-${duration}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-light text-zinc-700"
                      >
                        {duration}
                        <button 
                          onClick={() => removeFilter('duration', duration)}
                          className="transition-transform hover:scale-110"
                        >
                          <X className="size-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                {journeys.filter(matchesFilters).map((journey, index) => {
                  const WeatherIcon =
                    weatherIcons[
                      journey.weather as keyof typeof weatherIcons
                    ] || Sun;
                  return (
                    <JourneyCard 
                      key={journey.id}
                      journey={journey}
                      index={index}
                      isFavorite={favorites.includes(journey.id)}
                      onToggleFavorite={toggleFavorite}
                      WeatherIcon={WeatherIcon}
                      isAnimating={wishlistAnimating === journey.id}
                      onViewDetails={() => router.push(`/journeys/${journey.id}`)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Luxury Journey Card Component with Parallax Hover
function JourneyCard({ 
  journey, 
  index, 
  isFavorite, 
  onToggleFavorite, 
  WeatherIcon,
  isAnimating,
  onViewDetails 
}: { 
  journey: any; 
  index: number; 
  isFavorite: boolean; 
  onToggleFavorite: (id: number) => void;
  WeatherIcon: any;
  isAnimating: boolean;
  onViewDetails: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { damping: 25, stiffness: 150 });
  const mouseYSpring = useSpring(y, { damping: 25, stiffness: 150 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['2deg', '-2deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-2deg', '2deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{ 
        rotateX, 
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group"
    >
      <Card className="h-full cursor-pointer overflow-hidden rounded-3xl border-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-700 hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)]">
        {/* Image Container */}
        <div className="relative h-96 overflow-hidden">
          <motion.img
            src={journey.image}
            alt={journey.title}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
          
          {/* Cinematic Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Wishlist Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(journey.id);
            }}
            className={`absolute top-6 right-6 flex size-12 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
              isFavorite 
                ? 'bg-white/20 text-red-500' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={isAnimating ? {
              scale: [1, 1.3, 1],
              rotate: [0, 10, -10, 0]
            } : {}}
            transition={{ duration: 0.6 }}
          >
            <Heart
              className={`size-5 transition-all ${isFavorite ? 'fill-current' : ''}`}
              strokeWidth={1.5}
            />
          </motion.button>

          {/* Title Overlay */}
          <div className="absolute right-6 bottom-6 left-6">
            <motion.h3 
              className="font-cormorant mb-2 text-4xl font-light tracking-tight text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {journey.title}
            </motion.h3>
            <p className="font-inter text-sm font-light tracking-wide text-white/80">
              curated by {journey.author}
            </p>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-8">
          {/* Luxury Badges */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-light tracking-wide text-zinc-700 hover:border-zinc-300"
            >
              <MapPin className="mr-1.5 size-3" strokeWidth={1.5} />
              {journey.destination}
            </Badge>
            <Badge 
              variant="outline"
              className="rounded-full border-zinc-200 bg-transparent px-4 py-1.5 text-xs font-light tracking-wide text-zinc-600"
            >
              <Calendar className="mr-1.5 size-3" strokeWidth={1.5} />
              {journey.duration}
            </Badge>
            <Badge 
              variant="outline"
              className="rounded-full border-zinc-200 bg-transparent px-4 py-1.5 text-xs font-light tracking-wide text-zinc-600"
            >
              <WeatherIcon className="mr-1.5 size-3" strokeWidth={1.5} />
              {journey.season}
            </Badge>
          </div>

          {/* Description */}
          <p className="font-inter mb-6 line-clamp-2 text-base font-light leading-relaxed text-zinc-600">
            {journey.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="font-inter flex items-center gap-2 text-sm font-light text-zinc-500">
              <Heart className="size-4" strokeWidth={1.5} />
              <span>{journey.likes} travelers inspired</span>
            </div>
            <motion.button
              onClick={onViewDetails}
              className="font-inter group/btn flex items-center gap-2 rounded-full border border-zinc-900 bg-zinc-900 px-6 py-3 text-sm font-light tracking-wide text-white transition-all duration-300 hover:bg-transparent hover:text-zinc-900"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Discover
              <motion.span
                className="transition-transform duration-300 group-hover/btn:translate-x-1"
              >
                →
              </motion.span>
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
