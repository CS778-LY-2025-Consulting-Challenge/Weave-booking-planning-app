import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TripCarousel, { type TripCarouselRef } from './TripCarousel';

const TripsSection = () => {
  const [selectedTrip, setSelectedTrip] = useState(upcomingTrips[0]);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const SCROLL_INDICATOR_HIDE_OFFSET = 120;

  const carouselRef = useRef<TripCarouselRef>(null);

  useEffect(() => {
    setIsInitialMount(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY <= SCROLL_INDICATOR_HIDE_OFFSET;
      setShowScrollIndicator((prev) =>
        prev !== shouldShow ? shouldShow : prev,
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
    <div className="bg-slate-900 relative h-screen snap-start overflow-hidden">
      {/* Landmark background */}
      <AnimatePresence>
        <motion.div
          key={selectedTrip.id}
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
          {selectedTrip.video ? (
            <video
              key={selectedTrip.video}
              className="bg-slate-900 absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnd}
            >
              <source src={selectedTrip.video} type="video/mp4" />
            </video>
          ) : (
            <div
              className="bg-slate-900 absolute inset-0 bg-cover bg-center"
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
        className={`pointer-events-none absolute bottom-8 right-8 z-20 flex flex-col items-center text-white transition-all duration-500 ${showScrollIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        aria-hidden="true"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-4 py-2 text-[11px] uppercase tracking-[0.35em] backdrop-blur-md shadow-2xl">
          <span>Scroll</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <ChevronDown className="size-4 animate-bounce" />
          </div>
        </div>
        <div className="mt-2 h-8 w-px bg-gradient-to-b from-white/70 to-transparent"></div>
      </div>

      <div className="relative z-10 h-full px-6 py-16">
        <motion.div
          className="mx-auto flex h-full max-w-7xl flex-col justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col gap-6 text-white md:flex-row md:items-end md:justify-between">
            <div>
              
              <h1 className="mt-2 text-5xl font-bold tracking-tight">Weave</h1>
           
              
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/5 px-6 py-4 text-left backdrop-blur-md md:max-w-sm">
              <p className="text-xs uppercase tracking-[0.5em] text-white/60">
                Now Exploring
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {selectedTrip.title}
              </p>
              <p className="text-sm text-white/70">{selectedTrip.location}</p>
            </div>
          </div>

          <TripCarousel
            ref={carouselRef}
            trips={upcomingTrips}
            onTripSelect={setSelectedTrip}
          />

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
                <div className="text-xs uppercase tracking-[0.5em] text-white/60">
                  {stat.label}
                </div>
                <div className="mt-3 text-2xl font-semibold md:text-3xl">
                  {stat.value}
                </div>
                <div className="mx-auto mt-3 h-px w-16 bg-white/30" />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TripsSection;

export const upcomingTrips = [
  {
    id: 1,
    title: 'PATAGONIA EXPRESS',
    location: 'Tierra del Fuego, Chile',
    image: '/travels/america.jpg',
    video: 'https://www.pexels.com/download/video/33197886/',
    cardImage: '/travels/america_card.jpg',
    distance: '45.5M',
    elevation: '620M',
    bestTime: 'November – March',
    likes: 730,
  },
  {
    id: 2,
    title: 'TOKYO NIGHTS',
    location: 'Shibuya, Tokyo',
    image: '/travels/tokyo.jpg',
    video: 'https://www.pexels.com/download/video/31385032/',
    cardImage: '/travels/tokyo_card.jpg',
    distance: '32.1M',
    elevation: '210M',
    bestTime: 'March – May',
    likes: 892,
  },
  {
    id: 3,
    title: 'GREAT WALL TREK',
    location: 'Beijing, China',
    image: '/travels/china.jpg',
    video: 'https://www.pexels.com/download/video/5907129/',
    cardImage: '/travels/china_card.jpg',
    distance: '28.3M',
    elevation: '850M',
    bestTime: 'April – June',
    likes: 654,
  },
  {
    id: 4,
    title: 'HIMALAYAN SUNRISE',
    location: 'Ladakh, India',
    image: '/travels/india.jpg',
    video: 'https://www.pexels.com/download/video/29632693/',
    cardImage: '/travels/india_card.jpg',
    distance: '52.7M',
    elevation: '1420M',
    bestTime: 'May – June',
    likes: 1024,
  },
  {
    id: 5,
    title: 'FJORD EXPLORER',
    location: 'South Island, New Zealand',
    image: '/travels/new_zealand.jpg',
    video: 'https://www.pexels.com/download/video/5700949/',
    cardImage: '/travels/new_zealand_card.jpg',
    distance: '38.9M',
    elevation: '540M',
    bestTime: 'December ',
    likes: 765,
  },
  {
    id: 6,
    title: 'THAI TEMPLE TRAIL',
    location: 'Chiang Mai, Thailand',
    image: '/travels/thailand.jpg',
    video: 'https://www.pexels.com/download/video/8303084/',
    cardImage: '/travels/thailand_card.jpg',
    distance: '24.6M',
    elevation: '380M',
    bestTime: 'November',
    likes: 583,
  },
];