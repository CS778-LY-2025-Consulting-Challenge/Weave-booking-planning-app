import { ChevronDown, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const TIMELINE_ITEMS = [
  {
    id: '1',
    title: 'Packages',
    link: '/packages',
    iconUrl: '/images/packages.png',
    description:
      'Curated travel bundles for the ultimate Zhangjiajie experience.',
  },
  {
    id: '2',
    title: 'AI Trip Planner',
    link: '/ai-planner-intro',
    iconUrl: '/images/ai-planner.png',
    description:
      'Intelligent itineraries customized to your personal preferences.',
  },
  {
    id: '3',
    title: 'Flights',
    link: '/flights',
    iconUrl: '/images/flights.png',
    description: 'Seamless flight connections to transport you to the clouds.',
  },
  {
    id: '4',
    title: 'Hotels',
    link: '/hotels',
    iconUrl: '/images/hotels.png',
    description: 'Luxury stays tucked away in the mystical peaks.',
  },
  {
    id: '5',
    title: 'Local Guides',
    link: '/guides',
    iconUrl: '/images/guides.png',
    description: 'Expert local storytellers to unlock hidden mountain secrets.',
  },
  {
    id: '6',
    title: 'Community Journeys',
    link: '/journeys',
    iconUrl: '/images/journeys.png',
    description: 'Connect with fellow adventurers on shared mountain paths.',
  },
];

const ParallaxHero = () => {
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  const [textUrl, setTextUrl] = useState<string>('');
  const [mountainUrl, setMountainUrl] = useState<string>('');
  const [mountainOffset, setMountainOffset] = useState(500);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const SCROLL_HINT_HIDE_OFFSET = 150;

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
        <div className="absolute inset-x-0 top-8 text-center">
          <span className="text-base md:text-lg font-light tracking-[0.4em] text-white uppercase opacity-80">
            WELCOME TO WEAVE
          </span>
        </div>

        {/* Text layer */}
        <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto flex w-[85%] md:w-[90%] items-center justify-center">
          {textUrl && (
            <Image
              src={textUrl}
              alt="Weave Text"
              width={800}
              height={280}
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

              {/* Timeline Overlay on Mountain */}
              <div className="pointer-events-none absolute inset-0 top-[28%] flex items-start justify-center">
                <div className="pointer-events-auto relative flex w-full max-w-4xl items-start justify-center px-8">
                  {/* Center Vertical Line */}
                  <div className="absolute top-0 left-1/2 z-10 h-full w-[2px] -translate-x-1/2 bg-white" />

                  {/* Timeline Cards Container */}
                  <div className="relative flex w-full flex-col gap-3">
                    {TIMELINE_ITEMS.map((item, index) => {
                      const isLeft = index % 2 === 0;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.15,
                            ease: 'easeOut',
                          }}
                          className={cn(
                            'relative flex w-full items-center',
                            isLeft ? 'justify-start' : 'justify-end'
                          )}
                        >
                          {/* Center Dot */}
                          <div className="absolute left-1/2 z-20 flex h-3 w-3 -translate-x-1/2 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-900/80" />
                          </div>

                          {/* Card */}
                          <motion.a
                            href={item.link}
                            whileHover={{ scale: 1.02, translateY: -2 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                              'group relative w-[48%] overflow-hidden rounded-xl border border-white/20 bg-black/40 p-6 backdrop-blur-md transition-all',
                              isLeft ? 'mr-auto' : 'ml-auto'
                            )}
                          >
                            <div className="flex items-center gap-4">
                              {/* Icon */}
                              <div className="h-16 w-16 flex-shrink-0">
                                <img
                                  src={item.iconUrl}
                                  alt={item.title}
                                  className="h-full w-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                                />
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-semibold text-white">
                                  {item.title}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/80">
                                  {item.description}
                                </p>
                              </div>

                              {/* Arrow */}
                              <ArrowRight className="size-5 flex-shrink-0 text-white/40 transition-all group-hover:translate-x-1 group-hover:text-white" />
                            </div>
                          </motion.a>
                        </motion.div>
                      );
                    })}
                  </div>
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
