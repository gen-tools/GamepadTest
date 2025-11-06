import React, { useCallback } from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';

interface PrefetchLinkProps extends LinkProps {
  prefetchLoader?: () => Promise<any>;
  children: React.ReactNode;
}

/**
 * A Link component that automatically prefetches route chunks on hover
 * Provides faster page transitions with minimal performance overhead
 */
export const PrefetchLink = React.forwardRef<
  HTMLAnchorElement,
  PrefetchLinkProps
>(({ prefetchLoader, onMouseEnter, ...props }, ref) => {
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Trigger prefetch on hover
      if (prefetchLoader) {
        prefetchLoader().catch(() => {
          // Silently handle prefetch errors
        });
      }

      // Call original onMouseEnter if provided
      if (onMouseEnter) {
        onMouseEnter(e);
      }
    },
    [prefetchLoader, onMouseEnter]
  );

  return (
    <RouterLink
      ref={ref}
      onMouseEnter={handleMouseEnter}
      {...props}
    />
  );
});

PrefetchLink.displayName = 'PrefetchLink';
