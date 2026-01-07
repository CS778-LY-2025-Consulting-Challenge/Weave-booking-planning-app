'use client';

import { cn } from '@/lib/utils';

/* -----------------------------------------------------------------------------
 * Gallery Items Component
 * Artwork frames on the gallery wall with interaction points
 * -------------------------------------------------------------------------- */

interface ArtworkItem {
  id: number;
  title: string;
  artist?: string;
  image?: string;
  color?: string; // Placeholder color if no image
}

interface GalleryItemsProps {
  items?: ArtworkItem[];
  activeItemId?: number | null;
  /** Which copy this instance is (0, 1, or 2) */
  copyIndex?: number;
  /** Which copy is currently active (0, 1, or 2), null if none */
  activeCopy?: number | null;
}

function GalleryItems({
  items = [],
  activeItemId,
  copyIndex = 1,
  activeCopy,
}: GalleryItemsProps) {
  // Only show active state if this copy is the active one
  const isActiveCopy = activeCopy === copyIndex;
  return (
    <div className="absolute inset-0 flex items-end pb-32">
      {/* Artwork frames evenly distributed to fill container width for seamless looping */}
      <div className="flex h-full w-full items-end">
        {items.map((artwork, index) => (
          <div
            key={artwork.id}
            data-artwork-id={artwork.id}
            className={cn(
              'relative flex h-full w-80 shrink-0 flex-col items-center' // Fixed width (320px) + shrink-0 prevents overlapping
            )}
          >
            {/* Frame with artwork */}
            <div
              className={cn(
                'absolute transition-transform duration-200',
                index % 2 === 0 ? 'bottom-20' : 'top-20'
              )}
            >
              {/* Spotlight Beam from Ceiling - Increased contrast against ambient */}
              {isActiveCopy && activeItemId === artwork.id && (
                <>
                  {/* Outer soft glow - Highly dispersed Warm Amber */}
                  <div
                    className="pointer-events-none absolute -top-[100vh] left-1/2 h-[200vh] w-[700px] -translate-x-1/2"
                    style={{
                      background: `radial-gradient(ellipse at 50% 50%, rgba(255, 240, 180, 0.25) 0%, rgba(255, 240, 180, 0.05) 40%, transparent 80%)`,
                      filter: 'blur(100px)',
                      mixBlendMode: 'screen',
                    }}
                  />
                  {/* Core sharp beam - Wider and softer falloff */}
                  <div
                    className="pointer-events-none absolute -top-[100vh] left-1/2 h-[200vh] w-40 -translate-x-1/2"
                    style={{
                      background: `linear-gradient(to bottom, rgba(255, 240, 180, 0) 40%, rgba(255, 240, 180, 0.1) 50%, rgba(255, 240, 180, 0.03) 80%)`,
                      filter: 'blur(40px)',
                      mixBlendMode: 'screen',
                    }}
                  />
                </>
              )}

              {/* Interaction hint when active */}
              {isActiveCopy && activeItemId === artwork.id && (
                <div className="animate-in fade-in absolute -top-12 left-1/2 flex -translate-x-1/2 items-center gap-2 text-lg font-bold whitespace-nowrap text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] duration-700">
                  <span>{artwork.title}</span>
                </div>
              )}

              <div
                className={cn(
                  'bg-neutral-900 p-2 shadow-2xl transition-all duration-500',
                  isActiveCopy && activeItemId === artwork.id
                    ? 'ring-1 shadow-white/10 ring-white/20'
                    : 'brightness-[0.5] grayscale-[0.1]'
                )}
              >
                {/* White mat/mount */}
                <div className="bg-white p-4">
                  {/* Artwork placeholder */}
                  <div
                    className={cn(
                      'relative h-80 w-56 transition-all duration-500',
                      artwork.image
                        ? 'bg-cover bg-center'
                        : artwork.color || 'bg-neutral-100'
                    )}
                    style={
                      artwork.image
                        ? { backgroundImage: `url(${artwork.image})` }
                        : undefined
                    }
                  >
                    {/* Placeholder scribble effect */}
                    {!artwork.image && (
                      <svg
                        className="h-full w-full opacity-30"
                        viewBox="0 0 100 140"
                      >
                        <path
                          d="M20,30 Q50,20 80,35 T60,70 T40,100 T70,120"
                          fill="none"
                          stroke="#666"
                          strokeWidth="1"
                        />
                        <path
                          d="M30,50 Q60,40 70,65 T50,90 T45,110"
                          fill="none"
                          stroke="#888"
                          strokeWidth="0.8"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction point - Positioned lower towards character's feet */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2">
              <div
                className={cn(
                  'relative flex h-12 w-32 items-center justify-center transition-opacity duration-500',
                  isActiveCopy && activeItemId === artwork.id
                    ? 'opacity-100'
                    : 'opacity-80'
                )}
              >
                {/* Dynamic Content: Fixed centering */}
                {isActiveCopy && activeItemId === artwork.id ? (
                  <>
                    {/* Core pulse */}
                    <div className="h-4 w-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />

                    {/* Active Ripple rings */}
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="absolute h-8 w-24 rounded-[50%] border-2 border-white/40"
                        style={{
                          animation: `ripple-expand 2s infinite ease-out ${i * 0.6}s`,
                        }}
                      />
                    ))}
                  </>
                ) : (
                  /* Inactive state: Breathing ring - Absolutely centered */
                  <div className="h-10 w-28 animate-pulse rounded-[50%] border-2 border-white/20" />
                )}
              </div>
            </div>

            <style jsx>{`
              @keyframes ripple-expand {
                0% {
                  transform: scale(0.8);
                  opacity: 0.8;
                }
                100% {
                  transform: scale(2.5);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        ))}
      </div>
    </div>
  );
}

export { GalleryItems };
export type { ArtworkItem, GalleryItemsProps };
