'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export default function TrendingDestinations() {
  const [bestInTravelSrc, setBestInTravelSrc] = useState(
    '/best-in-travel/index.html'
  );
  const [iframeHeight, setIframeHeight] = useState<number | undefined>(undefined);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Prefer local file; if missing, fallback to remote (may have its own scroll)
    fetch('/best-in-travel/index.html', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setBestInTravelSrc('/best-in-travel/index.html');
        } else {
          setBestInTravelSrc('https://www.lonelyplanet.com/best-in-travel');
        }
      })
      .catch(() => {
        setBestInTravelSrc('https://www.lonelyplanet.com/best-in-travel');
      });
  }, []);

  useEffect(() => {
    const handleIframeLoad = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        // Seamless integration: hide the embedded page's own header if present
        const header = doc.querySelector('header');
        if (header) header.style.display = 'none';

        // Remove any welcome banner text block if found
        const matchingNode = Array.from(doc.querySelectorAll<HTMLElement>('*')).find(
          (el) =>
            el.textContent &&
            el.textContent.includes('Places to go in 2026') &&
            el.textContent.includes('Welcome to Lonely Planet')
        );
        if (matchingNode) matchingNode.style.display = 'none';

        // Resize iframe to match content height for single page scrollbar
        const body = doc.body;
        const html = doc.documentElement;
        const height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );
        setIframeHeight(height);

        // Optional: observe changes to adjust height if content expands
        const observer = new ResizeObserver(() => {
          const newHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
          );
          setIframeHeight(newHeight);
        });
        observer.observe(body);
      } catch (err) {
        // Cross-origin: cannot access content; leave default height
        setIframeHeight(undefined);
      }
    };

    const node = iframeRef.current;
    node?.addEventListener('load', handleIframeLoad);
    return () => node?.removeEventListener('load', handleIframeLoad);
  }, [bestInTravelSrc]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Video Background - Full Screen */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* YouTube Video Background */}
        <div className="absolute inset-0">
          <iframe
            className="absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2"
            src="https://www.youtube.com/embed/LQuLAbG62vY?si=OINNSloSE4hmXHRy&start=17&autoplay=1&mute=1&loop=1&controls=0&playlist=LQuLAbG62vY&modestbranding=1&showinfo=0&rel=0"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ pointerEvents: 'none' }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

        {/* Content Overlay */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-4 text-white drop-shadow-lg">Trending Destinations</h1>
            <p className="mx-auto max-w-3xl text-xl text-white/90 drop-shadow-md">
              Discover the world's most exciting destinations right now.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Integrated Best-in-Travel content */}
      <section className="bg-white">
        <div className="w-full">
          <iframe
            src={bestInTravelSrc}
            title="Best in Travel 2026"
            loading="lazy"
            className="w-full border-0"
            style={{
              display: 'block',
              width: '100%',
              height: iframeHeight ? `${iframeHeight}px` : '1500px',
              minHeight: '600px',
            }}
            scrolling="no"
            referrerPolicy="no-referrer"
            ref={iframeRef}
          />
        </div>
      </section>
      {/* Footer is provided globally via Providers in layout */}
    </div>
  );
}