'use client';

import { useEffect, useRef } from 'react';

const TRAVEL_IMAGES = [
  'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1579606032821-4e6a5d6f4c5e?w=200&h=200&fit=crop',
];

interface TrailImage {
  element: HTMLImageElement;
  rotation: number;
  removeTime: number;
}

export default function CursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<TrailImage[]>([]);
  const lastSpawnTimeRef = useRef(0);
  const imageIndexRef = useRef(0);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  const lastMouseXRef = useRef(0);
  const lastMouseYRef = useRef(0);
  const prevMouseXRef = useRef(0);
  const prevMouseYRef = useRef(0);
  const lastMoveTimeRef = useRef(Date.now());
  const smoothedSpeedRef = useRef(0);
  const maxSpeedRef = useRef(0);
  const isMovingRef = useRef(false);
  const moveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    if (!container) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;

    const config = {
      imageLifespan: 600,
      mouseThreshold: isMobile ? 20 : 40,
      minMovementForImage: isMobile ? 3 : 5,
      baseImageSize: isMobile ? 180 : 240,
      minImageSize: isMobile ? 120 : 160,
      maxImageSize: isMobile ? 260 : 340,
      baseRotation: 30,
      maxRotationFactor: 3,
      speedSmoothingFactor: 0.25,
      inDuration: 600,
      outDuration: 800,
      inEasing: 'cubic-bezier(.07,.5,.5,1)',
      outEasing: 'cubic-bezier(.87, 0, .13, 1)',
    };

    const hasMovedEnough = () => {
      const dx = mouseXRef.current - lastMouseXRef.current;
      const dy = mouseYRef.current - lastMouseYRef.current;
      return Math.hypot(dx, dy) > config.mouseThreshold;
    };

    const hasMovedAtAll = () => {
      const dx = mouseXRef.current - prevMouseXRef.current;
      const dy = mouseYRef.current - prevMouseYRef.current;
      return Math.hypot(dx, dy) > config.minMovementForImage;
    };

    const calculateSpeed = () => {
      const now = Date.now();
      const dt = now - lastMoveTimeRef.current;
      if (dt <= 0) return 0;

      const dist = Math.hypot(
        mouseXRef.current - prevMouseXRef.current,
        mouseYRef.current - prevMouseYRef.current
      );
      const raw = dist / dt;

      if (raw > maxSpeedRef.current) maxSpeedRef.current = raw;
      const norm = Math.min(raw / (maxSpeedRef.current || 0.5), 1);
      smoothedSpeedRef.current =
        smoothedSpeedRef.current * (1 - config.speedSmoothingFactor) +
        norm * config.speedSmoothingFactor;

      lastMoveTimeRef.current = now;
      return smoothedSpeedRef.current;
    };

    const createImage = (speed: number) => {
      const imageSrc = TRAVEL_IMAGES[imageIndexRef.current];
      imageIndexRef.current = (imageIndexRef.current + 1) % TRAVEL_IMAGES.length;

      const size = config.minImageSize + (config.maxImageSize - config.minImageSize) * speed;
      const rotFactor = 1 + speed * (config.maxRotationFactor - 1);
      const rot = (Math.random() - 0.5) * config.baseRotation * rotFactor;

      const img = document.createElement('img');
      img.className = 'trail-img';
      img.src = imageSrc;
      img.style.cssText = `
        position: absolute;
        object-fit: cover;
        pointer-events: none;
        will-change: transform;
        z-index: 9999;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;
      img.width = img.height = size;

      img.style.left = `${mouseXRef.current}px`;
      img.style.top = `${mouseYRef.current}px`;
      img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(0)`;
      img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}`;

      container.appendChild(img);

      setTimeout(() => {
        img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1)`;
      }, 10);

      trailRef.current.push({
        element: img,
        rotation: rot,
        removeTime: Date.now() + config.imageLifespan,
      });
    };

    const createTrailImage = () => {
      if (isMovingRef.current && hasMovedEnough() && hasMovedAtAll()) {
        lastMouseXRef.current = mouseXRef.current;
        lastMouseYRef.current = mouseYRef.current;
        const speed = calculateSpeed();
        createImage(speed);
        prevMouseXRef.current = mouseXRef.current;
        prevMouseYRef.current = mouseYRef.current;
      }
    };

    const removeOldImages = () => {
      const now = Date.now();
      while (trailRef.current.length > 0 && now >= trailRef.current[0].removeTime) {
        const imgObj = trailRef.current.shift();
        if (!imgObj) continue;

        imgObj.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
        imgObj.element.style.transform = `translate(-50%, -50%) rotate(${
          imgObj.rotation + 360
        }deg) scale(0)`;

        setTimeout(() => {
          imgObj.element.remove();
        }, config.outDuration);
      }
    };

    const animate = () => {
      createTrailImage();
      removeOldImages();
      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      prevMouseXRef.current = mouseXRef.current;
      prevMouseYRef.current = mouseYRef.current;
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;

      if (hasMovedAtAll()) {
        isMovingRef.current = true;
        if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
        moveTimeoutRef.current = setTimeout(() => {
          isMovingRef.current = false;
        }, 100);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        prevMouseXRef.current = mouseXRef.current;
        prevMouseYRef.current = mouseYRef.current;
        mouseXRef.current = touch.clientX;
        mouseYRef.current = touch.clientY;

        if (hasMovedAtAll()) {
          isMovingRef.current = true;
          if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
          moveTimeoutRef.current = setTimeout(() => {
            isMovingRef.current = false;
          }, 100);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(rafId);
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);

      trailRef.current.forEach((imgObj) => {
        imgObj.element.remove();
      });
      trailRef.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}
