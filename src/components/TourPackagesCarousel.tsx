'use client';

import { useEffect, useRef, useState } from 'react';
import './TourPackagesCarousel.css';

interface TourPackage {
  name: string;
  description: string;
  price: string;
  rating: string;
  days: number;
  nights: number;
  image?: string;
}

const TOUR_PACKAGES: TourPackage[] = [
  {
    name: 'Paris Dreams',
    description: 'Experience the magic of Paris with Eiffel Tower and Louvre visits',
    price: '$1,299',
    rating: '★★★★★ (245 reviews)',
    days: 10,
    nights: 9,
    image: '/images/paris.jpg'
  },
  {
    name: 'Tokyo Adventure',
    description: 'Discover Tokyo\'s blend of tradition and modernity with cultural tours',
    price: '$1,499',
    rating: '★★★★★ (189 reviews)',
    days: 12,
    nights: 11,
    image: '/images/Tokyo.jpg'
  },
  {
    name: 'Swiss Alps Escape',
    description: 'Immerse in breathtaking mountain views and alpine adventures',
    price: '$1,599',
    rating: '★★★★★ (312 reviews)',
    days: 8,
    nights: 7,
    image: '/images/swiss alps.jpg'
  },
  {
    name: 'Bali Tropical',
    description: 'Relax on pristine beaches and explore ancient temples in Bali',
    price: '$899',
    rating: '★★★★★ (428 reviews)',
    days: 7,
    nights: 6,
    image: '/images/bali.jpg'
  },
  {
    name: 'New York City',
    description: 'The city that never sleeps - Broadway, landmarks, and vibrant culture',
    price: '$1,199',
    rating: '★★★★★ (567 reviews)',
    days: 7,
    nights: 6,
    image: '/images/new york.jpg'
  },
  {
    name: 'Dubai Luxury',
    description: 'Experience ultra-modern luxury with desert safaris and world-class shopping',
    price: '$1,399',
    rating: '★★★★★ (234 reviews)',
    days: 6,
    nights: 5,
    image: '/images/dubai.jpg'
  },
  {
    name: 'Barcelona Culture',
    description: 'Gaudí architecture, beaches, and Mediterranean charm await',
    price: '$1,099',
    rating: '★★★★★ (356 reviews)',
    days: 7,
    nights: 6,
    image: '/images/barcelona.jpg'
  },
  {
    name: 'Rome Historical',
    description: 'Walk through ancient history with Colosseum and Vatican tours',
    price: '$1,249',
    rating: '★★★★★ (478 reviews)',
    days: 9,
    nights: 8,
    image: '/images/rome.jpg'
  },
];

// Physics constants
const FRICTION = 0.9;
const WHEEL_SENS = 0.6;
const DRAG_SENS = 1.0;

