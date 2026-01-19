import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { HeartIcon } from 'lucide-react';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface Trip {
  id: number;
  title: string;
  location: string;
  image: string;
  video?: string;
  cardImage: string;
  distance: string;
  elevation: string;
  likes: number;
  bestTime: string;
  customComponent?: () => ReactNode;
}

interface TripCarouselProps {
  className?: string;
  trips: Trip[];
  onTripSelect?: (trip: Trip) => void;
}

export interface TripCarouselRef {
  selectNext: () => void;
}

const TripCarousel = forwardRef<TripCarouselRef, TripCarouselProps>(
  ({ className, trips, onTripSelect }, ref) => {
    const [orderedTrips, setOrderedTrips] = useState(trips);
    const [selectedId, setSelectedId] = useState(trips[0].id);
    const [isDragging, setIsDragging] = useState(false);
    const [hiddenIds, setHiddenIds] = useState<number[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const constraintsRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const controls = useAnimation();

    const handleCardClick = async (trip: Trip) => {
      if (!isDragging && !isAnimating) {
        setSelectedId(trip.id);
        onTripSelect?.(trip);

        const clickedIndex = orderedTrips.findIndex((t) => t.id === trip.id);

        if (clickedIndex === 0) {
          return;
        }

        setIsAnimating(true);

        const cardWidth = 264; // padding + gap
        const moveDistance = -(clickedIndex * cardWidth);

        const cardsToHide = orderedTrips.slice(0, clickedIndex);
        setHiddenIds(cardsToHide.map((t) => t.id));

        await controls.start({
          x: moveDistance,
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 20,
            mass: 1,
          },
        });

        const newOrder = [
          ...orderedTrips.slice(clickedIndex),
          ...orderedTrips.slice(0, clickedIndex),
        ];
        setOrderedTrips(newOrder);

        controls.set({ x: 0 });

        setHiddenIds([]);
        setIsAnimating(false);
      }
    };

    useImperativeHandle(ref, () => ({
      selectNext: () => {
        if (orderedTrips.length > 1) {
          handleCardClick(orderedTrips[1]);
        }
      },
    }));

    // Auto-play: zhangjiajie stays 30s, others stay 5s, pause on hover
    useEffect(() => {
      if (isAnimating || isHovered) return;

      const currentTrip = orderedTrips[0];
      const isZhangjiajie =
        currentTrip?.title?.toLowerCase().includes('zhangjiajie') ||
        currentTrip?.location?.toLowerCase().includes('zhangjiajie');
      const delay = isZhangjiajie ? 30000 : 5000;

      const timer = setTimeout(() => {
        if (orderedTrips.length > 1 && !isAnimating && !isHovered) {
          handleCardClick(orderedTrips[1]);
        }
      }, delay);

      return () => clearTimeout(timer);
    }, [orderedTrips, isAnimating, isHovered]);

    return (
      <div
        className={cn(
          'relative flex w-full items-center overflow-hidden py-4',
          className
        )}
        ref={constraintsRef}
      >
        <motion.div
          drag={!isAnimating && 'x'}
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
          animate={controls}
          style={{ x }}
          className="flex cursor-grab gap-6 pr-[calc(100%-300px)] pl-[calc(100%-300px)] active:cursor-grabbing"
        >
          {orderedTrips.map((trip) => {
            const isSelected = trip.id === selectedId;
            const isHidden = hiddenIds.includes(trip.id);

            return (
              <motion.div
                key={trip.id}
                className="h-80 w-60 flex-shrink-0"
                onClick={() => !isHidden && handleCardClick(trip)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={!isHidden ? { scale: 1.05 } : {}}
                animate={{
                  opacity: isHidden ? 0 : 1,
                  scale: isHidden ? 0.8 : 1,
                }}
                transition={{ duration: 0.2 }}
                style={{ pointerEvents: isHidden ? 'none' : 'auto' }}
              >
                <div
                  className={clsx(
                    'relative h-full w-full overflow-hidden rounded-3xl shadow-2xl transition-all',
                    isSelected ? 'ring-4 ring-white/50' : 'opacity-30'
                  )}
                >
                  <img
                    src={trip.cardImage}
                    alt={trip.title}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />

                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                  <div className="absolute right-0 bottom-0 left-0 p-4 text-white">
                    <h3 className="mb-1 text-lg font-bold tracking-wider">
                      {trip.title}
                    </h3>
                    <p className="mb-4 text-xs text-white/80">
                      {trip.location}
                    </p>

                    {/* <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="mb-1 text-[10px] text-white/60">
                            DISTANCE
                          </span>
                          <span className="text-sm font-semibold">
                            {trip.distance}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="mb-1 text-[10px] text-white/60">
                            ELEVATION
                          </span>
                          <span className="text-sm font-semibold">
                            {trip.elevation}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
                        <span className="text-base font-semibold">
                          {trip.likes}
                        </span>
                      </div>
                    </div> */}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  }
);

TripCarousel.displayName = 'TripCarousel';

export default TripCarousel;
