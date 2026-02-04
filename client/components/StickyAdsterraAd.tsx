import React, { useEffect, useRef } from 'react';

/**
 * StickyAdsterraAd Component
 * 
 * Provides a sticky advertisement banner that:
 * - Stays fixed at the bottom of the viewport
 * - Works on mobile and desktop
 * - Is SEO-safe (loads after main content)
 * - Prevents duplicate script loading
 */
const StickyAdsterraAd: React.FC = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    // Only run on client side and ensure we haven't loaded it yet
    if (typeof window === 'undefined' || !adContainerRef.current || scriptLoadedRef.current) return;

    const adKey = '84ce185164fd1fb9a9e3c375f2a48ff8';
    
    // Clear container to prevent duplicate ads
    adContainerRef.current.innerHTML = '';

    // Define atOptions globally for the script to use
    (window as any).atOptions = {
      'key' : adKey,
      'format' : 'iframe',
      'height' : 50,
      'width' : 320,
      'params' : {}
    };

    // Create and append the ad script
    const script = document.createElement('script');
    script.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
    script.async = true;

    adContainerRef.current.appendChild(script);
    scriptLoadedRef.current = true;

    return () => {
      // Cleanup
      if (typeof window !== 'undefined') {
        delete (window as any).atOptions;
      }
    };
  }, []);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center bg-background/80 backdrop-blur-sm border-t shadow-lg py-2"
      aria-label="Advertisement"
    >
      <div className="relative w-full max-w-[728px] px-4">
        <div 
          ref={adContainerRef}
          style={{ minWidth: '320px', minHeight: '50px' }}
          className="mx-auto flex items-center justify-center overflow-hidden"
        >
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground absolute top-0 left-4">Ad</span>
        </div>
      </div>
    </div>
  );
};

export default StickyAdsterraAd;