// Visual constants
const MAX_ROTATION = 28;
const MAX_DEPTH = 140;
const MIN_SCALE = 0.92;
const SCALE_RANGE = 0.1;
const GAP = 28;

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export default function TourPackagesCarousel() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRootRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Array<{ el: HTMLElement; x: number }>>([]);
  const positionsRef = useRef<Float32Array | null>(null);
  const stateRef = useRef({
    CARD_W: 300,
    CARD_H: 400,
    STEP: 328,
    TRACK: 0,
    SCROLL_X: 0,
    VW_HALF: typeof window !== 'undefined' ? window.innerWidth * 0.5 : 500,
    vX: 0,
    lastTime: 0,
    rafId: null as number | null,
    dragging: false,
    lastX: 0,
    lastT: 0,
    lastDelta: 0,
    isEntering: true,
    activeIndex: -1,
  });
  const itemsRef = useRef<Array<{ el: HTMLElement; x: number }>>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !stageRef.current || !cardsRootRef.current) return;

    const stage = stageRef.current;
    const cardsRoot = cardsRootRef.current;
    const state = stateRef.current;

    // Create cards
    const fragment = document.createDocumentFragment();
    const newItems: Array<{ el: HTMLElement; x: number }> = [];

    TOUR_PACKAGES.forEach((pkg, i) => {
      const card = document.createElement('article');
      card.className = 'tpc-card';
      card.style.backgroundImage = `url('${pkg.image}')`;

      const content = document.createElement('div');
      content.className = 'tpc-card__content';

      const daysInfo = document.createElement('p');
      daysInfo.className = 'tpc-card__days';
      daysInfo.textContent = `${pkg.days} DAYS / ${pkg.nights} NIGHTS`;

      const title = document.createElement('h3');
      title.className = 'tpc-card__title';
      title.textContent = pkg.name;

      const description = document.createElement('p');
      description.className = 'tpc-card__description';
      description.textContent = pkg.description;

      const priceInfo = document.createElement('p');
      priceInfo.className = 'tpc-card__price-info';
      priceInfo.textContent = `From ${pkg.price} per person`;

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'tpc-card__button-container';

      const button = document.createElement('button');
      button.className = 'tpc-card__button';
      button.textContent = 'BOOK NOW';

      const arrow = document.createElement('span');
      arrow.className = 'tpc-card__arrow';
      arrow.textContent = '→';

      buttonContainer.appendChild(button);
      buttonContainer.appendChild(arrow);

      content.appendChild(daysInfo);
      content.appendChild(title);
      content.appendChild(description);
      content.appendChild(priceInfo);
      content.appendChild(buttonContainer);

      card.appendChild(content);
      fragment.appendChild(card);

      newItems.push({ el: card, x: i * state.STEP });
    });

    cardsRoot.appendChild(fragment);
    itemsRef.current = newItems;
    setItems(newItems);

    // Measure and setup
    const measure = () => {
      const sample = newItems[0]?.el;
      if (!sample) return;

      const r = sample.getBoundingClientRect();
      state.CARD_W = r.width || state.CARD_W;
      state.CARD_H = r.height || state.CARD_H;
      state.STEP = state.CARD_W + GAP;
      state.TRACK = newItems.length * state.STEP;
      state.VW_HALF = window.innerWidth * 0.5;

      newItems.forEach((it, i) => {
        it.x = i * state.STEP;
      });

      positionsRef.current = new Float32Array(newItems.length);
    };

    measure();

    // Transform calculation
    const computeTransformComponents = (screenX: number) => {
      const norm = Math.max(-1, Math.min(1, screenX / state.VW_HALF));
      const absNorm = Math.abs(norm);
      const invNorm = 1 - absNorm;

      const ry = -norm * MAX_ROTATION;
      const tz = invNorm * MAX_DEPTH;
      const scale = MIN_SCALE + invNorm * SCALE_RANGE;

      return { norm, absNorm, invNorm, ry, tz, scale };
    };

    const transformForScreenX = (screenX: number) => {
      const { ry, tz, scale } = computeTransformComponents(screenX);
      return {
        transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
        z: tz,
      };
    };

    const updateCarouselTransforms = () => {
      const half = state.TRACK / 2;
      const positions = positionsRef.current;
      if (!positions) return;

      let closestIdx = -1;
      let closestDist = Infinity;

      for (let i = 0; i < newItems.length; i++) {
        let pos = newItems[i].x - state.SCROLL_X;

        if (pos < -half) pos += state.TRACK;
        if (pos > half) pos -= state.TRACK;

        positions[i] = pos;

        const dist = Math.abs(pos);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }

      const prevIdx = (closestIdx - 1 + newItems.length) % newItems.length;
      const nextIdx = (closestIdx + 1) % newItems.length;

      for (let i = 0; i < newItems.length; i++) {
        const it = newItems[i];
        const pos = positions[i];
        const norm = Math.max(-1, Math.min(1, pos / state.VW_HALF));
        const { transform, z } = transformForScreenX(pos);

        it.el.style.transform = transform;
        it.el.style.zIndex = String(1000 + Math.round(z));

        const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
        const blur = isCore ? 0 : 2 * Math.pow(Math.abs(norm), 1.1);
        it.el.style.filter = `blur(${blur.toFixed(2)}px)`;
      }
    };

    const tick = (t: number) => {
      const dt = state.lastTime ? (t - state.lastTime) / 1000 : 0;
      state.lastTime = t;

      state.SCROLL_X = mod(state.SCROLL_X + state.vX * dt, state.TRACK);

      const decay = Math.pow(FRICTION, dt * 60);
      state.vX *= decay;
      if (Math.abs(state.vX) < 0.02) state.vX = 0;

      updateCarouselTransforms();
      state.rafId = requestAnimationFrame(tick);
    };

    const startCarousel = () => {
      if (state.rafId) cancelAnimationFrame(state.rafId);
      state.lastTime = 0;
      state.rafId = requestAnimationFrame((t) => {
        updateCarouselTransforms();
        tick(t);
      });
    };

    const cancelCarousel = () => {
      if (state.rafId) cancelAnimationFrame(state.rafId);
      state.rafId = null;
    };

    updateCarouselTransforms();

    // Event listeners
    const handleWheel = (e: WheelEvent) => {
      if (state.isEntering) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      state.vX += delta * WHEEL_SENS * 20;
    };

    const handleDragStart = (e: DragEvent) => e.preventDefault();

    const handlePointerDown = (e: PointerEvent) => {
      if (state.isEntering) return;
      state.dragging = true;
      state.lastX = e.clientX;
      state.lastT = performance.now();
      state.lastDelta = 0;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('tpc-dragging');
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!state.dragging) return;

      const now = performance.now();
      const dx = e.clientX - state.lastX;
      const dt = Math.max(1, now - state.lastT) / 1000;

      state.SCROLL_X = mod(state.SCROLL_X - dx * DRAG_SENS, state.TRACK);
      state.lastDelta = dx / dt;
      state.lastX = e.clientX;
      state.lastT = now;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!state.dragging) return;
      state.dragging = false;
      stage.releasePointerCapture(e.pointerId);
      state.vX = -state.lastDelta * DRAG_SENS;
      stage.classList.remove('tpc-dragging');
    };

    const handleResize = () => {
      const prevStep = state.STEP || 1;
      const ratio = state.SCROLL_X / (newItems.length * prevStep);
      measure();
      state.SCROLL_X = mod(ratio * state.TRACK, state.TRACK);
      updateCarouselTransforms();
    };

    stage.addEventListener('wheel', handleWheel, { passive: false });
    stage.addEventListener('dragstart', handleDragStart);
    stage.addEventListener('pointerdown', handlePointerDown);
    stage.addEventListener('pointermove', handlePointerMove);
    stage.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('resize', handleResize);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelCarousel();
      } else {
        startCarousel();
      }
    });

    // Start carousel
    state.isEntering = false;
    startCarousel();

    return () => {
      stage.removeEventListener('wheel', handleWheel);
      stage.removeEventListener('dragstart', handleDragStart);
      stage.removeEventListener('pointerdown', handlePointerDown);
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      cancelCarousel();
    };
  }, []);

  return (
    <div ref={stageRef} className="tpc-stage">
      <div ref={cardsRootRef} className="tpc-cards"></div>
    </div>
  );
}
