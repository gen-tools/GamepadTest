import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AdsterraAdProps {
  className?: string;
}

const AdsterraAd: React.FC<AdsterraAdProps> = ({ className = '' }) => {
  const location = useLocation();
  // Standard initial height for Native Banner with image thumbnails and titles
  const [adHeight, setAdHeight] = useState<number>(220);
  const instanceId = React.useId().replace(/:/g, '');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === 'adsterra-resize' &&
        event.data.instanceId === instanceId
      ) {
        const newHeight = Number(event.data.height);
        if (newHeight >= 140 && newHeight <= 500 && Math.abs(newHeight - adHeight) > 15) {
          setAdHeight(newHeight);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [instanceId, adHeight]);

  const adHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      margin: 0;
      padding: 0;
      background: transparent;
      overflow: hidden;
    }
    #container-e55a93825b6c50f2921b8e0d174a7729 {
      display: block;
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      padding-bottom: 8px;
    }
    #container-e55a93825b6c50f2921b8e0d174a7729 iframe,
    #container-e55a93825b6c50f2921b8e0d174a7729 img,
    #container-e55a93825b6c50f2921b8e0d174a7729 div {
      max-width: 100% !important;
    }
  </style>
</head>
<body>
  <div id="container-e55a93825b6c50f2921b8e0d174a7729"></div>
  <script async="async" data-cfasync="false" src="https://pl28589316.effectivegatecpm.com/e55a93825b6c50f2921b8e0d174a7729/invoke.js"></script>
  <script>
    function sendContentSize() {
      var container = document.getElementById('container-e55a93825b6c50f2921b8e0d174a7729');
      if (!container) return;
      var h = Math.max(container.scrollHeight, container.offsetHeight);
      if (h > 60) {
        window.parent.postMessage({
          type: 'adsterra-resize',
          instanceId: '${instanceId}',
          height: Math.ceil(h) + 12
        }, '*');
      }
    }
    window.addEventListener('load', function() {
      setTimeout(sendContentSize, 300);
      setTimeout(sendContentSize, 1200);
    });
  </script>
</body>
</html>`;

  return (
    <div className={cn("flex justify-center my-6 w-full px-2", className)}>
      <div 
        className="w-full max-w-[728px] flex items-center justify-center rounded overflow-hidden"
        style={{ minHeight: `${adHeight}px` }}
      >
        <iframe
          key={`${location.pathname}-${instanceId}`}
          srcDoc={adHtml}
          title="Advertisement"
          width="100%"
          height={adHeight}
          style={{ height: `${adHeight}px` }}
          className="border-0 overflow-hidden w-full max-w-[728px] block"
          loading="lazy"
          scrolling="no"
        />
      </div>
    </div>
  );
};

export default AdsterraAd;
