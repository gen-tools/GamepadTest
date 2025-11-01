import { useEffect, useState } from 'react';

interface GpuAnimationProps {
  isRunning: boolean;
  progress: number;
}

export function GpuBenchmarkAnimation({ isRunning, progress }: GpuAnimationProps) {
  const [fps, setFps] = useState(0);
  const [gpuLoad, setGpuLoad] = useState(0);
  const [temp, setTemp] = useState(40);
  const [memory, setMemory] = useState(0);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      setFps(0);
      setGpuLoad(0);
      setTemp(40);
      setMemory(0);
      setFrameCount(0);
      return;
    }

    let lastTime = performance.now();
    let tempFrameCount = 0;

    const animationFrameId = requestAnimationFrame(function countFrames(currentTime) {
      tempFrameCount++;

      const deltaTime = currentTime - lastTime;
      if (deltaTime >= 1000) {
        const calculatedFps = Math.round((tempFrameCount * 1000) / deltaTime);
        setFps(calculatedFps);
        setFrameCount(tempFrameCount);
        lastTime = currentTime;
        tempFrameCount = 0;
      }

      // Simulate GPU metrics
      const loadValue = Math.min(60 + Math.random() * 35 + (progress * 0.3), 98);
      setGpuLoad(loadValue);

      const tempValue = Math.min(40 + (progress * 0.6) + Math.random() * 5, 85);
      setTemp(tempValue);

      const memoryValue = Math.min((progress / 100) * 90, 85);
      setMemory(memoryValue);

      if (isRunning) {
        requestAnimationFrame(countFrames);
      }
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, progress]);

  if (!isRunning) return null;

  const getTempColor = (temp: number) => {
    if (temp < 60) return 'text-green-400';
    if (temp < 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTempBgColor = (temp: number) => {
    if (temp < 60) return 'bg-green-500';
    if (temp < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLoadColor = (load: number) => {
    if (load < 50) return 'bg-blue-500';
    if (load < 75) return 'bg-cyan-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      {/* Animated scan lines effect */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500 to-transparent"
          style={{
            animation: 'scanlines 3s linear infinite',
            backgroundSize: '100% 4px',
          }}
        />
      </div>

      {/* Corner accent lights */}
      <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-cyan-400 blur-md opacity-60" />
      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-purple-400 blur-md opacity-60" />
      <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-green-400 blur-md opacity-60" />
      <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-pink-400 blur-md opacity-60" />

      {/* Metrics Display */}
      <div className="absolute top-4 left-4 space-y-3 text-white font-mono text-sm">
        {/* FPS Counter */}
        <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/50 rounded px-3 py-2">
          <div className="flex items-baseline gap-2">
            <span className="text-cyan-400 text-xs tracking-wider">FPS</span>
            <span className="text-lg font-bold text-cyan-300 animate-pulse">
              {fps}
            </span>
          </div>
        </div>

        {/* GPU Load */}
        <div className="bg-black/60 backdrop-blur-sm border border-emerald-500/50 rounded px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-emerald-400 text-xs tracking-wider">GPU LOAD</span>
            <span className="text-emerald-300 font-bold text-sm">{gpuLoad.toFixed(1)}%</span>
          </div>
          <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden border border-emerald-500/30">
            <div
              className={`h-full ${getLoadColor(gpuLoad)} transition-all duration-100`}
              style={{ width: `${gpuLoad}%` }}
            />
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-black/60 backdrop-blur-sm border border-orange-500/50 rounded px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-orange-400 text-xs tracking-wider">TEMP</span>
            <span className={`font-bold text-sm ${getTempColor(temp)}`}>
              {temp.toFixed(1)}°C
            </span>
          </div>
          <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden border border-orange-500/30">
            <div
              className={`h-full ${getTempBgColor(temp)} transition-all duration-100`}
              style={{ width: `${Math.min((temp / 100) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Memory */}
        <div className="bg-black/60 backdrop-blur-sm border border-purple-500/50 rounded px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-purple-400 text-xs tracking-wider">MEMORY</span>
            <span className="text-purple-300 font-bold text-sm">{memory.toFixed(1)}%</span>
          </div>
          <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden border border-purple-500/30">
            <div
              className="h-full bg-purple-500 transition-all duration-100"
              style={{ width: `${memory}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center Status */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div
            className="inline-block w-16 h-16 rounded-full border-4 border-transparent border-t-cyan-400 border-r-purple-400"
            style={{
              animation: 'spin 2s linear infinite',
            }}
          />
          <p className="mt-4 text-white font-mono text-sm tracking-widest opacity-70">
            BENCHMARKING
          </p>
          <p className="text-cyan-400 font-mono text-xs mt-1 animate-pulse">
            {progress.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Right side metrics */}
      <div className="absolute top-4 right-4 space-y-2 text-white font-mono text-xs">
        <div className="bg-black/60 backdrop-blur-sm border border-pink-500/50 rounded px-2 py-1">
          <span className="text-pink-400">THREADS:</span>
          <span className="ml-1 text-pink-300 font-bold">{Math.floor(Math.random() * 16) + 8}</span>
        </div>
        <div className="bg-black/60 backdrop-blur-sm border border-blue-500/50 rounded px-2 py-1">
          <span className="text-blue-400">VRAM:</span>
          <span className="ml-1 text-blue-300 font-bold">{(4 + Math.random() * 8).toFixed(1)}GB</span>
        </div>
        <div className="bg-black/60 backdrop-blur-sm border border-green-500/50 rounded px-2 py-1">
          <span className="text-green-400">CLOCK:</span>
          <span className="ml-1 text-green-300 font-bold">{(1.5 + Math.random() * 1.0).toFixed(1)}GHz</span>
        </div>
      </div>

      {/* Animated grid background */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-cyan-500" />
      </svg>

      {/* Animated particles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 12}%`,
            animation: `float-particle ${3 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes scanlines {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.3;
          }
          50% {
            transform: translate(${Math.random() * 20 - 10}px, -30px);
            opacity: 0.8;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
