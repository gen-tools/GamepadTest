import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Touchpad, 
  Hand, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Info, 
  Copy, 
  Grid3X3, 
  PenTool, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Activity, 
  Smartphone, 
  Laptop, 
  ShieldCheck,
  MousePointer,
  HelpCircle,
  Gamepad2,
  Mic,
  Music,
  Monitor,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AdsterraAd from '@/components/AdsterraAd';
import { useToast } from '@/hooks/use-toast';

interface TouchPointData {
  id: number;
  x: number;
  y: number;
  radiusX?: number;
  radiusY?: number;
  force?: number;
  color: string;
}

const TOUCH_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1', // Indigo
];

const faqsList = [
  {
    q: "How do I test my touch screen?",
    a: "Open this page on your device, then tap, swipe, or drag across the grid. You should see a marker appear the instant you touch."
  },
  {
    q: "Does this page support multi-touch testing?",
    a: "Yes — touch the screen with more than one finger and watch how many points get picked up at once."
  },
  {
    q: "Can I test my phone's touch screen online?",
    a: "Yes, it works directly in your mobile browser on Android and iPhone, no app required."
  },
  {
    q: "Why is my touch screen not responding?",
    a: "Could be a few things — a dirty or damp screen, a software glitch, a damaged screen protector, or actual hardware damage. Testing helps you figure out which one it is."
  },
  {
    q: "How many touch points does my device support?",
    a: "Most phones and tablets these days handle somewhere between five and ten touch points at once, though it varies by model."
  },
  {
    q: "Does this work on Android devices?",
    a: "Yes — Chrome, Firefox, and Samsung Internet all support it on Android."
  },
  {
    q: "Does this work on iPhone and iPad?",
    a: "Yes, both Safari and Chrome on iOS and iPadOS support the touch detection this uses."
  },
  {
    q: "Can I test a laptop's touch screen?",
    a: "As long as the laptop actually has a touchscreen and you're using a modern browser — Chrome, Edge, or Firefox — yes."
  },
  {
    q: "Why does my screen show ghost touches?",
    a: "Usually it's screen damage, moisture, static, or a screen protector that's not sitting right."
  },
  {
    q: "Can this test detect a cracked screen?",
    a: "It can pick up on touch problems caused by a crack, but it won't tell you directly whether the glass is physically damaged."
  },
  {
    q: "Is a browser test as accurate as a manufacturer diagnostic?",
    a: "It's a solid first step, but manufacturer tools can dig into hardware data that a browser simply can't reach."
  },
  {
    q: "Why does one corner of my screen not respond?",
    a: "That's a classic sign of a dead zone — often from pressure damage, age, or a manufacturing flaw."
  },
  {
    q: "Can I use this to check a used phone before buying it?",
    a: "Definitely. It's a quick way to check touch accuracy and multi-touch before you hand over cash for a secondhand device."
  },
  {
    q: "Does screen brightness affect touch accuracy?",
    a: "No — brightness and touch sensitivity come from separate parts of the display, so one shouldn't affect the other."
  },
    {
      q: "What should I do if my touch screen fails this test?",
      a: "Start simple: clean the screen and restart the device. If it's still acting up, our diagnostic guide walks through next steps before you call in a repair shop.",
      aJSX: (
        <>
          Start simple: clean the screen and restart the device. If it's still
          acting up,{" "}
          <Link to="/touch-screen-testing">
            this diagnostic guide
          </Link>{" "}
          walks through next steps before you call in a repair shop.
        </>
      ),
    },
  ];

