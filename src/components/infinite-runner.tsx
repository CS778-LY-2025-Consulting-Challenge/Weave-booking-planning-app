'use client';

import { cn } from '@/lib/utils';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type TouchEvent,
} from 'react';

/* -----------------------------------------------------------------------------
 * Context
 * -------------------------------------------------------------------------- */

interface InfiniteRunnerContextValue {
  isWalking: boolean;
  direction: 'left' | 'right';
  backgroundOffset: number;
  itemsOffset: number;
  setDirection: (dir: 'left' | 'right' | null) => void;
}

const InfiniteRunnerContext = createContext<InfiniteRunnerContextValue | null>(
  null
);

export interface BackgroundLayer {
  id: string;
  content: ReactNode | string;
  speedMultiplier: number;
}

function useInfiniteRunner() {
  const context = useContext(InfiniteRunnerContext);
  if (!context) {
    throw new Error('useInfiniteRunner must be used within an InfiniteRunner');
  }
  return context;
}

/* -----------------------------------------------------------------------------
 * Joystick Component (Internal)
 * -------------------------------------------------------------------------- */

interface JoystickProps {
  onDirectionChange?: (direction: 'left' | 'right' | null) => void;
  size?: number;
  className?: string;
}

function Joystick({ onDirectionChange, size = 120, className }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const knobSize = size * 0.4;
  const maxDistance = (size - knobSize) / 2;

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!baseRef.current) return;

      const rect = baseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let deltaX = clientX - centerX;
      let deltaY = clientY - centerY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance;
        deltaY = (deltaY / distance) * maxDistance;
      }

      setKnobPosition({ x: deltaX, y: deltaY });

      const threshold = maxDistance * 0.3;
      if (deltaX < -threshold) {
        onDirectionChange?.('left');
      } else if (deltaX > threshold) {
        onDirectionChange?.('right');
      } else {
        onDirectionChange?.(null);
      }
    },
    [maxDistance, onDirectionChange]
  );

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    setIsActive(true);
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!isActive) return;
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsActive(false);
    setKnobPosition({ x: 0, y: 0 });
    onDirectionChange?.(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsActive(true);
    handleMove(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsActive(false);
      setKnobPosition({ x: 0, y: 0 });
      onDirectionChange?.(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isActive, handleMove, onDirectionChange]);

  return (
    <div
      ref={baseRef}
      className={cn(
        'relative rounded-full bg-black/30 backdrop-blur-sm',
        'border-2 border-white/20',
        'touch-none select-none',
        className
      )}
      style={{ width: size, height: size }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Left arrow */}
      <div className="absolute top-1/2 left-3 -translate-y-1/2">
        <div className="h-0 w-0 border-t-[6px] border-r-[8px] border-b-[6px] border-t-transparent border-r-white/40 border-b-transparent" />
      </div>
      {/* Right arrow */}
      <div className="absolute top-1/2 right-3 -translate-y-1/2">
        <div className="h-0 w-0 border-t-[6px] border-b-[6px] border-l-[8px] border-t-transparent border-b-transparent border-l-white/40" />
      </div>
      <div
        className={cn(
          'absolute top-1/2 left-1/2 rounded-full',
          'bg-white/80 shadow-lg',
          'transition-transform duration-75',
          isActive && 'bg-white'
        )}
        style={{
          width: knobSize,
          height: knobSize,
          transform: `translate(calc(-50% + ${knobPosition.x}px), calc(-50% + ${knobPosition.y}px))`,
        }}
      />
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

interface InfiniteRunnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Single background image URL or ReactNode */
  background?: ReactNode | string;
  /** Multiple background layers with parallax speed multipliers */
  backgroundLayers?: BackgroundLayer[];
  /** Background scroll speed in pixels per frame. Default: 4 */
  backgroundSpeed?: number;
  /** Items to render - can be ReactNode or render function receiving (copyIndex, activeCopy) */
  items?:
    | ReactNode
    | ((copyIndex: number, activeCopy: number | null) => ReactNode);
  /** Total width of all items combined (for seamless looping). Default: containerWidth */
  itemsWidth?: number;
  /** Number of items for collision detection */
  itemCount?: number;
  /** Width of each individual item in pixels. Default: 320 */
  itemWidth?: number;
  /** Item data array for stable ID mapping in collision detection. Should match items order. */
  itemsData?: { id: number }[];
  /** Items layer scroll speed in pixels per frame. Default: 4 */
  itemsSpeed?: number;
  /** Enable arrow key controls. Default: true */
  keyboardEnabled?: boolean;
  /** Show on-screen joystick for mobile. Default: true */
  showJoystick?: boolean;
  /** Character element to render */
  character?: ReactNode;
  /** Character horizontal position as percentage (0-1). Default: 0.2 */
  characterPosition?: number;
  /** Called when character enters/exits an item's collision zone */
  onActiveItemChange?: (
    itemId: number | null,
    activeCopy: number | null
  ) => void;
  /** Called when Enter key is pressed while standing on an active item */
  onInteract?: (itemId: number) => void;
}

/* -----------------------------------------------------------------------------
 * Main Component
 * -------------------------------------------------------------------------- */

function InfiniteRunner({
  className,
  background,
  backgroundLayers,
  backgroundSpeed = 4,
  items,
  itemsWidth,
  itemCount = 0,
  itemWidth = 320,
  itemsSpeed = 4,
  keyboardEnabled = true,
  showJoystick = true,
  character,
  characterPosition = 0.2,
  itemsData,
  onActiveItemChange,
  onInteract,
  children,
  ...props
}: InfiniteRunnerProps) {
  // Collision threshold - how close character needs to be to trigger
  const COLLISION_THRESHOLD = 60;
  const activeItemRef = useRef<any>(null);
  const activeCopyRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundOffsetRef = useRef(0);
  const itemsOffsetRef = useRef(0);
  const directionRef = useRef<'left' | 'right' | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Use a fixed large number of copies to prevent coordinate jumps during resize.
  // 30 copies are enough to cover up to 9600px width with standard gallery items.
  const numCopies = 30;
  const baseCopyIndex = 15;

  const [backgroundOffset, setBackgroundOffset] = useState(0);
  const [itemsOffset, setItemsOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [activeCopyState, setActiveCopyState] = useState<number | null>(null);
  const [facingDirection, setFacingDirection] = useState<'left' | 'right'>(
    'right'
  );

  const setDirection = useCallback((dir: 'left' | 'right' | null) => {
    directionRef.current = dir;
    if (dir) {
      setIsWalking(true);
      setFacingDirection(dir);
    } else {
      setIsWalking(false);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setContainerWidth(container.offsetWidth);
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Reset all scroll offsets and active state when items configuration changes
  useEffect(() => {
    // Reset scroll offsets
    backgroundOffsetRef.current = 0;
    setBackgroundOffset(0);
    itemsOffsetRef.current = 0;
    setItemsOffset(0);
    // Reset active state
    activeItemRef.current = null;
    activeCopyRef.current = null;
    setActiveCopyState(null);
  }, [itemsWidth, itemCount]);

  // Collision detection - use useEffectEvent to always access latest props/state
  // without needing to add them as dependencies (solves stale closure issues in animate)
  const checkCollision = useEffectEvent(() => {
    if (
      !onActiveItemChange ||
      itemCount === 0 ||
      !itemsWidth ||
      containerWidth === 0
    )
      return;

    // numCopies and baseCopyIndex are now constants defined at component level

    // Character X position in pixels (center of character)
    const characterX = containerWidth * characterPosition;

    const offset = itemsOffsetRef.current;
    // Normalize offset to be within one cycle
    const normalizedOffset = ((offset % itemsWidth) + itemsWidth) % itemsWidth;

    let activeId: number | null = null;
    let activeCopy: number | null = null;
    let minDist = Infinity;

    for (let i = 0; i < itemCount; i++) {
      // Each item is centered in its container
      const itemCenterX = (i + 0.5) * itemWidth;

      // Check all copies for collision (dynamic based on screen coverage)
      for (let copy = 0; copy < numCopies; copy++) {
        const screenX =
          itemCenterX + normalizedOffset + (copy - baseCopyIndex) * itemsWidth;
        const dist = Math.abs(screenX - characterX);

        // Find the closest item within threshold
        if (dist < COLLISION_THRESHOLD && dist < minDist) {
          minDist = dist;
          activeId = itemsData?.[i]?.id ?? i + 1; // Use itemsData for stable ID
          activeCopy = copy;
        }
      }
    }

    // Only update if changed (check both activeId and activeCopy)
    if (
      activeId !== activeItemRef.current ||
      activeCopy !== activeCopyRef.current
    ) {
      activeItemRef.current = activeId;
      activeCopyRef.current = activeCopy;
      setActiveCopyState(activeCopy);
      onActiveItemChange(activeId, activeCopy);
    }
  });

  // Run collision check when positions, sizes, or item configuration changes
  useEffect(() => {
    checkCollision();
  }, [itemsOffset, containerWidth, itemCount, itemsWidth]);

  const animate = useCallback(() => {
    if (directionRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const multiplier = directionRef.current === 'left' ? 1 : -1;

    backgroundOffsetRef.current += backgroundSpeed * multiplier;
    setBackgroundOffset(backgroundOffsetRef.current);

    if (items) {
      itemsOffsetRef.current += itemsSpeed * multiplier;
      setItemsOffset(itemsOffsetRef.current);
      // Check for collisions after updating position
      // Using useEffectEvent makes this always access latest props/state
      checkCollision();
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [backgroundSpeed, itemsSpeed, items]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  const pressedKeysRef = useRef<string[]>([]);

  useEffect(() => {
    if (!keyboardEnabled) return;

    const updateDirection = () => {
      const keys = pressedKeysRef.current;
      if (keys.length === 0) {
        setDirection(null);
        return;
      }

      // Latest pressed key gets priority
      const lastKey = keys[keys.length - 1];
      if (lastKey === 'ArrowLeft') {
        setDirection('left');
      } else if (lastKey === 'ArrowRight') {
        setDirection('right');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        // Don't add if already in array (prevent repeat events)
        if (!pressedKeysRef.current.includes(e.key)) {
          pressedKeysRef.current.push(e.key);
          updateDirection();
        }
      } else if (e.key === 'Enter' && activeItemRef.current && onInteract) {
        e.preventDefault();
        onInteract(activeItemRef.current);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const index = pressedKeysRef.current.indexOf(e.key);
        if (index > -1) {
          pressedKeysRef.current.splice(index, 1);
          updateDirection();
        }
      }
    };

    const handleBlur = () => {
      pressedKeysRef.current = [];
      updateDirection();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [keyboardEnabled, setDirection, onInteract]);

  const renderBackgroundContent = (content: ReactNode | string) => {
    if (!content) return null;

    if (typeof content === 'string') {
      return (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${content})` }}
        />
      );
    }

    return content;
  };

  const renderBackground = () => {
    if (backgroundLayers && backgroundLayers.length > 0) {
      return backgroundLayers.map((layer) => {
        const normalizedOffset = getNormalizedOffset(
          backgroundOffset * layer.speedMultiplier,
          containerWidth
        );

        return (
          <div
            key={layer.id}
            className="absolute inset-0 flex will-change-transform"
            style={{
              transform: `translateX(${normalizedOffset - containerWidth}px)`,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="relative h-full shrink-0"
                style={{ width: containerWidth || '100%' }}
              >
                {renderBackgroundContent(layer.content)}
              </div>
            ))}
          </div>
        );
      });
    }

    if (!background) {
      return (
        <div
          className="absolute inset-0 flex will-change-transform"
          style={{
            transform: `translateX(${getNormalizedOffset(backgroundOffset, containerWidth) - containerWidth}px)`,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="relative h-full shrink-0"
              style={{ width: containerWidth || '100%' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400" />
            </div>
          ))}
        </div>
      );
    }

    const normalizedBgOffset = getNormalizedOffset(
      backgroundOffset,
      containerWidth
    );

    return (
      <div
        className="absolute inset-0 flex will-change-transform"
        style={{
          transform: `translateX(${normalizedBgOffset - containerWidth}px)`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative h-full shrink-0"
            style={{ width: containerWidth || '100%' }}
          >
            {renderBackgroundContent(background)}
          </div>
        ))}
      </div>
    );
  };

  const getNormalizedOffset = (offset: number, width: number) => {
    if (width === 0) return 0;
    return ((offset % width) + width) % width;
  };

  const normalizedBgOffset = getNormalizedOffset(
    backgroundOffset,
    containerWidth
  );
  // Use itemsWidth if provided, otherwise fall back to containerWidth
  const effectiveItemsWidth = itemsWidth || containerWidth;
  // numCopies and baseCopyIndex are now constants defined at component level
  const normalizedItemsOffset = getNormalizedOffset(
    itemsOffset,
    effectiveItemsWidth
  );

  const contextValue: InfiniteRunnerContextValue = {
    isWalking,
    direction: facingDirection,
    backgroundOffset,
    itemsOffset,
    setDirection,
  };

  return (
    <InfiniteRunnerContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        data-slot="infinite-runner"
        className={cn(
          'relative h-full w-full overflow-hidden',
          'focus:outline-none',
          className
        )}
        tabIndex={keyboardEnabled ? 0 : undefined}
        {...props}
      >
        {/* Background Layer(s) */}
        {renderBackground()}

        {/* Dimming Overlay - Low Ambient Light (Contrast Refined) */}
        <div className="pointer-events-none absolute inset-0 bg-black/50" />

        {/* Shadow at the wall-floor junction */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-48 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

        {/* Floor Light Reflection Base - Subtle warm tint */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-orange-200/5 opacity-40" />

        {/* Items Layer - uses fixed baseCopyIndex to ensure scroll stability */}
        {items && (
          <div
            className="absolute inset-0 flex will-change-transform"
            style={{
              transform: `translateX(${normalizedItemsOffset - baseCopyIndex * effectiveItemsWidth}px)`,
            }}
          >
            {Array.from({ length: numCopies }).map((_, copyIndex) => (
              <div
                key={copyIndex}
                className="relative h-full shrink-0"
                style={{ width: effectiveItemsWidth || '100%' }}
              >
                {typeof items === 'function'
                  ? items(copyIndex, activeCopyState)
                  : items}
              </div>
            ))}
          </div>
        )}

        {/* Character Layer */}
        {character && (
          <div
            className="absolute bottom-16 -translate-x-1/2"
            style={{ left: `${characterPosition * 100}%` }}
          >
            {character}
          </div>
        )}

        {/* Mobile Joystick */}
        {showJoystick && (
          <div className="absolute right-6 bottom-6 md:hidden">
            <Joystick onDirectionChange={setDirection} size={100} />
          </div>
        )}

        {children}
      </div>
    </InfiniteRunnerContext.Provider>
  );
}

export { InfiniteRunner, InfiniteRunnerContext, useInfiniteRunner };
export type { InfiniteRunnerContextValue, InfiniteRunnerProps };
