'use client';

import gsap from 'gsap';
import { useCallback, useEffect, useRef } from 'react';
import styles from './ZhangjiajieParallax.module.css';

interface ParallaxLayer {
  src: string;
  speedx: number;
  speedy: number;
  speedz: number;
  rotation: number;
  distance: number;
  className: string;
}

const layers: ParallaxLayer[] = [
  {
    src: '/api/image-proxy?path=zhangjiajie/background.png',
    speedx: 0.3,
    speedy: 0.38,
    speedz: 0,
    rotation: 0,
    distance: -200,
    className: 'bgImg',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/fog_7.png',
    speedx: 0.27,
    speedy: 0.32,
    speedz: 0,
    rotation: 0,
    distance: 850,
    className: 'fog7',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/mountain_10.png',
    speedx: 0.195,
    speedy: 0.305,
    speedz: 0,
    rotation: 0,
    distance: 1100,
    className: 'mountain10',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/fog_6.png',
    speedx: 0.25,
    speedy: 0.28,
    speedz: 0,
    rotation: 0,
    distance: 1400,
    className: 'fog6',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/mountain_9.png',
    speedx: 0.125,
    speedy: 0.155,
    speedz: 0.15,
    rotation: 0.02,
    distance: 1700,
    className: 'mountain9',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/mountain_8.png',
    speedx: 0.1,
    speedy: 0.11,
    speedz: 0,
    rotation: 0.02,
    distance: 1800,
    className: 'mountain8',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/fog_5.png',
    speedx: 0.16,
    speedy: 0.105,
    speedz: 0,
    rotation: 0,
    distance: 1900,
    className: 'fog5',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/mountain_7.png',
    speedx: 0.1,
    speedy: 0.1,
    speedz: 0,
    rotation: 0.09,
    distance: 2000,
    className: 'mountain7',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/mountain_6.png',
    speedx: 0.065,
    speedy: 0.05,
    speedz: 0.05,
    rotation: 0.12,
    distance: 2300,
    className: 'mountain6',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/fog_4.png',
    speedx: 0.135,
    speedy: 0.04,
    speedz: 0,
    rotation: 0,
    distance: 2400,
    className: 'fog4',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/mountain_5.png',
    speedx: 0.08,
    speedy: 0.03,
    speedz: 0.13,
    rotation: 0.1,
    distance: 2550,
    className: 'mountain5',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/fog_3.png',
    speedx: 0.11,
    speedy: 0.018,
    speedz: 0,
    rotation: 0,
    distance: 2800,
    className: 'fog3',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/mountain_4.png',
    speedx: 0.059,
    speedy: 0.024,
    speedz: 0.35,
    rotation: 0.14,
    distance: 3200,
    className: 'mountain4',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/mountain_3.png',
    speedx: 0.04,
    speedy: 0.018,
    speedz: 0.32,
    rotation: 0.05,
    distance: 3400,
    className: 'mountain3',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/fog_2.png',
    speedx: 0.15,
    speedy: 0.0115,
    speedz: 0,
    rotation: 0,
    distance: 3600,
    className: 'fog2',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/mountain_2.png',
    speedx: 0.0235,
    speedy: 0.013,
    speedz: 0.42,
    rotation: 0.15,
    distance: 3800,
    className: 'mountain2',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/mountain_1.png',
    speedx: 0.027,
    speedy: 0.018,
    speedz: 0.53,
    rotation: 0.2,
    distance: 4000,
    className: 'mountain1',
  },
  {
    src: '/api/image-proxy?path=zhangjiajie/fog_1.png',
    speedx: 0.12,
    speedy: 0.01,
    speedz: 0,
    rotation: 0,
    distance: 4200,
    className: 'fog1',
  },
];

const textLayer = { speedx: 0.07, speedy: 0.07, speedz: 0, rotation: 0.11 };

export interface ZhangjiajieParallaxProps {
  imagePath?: string;
}