export default function TouchTester() {
  const { toast } = useToast();

  // Device & API capabilities state
  const [hasTouchSupport, setHasTouchSupport] = useState<boolean>(false);
  const [hardwareMaxTouchPoints, setHardwareMaxTouchPoints] = useState<number>(0);

  // Active touch points tracking
  const [activeTouches, setActiveTouches] = useState<TouchPointData[]>([]);
  const [maxDetectedSimultaneous, setMaxDetectedSimultaneous] = useState<number>(0);
  const [totalTouchEventsCount, setTotalTouchEventsCount] = useState<number>(0);

  // Settings / Modes
  const [testMode, setTestMode] = useState<'canvas' | 'grid'>('canvas');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Grid Dead-Spot test state (10 columns x 8 rows)
  const GRID_COLS = 10;
  const GRID_ROWS = 8;
  const [gridCells, setGridCells] = useState<boolean[]>(() => new Array(GRID_COLS * GRID_ROWS).fill(false));

  // Canvas ref for persistent trail drawing
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Check Touch Support on mount
  useEffect(() => {
    const touchSupported = typeof window !== 'undefined' && (
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      (navigator as any).msMaxTouchPoints > 0
    );

    const maxPoints = navigator.maxTouchPoints || (navigator as any).msMaxTouchPoints || 0;

    setHasTouchSupport(touchSupported);
    setHardwareMaxTouchPoints(maxPoints);
  }, []);

  // Web Audio chime generator for touch feedback
  const playTouchChime = useCallback((pitchMultiplier: number = 1) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 * pitchMultiplier, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880 * pitchMultiplier, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore audio context autoplay policy restrictions
    }
  }, [soundEnabled]);

  // Adjust canvas size to container
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Process Touch & Mouse events
  const handleTouchStartOrMove = useCallback((e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    let newPoints: TouchPointData[] = [];

    if ('touches' in e && e.touches.length > 0) {
      // Touch Event
      const touchesArr = Array.from(e.touches);
      newPoints = touchesArr.map((t, idx) => {
        const touchAny = t as any;
        return {
          id: t.identifier,
          x: Math.round(t.clientX - rect.left),
          y: Math.round(t.clientY - rect.top),
          radiusX: Math.round(touchAny.radiusX || 15),
          radiusY: Math.round(touchAny.radiusY || 15),
          force: touchAny.force ? Number(touchAny.force.toFixed(2)) : undefined,
          color: TOUCH_COLORS[idx % TOUCH_COLORS.length]
        };
      });
    } else if ('clientX' in e) {
      // Mouse/Pointer event simulation
      const me = e as React.MouseEvent<HTMLDivElement>;
      if (me.buttons > 0 || e.type === 'mousedown') {
        newPoints = [{
          id: 0,
          x: Math.round(me.clientX - rect.left),
          y: Math.round(me.clientY - rect.top),
          radiusX: 15,
          radiusY: 15,
          color: TOUCH_COLORS[0]
        }];
      }
    }

    if (newPoints.length > 0) {
      setActiveTouches(newPoints);
      setMaxDetectedSimultaneous((prev) => Math.max(prev, newPoints.length));
      setTotalTouchEventsCount((prev) => prev + 1);

      if (e.type === 'touchstart' || e.type === 'mousedown') {
        playTouchChime(1 + (newPoints.length * 0.1));
      }

      // Draw trails on canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          newPoints.forEach((pt) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, (pt.radiusX || 12), 0, Math.PI * 2);
            ctx.fillStyle = pt.color + '44'; // semi-transparent trail
            ctx.fill();
            ctx.strokeStyle = pt.color;
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        }
      }

      // Update Grid Dead-spot Test state if in grid mode
      if (testMode === 'grid') {
        const cellW = rect.width / GRID_COLS;
        const cellH = rect.height / GRID_ROWS;

        setGridCells((prevGrid) => {
          let updated = false;
          const nextGrid = [...prevGrid];

          newPoints.forEach((pt) => {
            const col = Math.floor(pt.x / cellW);
            const row = Math.floor(pt.y / cellH);

            if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
              const index = row * GRID_COLS + col;
              if (!nextGrid[index]) {
                nextGrid[index] = true;
                updated = true;
              }
            }
          });

          return updated ? nextGrid : prevGrid;
        });
      }
    }
  }, [playTouchChime, testMode]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if ('touches' in e && e.touches.length > 0) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const touchesArr = Array.from(e.touches);
      const remaining = touchesArr.map((t, idx) => {
        const touchAny = t as any;
        return {
          id: t.identifier,
          x: Math.round(t.clientX - rect.left),
          y: Math.round(t.clientY - rect.top),
          radiusX: Math.round(touchAny.radiusX || 15),
          radiusY: Math.round(touchAny.radiusY || 15),
          color: TOUCH_COLORS[idx % TOUCH_COLORS.length]
        };
      });
      setActiveTouches(remaining);
    } else {
      setActiveTouches([]);
    }
  }, []);

  // Clear canvas & grid test
  const clearCanvasAndGrid = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setGridCells(new Array(GRID_COLS * GRID_ROWS).fill(false));
    setActiveTouches([]);
    toast({
      title: "Test Area Reset",
      description: "Touch trails and grid coverage test cleared.",
    });
  };

  // Toggle Fullscreen
  const toggleFullscreenMode = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        toast({ title: "Fullscreen standard restricted", description: "Fullscreen mode unavailable in this browser." });
      });
    } else {
      document.exitFullscreen?.().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Copy Touch Diagnostic Report
  const copyDiagnosticReport = () => {
    const gridCheckedCount = gridCells.filter(Boolean).length;
    const gridPct = Math.round((gridCheckedCount / (GRID_COLS * GRID_ROWS)) * 100);

    const report = `=== GAMEPADTEST TOUCH SCREEN DIAGNOSTIC ===
Date: ${new Date().toLocaleString()}
Touch Hardware API Supported: ${hasTouchSupport ? 'YES 🟢' : 'NO / Desktop Mouse Only 🟡'}
Hardware Max Simultaneous Touch Points: ${hardwareMaxTouchPoints}
Peak Simultaneous Touches Detected: ${maxDetectedSimultaneous}
Total Touch Events Captured: ${totalTouchEventsCount}
Grid Coverage Dead-Spot Test: ${gridPct}% (${gridCheckedCount}/${GRID_COLS * GRID_ROWS} cells)
Screen Resolution: ${window.innerWidth} x ${window.innerHeight} px
User Agent: ${navigator.userAgent}
===========================================`;

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    toast({
      title: "Report Copied!",
      description: "Touch screen diagnostic details copied to clipboard.",
    });
    setTimeout(() => setCopiedReport(false), 3000);
  };

  // Grid Coverage percentage calculation
  const gridCheckedCount = gridCells.filter(Boolean).length;
  const gridCoveragePct = Math.round((gridCheckedCount / (GRID_COLS * GRID_ROWS)) * 100);

  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqsList.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Touch Screen Test Online | Free Multi-Touch Checker</title>
        <meta
          name="description"
          content="Touch Screen Test online for free. Check touch points, response speed, multi-touch accuracy, and detect dead zones on any phone, tablet, or laptop."
        />
        <meta
          name="keywords"
          content="Touch Screen Test, Multi Touch Tester, Screen Dead Spot Test, Touchscreen Test Online, Mobile Touch Test, Max Touch Points"
        />
        <link rel="canonical" href="https://www.gamepadtest.tech/touch-screen-test" />

        {/* Open Graph */}
        <meta property="og:title" content="Touch Screen Test Online | Free Multi-Touch Checker" />
        <meta property="og:description" content="Touch Screen Test online for free. Check touch points, response speed, multi-touch accuracy, and detect dead zones on any phone, tablet, or laptop." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.gamepadtest.tech/touch-screen-test" />
        <meta property="og:site_name" content="GamepadTest" />
        <meta property="og:image" content="https://www.gamepadtest.tech/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GamepadTest" />
        <meta name="twitter:title" content="Touch Screen Test Online | Free Multi-Touch Checker" />
        <meta name="twitter:description" content="Touch Screen Test online for free. Check touch points, response speed, multi-touch accuracy, and detect dead zones on any phone, tablet, or laptop." />
        <meta name="twitter:image" content="https://www.gamepadtest.tech/twitter-image.jpg" />

        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-in fade-in duration-500">
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Touchpad className="h-4 w-4" />
            Display & Input Hardware Diagnostics
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground text-center flex justify-center items-center">
            Touch Screen Test
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Use this touch screen test to see if your display is responding the way it should. Tap or swipe across the grid below and watch your touch points show up live. It only takes a few seconds to spot a dead zone or a laggy corner.
          </p>
        </div>

        {/* Non-Touch Device Notice Banner */}
        {!hasTouchSupport && (
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 flex items-start gap-3 text-blue-900 dark:text-blue-200">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-semibold">Desktop / Non-Touch Device Detected</p>
              <p>
                Your browser reports <strong>{hardwareMaxTouchPoints} hardware touch points</strong>. If you are on a desktop PC or non-touch laptop, you can still test touch response using click and drag below, or open this page on your smartphone or tablet!
              </p>
            </div>
          </div>
        )}

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-primary/20 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Hand className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Active Touches</p>
                <p className="text-2xl font-black text-foreground">{activeTouches.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10 text-green-600">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Peak Multi-Touch</p>
                <p className="text-2xl font-black text-foreground">{maxDetectedSimultaneous} Points</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Max Hardware Spec</p>
                <p className="text-2xl font-black text-foreground">
                  {hardwareMaxTouchPoints > 0 ? `${hardwareMaxTouchPoints} Points` : 'Non-Touch'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                <Grid3X3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Grid Coverage</p>
                <p className="text-2xl font-black text-foreground">{gridCoveragePct}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant={testMode === 'canvas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTestMode('canvas')}
              className="text-xs font-semibold"
            >
              <PenTool className="h-4 w-4 mr-1.5" />
              Multi-Touch Trail Canvas
            </Button>
            <Button
              variant={testMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTestMode('grid')}
              className="text-xs font-semibold"
            >
              <Grid3X3 className="h-4 w-4 mr-1.5" />
              Dead-Spot Grid Test
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-xs font-medium"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-green-500 mr-1" /> : <VolumeX className="h-4 w-4 text-muted-foreground mr-1" />}
              Sound Feedback
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvasAndGrid}
              className="text-xs font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset Test Area
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreenMode}
              className="text-xs font-medium"
            >
              <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
              Full Screen
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={copyDiagnosticReport}
              className="text-xs font-semibold"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              {copiedReport ? 'Copied!' : 'Copy Report'}
            </Button>
          </div>
        </div>

        {/* Main Touch Test Area Canvas Box */}
        <Card className="border-2 border-primary/30 shadow-lg overflow-hidden relative">
          <CardHeader className="bg-muted/40 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Hand className="h-5 w-5 text-primary" />
                Interactive Touch Screen Testing Surface
              </CardTitle>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {testMode === 'canvas' ? 'Trail Drawing Active' : 'Dead-Spot Grid Mode'}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {testMode === 'canvas' 
                ? 'Touch, tap, or drag multiple fingers across the screen to test multi-touch tracking and smoothness.'
                : 'Swipe across every section of the screen to fill all grid cells green and verify zero dead-spots.'}
            </CardDescription>
          </CardHeader>

          <div
            ref={containerRef}
            onTouchStart={handleTouchStartOrMove}
            onTouchMove={handleTouchStartOrMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseDown={handleTouchStartOrMove}
            onMouseMove={handleTouchStartOrMove}
            onMouseUp={handleTouchEnd}
            className={`relative w-full h-[480px] bg-background select-none touch-none overflow-hidden cursor-crosshair ${
              isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen rounded-none' : ''
            }`}
          >
            {/* Background Persistent Drawing Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* Grid Overlay Mode */}
            {testMode === 'grid' && (
              <div 
                className="absolute inset-0 grid w-full h-full pointer-events-none border border-muted"
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`
                }}
              >
                {gridCells.map((checked, idx) => (
                  <div
                    key={idx}
                    className={`border border-border/40 transition-colors duration-200 flex items-center justify-center ${
                      checked ? 'bg-green-500/30 border-green-500/50' : 'bg-transparent'
                    }`}
                  >
                    {checked && <CheckCircle2 className="h-4 w-4 text-green-500 opacity-60" />}
                  </div>
                ))}
              </div>
            )}

            {/* Instruction Overlay if empty */}
            {activeTouches.length === 0 && totalTouchEventsCount === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none space-y-3 bg-background/60 backdrop-blur-xs">
                <div className="p-4 rounded-full bg-primary/10 text-primary animate-pulse">
                  <Hand className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">Touch or Drag Anywhere On Screen</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Place 1, 2, 5, or 10 fingers on the screen simultaneously to verify multi-touch input capability.
                  </p>
                </div>
              </div>
            )}

            {/* Active Floating Touch Points Visual Indicators */}
            {activeTouches.map((touch, idx) => (
              <div
                key={touch.id ?? idx}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75 flex flex-col items-center"
                style={{
                  left: `${touch.x}px`,
                  top: `${touch.y}px`,
                }}
              >
                {/* Glowing Circle */}
                <div
                  className="w-16 h-16 rounded-full border-2 animate-ping absolute opacity-75"
                  style={{ borderColor: touch.color, backgroundColor: touch.color + '22' }}
                />
                <div
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg font-mono font-bold text-xs text-white"
                  style={{ backgroundColor: touch.color, borderColor: '#ffffff' }}
                >
                  #{idx + 1}
                </div>

                {/* Coordinates Tag */}
                <div className="mt-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] whitespace-nowrap shadow">
                  X:{touch.x} Y:{touch.y} {touch.force ? `(${Math.round(touch.force * 100)}%)` : ''}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Touch Point Coordinates Table */}
        {activeTouches.length > 0 && (
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Active Touch Stream
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {activeTouches.map((pt, idx) => (
                  <div key={pt.id ?? idx} className="p-2.5 rounded-lg border bg-muted/30 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between font-bold" style={{ color: pt.color }}>
                      <span>Finger #{idx + 1}</span>
                      <span>ID: {pt.id}</span>
                    </div>
                    <div className="text-muted-foreground flex justify-between">
                      <span>X: {pt.x}px</span>
                      <span>Y: {pt.y}px</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Middle Ad Banner */}
        <AdsterraAd className="my-6" />

        {/* 4. Introduction & 5. Quick Answer Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Touchpad className="h-5 w-5 text-primary" />
                Introduction to Touch Screen Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                A touch screen that&apos;s working right reacts the moment your finger touches it — no pause, no guessing. When taps get missed, swipes feel jumpy, or one part of the screen just won&apos;t respond, it&apos;s not always obvious whether the issue is the hardware, the browser, or something running in the background. Running a touch screen test clears that up fast, right in your browser, with nothing to download.
              </p>
              <p>
                Go ahead and tap, swipe, or drag your finger across the grid above. You&apos;ll see each contact point light up as it&apos;s detected, so you can tell how many fingers your screen picks up at once, how quickly it reacts, and whether any spot on the display is being ignored. This works on phones, tablets, and touchscreen laptops, whether you&apos;re on Android, iOS, Windows, or Chrome OS.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2 text-foreground">
                <Zap className="h-5 w-5 text-amber-500" />
                Quick Answer: What is a Touch Screen Test?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                What is a touch screen test? It&apos;s a way to check whether your screen actually detects and responds to your finger — taps, swipes, and more than one touch point at a time.
              </p>
              <p>
                Tap the grid on this page with one finger, then try a few at once, and watch for instant feedback wherever you touch. If a spot stays quiet or the response feels slow, that part of the screen might have a hardware or driver problem.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 6. Why Use This Tool? */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Why Use This Tool?
            </CardTitle>
            <CardDescription>A few situations where running a quick touch check actually pays off:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-card space-y-1">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-500" />
                  Test a new phone before you buy it
                </h3>
                <p className="text-xs text-muted-foreground">
                  Better to catch a dead zone now than after the return window closes.
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-card space-y-1">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Verify a repair went well
                </h3>
                <p className="text-xs text-muted-foreground">
                  After a screen replacement, it&apos;s worth checking the whole display, not just the spot you happen to tap first.
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-card space-y-1">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Catch dead zones while they&apos;re small
                </h3>
                <p className="text-xs text-muted-foreground">
                  Screens don&apos;t usually fail all at once — an unresponsive corner today can spread later.
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-card space-y-1">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-purple-500" />
                  Check multi-touch before gaming
                </h3>
                <p className="text-xs text-muted-foreground">
                  Fast games and drawing apps lean hard on the screen tracking several fingers accurately.
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-card space-y-1 md:col-span-2">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Info className="h-4 w-4 text-indigo-500" />
                  Rule things out when something feels off
                </h3>
                <p className="text-xs text-muted-foreground">
                  A quick test tells you whether the problem is the screen itself, the browser, or an app running in the background.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. How to Use the Touch Screen Test & 8. Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Hand className="h-5 w-5 text-primary" />
                How to Use the Touch Screen Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-5">
                <li>Pull this page up on the device you want to check — phone, tablet, or a laptop with a touchscreen.</li>
                <li>Tap anywhere on the grid. You should see a marker appear right where your finger lands.</li>
                <li>Add more fingers. Most phones and tablets today can track somewhere between five and ten touch points at once.</li>
                <li>Swipe and drag your finger across the screen and see how well it keeps up.</li>
                <li>Don&apos;t skip the corners and edges. That&apos;s usually where dead zones show up first.</li>
                <li>Keep an eye on the touch counter to see how many points your screen is actually registering.</li>
                <li>Clean the screen and try again if something seems off — a smudge or bit of moisture can throw off the results.</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Touch points show up on screen the moment they&apos;re detected</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Multi-touch tracking, so you can see how many fingers register at the same time</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Runs right in your browser — nothing to install</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Works on Android, iOS, Windows, and Chrome OS devices</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Grid layout makes dead zones easy to spot</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Reacts instantly, so lag is obvious right away</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>No sign-up, no account, nothing to hand over</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 9. What the Tool Tests */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Grid3X3 className="h-6 w-6 text-primary" />
              What the Tool Tests
            </CardTitle>
            <CardDescription>Comprehensive breakdown of input parameters verified during testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 font-bold text-foreground w-1/3">Test Area</th>
                    <th className="py-3 px-4 font-bold text-foreground">What It Checks</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-muted-foreground">
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">Touch detection</td>
                    <td className="py-3 px-4">Whether the screen picks up a touch at all</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">Multi-touch support</td>
                    <td className="py-3 px-4">How many fingers the display can track at once</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">Touch accuracy</td>
                    <td className="py-3 px-4">Whether the marker lands where you actually touched</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">Response speed</td>
                    <td className="py-3 px-4">How much delay there is between touching and seeing a reaction</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">Dead zones</td>
                    <td className="py-3 px-4">Spots on the screen that don&apos;t respond to touch</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">Swipe and drag tracking</td>
                    <td className="py-3 px-4">How smoothly the screen follows your finger as it moves</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">Edge and corner sensitivity</td>
                    <td className="py-3 px-4">Whether touches near the border of the screen register properly</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 10. Benefits of Testing Your Touch Screen */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-green-500" />
              Benefits of Testing Your Touch Screen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>Small problems are easier to fix than big ones, so catching them early matters.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>If you just had a screen replaced, this confirms the repair actually worked across the whole display.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>Buying a used phone or tablet? A quick test tells you a lot before you hand over money.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>If the browser test comes back clean, it&apos;s more likely a software issue than a hardware one — and vice versa.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>Multi-touch matters for gaming, drawing apps, and even basic gestures like pinch-to-zoom, so it&apos;s worth confirming.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>Got an issue you need to report? A screenshot or short video from this test makes for solid proof when you contact support.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 11. Common Touch Screen Problems */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Common Touch Screen Problems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl border bg-card space-y-1">
                <h3 className="font-bold text-foreground">Unresponsive spots (dead zones)</h3>
                <p className="text-xs text-muted-foreground">
                  Parts of the screen just stop reacting to touch, usually near the edges, and often after the device has taken a drop or some pressure.
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-card space-y-1">
                <h3 className="font-bold text-foreground">Ghost touches</h3>
                <p className="text-xs text-muted-foreground">
                  The screen reacts even though nothing touched it. This is usually a sign of screen damage, moisture underneath the glass, static, or a bad screen protector.
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-card space-y-1">
                <h3 className="font-bold text-foreground">Delayed response</h3>
                <p className="text-xs text-muted-foreground">
                  There&apos;s a noticeable gap between the touch and the reaction. Sometimes it&apos;s the hardware aging, sometimes it&apos;s just too many apps running at once.
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-card space-y-1">
                <h3 className="font-bold text-foreground">Multi-touch failure</h3>
                <p className="text-xs text-muted-foreground">
                  One finger works fine, but add a second and nothing happens — which kills gestures like pinch-to-zoom or two-finger scrolling.
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-card space-y-1">
                <h3 className="font-bold text-foreground">Drifting or inaccurate touches</h3>
                <p className="text-xs text-muted-foreground">
                  The screen does react, just not where you actually touched. Feels like the input is a little off, consistently.
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-card space-y-1">
                <h3 className="font-bold text-foreground">Screen freezing mid-touch</h3>
                <p className="text-xs text-muted-foreground">
                  Touch stops working for a stretch, then comes back on its own, sometimes after a restart.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 12. Browser and Device Compatibility */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Laptop className="h-6 w-6 text-primary" />
              Browser and Device Compatibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 font-bold text-foreground w-1/2">Platform</th>
                    <th className="py-3 px-4 font-bold text-foreground">Compatibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-muted-foreground">
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">Android phones and tablets</td>
                    <td className="py-3 px-4">Chrome, Firefox, and Samsung Internet all work</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">iPhone and iPad (iOS/iPadOS)</td>
                    <td className="py-3 px-4">Safari and Chrome both support it</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">Windows touchscreen laptops</td>
                    <td className="py-3 px-4">Works in Chrome, Edge, and Firefox</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">Chromebooks with touch displays</td>
                    <td className="py-3 px-4">Chrome browser handles this fine</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">Desktop monitors with touch support</td>
                    <td className="py-3 px-4">Depends on whether your browser and OS report touch input correctly</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              This relies on the Touch Events API and Pointer Events, which current versions of the major browsers all support. Older browsers may only support this partially, or not at all.
            </p>
          </CardContent>
        </Card>

        {/* 14. Related Tools */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Related Diagnostic Tools
            </CardTitle>
            <CardDescription>
              Touch response is just one piece of checking whether a device&apos;s hardware is behaving. A few other checks worth running while you&apos;re at it:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/gamepad-tester" className="p-4 rounded-xl border bg-card hover:bg-muted/40 transition-colors space-y-2 block">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  Gamepad Tester
                </div>
                <p className="text-xs text-muted-foreground">
                  Checks button mapping, stick drift, and how responsive a connected controller is.
                </p>
              </Link>

              <Link to="/mic-tester" className="p-4 rounded-xl border bg-card hover:bg-muted/40 transition-colors space-y-2 block">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Mic className="h-5 w-5 text-green-500" />
                  Mic Tester
                </div>
                <p className="text-xs text-muted-foreground">
                  Confirms your microphone is actually picking up clear audio before a call or recording.
                </p>
              </Link>

              <Link to="/gpu-tester" className="p-4 rounded-xl border bg-card hover:bg-muted/40 transition-colors space-y-2 block">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Monitor className="h-5 w-5 text-blue-500" />
                  GPU Tester
                </div>
                <p className="text-xs text-muted-foreground">
                  Checks how your graphics card handles 3D rendering and graphics load.
                </p>
              </Link>

              <Link to="/midi-tester" className="p-4 rounded-xl border bg-card hover:bg-muted/40 transition-colors space-y-2 block">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Music className="h-5 w-5 text-purple-500" />
                  MIDI Tester
                </div>
                <p className="text-xs text-muted-foreground">
                  Verifies a MIDI device is sending and receiving signals the way it should.
                </p>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Running through a few of these together is a decent way to rule out hardware issues before assuming something needs to be replaced or repaired.
            </p>
          </CardContent>
        </Card>

        {/* 15. Frequently Asked Questions */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>Common questions regarding touch screen diagnostics, multi-touch, and hardware troubleshooting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqsList.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-xl border bg-card space-y-1.5">
                  <h3 className="font-bold text-sm text-foreground flex items-start gap-2">
                    <span className="text-primary shrink-0">Q:</span>
                    {faq.q}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                    {faq.aJSX || faq.a}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

