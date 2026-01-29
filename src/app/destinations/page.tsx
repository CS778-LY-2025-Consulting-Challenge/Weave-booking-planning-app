'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export default function TrendingDestinations() {
  const [bestInTravelSrc] = useState('/best-in-travel/index.html');
  const [iframeHeight, setIframeHeight] = useState<number | undefined>(undefined);
  const iframeRef = useRef<HTMLIFrameElement>(null);



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
      {/* Hero Section with S3 Video Background - Full Screen */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* S3 Video Background */}
        <video
          className="absolute top-1/2 left-1/2 h-full w-full object-cover -translate-x-1/2 -translate-y-1/2"
          src="https://d30mgvfwc9sz4j.cloudfront.net/hero-videos/destinations-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        {/* Content Overlay */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-4 text-white drop-shadow-lg md:text-9xl" style={{ fontFamily: 'var(--font-bonheur-royale)' }} >Trending Destinations</h1>
            <p className="mx-auto max-w-3x3 text-xl md:text-3xl text-white/90 drop-shadow-md" style={{ fontFamily: 'var(--font-special-elite)' }}>
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
            referrerPolicy="no-referrer"
            ref={iframeRef}
          />
        </div>
      </section>
      {/* Footer is provided globally via Providers in layout */}
    </div>
  );
}