import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

/**
 * StickyAdsterraAd Component
 * 
 * Provides a sticky advertisement banner that:
 * - Stays fixed at the bottom of the viewport (320x50 standard banner format)
 * - Has a fixed height container (h-[60px]) to prevent layout shifts or upward movement
 * - Includes a close button for user dismissal
 * - Delays loading until after initial page render for maximum mobile speed & LCP score
 */
const StickyAdsterraAd: React.FC = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Delay rendering ad by 2 seconds or during idle time on client to optimize mobile PageSpeed score
    let timer: NodeJS.Timeout;
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => setShouldRender(true), { timeout: 2500 });
      } else {
        timer = setTimeout(() => setShouldRender(true), 2000);
      }
    }
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || !shouldRender) return null;

  const stickyAdHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '84ce185164fd1fb9a9e3c375f2a48ff8',
      'format' : 'iframe',
      'height' : 50,
      'width' : 320,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highperformanceformat.com/84ce185164fd1fb9a9e3c375f2a48ff8/invoke.js"></script>
</body>
</html>`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border/50 shadow-lg flex justify-center items-center h-[60px]">
      <div className="relative w-full max-w-[728px] h-[50px] flex justify-center items-center px-2">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 -top-3 z-10 bg-background border border-border rounded-full p-1 shadow-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Close ad"
          aria-label="Close advertisement"
        >
          <X className="h-3 w-3" />
        </button>
        <iframe
          key={location.pathname}
          srcDoc={stickyAdHtml}
          title="Advertisement"
          width="320"
          height="50"
          className="border-0 overflow-hidden w-[320px] h-[50px] block shrink-0"
          loading="lazy"
          scrolling="no"
        />
      </div>
    </div>
  );
};

export default StickyAdsterraAd;
