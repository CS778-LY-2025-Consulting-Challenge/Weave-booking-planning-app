 'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export default function TrendingDestinations() {
  const [bestInTravelSrc, setBestInTravelSrc] = useState(
    'https://www.lonelyplanet.com/best-in-travel'
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const localPath = '/best-in-travel/index.html';

    fetch(localPath, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setBestInTravelSrc(localPath);
        }
      })
      .catch(() => {
        /* ignore failures and keep the remote fallback */
      });
  }, []);

  useEffect(() => {
    const handleIframeLoad = () => {
      if (!iframeRef.current) return;

      try {
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        // If we're loading the local HTML and it has no styles, fallback to remote
        const isLocal = bestInTravelSrc.startsWith('/');
        if (isLocal) {
          const hasStyles =
            (doc as any).styleSheets?.length > 0 ||
            !!doc.querySelector('link[rel="stylesheet"], style');

          if (!hasStyles) {
            setBestInTravelSrc('https://www.lonelyplanet.com/best-in-travel');
            return;
          }
        }

        const navTerms = [
          'Destinations',
          'Books',
          'Trips',
          'Stories',
          'Search',
          'Cart',
          'Sign In',
        ];

        const header = doc.querySelector('header');
        if (
          header &&
          header.textContent &&
          navTerms.every((term) => header.textContent?.includes(term))
        ) {
          header.style.display = 'none';
        }

        const matchingNode = Array.from(doc.querySelectorAll<HTMLElement>('*')).find(
          (el) =>
            el.textContent &&
            el.textContent.includes('Places to go in 2026') &&
            el.textContent.includes('Welcome to Lonely Planet')
        );

        if (matchingNode) {
          matchingNode.style.display = 'none';
        }
      } catch (error) {
        /* cross-origin; ignore */
      }
    };

    const node = iframeRef.current;
    node?.addEventListener('load', handleIframeLoad);

    return () => {
      node?.removeEventListener('load', handleIframeLoad);
    };
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
            <h1 className="mb-4 text-white drop-shadow-lg">
              Trending Destinations
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-white/90 drop-shadow-md">
              Discover the world's most exciting destinations right now. From
              hidden gems to iconic landmarks, explore where travelers are
              heading this season.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Best-in-Travel Content (replaces destination cards grid) */}
      <section className="bg-white">
        <div className="w-full">
          <div className="h-[90vh] w-screen overflow-hidden">
            <iframe
              src={bestInTravelSrc}
              title="Lonely Planet Best in Travel 2026"
              loading="lazy"
              className="h-full w-full"
              referrerPolicy="no-referrer"
              ref={iframeRef}
            />
          </div>
        </div>
      </section>
    </div>
  );
}