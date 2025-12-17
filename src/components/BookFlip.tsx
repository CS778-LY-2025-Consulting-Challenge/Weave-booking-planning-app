'use client';

import { PageFlip, SizeType } from 'page-flip';
import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export interface BookFlipSettings {
  startPage?: number;
  size?: 'fixed' | 'stretch';
  width: number;
  height: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  drawShadow?: boolean;
  flippingTime?: number;
  usePortrait?: boolean;
  startZIndex?: number;
  autoSize?: boolean;
  maxShadowOpacity?: number;
  showCover?: boolean;
  mobileScrollSupport?: boolean;
  clickEventForward?: boolean;
  useMouseEvents?: boolean;
  swipeDistance?: number;
  showPageCorners?: boolean;
  disableFlipByClick?: boolean;
}

export interface BookFlipEvents {
  onFlip?: (e: unknown) => void;
  onChangeOrientation?: (e: unknown) => void;
  onChangeState?: (e: unknown) => void;
  onInit?: (e: unknown) => void;
  onUpdate?: (e: unknown) => void;
}

export interface BookFlipProps
  extends BookFlipSettings, BookFlipEvents {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface BookFlipRef {
  pageFlip: () => PageFlip | undefined;
  flipNext: () => void;
  flipPrev: () => void;
  turnToPage: (page: number) => void;
  getCurrentPage: () => number;
}

const defaultSettings: Partial<BookFlipSettings> = {
  startPage: 0,
  size: 'fixed',
  minWidth: 100,
  maxWidth: 2000,
  minHeight: 100,
  maxHeight: 2000,
  drawShadow: true,
  flippingTime: 1000,
  usePortrait: true,
  startZIndex: 0,
  autoSize: true,
  maxShadowOpacity: 1,
  showCover: false,
  mobileScrollSupport: true,
  clickEventForward: true,
  useMouseEvents: true,
  swipeDistance: 30,
  showPageCorners: true,
  disableFlipByClick: false,
};

const BookFlip = forwardRef<BookFlipRef, BookFlipProps>(
  (props, ref) => {
    const {
      children,
      className = '',
      style,
      onFlip,
      onChangeOrientation,
      onChangeState,
      onInit,
      onUpdate,
      ...settings
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const pageFlipRef = useRef<PageFlip | null>(null);
    const pagesRef = useRef<HTMLElement[]>([]);
    const [isReady, setIsReady] = useState(false);

    const mergedSettings = { ...defaultSettings, ...settings };

    useImperativeHandle(ref, () => ({
      pageFlip: () => pageFlipRef.current ?? undefined,
      flipNext: () => pageFlipRef.current?.flipNext(),
      flipPrev: () => pageFlipRef.current?.flipPrev(),
      turnToPage: (page: number) => pageFlipRef.current?.turnToPage(page),
      getCurrentPage: () => pageFlipRef.current?.getCurrentPageIndex() ?? 0,
    }));

    const collectPageRef = useCallback(
      (index: number) => (el: HTMLElement | null) => {
        if (el) {
          pagesRef.current[index] = el;
        }
      },
      []
    );

    const renderedPages = Children.map(children, (child, index) => {
      if (!isValidElement(child)) return child;

      return cloneElement(
        child as ReactElement<{ ref?: React.Ref<HTMLElement> }>,
        {
          ref: collectPageRef(index),
        }
      );
    });

    useEffect(() => {
      if (!containerRef.current || pageFlipRef.current) return;

      const timer = setTimeout(() => {
        if (!containerRef.current) return;

        const pageFlip = new PageFlip(containerRef.current, {
          width: mergedSettings.width,
          height: mergedSettings.height,
          size: mergedSettings.size as SizeType,
          minWidth: mergedSettings.minWidth!,
          maxWidth: mergedSettings.maxWidth!,
          minHeight: mergedSettings.minHeight!,
          maxHeight: mergedSettings.maxHeight!,
          drawShadow: mergedSettings.drawShadow!,
          flippingTime: mergedSettings.flippingTime!,
          usePortrait: mergedSettings.usePortrait!,
          startZIndex: mergedSettings.startZIndex!,
          autoSize: mergedSettings.autoSize!,
          maxShadowOpacity: mergedSettings.maxShadowOpacity!,
          showCover: mergedSettings.showCover!,
          mobileScrollSupport: mergedSettings.mobileScrollSupport!,
          clickEventForward: mergedSettings.clickEventForward!,
          useMouseEvents: mergedSettings.useMouseEvents!,
          swipeDistance: mergedSettings.swipeDistance!,
          showPageCorners: mergedSettings.showPageCorners!,
          disableFlipByClick: mergedSettings.disableFlipByClick!,
          startPage: mergedSettings.startPage!,
        });

        const validPages = pagesRef.current.filter(Boolean);
        if (validPages.length > 0) {
          pageFlip.loadFromHTML(validPages);
        }

        pageFlipRef.current = pageFlip;
        setIsReady(true);
      }, 0);

      return () => {
        clearTimeout(timer);
        if (pageFlipRef.current) {
          pageFlipRef.current.destroy();
          pageFlipRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (!isReady || !pageFlipRef.current) return;

      const pageFlip = pageFlipRef.current;

      if (onFlip) {
        pageFlip.on('flip', onFlip);
      }
      if (onChangeOrientation) {
        pageFlip.on('changeOrientation', onChangeOrientation);
      }
      if (onChangeState) {
        pageFlip.on('changeState', onChangeState);
      }
      if (onInit) {
        pageFlip.on('init', onInit);
      }
      if (onUpdate) {
        pageFlip.on('update', onUpdate);
      }

      return () => {
        pageFlip.off('flip');
        pageFlip.off('changeOrientation');
        pageFlip.off('changeState');
        pageFlip.off('init');
        pageFlip.off('update');
      };
    }, [isReady, onFlip, onChangeOrientation, onChangeState, onInit, onUpdate]);

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          ...style,
          visibility: isReady ? 'visible' : 'hidden',
        }}
      >
        {renderedPages}
      </div>
    );
  }
);

BookFlip.displayName = 'BookFlip';

export { BookFlip };