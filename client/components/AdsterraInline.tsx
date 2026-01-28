import { useEffect, useRef } from "react";

export default function AdsterraInline() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    // Clear any previous scripts
    adRef.current.innerHTML = "";

    // Configuration script
    const configScript = document.createElement("script");
    configScript.innerHTML = `
      atOptions = {
        key: '84ce185164fd1fb9a9e3c375f2a48ff8',
        format: 'iframe',
        height: 50,
        width: 320,
        params: {}
      };
    `;

    // Adsterra invoke script
    const invokeScript = document.createElement("script");
    invokeScript.src =
      "https://www.highperformanceformat.com/84ce185164fd1fb9a9e3c375f2a48ff8/invoke.js";
    invokeScript.async = true;

    // Append scripts safely
    adRef.current.appendChild(configScript);
    adRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div
      ref={adRef}
      className="flex justify-center my-8 min-h-[50px]"
      aria-label="Advertisement"
    />
  );
}
