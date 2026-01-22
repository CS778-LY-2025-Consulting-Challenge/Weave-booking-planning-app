import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck, ChevronDown, Compass, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import TripCarousel, { type Trip, type TripCarouselRef } from './TripCarousel';
import ZhangjiajieParallax from './ZhangjiajieParallax';

const TripsSection = () => {
  const [selectedTrip, setSelectedTrip] = useState(upcomingTrips[0]);
  const [selectionKey, setSelectionKey] = useState(0);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const SCROLL_INDICATOR_HIDE_OFFSET = 120;

  const carouselRef = useRef<TripCarouselRef>(null);

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectionKey((prev) => prev + 1);
  };

  useEffect(() => {
    setIsInitialMount(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY <= SCROLL_INDICATOR_HIDE_OFFSET;
      setShowScrollIndicator((prev) =>
        prev !== shouldShow ? shouldShow : prev
      );
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleVideoEnd = () => {
    carouselRef.current?.selectNext();
  };

  return (
    <div className="relative h-screen snap-start overflow-hidden bg-slate-900">
      {/* Landmark background */}
      <AnimatePresence>
        <motion.div
          key={selectionKey}
          className="absolute inset-0"
          style={{ zIndex: selectedTrip.id }}
          initial={{
            clipPath: isInitialMount
              ? 'circle(150% at 50% 50%)'
              : 'circle(0% at 50% 50%)',
            opacity: 1,
          }}
          animate={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          {selectedTrip.customComponent ? (
            selectedTrip.customComponent()
          ) : selectedTrip.video ? (
            <video
              key={selectedTrip.video}
              className="absolute inset-0 h-full w-full bg-slate-900 object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onEnded={handleVideoEnd}
              onError={(e) => console.error('Video playback error:', e)}
            >
              <source src={selectedTrip.video} type="video/mp4" />
            </video>
          ) : (
            <div
              className="absolute inset-0 bg-slate-900 bg-cover bg-center"
              style={{
                backgroundImage: `url(${selectedTrip.image})`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </motion.div>
      </AnimatePresence>

      {/* Scroll indicator overlay */}
      <div
        className={cn(
          'pointer-events-none absolute right-8 bottom-8 z-20 flex flex-col items-center text-white transition-all duration-500',
          showScrollIndicator
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0'
        )}
        aria-hidden="true"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-4 py-2 text-[11px] tracking-[0.35em] uppercase shadow-2xl backdrop-blur-md">
          <span>Scroll</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <ChevronDown className="size-4 animate-bounce" />
          </div>
        </div>
        <div className="mt-2 h-8 w-px bg-gradient-to-b from-white/70 to-transparent"></div>
      </div>

      <div className="relative z-10 h-full px-6 py-8 md:px-12 lg:px-16">
        <motion.div
          className="mx-auto flex h-full flex-col justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col gap-6 text-white md:flex-row md:items-center md:justify-between">
            <div className="ml-4 md:ml-8">
              <h1 className="text-7xl md:text-8xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-butterfly-kids)' }}>Weave</h1>
              <h1 className="text-3xl md:text-4xl font-normal tracking-tight" style={{ fontFamily: 'var(--font-emilys-candy)' }}>
                Your one stop shop for everything travel
              </h1>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/5 px-6 py-4 text-left backdrop-blur-md md:max-w-sm">
              <p className="text-xs tracking-[0.5em] text-white/60 uppercase">
                Now Exploring
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {selectedTrip.title}
              </p>
              <p className="text-sm text-white/70">{selectedTrip.location}</p>
            </div>
          </div>

          <div className="flex flex-col">
            <TripCarousel
              ref={carouselRef}
              trips={upcomingTrips}
              onTripSelect={handleTripSelect}
            />

            <div className="pointer-events-none mx-auto mt-4 mb-8 grid max-w-4xl grid-cols-2 gap-6">
              <button
                onClick={() =>
                  window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth',
                  })
                }
                className="group pointer-events-auto cursor-pointer rounded-3xl border border-white/15 bg-white/5 px-8 py-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-white/25 hover:bg-white/10 hover:shadow-xl"
              >
                <div className="flex items-center gap-8">
                  <Compass className="h-6 w-6 text-white/90 transition-transform duration-300 group-hover:rotate-45" />
                  <div className="text-left">
                    <p className="text-lg font-medium text-white">
                      Start Journey
                    </p>
                    <p className="text-sm text-white/50">
                      Begin your adventure
                    </p>
                  </div>
                </div>
              </button>

              <Link
                href="/destinations"
                className="group pointer-events-auto cursor-pointer rounded-3xl border border-white/15 bg-white/5 px-8 py-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-white/25 hover:bg-white/10 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                  <div className="text-left">
                    <p className="text-lg font-medium text-white">
                      Browse Destinations
                    </p>
                    <p className="text-sm text-white/50">
                      Explore amazing places
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Statistics indicators */}
            <motion.div
              className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {[
                { label: 'Distance', value: selectedTrip.distance },
                {
                  label: 'Best time to visit',
                  value: selectedTrip.bestTime,
                },
                {
                  label: 'Loved by travellers',
                  value: selectedTrip.likes.toLocaleString(),
                },
                {
                  label: 'Region',
                  value:
                    selectedTrip.location.split(',')[1]?.trim() ??
                    selectedTrip.location,
                },
              ].map((stat, index) => (
                <div key={index} className="text-center text-white">
                  <div className="text-xs tracking-[0.5em] text-white/60 uppercase">
                    {stat.label}
                  </div>
                  <div className="mt-3 text-2xl font-semibold whitespace-pre md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mx-auto mt-3 h-px w-16 bg-white/30" />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TripsSection;

export const upcomingTrips: Trip[] = [
  {
    id: 1,
    title: 'ZHANGJIAJIE PEAKS',
    location: 'Hunan, China',
    image: '/api/image-proxy?path=zhangjiajie/background.png',
    cardImage: '/api/image-proxy?path=travels/zhangjiajie_card.jpg',
    distance: '18.2M',
    elevation: '1262M',
    bestTime: 'April – October',
    likes: 1580,
    customComponent: () => <ZhangjiajieParallax imagePath="zhangjiajie" />,
  },
  {
    id: 2,
    title: 'PATAGONIA EXPRESS',
    location: 'Tierra del Fuego, Chile',
    image: '/api/image-proxy?path=travels/america.jpg',
    video: 'https://www.pexels.com/download/video/33197886/',
    cardImage: '/api/image-proxy?path=travels/america_card.jpg',
    distance: '45.5M',
    elevation: '620M',
    bestTime: 'November – March',
    likes: 730,
  },
  {
    id: 3,
    title: 'TOKYO NIGHTS',
    location: 'Shibuya, Tokyo',
    image: '/api/image-proxy?path=travels/tokyo.jpg',
    video: 'https://www.pexels.com/download/video/31385032/',
    cardImage: '/api/image-proxy?path=travels/tokyo_card.jpg',
    distance: '32.1M',
    elevation: '210M',
    bestTime: 'March – May',
    likes: 892,
    bookingUrl: '/packages/3',
  },
  {
    id: 4,
    title: 'GREAT WALL TREK',
    location: 'Beijing, China',
    image: '/api/image-proxy?path=travels/china.jpg',
    video: 'https://www.pexels.com/download/video/5907129/',
    cardImage: '/api/image-proxy?path=travels/china_card.jpg',
    distance: '28.3M',
    elevation: '850M',
    bestTime: 'April – June',
    likes: 654,
  },
  {
    id: 5,
    title: 'HIMALAYAN SUNRISE',
    location: 'Ladakh, India',
    image: '/api/image-proxy?path=travels/india.jpg',
    video: 'https://www.pexels.com/download/video/29632693/',
    cardImage: '/api/image-proxy?path=travels/india_card.jpg',
    distance: '52.7M',
    elevation: '1420M',
    bestTime: 'May – June',
    likes: 1024,
  },
  {
    id: 6,
    title: 'FJORD EXPLORER',
    location: 'South Island, New Zealand',
    image: '/api/image-proxy?path=travels/new_zealand.jpg',
    video: 'https://www.pexels.com/download/video/5700949/',
    cardImage: '/api/image-proxy?path=travels/new_zealand_card.jpg',
    distance: '38.9M',
    elevation: '540M',
    bestTime: 'December ',
    likes: 765,
    bookingUrl: '/packages/1',
  },
  {
    id: 7,
    title: 'THAI TEMPLE TRAIL',
    location: 'Chiang Mai, Thailand',
    image: '/api/image-proxy?path=travels/thailand.jpg',
    video: 'https://www.pexels.com/download/video/8303084/',
    cardImage: '/api/image-proxy?path=travels/thailand_card.jpg',
    distance: '24.6M',
    elevation: '380M',
    bestTime: 'November',
    likes: 583,
  },
];