export default function ZhangjiajieParallax({
  imagePath = '',
}: ZhangjiajieParallaxProps) {
  const mainRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const layerRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement>(null);

  const updateParallax = useCallback((clientX: number, clientY: number) => {
    const xValue = clientX - window.innerWidth / 2;
    const yValue = clientY - window.innerHeight / 2;
    const rotateDegree = (xValue / (window.innerWidth / 2)) * 20;

    const updateElement = (
      el: HTMLElement | null,
      layer: {
        speedx: number;
        speedy: number;
        speedz: number;
        rotation: number;
      }
    ) => {
      if (!el) return;
      const isInLeft =
        parseFloat(getComputedStyle(el).left) < window.innerWidth / 2 ? 1 : -1;
      const zValue =
        (clientX - parseFloat(getComputedStyle(el).left)) * isInLeft * 0.1;

      el.style.transform = `perspective(2300px) translateZ(${zValue * layer.speedz}px) rotateY(${rotateDegree * layer.rotation}deg) translateX(calc(-50% + ${-xValue * layer.speedx}px)) translateY(calc(-50% + ${yValue * layer.speedy}px))`;
    };

    layerRefs.current.forEach((el, i) => updateElement(el, layers[i]));
    updateElement(textRef.current, textLayer);
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    if (window.innerWidth >= 725) {
      main.style.maxHeight = `${window.innerWidth * 0.6}px`;
    } else {
      main.style.maxHeight = `${window.innerWidth * 1.6}px`;
    }

    updateParallax(window.innerWidth / 2, window.innerHeight / 2);

    const handleMouseMove = (e: MouseEvent) => {
      if (timelineRef.current?.isActive()) return;
      updateParallax(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const images = layerRefs.current.filter((el) => el) as HTMLImageElement[];
    const imageLoadPromises = images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });

    Promise.all(imageLoadPromises).then(() => {
      // 使用 requestAnimationFrame 确保在路由跳转后 DOM 布局已完成渲染
      // 这样 getBoundingClientRect().top 才能拿到准确的值
      requestAnimationFrame(() => {
        const ctx = gsap.context(() => {
          const timeline = gsap.timeline();
          timelineRef.current = timeline;

          layerRefs.current.forEach((el, i) => {
            if (el) {
              const fromTop = el.offsetHeight / 2 + layers[i].distance;
              timeline.from(
                el,
                {
                  top: `${fromTop}px`,
                  duration: 3.5,
                  ease: 'power3.out',
                },
                '1'
              );
            }
          });

          const textH1El = main.querySelector(`.${styles.textH1}`);
          const textH2El = main.querySelector(`.${styles.textH2}`);
          const hideEls = main.querySelectorAll(`.${styles.hide}`);

          // 保持原始的计算逻辑，确保视觉效果与初始加载一致
          timeline.from(
            textH1El,
            {
              y:
                window.innerHeight -
                (textH1El?.getBoundingClientRect().top || 0) +
                200,
              duration: 2,
            },
            '2.5'
          );

          timeline.from(
            textH2El,
            {
              y: -150,
              opacity: 0,
              duration: 1.5,
            },
            '3'
          );

          timeline.from(
            hideEls,
            {
              opacity: 0,
              duration: 1.5,
            },
            '3'
          );

          setTimeout(() => {
            [...layerRefs.current, textRef.current].forEach((el) => {
              if (el)
                el.style.transition =
                  '0.45s cubic-bezier(0.2, 0.49, 0.32, 0.99)';
            });
          }, timeline.endTime() * 1000);
        }, main); // 将 scope 限定在 main 容器内

        (main as any)._gsapContext = ctx;
      });
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if ((main as any)._gsapContext) {
        (main as any)._gsapContext.revert();
      }
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      layerRefs.current.forEach((el) => {
        if (el) gsap.set(el, { clearProps: 'all' });
      });
    };
  }, [updateParallax]);

  return (
    <div className={styles.container}>
      <main ref={mainRef} className={styles.main}>
        <div className={`${styles.vignette} ${styles.hide}`}></div>

        {layers.map((layer, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={layer.className}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            src={layer.src}
            className={`${styles.parallax} ${styles[layer.className]}`}
            alt={layer.className}
          />
        ))}

        <div ref={textRef} className={`${styles.text} ${styles.parallax}`}>
          <h2 className={styles.textH2}>China</h2>
          <h1 className={styles.textH1}>Zhangjiajie</h1>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/api/image-proxy?path=zhangjiajie/sun_rays.png"
          className={`${styles.sunRays} ${styles.hide}`}
          alt="sun rays"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/api/image-proxy?path=zhangjiajie/black_shadow.png"
          className={`${styles.blackShadow} ${styles.hide}`}
          alt="black shadow"
        />
      </main>
    </div>
  );
}
