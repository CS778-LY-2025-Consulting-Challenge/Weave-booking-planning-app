'use client';

import { cn } from '@/lib/utils';
import { PAGInit } from 'libpag';
import { useEffect, useRef, useState } from 'react';
import { Character } from './character';
import { useInfiniteRunner } from './infinite-runner';

export function PagCharacter() {
  const { isWalking, direction } = useInfiniteRunner();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initPAG() {
      try {
        const PAG = await PAGInit();
        if (!mounted || !canvasRef.current) return;

        const response = await fetch('/character.pag');
        const buffer = await response.arrayBuffer();
        const pagFile = await PAG.PAGFile.load(buffer);

        if (!mounted || !canvasRef.current) return;

        const pagView = await PAG.PAGView.init(pagFile, canvasRef.current);
        if (!mounted) return;

        if (!pagView) return;

        // Speed up animation (2x faster)
        const originalDuration = pagFile.duration();
        pagFile.setTimeStretchMode(1);
        pagFile.setDuration(originalDuration / 2);

        pagView.setRepeatCount(0); // Infinite loop
        playerRef.current = pagView;
        setIsLoaded(true);

        if (isWalking) {
          await pagView.play();
        } else {
          pagView.pause();
          pagView.setProgress(0.0);
        }
      } catch (error) {
        console.error('Failed to initialize PAG:', error);
      }
    }

    initPAG();

    return () => {
      mounted = false;
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!playerRef.current || !isLoaded) return;

    if (isWalking) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
      //   playerRef.current.setProgress(0);
      //   playerRef.current.flush();
    }
  }, [isWalking, isLoaded]);

  return (
    <div
      className={cn(
        'relative flex items-end transition-transform duration-100',
        direction === 'left' && 'scale-x-[-1]'
      )}
    >
      {/* Follower behind */}
      <div className="-mr-24">
        <Character />
      </div>
      {/* Main PAG character */}
      <div className="h-64 w-64">
        <canvas
          ref={canvasRef}
          className={cn(
            'h-full w-full object-contain transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>
    </div>
  );
}
