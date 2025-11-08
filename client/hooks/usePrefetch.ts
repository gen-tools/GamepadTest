import { useCallback } from 'react';

interface PrefetchOptions {
  delay?: number;
}

/**
 * Hook to prefetch route chunks on hover for faster navigation
 * Reduces perceived loading time when navigating between pages
 */
export const usePrefetch = (
  routeLoader: () => Promise<any>,
  options: PrefetchOptions = {}
) => {
  const { delay = 0 } = options;

  return useCallback(() => {
    // Use setTimeout to avoid blocking on hover if no delay specified
    const timer = setTimeout(() => {
      routeLoader().catch(() => {
        // Silently handle prefetch errors - don't impact user experience
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [routeLoader, delay]);
};

/**
 * Immediate prefetch without hover delay
 * Useful for predictable navigation paths
 */
export const usePrefetchImmediate = (routeLoader: () => Promise<any>) => {
  return useCallback(() => {
    routeLoader().catch(() => {
      // Silently handle prefetch errors
    });
  }, [routeLoader]);
};
