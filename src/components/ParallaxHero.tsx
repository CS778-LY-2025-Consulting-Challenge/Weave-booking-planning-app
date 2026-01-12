import { ChevronDown, MapPin, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { cn } from '@/lib/utils';

const HOTSPOTS = [
  {
    id: '1',
    x: 66,
    y: 18,
    title: 'Packages',
    link: '/packages',
    iconUrl: '/api/image-proxy?path=home/packages.png',
    iconClassName: 'w-36',
    description:
      'Curated travel bundles for the ultimate Zhangjiajie experience.',
    alignment: 'left',
  },
  {
    id: '2',
    x: 48,
    y: 33,
    title: 'AI Trip Planner',
    link: '/ai-planner',
    iconUrl: '/api/image-proxy?path=home/ai-planner.png',
    iconClassName: 'w-40',
    description:
      'Intelligent itineraries customized to your personal preferences.',
    alignment: 'right',
  },
  {
    id: '3',
    x: 56,
    y: 48,
    title: 'Flights',
    link: '/flights',
    iconUrl: '/api/image-proxy?path=home/flights.png',
    iconClassName: 'w-44',
    description: 'Seamless flight connections to transport you to the clouds.',
    alignment: 'left',
  },
  {
    id: '4',
    x: 68,
    y: 64,
    title: 'Hotels',
    link: '/hotels',
    iconUrl: '/api/image-proxy?path=home/hotels.png',
    iconClassName: 'w-36',
    description: 'Luxury stays tucked away in the mystical peaks.',
    alignment: 'right',
  },
  {
    id: '5',
    x: 20,
    y: 72,
    title: 'Local Guides',
    link: '/guides',
    iconUrl: '/api/image-proxy?path=home/guides.png',
    iconClassName: 'w-40',
    description: 'Expert local storytellers to unlock hidden mountain secrets.',
    alignment: 'right',
  },
  {
    id: '6',
    x: 88,
    y: 68,
    title: 'Community Journeys',
    link: '/journeys',
    iconUrl: '/api/image-proxy?path=home/journeys.png',
    iconClassName: 'w-52',
    description: 'Connect with fellow adventurers on shared mountain paths.',
    alignment: 'bottom',
  },
];

const ROUTES = [
  { from: '1', to: '2' },
  { from: '2', to: '3' },
  { from: '3', to: '4' },
];

const ParallaxHero = () => {
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  const [textUrl, setTextUrl] = useState<string>('');
  const [mountainUrl, setMountainUrl] = useState<string>('');
  const [mountainOffset, setMountainOffset] = useState(500);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const SCROLL_HINT_HIDE_OFFSET = 150;

  // Helper code to get coordinates for routes
  const getPoint = (id: string) => HOTSPOTS.find((p) => p.id === id);

  // Fetch signed URLs on mount
  useEffect(() => {
    setBackgroundUrl(`/api/image-proxy?path=home/background.jpg`);
    setTextUrl(`/api/image-proxy?path=home/text.png`);
    setMountainUrl(`/api/image-proxy?path=home/mountain.png`);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const stickyStart = 0; // When sticky container hits top of viewport

      // Calculate how far we've scrolled into the sticky section
      // rect.top will be 0 when sticky, negative when scrolling past
      if (rect.top <= stickyStart && rect.bottom > window.innerHeight) {
        // We're in the sticky zone - move the mountain up
        const scrolledIntoSticky = -rect.top;
        const newOffset = Math.max(0, 500 - scrolledIntoSticky * 0.6);
        setMountainOffset(newOffset);
      } else if (rect.top > stickyStart) {
        // Before sticky zone - mountain at initial position
        setMountainOffset(500);
      } else {
        // After sticky zone - mountain fully up
        setMountainOffset(0);
      }

      // Fade out scroll indicator once the visitor starts moving
      const shouldShow = window.scrollY <= SCROLL_HINT_HIDE_OFFSET;
      setShowScrollHint((prev) => (prev !== shouldShow ? shouldShow : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // Outer container with extra height for scroll distance
    <div
      ref={containerRef}
      className="relative h-[200vh] font-sans"
      id="hero-section"
    >
      {/* Sticky inner container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: backgroundUrl
              ? `url(${backgroundUrl})`
              : undefined,
          }}
        />

        {/* Welcome text */}
        <div className="absolute inset-x-0 top-8 z-10 text-center">
          <span className="text-xs font-light tracking-[0.4em] text-white uppercase opacity-80">
            WELCOME TO WEAVE
          </span>
        </div>

        {/* Text layer */}
        <div className="pointer-events-none absolute inset-x-0 top-20 z-10 mx-auto flex w-[80%] items-center justify-center">
          {textUrl && (
            <Image
              src={textUrl}
              alt="Weave Text"
              width={600}
              height={200}
              className="max-h-full max-w-full object-contain"
              unoptimized
            />
          )}
        </div>

        {/* Mountain layer - moves up during sticky scroll */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full"
          style={{
            transform: `translateY(${mountainOffset}px)`,
          }}
        >
          {mountainUrl && (
            <div className="pointer-events-auto relative h-auto w-full">
              <Image
                src={mountainUrl}
                alt="Mountain"
                width={1920}
                height={1080}
                className="h-auto w-full object-contain"
                unoptimized
              />

              {/* Hotspots & Routes Overlay */}
              <div className="pointer-events-none absolute inset-0">
                {/* SVG Route Lines */}
                <svg
                  className="absolute inset-0 z-0 h-full w-full overflow-visible"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="line-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                      <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  {ROUTES.map((route, idx) => {
                    const start = getPoint(route.from);
                    const end = getPoint(route.to);
                    if (!start || !end) return null;
                    return (
                      <motion.path
                        key={`route-${idx}`}
                        d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                        stroke="rgba(255,255,255,1)"
                        strokeWidth="0.4"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                          duration: 1.5,
                          delay: 0.5 + idx * 1.5,
                          ease: 'easeInOut',
                        }}
                      />
                    );
                  })}
                </svg>

                {/* Hotspots */}
                <div className="absolute inset-0 z-10">
                  {HOTSPOTS.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    >
                      <HoverCard openDelay={100} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <div
                            className={cn(
                              'relative z-10 flex cursor-pointer items-center justify-center p-2',
                              hotspot.iconClassName
                            )}
                          >
                            {/* Backdrop Pulse Glow - Size dynamic based on icon h */}
                            <span className="absolute inline-flex animate-ping rounded-full bg-white opacity-10"></span>

                            {/* Sticker/Icon Image */}
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 2 }}
                              whileTap={{ scale: 0.95 }}
                              className="relative z-10"
                            >
                              <img
                                src={hotspot.iconUrl}
                                alt={hotspot.title}
                                className={cn(
                                  'w-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform'
                                )}
                              />
                            </motion.div>
                          </div>
                        </HoverCardTrigger>

                        <HoverCardContent
                          sideOffset={15}
                          className="w-60 rounded-xl border border-white/10 bg-black/60 p-4 shadow-2xl backdrop-blur-xl"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <h3 className="text-base leading-tight font-medium text-white">
                              {hotspot.title}
                            </h3>
                            <MapPin className="mt-0.5 size-3.5 text-emerald-400" />
                          </div>
                          <p className="mb-4 text-xs leading-relaxed font-light text-white/70">
                            {hotspot.description}
                          </p>

                          <a
                            href={hotspot.link}
                            className="group/btn flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-all duration-300 hover:bg-white/10"
                          >
                            <span className="text-[11px] font-medium tracking-wide text-white">
                              Explore More
                            </span>
                            <ArrowRight className="size-3 text-white/50 transition-all group-hover/btn:translate-x-0.5 group-hover/btn:text-white" />
                          </a>
                        </HoverCardContent>
                      </HoverCard>

                      {/* Absolutely positioned Title Label - OUTSIDE the trigger */}
                      <span
                        className={cn(
                          'pointer-events-none absolute rounded-full border border-white/5 bg-black/20 px-2 py-0.5 text-[10px] font-medium tracking-wider whitespace-nowrap text-white/90 uppercase drop-shadow-md backdrop-blur-sm transition-colors sm:text-xs',
                          hotspot.alignment === 'bottom'
                            ? 'top-full left-1/2 mt-2 -translate-x-1/2'
                            : 'top-1/2 -translate-y-1/2',
                          hotspot.alignment === 'right' && 'left-full ml-2',
                          hotspot.alignment === 'left' && 'right-full mr-2'
                        )}
                      >
                        {hotspot.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div
          className={cn(
            'absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 text-white transition-all duration-500',
            showScrollHint
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-2 opacity-0'
          )}
        >
          <span className="text-[10px] font-medium tracking-[0.5em] uppercase opacity-60">
            Scroll to explore
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-md">
            <ChevronDown className="size-4 animate-bounce text-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParallaxHero;
