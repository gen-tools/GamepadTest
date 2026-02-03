import React, { useEffect, useRef } from 'react';

const AdsterraAd: React.FC = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !adContainerRef.current) return;

    // Clear container to prevent duplicate ads if component re-renders
    adContainerRef.current.innerHTML = '';

    // Define atOptions globally
    (window as any).atOptions = {
      key: '84ce185164fd1fb9a9e3c375f2a48ff8',
      format: 'iframe',
      height: 50,
      width: 320,
      params: {}
    };

    const script = document.createElement('script');
    script.src = 'https://www.highperformanceformat.com/84ce185164fd1fb9a9e3c375f2a48ff8/invoke.js';
    script.async = true;

    adContainerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center my-6">
      {/* Reserve space to avoid CLS */}
      <div 
        ref={adContainerRef}
        style={{ width: '320px', height: '50px', minHeight: '50px' }}
        className="bg-muted/50 rounded flex items-center justify-center overflow-hidden"
      >
        {/* Placeholder text hidden if ad loads, or showing brief status */}
        <span className="text-xs text-muted-foreground">Advertisement</span>
      </div>
    </div>
  );
};

export default AdsterraAd;
