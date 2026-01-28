'use client';

import { GalleryFloor, GalleryWall } from '@/components/gallery-background';
import { GalleryItems } from '@/components/gallery-items';
import { InfiniteRunner } from '@/components/infinite-runner';
import { PagCharacter } from '@/components/pag-character';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Camera,
  ChevronDown,
  Cloud,
  Compass,
  Filter,
  Heart,
  Loader2 as Loader,
  Map,
  MapPin,
  Sun
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';

export default function Journeys() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'myJourneys' | 'communityJourneys'>(
    (searchParams.get('tab') === 'community' ? 'communityJourneys' : 'myJourneys')
  );
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<Set<string>>(new Set());
  const [selectedWeather, setSelectedWeather] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedDurations, setSelectedDurations] = useState<Set<string>>(new Set());
  const [wishlistAnimating, setWishlistAnimating] = useState<number | null>(null);
  const [activeJourney, setActiveJourney] = useState<number | null>(null);
  
  // Community trips from API
  const [communityTrips, setCommunityTrips] = useState<any[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  
  // Toggle button visibility logic (same as navbar)
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Fetch community trips when switching to community view
  useEffect(() => {
    if (viewMode === 'communityJourneys' && communityTrips.length === 0) {
      fetchCommunityTrips();
    }
  }, [viewMode]);

  const fetchCommunityTrips = async () => {
    try {
      setLoadingCommunity(true);
      const response = await fetch('/api/community-trips?limit=50');
      if (response.ok) {
        const data = await response.json();
        
        // If API returns data, use it; otherwise use mock data
        if (data && data.length > 0) {
          const transformedTrips = data.map((trip: any) => ({
            id: trip.id,
            title: trip.title,
            author: trip.userName,
            authorAvatar: trip.userAvatar || 'https://i.pravatar.cc/150?img=1',
            destination: trip.destination,
            duration: trip.duration,
            type: 'Community',
            image: trip.thumbnailUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
            description: trip.description || 'Discover this amazing journey',
            likes: trip._count?.likes || 0,
            comments: trip._count?.comments || 0,
            views: trip.viewCount || 0,
            imports: trip.importCount || 0,
            rating: trip.rating || 4.5,
          }));
          setCommunityTrips(transformedTrips);
        } else {
          // Use mock data as fallback
          setCommunityTrips(journeys);
        }
      } else {
        // If API fails, use mock data
        setCommunityTrips(journeys);
      }
    } catch (error) {
      console.error('Error fetching community trips:', error);
      // Use mock data as fallback
      setCommunityTrips(journeys);
    } finally {
      setLoadingCommunity(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Change text color after scrolling to second page
      const hasScrolled = scrollY > viewportHeight;
      
      if (scrollY <= 10) {
        setIsVisible(true);
      } else if (scrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      } else if (scrollY > lastScrollY && scrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      }
      
      setLastScrollY(scrollY);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const journeys = [
    {
      id: 1,
      title: 'New Zealand Explorer',
      author: 'James T.',
      authorAvatar: 'https://i.pravatar.cc/150?img=12',
      destination: 'New Zealand',
      season: 'Spring',
      weather: 'Clear',
      duration: '18 days & 17 nights',
      type: 'Adventure',
      image: '/images/new%20zealand.jpg',
      description:
        "A transformative journey through Aotearoa's most iconic landscapes. Navigate the Fiordland cruises, experience adrenaline-pumping activities in Queenstown, and contemplate majesty at Milford Sound.",
      likes: 567,
      comments: 89,
      views: 2340,
      imports: 156,
      rating: 4.9,
    },
    {
      id: 2,
      title: 'Bali Adventure',
      author: 'Sarah M.',
      authorAvatar: 'https://i.pravatar.cc/150?img=5',
      destination: 'Bali, Indonesia',
      season: 'Summer',
      weather: 'Sunny',
      duration: '10 days & 9 nights',
      type: 'Adventure',
      image: '/images/bali.jpg',
      description:
        'Sacred temples whisper ancient wisdom while emerald rice paddies stretch endlessly. Dive into cenote pools, embrace spiritual ceremonies, and discover the art of slow travel through Balinese hospitality.',
      likes: 234,
      comments: 45,
      views: 1890,
      imports: 78,
      rating: 4.7,
    },
    {
      id: 3,
      title: 'European Grand Tour',
      author: 'Mike R.',
      authorAvatar: 'https://i.pravatar.cc/150?img=33',
      destination: 'Multiple Cities, Europe',
      season: 'Spring',
      weather: 'Mild',
      duration: '21 days & 20 nights',
      type: 'Culture',
      image: '/images/paris.jpg',
      description:
        "A scholarly pilgrimage through Europe's cultural heart. From Renaissance masterpieces in Florence to Gothic grandeur in Paris, experience centuries of art, architecture, and storytelling in seven countries.",
      likes: 456,
      comments: 67,
      views: 3120,
      imports: 203,
      rating: 4.8,
    },
    {
      id: 4,
      title: 'Mountain Trekking Nepal',
      author: 'Emma K.',
      authorAvatar: 'https://i.pravatar.cc/150?img=9',
      destination: 'Himalayas, Nepal',
      season: 'Autumn',
      weather: 'Clear',
      duration: '14 days & 13 nights',
      type: 'Adventure',
      image: '/images/nepal.jpg',
      description:
        "Summit your inner peak amid the world's highest mountains. Through alpine meadows and prayer flag-adorned passes, witness crystalline skies and find profound silence that only the Himalayas can offer.",
      likes: 189,
      comments: 34,
      views: 1560,
      imports: 92,
      rating: 4.6,
    },
    {
      id: 5,
      title: 'Tokyo Food Tour',
      author: 'David L.',
      authorAvatar: 'https://i.pravatar.cc/150?img=15',
      destination: 'Tokyo, Japan',
      season: 'Spring',
      weather: 'Mild',
      duration: '7 days & 6 nights',
      type: 'Food & Culture',
      image: '/images/Tokyo.jpg',
      description:
        'Taste the soul of Japan through Michelin-starred precision and street-corner perfection. From omakase temples to midnight ramen sanctuaries, discover how Tokyo elevates every meal into ritual.',
      likes: 312,
      comments: 52,
      views: 2100,
      imports: 124,
      rating: 4.8,
    },
    {
      id: 6,
      title: 'Greek Island Hopping',
      author: 'Lisa P.',
      authorAvatar: 'https://i.pravatar.cc/150?img=20',
      destination: 'Greek Islands',
      season: 'Summer',
      weather: 'Sunny',
      duration: '12 days & 11 nights',
      type: 'Beach & Relaxation',
      image: '/images/greek.jpg',
      description:
        'Island-hop through the Aegean where whitewashed villages meet azure waters. Each island unveils its own mythology, flavors, and the timeless rhythm of Mediterranean living.',
      likes: 278,
      comments: 41,
      views: 1780,
      imports: 98,
      rating: 4.7,
    },
    {
      id: 7,
      title: 'New York City Explorer',
      author: 'Tom W.',
      authorAvatar: 'https://i.pravatar.cc/150?img=8',
      destination: 'New York, USA',
      season: 'Fall',
      weather: 'Cool',
      duration: '5 days & 4 nights',
      type: 'City Break',
      image: '/images/new%20york.jpg',
      description:
        "Immerse in the electric choreography of the city that never sleeps. From Broadway's golden lights to Central Park's autumn foliage, experience the pulse of ambition and culture.",
      likes: 201,
      comments: 28,
      views: 1420,
      imports: 67,
      rating: 4.5,
    },
  ];

  const toggleFavorite = (id: number) => {
    setWishlistAnimating(id);
    setTimeout(() => setWishlistAnimating(null), 600);
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const toggleInSet = (
    setter: (s: Set<string>) => void,
    setVal: Set<string>,
    value: string,
    checked: boolean
  ) => {
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

  const matchesFilters = (j: (typeof journeys)[number]) => {
    const seasonOk =
      selectedSeasons.size === 0 || selectedSeasons.has(j.season);
    const weatherOk =
      selectedWeather.size === 0 || selectedWeather.has(j.weather);
    const typeOk = selectedTypes.size === 0 || selectedTypes.has(j.type);
    const dur = durationBucket(parseDays(j.duration));
    const durationOk =
      selectedDurations.size === 0 || selectedDurations.has(dur);
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
      .getElementById('gallery-section')
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

  const removeFilter = (
    category: 'season' | 'weather' | 'type' | 'duration',
    value: string
  ) => {
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

  const FilterSection = ({
    title,
    items,
    selectedSet,
    setter,
    category,
  }: {
    title: string;
    items: string[];
    selectedSet: Set<string>;
    setter: (s: Set<string>) => void;
    category: 'season' | 'weather' | 'type' | 'duration';
  }) => (
    <div>
      <h4 className="mb-4 text-xs font-medium tracking-[0.15em] text-zinc-500 uppercase">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = selectedSet.has(item);
          return (
            <motion.button
              key={item}
              onClick={() =>
                toggleInSet(setter, selectedSet, item, !isSelected)
              }
              className={`rounded-full px-4 py-2 text-sm font-light tracking-wide transition-all duration-300 ${
                isSelected
                  ? 'bg-zinc-900 text-white shadow-lg'
                  : 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
              } `}
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

  const filteredJourneys = useMemo(
    () => journeys.filter(matchesFilters),
    [selectedSeasons, selectedWeather, selectedTypes, selectedDurations]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50/30 to-white">
      {/* Toggle Button - Fixed Below Navbar */}
      <div className={cn(
        "fixed top-24 left-1/2 z-50 -translate-x-1/2 transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}>
        <div className="inline-flex rounded-full border border-zinc-300/50 bg-white/70 p-0.5 shadow-md backdrop-blur-md">
          <button
            onClick={() => setViewMode('communityJourneys')}
            className={cn(
              'px-5 py-2 text-xs font-medium transition-all duration-300 rounded-full',
              viewMode === 'communityJourneys'
                ? 'bg-zinc-400 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            )}
          >
            Community Journeys
          </button>
          <button
            onClick={() => setViewMode('myJourneys')}
            className={cn(
              'px-5 py-2 text-xs font-medium transition-all duration-300 rounded-full',
              viewMode === 'myJourneys'
                ? 'bg-zinc-400 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            )}
          >
            Gallery
          </button>
        </div>
      </div>

      {/* Conditional Content */}
      {viewMode === 'communityJourneys' ? (
        // Community Journeys - Card Grid View
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 pb-20 pt-32">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="font-cormorant mb-4 text-4xl font-light text-zinc-800 md:text-5xl">
                Community Journeys
              </h1>
              <p className="font-inter mx-auto max-w-2xl text-zinc-600">
                Discover and import travel itineraries shared by fellow travelers. Find inspiration, save favorites, and create your own adventure.
              </p>
            </div>

            {/* Loading State */}
            {loadingCommunity && (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="size-8 animate-spin text-zinc-400" />
                  <p className="text-zinc-600">Loading community trips...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loadingCommunity && communityTrips.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <Compass className="size-16 text-zinc-300 mb-4" />
                <h3 className="text-xl font-semibold text-zinc-800 mb-2">No community trips yet</h3>
                <p className="text-zinc-600 mb-6">Be the first to share your journey!</p>
                <Button onClick={() => router.push('/ai-planner')}>
                  Create a Trip
                </Button>
              </div>
            )}

            {/* Journey Grid */}
            {!loadingCommunity && communityTrips.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {communityTrips.map((journey) => (
                <motion.div
                  key={journey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -8 }}
                  onClick={() => router.push(`/community-trips/${journey.id}`)}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={journey.image}
                      alt={journey.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 backdrop-blur-sm">
                      <Sun className="size-4 text-amber-500" />
                      <span className="text-sm font-semibold text-zinc-800">{journey.rating}</span>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                      <span className="text-xs font-medium text-white">{journey.duration}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="font-cormorant mb-2 text-xl font-semibold text-zinc-800 line-clamp-1">
                      {journey.title}
                    </h3>

                    {/* Destination */}
                    <div className="mb-3 flex items-center gap-2 text-sm text-zinc-600">
                      <MapPin className="size-4" />
                      <span>{journey.destination}</span>
                    </div>

                    {/* Description */}
                    <p className="font-inter mb-4 text-sm leading-relaxed text-zinc-600 line-clamp-2">
                      {journey.description}
                    </p>

                    {/* Author */}
                    <div className="mb-4 flex items-center gap-3">
                      <img
                        src={journey.authorAvatar}
                        alt={journey.author}
                        className="size-8 rounded-full border-2 border-zinc-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-zinc-800">{journey.author}</p>
                        <p className="text-xs text-zinc-500">{journey.type}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Heart className="size-4" />
                          {journey.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          {journey.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {journey.imports}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/community-trips/${journey.id}`);
                        }}
                        className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            )}
          </div>
        </div>
      ) : (
        // Gallery View
        <>
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

            <h1 className="font-cormorant mb-8 text-7xl font-light tracking-tight text-white md:text-8xl lg:text-9xl" style={{ fontFamily: 'var(--font-bonheur-royale)' }}>
              Featured Journeys
            </h1>

            <p className="font-inter mx-auto mb-6 max-w-3x2 text-xl leading-relaxed font-light tracking-wide text-white/90 md:text-4xl" style={{ fontFamily: 'var(--font-special-elite)' }}>
              Curated stories from discerning travelers.
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
                <div className="font-inter text-xs font-light tracking-[0.2em] text-white/60 uppercase">
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
                <div className="font-inter text-xs font-light tracking-[0.2em] text-white/60 uppercase">
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
                <div className="font-inter text-xs font-light tracking-[0.2em] text-white/60 uppercase">
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
                className="font-inter group rounded-full border border-white/20 bg-white/10 px-10 py-7 text-base font-light tracking-widest text-white uppercase backdrop-blur-md transition-all duration-500 hover:bg-white hover:text-zinc-900 hover:shadow-2xl hover:shadow-white/20"
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

      <main id="gallery-section" className="relative h-screen w-full">
        <InfiniteRunner
          itemsData={filteredJourneys}
          backgroundSpeed={3}
          itemsSpeed={3}
          itemsWidth={filteredJourneys.length * 320}
          itemCount={filteredJourneys.length}
          itemWidth={320}
          character={<PagCharacter />}
          backgroundLayers={[
            {
              id: 'wall',
              content: <GalleryWall />,
              speedMultiplier: 1.0,
            },
            {
              id: 'floor',
              content: <GalleryFloor />,
              speedMultiplier: 1.0,
            },
          ]}
          items={(copyIndex, activeCopy) => (
            <GalleryItems
              items={filteredJourneys}
              activeItemId={activeJourney}
              copyIndex={copyIndex}
              activeCopy={activeCopy}
            />
          )}
          onActiveItemChange={(itemId) => setActiveJourney(itemId)}
          onInteract={(itemId: number) => {
            router.push(`/journeys/${itemId}`);
          }}
        />

        {/* Bottom Bar - Instructions + Filter Button */}
        <div className="absolute bottom-8 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-4 md:flex">
          {/* Instructions */}
          <div className="rounded-full bg-black/60 px-6 py-3 text-white backdrop-blur-sm">
            <p className="text-sm font-medium">
              Press <kbd className="mx-1 rounded bg-white/20 px-2 py-1">←</kbd>{' '}
              or <kbd className="mx-1 rounded bg-white/20 px-2 py-1">→</kbd> to
              scroll,
              <kbd className="mx-1 rounded bg-white/20 px-2 py-1">Enter</kbd> to
              explore destination
            </p>
          </div>

          {/* Filter Button with Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                className={cn(
                  'relative flex size-12 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition-all duration-300',
                  hasActiveFilters
                    ? 'bg-amber-500/90 text-zinc-900'
                    : 'bg-black/60 text-white hover:bg-black/70'
                )}
              >
                <Filter className="size-5" strokeWidth={1.5} />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-zinc-900 shadow-md">
                    {selectedSeasons.size +
                      selectedWeather.size +
                      selectedTypes.size +
                      selectedDurations.size}
                  </span>
                )}
              </button>
            </DialogTrigger>
            <DialogContent
              className="w-auto max-w-fit rounded-2xl border-white/10 bg-black/80 text-white backdrop-blur-xl sm:max-w-fit"
              showCloseButton={true}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between pr-8 text-white">
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-normal text-white/50 transition-colors hover:text-white"
                    >
                      Clear All
                    </button>
                  )}
                </DialogTitle>
              </DialogHeader>

              {/* Filter Grid */}
              <div className="mt-4 flex gap-6">
                {/* Season */}
                <div className="flex-1">
                  <p className="mb-3 text-xs tracking-widest text-white/60 uppercase">
                    Season
                  </p>
                  <div className="flex flex-col gap-1">
                    {['Summer', 'Spring', 'Fall', 'Winter'].map((item) => {
                      const isSelected = selectedSeasons.has(item);
                      return (
                        <button
                          key={item}
                          onClick={() =>
                            toggleInSet(
                              setSelectedSeasons,
                              selectedSeasons,
                              item,
                              !isSelected
                            )
                          }
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-all duration-200',
                            isSelected
                              ? 'bg-amber-500/90 text-zinc-900'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          )}
                        >
                          <div
                            className={cn(
                              'flex size-4 items-center justify-center rounded border',
                              isSelected
                                ? 'border-zinc-900 bg-zinc-900'
                                : 'border-white/40'
                            )}
                          >
                            {isSelected && (
                              <svg
                                className="size-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Weather */}
                <div className="flex-1">
                  <p className="mb-3 text-xs tracking-widest text-white/60 uppercase">
                    Weather
                  </p>
                  <div className="flex flex-col gap-1">
                    {['Sunny', 'Rainy', 'Mild', 'Cool'].map((item) => {
                      const isSelected = selectedWeather.has(item);
                      return (
                        <button
                          key={item}
                          onClick={() =>
                            toggleInSet(
                              setSelectedWeather,
                              selectedWeather,
                              item,
                              !isSelected
                            )
                          }
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-all duration-200',
                            isSelected
                              ? 'bg-amber-500/90 text-zinc-900'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          )}
                        >
                          <div
                            className={cn(
                              'flex size-4 items-center justify-center rounded border',
                              isSelected
                                ? 'border-zinc-900 bg-zinc-900'
                                : 'border-white/40'
                            )}
                          >
                            {isSelected && (
                              <svg
                                className="size-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experience */}
                <div className="flex-1">
                  <p className="mb-3 text-xs tracking-widest text-white/60 uppercase">
                    Experience
                  </p>
                  <div className="flex flex-col gap-1">
                    {[
                      'Adventure',
                      'Beach & Relaxation',
                      'Culture',
                      'Food & Culture',
                      'Family',
                      'City Break',
                    ].map((item) => {
                      const isSelected = selectedTypes.has(item);
                      return (
                        <button
                          key={item}
                          onClick={() =>
                            toggleInSet(
                              setSelectedTypes,
                              selectedTypes,
                              item,
                              !isSelected
                            )
                          }
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-all duration-200',
                            isSelected
                              ? 'bg-amber-500/90 text-zinc-900'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          )}
                        >
                          <div
                            className={cn(
                              'flex size-4 items-center justify-center rounded border',
                              isSelected
                                ? 'border-zinc-900 bg-zinc-900'
                                : 'border-white/40'
                            )}
                          >
                            {isSelected && (
                              <svg
                                className="size-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration */}
                <div className="flex-1">
                  <p className="mb-3 text-xs tracking-widest text-white/60 uppercase">
                    Duration
                  </p>
                  <div className="flex flex-col gap-1">
                    {['< 1 week', '1-2 weeks', '2-3 weeks', '> 3 weeks'].map(
                      (item) => {
                        const isSelected = selectedDurations.has(item);
                        return (
                          <button
                            key={item}
                            onClick={() =>
                              toggleInSet(
                                setSelectedDurations,
                                selectedDurations,
                                item,
                                !isSelected
                              )
                            }
                            className={cn(
                              'flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-all duration-200',
                              isSelected
                                ? 'bg-amber-500/90 text-zinc-900'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            )}
                          >
                            <div
                              className={cn(
                                'flex size-4 items-center justify-center rounded border',
                                isSelected
                                  ? 'border-zinc-900 bg-zinc-900'
                                  : 'border-white/40'
                              )}
                            >
                              {isSelected && (
                                <svg
                                  className="size-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            {item}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
        </>
      )}
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
  onViewDetails,
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
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
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
            animate={
              isAnimating
                ? {
                    scale: [1, 1.3, 1],
                    rotate: [0, 10, -10, 0],
                  }
                : {}
            }
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
          <p className="font-inter mb-6 line-clamp-2 text-base leading-relaxed font-light text-zinc-600">
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
              <motion.span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                →
              </motion.span>
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
