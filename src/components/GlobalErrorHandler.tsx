'use client';

import { useEffect } from 'react';

/**
 * Global error handler to suppress known non-critical errors
 * This prevents video seek timeout errors from appearing in the console
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console.error to filter out video-related errors
    console.error = (...args: any[]) => {
      const errorMessage = args[0]?.toString() || '';
      
      // List of errors to suppress
      const suppressedErrors = [
        'Seek operation timed out',
        'video-reader',
        'AbortError: The play() request was interrupted',
        'NotAllowedError: play() failed',
        'Media resource',
        'could not be decoded',
        'NS_ERROR_DOM_MEDIA_METADATA_ERR',
      ];

      // Check if error should be suppressed
      const shouldSuppress = suppressedErrors.some((pattern) =>
        errorMessage.includes(pattern)
      );

      // Only log if not suppressed
      if (!shouldSuppress) {
        originalError.apply(console, args);
      }
    };

    // Override console.warn to filter out font preload warnings
    console.warn = (...args: any[]) => {
      const warnMessage = args[0]?.toString() || '';
      
      // List of warnings to suppress
      const suppressedWarnings = [
        'preloaded with link preload was not used',
        'WebGL warning',
        'tex(Sub)Image',
        'texSubImage',
        'drawElementsInstanced',
      ];

      // Check if warning should be suppressed
      const shouldSuppress = suppressedWarnings.some((pattern) =>
        warnMessage.includes(pattern)
      );

      // Only log if not suppressed
      if (!shouldSuppress) {
        originalWarn.apply(console, args);
      }
    };

    // Cleanup on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Add global error event listener for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.toString() || '';
      
      // Suppress video-related promise rejections
      if (
        errorMessage.includes('Seek operation timed out') ||
        errorMessage.includes('video-reader') ||
        errorMessage.includes('Media resource') ||
        errorMessage.includes('could not be decoded')
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}
