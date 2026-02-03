import React, { useEffect, useRef } from 'react';

const AdsterraAd: React.FC = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !adContainerRef.current) return;

    // Clear container to prevent duplicate ads if component re-renders
    adContainerRef.current.innerHTML = '';

    // Create the container element required by the ad script
    const container = document.createElement('div');
    container.id = 'container-e55a93825b6c50f2921b8e0d174a7729';
    adContainerRef.current.appendChild(container);

    // Create and append the ad script
    const script = document.createElement('script');
    script.src = 'https://pl28589316.effectivegatecpm.com/e55a93825b6c50f2921b8e0d174a7729/invoke.js';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    adContainerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center my-6">
      {/* Reserve space to avoid CLS - adjust dimensions if needed for the new ad format */}
      <div 
        ref={adContainerRef}
        style={{ minWidth: '320px', minHeight: '50px' }}
        className="bg-muted/50 rounded flex items-center justify-center overflow-hidden"
      >
        <span className="text-xs text-muted-foreground">Advertisement</span>
      </div>
    </div>
  );
};

export default AdsterraAd;
