import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useInfiniteRunner } from './infinite-runner';

/* -----------------------------------------------------------------------------
 * Character Component (Frame Animation)
 * Cycles through 1.png, 2.png, 3.png from /public/character
 * -------------------------------------------------------------------------- */

function Character() {
  const { isWalking, direction } = useInfiniteRunner();
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    if (!isWalking) {
      setFrame(1); // Reset to idle frame
      return;
    }

    const interval = setInterval(() => {
      setFrame((prev) => (prev % 3) + 1);
    }, 150); // Animation speed

    return () => clearInterval(interval);
  }, [isWalking]);

  return (
    <div
      className={cn(
        'relative h-48 w-48 transition-transform duration-100',
        direction === 'left' && 'scale-x-[-1]'
      )}
    >
      <img
        src={`/character/${frame}.png`}
        alt="Character"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export { Character };
