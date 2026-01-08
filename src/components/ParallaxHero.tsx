import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

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
    // Outer container with extra height for scroll distance
    <div ref={containerRef} className="relative h-[200vh]" id="hero-section">
      {/* Sticky inner container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
          }}
        />

        {/* Welcome text */}
        <div className="absolute inset-x-0 top-8 text-center">
          <span className="text-white text-sm tracking-[0.3em] uppercase">
            WELCOME TO WEAVE
          </span>
        </div>

        {/* Text layer */}
        <div
          className="absolute inset-x-0 top-20 w-[80%] mx-auto flex items-center justify-center"
        >
          {textUrl && (
            <Image
              src={textUrl}
              alt="Weave Text"
              width={600}
              height={200}
              className="max-w-full max-h-full object-contain"
              unoptimized
            />
          )}
        </div>

        {/* Mountain layer - moves up during sticky scroll */}
        <div
          className="absolute inset-x-0 bottom-0 w-full pointer-events-none"
          style={{
            transform: `translateY(${mountainOffset}px)`,
          }}
        >
          {mountainUrl && (
            <Image
              src={mountainUrl}
              alt="Mountain"
              width={1920}
              height={1080}
              className="w-full h-auto object-contain"
              unoptimized
            />
          )}
        </div>

        {/* Scroll Indicator */}
        <div
          className={`absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-white transition-all duration-500 ${showScrollHint ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'}`}
        >
          <span className="text-xs tracking-[0.35em] uppercase">
            Scroll to explore
          </span>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/10 shadow-lg backdrop-blur-md">
            <ChevronDown className="size-5 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParallaxHero;