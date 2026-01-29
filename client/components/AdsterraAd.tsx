import React, { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  /** The unique ad key provided by Adsterra */
  adKey: string;
  /** Fixed width to prevent Layout Shift (CLS) */
  width?: number | string;
  /** Fixed height to prevent Layout Shift (CLS) */
  height?: number | string;
  /** Optional tailwind or CSS classes */
  className?: string;
}

/**
 * Production-ready Adsterra component for React/Vercel.
 * Features:
 * - Client-side only execution (no SSR errors)
 * - Prevents duplicate loading
 * - SEO friendly (content renders first)
 * - Layout Shift protection via reserved dimensions
 */
export const AdsterraAd: React.FC<AdsterraAdProps> = ({ 
  adKey, 
  width = '100%', 
  height = 'auto', 
  className = "" 
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Safety check for SSR and Ref availability
    if (typeof window === 'undefined' || !adRef.current) return;

    // Clean up container to prevent duplicate ads on HMR or re-renders
    const container = adRef.current;
    container.innerHTML = '';
    
    // 1. Set global configuration
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.text = `
      atOptions = {
        'key' : '${adKey}',
        'format' : 'iframe',
        'height' : ${typeof height === 'number' ? height : 90},
        'width' : ${typeof width === 'number' ? width : 728},
        'params' : {}
      };
    `;

    // 2. Load the invoker script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
    invokeScript.async = true;

    // 3. Append to local ref (not head) for better SEO/UX
    container.appendChild(configScript);
    container.appendChild(invokeScript);

    return () => {
      // Cleanup scripts on component unmount
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [adKey, width, height]);

  return (
    <div 
      className={`adsterra-wrapper flex justify-center items-center my-6 overflow-hidden ${className}`}
      style={{ 
        minWidth: width, 
        minHeight: height,
        backgroundColor: 'transparent' 
      }}
      ref={adRef}
    />
  );
};
