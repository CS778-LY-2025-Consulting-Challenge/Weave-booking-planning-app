'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, BadgeCheck, X } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
// import { Guide } from '@/lib/types'; // Removed invalid import
import { GuideBookingDialog } from '@/components/GuideBookingDialog';

// Define Guide interface locally if not available globally yet, 
// matching the one in guides/page.tsx for now
interface GuideProps {
    id: string;
    name: string;
    country: string;
    rating: number;
    reviews: number;
    languages: string[];
    specialties: string[];
    hourlyRate: number;
    image: string;
    video: string;
    verified: boolean;
    responseTime: string;
    featured?: boolean;
    tagline?: string;
}

interface FeaturedGuidesCarouselProps {
    guides: GuideProps[];
    onBookAppointment: (guide: GuideProps) => void;
}

export function FeaturedGuidesCarousel({ guides, onBookAppointment }: FeaturedGuidesCarouselProps) {
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [isCarouselHovered, setIsCarouselHovered] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Auto-scroll carousel
    useEffect(() => {
        if (!carouselRef.current || isCarouselHovered || playingVideoId) return;

        const scrollContainer = carouselRef.current;
        let scrollInterval: NodeJS.Timeout;

        scrollInterval = setInterval(() => {
            if (scrollContainer) {
                const maxScroll =
                    scrollContainer.scrollWidth - scrollContainer.clientWidth;
                const currentScroll = scrollContainer.scrollLeft;

                if (currentScroll >= maxScroll) {
                    // Reset to start for infinite loop
                    scrollContainer.scrollLeft = 0;
                } else {
                    // Smooth scroll by 1 pixel
                    scrollContainer.scrollLeft += 1;
                }
            }
        }, 20);

        return () => clearInterval(scrollInterval);
    }, [isCarouselHovered, playingVideoId]);

    if (!guides || guides.length === 0) return null;

    // Duplicate guides for infinite scroll effect
    const displayGuides = [...guides, ...guides, ...guides];

    return (
        <div
            className="relative"
            onMouseEnter={() => {
                if (!isCarouselHovered) setIsCarouselHovered(true);
            }}
            onMouseLeave={() => {
                if (isCarouselHovered) setIsCarouselHovered(false);
            }}
        >
            <div
                ref={carouselRef}
                className="scrollbar-hide overflow-x-auto"
                style={{ scrollBehavior: 'auto' }}
            >
                <div className="flex gap-6 px-6 pb-4 lg:px-12">
                    {displayGuides.map((guide, index) => {
                        // Unique key for duplicated items
                        const cardId = `${guide.id}-${index}`;
                        const isPlayingVideo = playingVideoId === cardId;

                        return (
                            <div
                                key={cardId}
                                className="group w-[320px] flex-none cursor-pointer sm:w-95"
                            >
                                <div className="relative aspect-3/4 overflow-hidden rounded-3xl shadow-lg bg-gray-100">
                                    {!isPlayingVideo ? (
                                        <>
                                            <ImageWithFallback
                                                src={guide.image}
                                                alt={guide.name}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />

                                            {/* Video Play Button - Show only if video exists */}
                                            {guide.video && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPlayingVideoId(cardId);
                                                    }}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 hover:bg-black/20"
                                                >
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl transition-transform duration-300 group-hover:scale-110">
                                                        <div className="ml-1 h-0 w-0 border-t-10 border-b-10 border-l-16 border-t-transparent border-b-transparent border-l-blue-600"></div>
                                                    </div>
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <video
                                                src={guide.video}
                                                className="absolute inset-0 h-full w-full object-cover"
                                                autoPlay
                                                controls
                                                loop
                                                muted
                                                playsInline
                                                preload="metadata"
                                                onError={(e) => {
                                                    console.error('Video error:', e);
                                                    setPlayingVideoId(null);
                                                }}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPlayingVideoId(null);
                                                }}
                                                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black hover:bg-white"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </>
                                    )}

                                    {/* Text Overlay */}
                                    {!isPlayingVideo && (
                                        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-black/20 to-transparent p-6">
                                            <h3 className="mb-1 text-2xl text-white">
                                                {guide.name.split(' ')[0]}
                                            </h3>
                                            <p className="mb-3 text-sm text-white/90">
                                                Local expert, {guide.country}
                                            </p>

                                            {guide.featured && (
                                                <div className="space-y-1 mb-3">
                                                    <p className="text-xs tracking-wide text-white uppercase">
                                                        Featured Guide
                                                    </p>
                                                    <p className="text-xs text-white/80">
                                                        {guide.tagline}
                                                    </p>
                                                </div>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onBookAppointment(guide); // Delegate to parent
                                                }}
                                                className="pointer-events-auto w-full rounded-lg bg-white py-2.5 px-4 text-sm font-medium text-black transition-all hover:bg-blue-600 hover:text-white shadow-lg"
                                            >
                                                Book appointment
                                            </button>
                                        </div>
                                    )}

                                    {!isPlayingVideo && guide.verified && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs text-black shadow-md backdrop-blur-sm">
                                            <BadgeCheck className="size-3" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                className="absolute top-1/2 left-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl transition-colors hover:bg-gray-50"
                onClick={() => {
                    if (carouselRef.current) {
                        carouselRef.current.scrollLeft -= 400;
                    }
                }}
            >
                <ChevronDown className="size-6 -rotate-90" />
            </button>
            <button
                className="absolute top-1/2 right-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl transition-colors hover:bg-gray-50"
                onClick={() => {
                    if (carouselRef.current) {
                        carouselRef.current.scrollLeft += 400;
                    }
                }}
            >
                <ChevronDown className="size-6 rotate-90" />
            </button>
        </div>
    );
}
