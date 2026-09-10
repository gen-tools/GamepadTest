import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Gamepad2,
  RotateCcw,
  Sliders,
  Activity,
  CircleDot,
  Sparkles,
  ChevronRight,
  Info,
  HelpCircle,
  Play,
  Crosshair,
  Check,
  X,
  Gauge
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { SEO, createFAQStructuredData } from "@/components/SEO";
import AdsterraAd from "@/components/AdsterraAd";

interface StickPosition {
  x: number;
  y: number;
  rawX: number;
  rawY: number;
  distance: number;
}

interface StickStats {
  current: StickPosition;
  peakDrift: number;
  history: { x: number; y: number }[];
  zeroOffset: { x: number; y: number };
  circularityPoints: { x: number; y: number }[];
  circularityError: number | null;
}

interface StabilityResult {
  leftAvgDrift: number;
  leftMaxDrift: number;
  leftJitter: number;
  rightAvgDrift: number;
  rightMaxDrift: number;
  rightJitter: number;
}

export default function StickDriftTester() {
  const [gamepads, setGamepads] = useState<Gamepad[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [deadzone, setDeadzone] = useState<number>(5); // 5% default deadzone

  // Stick data
  const [leftStick, setLeftStick] = useState<StickStats>({
    current: { x: 0, y: 0, rawX: 0, rawY: 0, distance: 0 },
    peakDrift: 0,
    history: [],
    zeroOffset: { x: 0, y: 0 },
    circularityPoints: [],
    circularityError: null,
  });

  const [rightStick, setRightStick] = useState<StickStats>({
    current: { x: 0, y: 0, rawX: 0, rawY: 0, distance: 0 },
    peakDrift: 0,
    history: [],
    zeroOffset: { x: 0, y: 0 },
    circularityPoints: [],
    circularityError: null,
  });

  // Test modes
  const [isTestingStability, setIsTestingStability] = useState<boolean>(false);
  const [stabilityTimeLeft, setStabilityTimeLeft] = useState<number>(5);
  const [stabilityResults, setStabilityResults] = useState<StabilityResult | null>(null);

  const [circularityMode, setCircularityMode] = useState<"none" | "left" | "right">("none");
  const [circularityProgress, setCircularityProgress] = useState<number>(0);

  // Canvas refs
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation frame ref
  const rafRef = useRef<number | null>(null);

  // History buffers for calculations
  const leftHistoryRef = useRef<{ x: number; y: number }[]>([]);
  const rightHistoryRef = useRef<{ x: number; y: number }[]>([]);
  const stabilitySamplesRef = useRef<{ lx: number; ly: number; rx: number; ry: number }[]>([]);

  const leftZeroRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rightZeroRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update Gamepads
  const updateGamepadsList = useCallback(() => {
    const rawPads = navigator.getGamepads ? navigator.getGamepads() : [];
    const validPads = Array.from(rawPads).filter((g): g is Gamepad => g !== null && g.connected);
    setGamepads(validPads);
  }, []);

  useEffect(() => {
    window.addEventListener("gamepadconnected", updateGamepadsList);
    window.addEventListener("gamepaddisconnected", updateGamepadsList);
    updateGamepadsList();

    return () => {
      window.removeEventListener("gamepadconnected", updateGamepadsList);
      window.removeEventListener("gamepaddisconnected", updateGamepadsList);
    };
  }, [updateGamepadsList]);

  // Main polling loop
  useEffect(() => {
    const poll = () => {
      const rawPads = navigator.getGamepads ? navigator.getGamepads() : [];
      const activePad = rawPads[selectedIndex] || rawPads.find((g) => g !== null && g.connected);

      if (activePad) {
        // Standard mapping: Left Stick (axes 0, 1), Right Stick (axes 2, 3 or 3, 4)
        const rawLx = activePad.axes[0] || 0;
        const rawLy = activePad.axes[1] || 0;

        // Determine Right stick axes (some devices use 2 & 3, others 3 & 4)
        const rawRx = activePad.axes[2] !== undefined && Math.abs(activePad.axes[2]) > 0.0001 ? activePad.axes[2] : activePad.axes[3] || 0;
        const rawRy = activePad.axes[3] !== undefined && activePad.axes[2] !== undefined && Math.abs(activePad.axes[2]) > 0.0001 ? activePad.axes[3] : activePad.axes[4] || 0;

        // Apply zero calibration offset
        const lx = rawLx - leftZeroRef.current.x;
        const ly = rawLy - leftZeroRef.current.y;
        const rx = rawRx - rightZeroRef.current.x;
        const ry = rawRy - rightZeroRef.current.y;

        const lDist = Math.sqrt(lx * lx + ly * ly) * 100;
        const rDist = Math.sqrt(rx * rx + ry * ry) * 100;

        // Update history
        leftHistoryRef.current.push({ x: lx, y: ly });
        if (leftHistoryRef.current.length > 60) leftHistoryRef.current.shift();

        rightHistoryRef.current.push({ x: rx, y: ry });
        if (rightHistoryRef.current.length > 60) rightHistoryRef.current.shift();

        setLeftStick((prev) => ({
          ...prev,
          current: { x: lx, y: ly, rawX: rawLx, rawY: rawLy, distance: lDist },
          peakDrift: Math.max(prev.peakDrift, lDist),
          history: [...leftHistoryRef.current],
        }));

        setRightStick((prev) => ({
          ...prev,
          current: { x: rx, y: ry, rawX: rawRx, rawY: rawRy, distance: rDist },
          peakDrift: Math.max(prev.peakDrift, rDist),
          history: [...rightHistoryRef.current],
        }));

        // Collect stability test samples if active
        if (isTestingStability) {
          stabilitySamplesRef.current.push({ lx, ly, rx, ry });
        }

        // Collect circularity test points
        if (circularityMode === "left") {
          const radius = Math.sqrt(lx * lx + ly * ly);
          if (radius > 0.5) {
            setLeftStick((prev) => {
              const updatedPoints = [...prev.circularityPoints, { x: lx, y: ly }];
              return { ...prev, circularityPoints: updatedPoints };
            });
          }
        } else if (circularityMode === "right") {
          const radius = Math.sqrt(rx * rx + ry * ry);
          if (radius > 0.5) {
            setRightStick((prev) => {
              const updatedPoints = [...prev.circularityPoints, { x: rx, y: ry }];
              return { ...prev, circularityPoints: updatedPoints };
            });
          }
        }
      }

      rafRef.current = requestAnimationFrame(poll);
    };

    rafRef.current = requestAnimationFrame(poll);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [selectedIndex, isTestingStability, circularityMode]);

  // Render Canvas graphics
  const drawStickCanvas = (
    canvas: HTMLCanvasElement | null,
    stick: StickStats,
    deadzonePct: number,
    label: string
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const maxR = width * 0.42; // Maximum outer circle radius

    ctx.clearRect(0, 0, width, height);

    // Background fill
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, width, height);

    // Outer boundary circle (1.0 limit)
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dead zone circle
    const deadzoneR = (deadzonePct / 100) * maxR;
    ctx.beginPath();
    ctx.arc(cx, cy, deadzoneR, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(59, 130, 246, 0.08)";
    ctx.fill();
    ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshairs
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(cx - maxR, cy);
    ctx.lineTo(cx + maxR, cy);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(cx, cy - maxR);
    ctx.lineTo(cx, cy + maxR);
    ctx.stroke();

    // Diagonal guidelines
    ctx.strokeStyle = "#f1f5f9";
    ctx.beginPath();
    ctx.moveTo(cx - maxR * 0.707, cy - maxR * 0.707);
    ctx.lineTo(cx + maxR * 0.707, cy + maxR * 0.707);
    ctx.moveTo(cx + maxR * 0.707, cy - maxR * 0.707);
    ctx.lineTo(cx - maxR * 0.707, cy + maxR * 0.707);
    ctx.stroke();

    // Draw Circularity outer points if present
    if (stick.circularityPoints.length > 5) {
      ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
      ctx.beginPath();
      stick.circularityPoints.forEach((pt, idx) => {
        const px = cx + pt.x * maxR;
        const py = cy + pt.y * maxR;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(168, 85, 247, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw history trail
    if (stick.history.length > 1) {
      ctx.beginPath();
      stick.history.forEach((pt, i) => {
        const px = cx + pt.x * maxR;
        const py = cy + pt.y * maxR;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = "rgba(59, 130, 246, 0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Current position point
    const currPx = cx + stick.current.x * maxR;
    const currPy = cy + stick.current.y * maxR;

    // Color code based on deadzone & drift severity
    let dotColor = "#22c55e"; // Green (< deadzone)
    if (stick.current.distance > deadzonePct) {
      dotColor = stick.current.distance > 10 ? "#ef4444" : "#f59e0b"; // Red (>10%) or Orange/Yellow (5-10%)
    }

    // Outer pulse ring
    ctx.beginPath();
    ctx.arc(currPx, currPy, 12, 0, Math.PI * 2);
    ctx.fillStyle = dotColor + "25";
    ctx.fill();

    // Inner solid dot
    ctx.beginPath();
    ctx.arc(currPx, currPy, 6, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label text
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, cx, 20);
  };

  useEffect(() => {
    drawStickCanvas(leftCanvasRef.current, leftStick, deadzone, "LEFT ANALOG STICK");
  }, [leftStick, deadzone]);

  useEffect(() => {
    drawStickCanvas(rightCanvasRef.current, rightStick, deadzone, "RIGHT ANALOG STICK");
  }, [rightStick, deadzone]);

  // Stability test trigger
  const runStabilityTest = () => {
    setIsTestingStability(true);
    setStabilityTimeLeft(5);
    stabilitySamplesRef.current = [];

    let count = 5;
    const timer = setInterval(() => {
      count -= 1;
      setStabilityTimeLeft(count);

      if (count <= 0) {
        clearInterval(timer);
        setIsTestingStability(false);

        // Analyze collected samples
        const samples = stabilitySamplesRef.current;
        if (samples.length > 0) {
          let leftSum = 0,
            leftMax = 0;
          let rightSum = 0,
            rightMax = 0;

          samples.forEach((s) => {
            const lDist = Math.sqrt(s.lx * s.lx + s.ly * s.ly) * 100;
            const rDist = Math.sqrt(s.rx * s.rx + s.ry * s.ry) * 100;

            leftSum += lDist;
            leftMax = Math.max(leftMax, lDist);

            rightSum += rDist;
            rightMax = Math.max(rightMax, rDist);
          });

          const leftAvg = leftSum / samples.length;
          const rightAvg = rightSum / samples.length;

          // Calculate variance/jitter
          const leftJitter =
            Math.sqrt(
              samples.reduce((acc, s) => {
                const d = Math.sqrt(s.lx * s.lx + s.ly * s.ly) * 100;
                return acc + Math.pow(d - leftAvg, 2);
              }, 0) / samples.length
            ) || 0;

          const rightJitter =
            Math.sqrt(
              samples.reduce((acc, s) => {
                const d = Math.sqrt(s.rx * s.rx + s.ry * s.ry) * 100;
                return acc + Math.pow(d - rightAvg, 2);
              }, 0) / samples.length
            ) || 0;

          setStabilityResults({
            leftAvgDrift: leftAvg,
            leftMaxDrift: leftMax,
            leftJitter,
            rightAvgDrift: rightAvg,
            rightMaxDrift: rightMax,
            rightJitter,
          });
        }
      }
    }, 1000);
  };

  // Circularity Test Trigger
  const startCircularityTest = (stick: "left" | "right") => {
    if (stick === "left") {
      setLeftStick((prev) => ({ ...prev, circularityPoints: [], circularityError: null }));
    } else {
      setRightStick((prev) => ({ ...prev, circularityPoints: [], circularityError: null }));
    }

    setCircularityMode(stick);
    setCircularityProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setCircularityProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setCircularityMode("none");

        // Compute circularity error
        if (stick === "left") {
          calculateCircularityError("left");
        } else {
          calculateCircularityError("right");
        }
      }
    }, 1000);
  };

  const calculateCircularityError = (stick: "left" | "right") => {
    const targetStick = stick === "left" ? leftStick : rightStick;
    const points = targetStick.circularityPoints;

    if (points.length < 10) return;

    // Ideal circle radius is 1.0 (100%)
    let totalDev = 0;
    points.forEach((p) => {
      const radius = Math.sqrt(p.x * p.x + p.y * p.y);
      totalDev += Math.abs(1.0 - radius);
    });

    const avgError = (totalDev / points.length) * 100;

    if (stick === "left") {
      setLeftStick((prev) => ({ ...prev, circularityError: avgError }));
    } else {
      setRightStick((prev) => ({ ...prev, circularityError: avgError }));
    }
  };

  // Reset Peak & Zero Baseline
  const resetPeakAndHistory = () => {
    setLeftStick((prev) => ({ ...prev, peakDrift: 0, circularityPoints: [], circularityError: null }));
    setRightStick((prev) => ({ ...prev, peakDrift: 0, circularityPoints: [], circularityError: null }));
    setStabilityResults(null);
  };

  const zeroBaseline = () => {
    const activePad = gamepads[selectedIndex] || gamepads[0];
    if (activePad) {
      const lx = activePad.axes[0] || 0;
      const ly = activePad.axes[1] || 0;
      const rx = activePad.axes[2] !== undefined && Math.abs(activePad.axes[2]) > 0.0001 ? activePad.axes[2] : activePad.axes[3] || 0;
      const ry = activePad.axes[3] !== undefined && activePad.axes[2] !== undefined && Math.abs(activePad.axes[2]) > 0.0001 ? activePad.axes[3] : activePad.axes[4] || 0;

      leftZeroRef.current = { x: lx, y: ly };
      rightZeroRef.current = { x: rx, y: ry };

      setLeftStick((prev) => ({ ...prev, zeroOffset: { x: lx, y: ly } }));
      setRightStick((prev) => ({ ...prev, zeroOffset: { x: rx, y: ry } }));
    }
  };

  const getDriftSeverityBadge = (distance: number) => {
    if (distance < 2) {
      return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Pristine (0-2%)</Badge>;
    } else if (distance < 5) {
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Minor (2-5%)</Badge>;
    } else if (distance < 10) {
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Moderate (5-10%)</Badge>;
    } else {
      return <Badge className="bg-red-500 hover:bg-red-600 text-white">Severe (&gt;10%)</Badge>;
    }
  };

  const activePad = gamepads[selectedIndex] || gamepads[0];

  // FAQ Schema Data (20 verbatim FAQs)
  const faqs = [
    {
      question: "How do I know if my stick has drift?",
      answer: "If the on-screen indicator moves while your thumb is completely off the stick, that's drift — a healthy stick stays centered at rest. In-game, it shows up as your camera slowly panning, your character walking on its own, or your cursor creeping across a menu when you're not touching anything."
    },
    {
      question: "What causes stick drift?",
      answer: "Most drift comes from worn potentiometers — the small sensors inside the stick that report its position. Tiny metal contacts inside slide against a resistive track every time you move the stick, and after enough use they wear down and stop reading \"center\" accurately. Dust, skin oils, and debris working their way under the stick module speed this up. Less commonly, drift is caused by a bad calibration setting or firmware issue rather than physical wear."
    },
    {
      question: "Can stick drift be fixed?",
      answer: "Sometimes, depending on the cause. If it's minor or software-related, cleaning around the stick and recalibrating can resolve it. If it's caused by worn-out hardware, cleaning only helps temporarily, and the real fix is replacing the stick module or the potentiometer itself."
    },
    {
      question: "How do I fix stick drift at home?",
      answer: "Start with the cheapest steps first: recalibrate the controller in your console or PC settings, then clean around the base of the stick with isopropyl alcohol and a cotton swab or a shot of compressed air to clear out dust. If that doesn't help, the next step is opening the controller and replacing the analog stick module, which requires basic soldering or a plug-in replacement part depending on the controller."
    },
    {
      question: "Does cleaning actually fix stick drift?",
      answer: "It can, if the cause is dust or debris rather than worn-out contacts. Cleaning won't reverse physical wear on a potentiometer, so if drift returns shortly after cleaning, the module itself likely needs replacing."
    },
    {
      question: "Does recalibrating fix stick drift?",
      answer: "Recalibration can mask small amounts of drift by resetting what the controller treats as \"center,\" but it doesn't repair the underlying wear. Drift caused by worn hardware will typically come back and worsen over time even after recalibrating."
    },
    {
      question: "Why does my brand-new controller already have drift?",
      answer: "It's less common but does happen — manufacturing tolerances mean some controllers ship with a stick that's very slightly off-center from the factory. If a new controller shows drift, it's usually worth exchanging or requesting a warranty replacement rather than trying to fix it yourself."
    },
    {
      question: "Does stick drift get worse over time?",
      answer: "Yes, if it's caused by hardware wear. It typically starts subtly — a barely-noticeable creep — and becomes more pronounced the more the controller is used, since the same worn contacts keep degrading."
    },
    {
      question: "Is stick drift covered under warranty?",
      answer: "Often, if the controller is still within its warranty period and the drift isn't due to damage or excessive wear outside normal use. Policies vary by manufacturer, so check your specific console maker's support page for current warranty terms."
    },
    {
      question: "How much does it cost to fix stick drift?",
      answer: "A DIY replacement stick module typically costs far less than a full new controller, but requires some technical comfort. A professional repair service costs more than doing it yourself but doesn't require opening the controller. Replacing the whole controller is the simplest but most expensive option."
    },
    {
      question: "Can I increase the dead zone instead of fixing the drift?",
      answer: "Yes, many consoles and PC configuration tools let you manually raise the dead zone — the area around center where input is ignored — to hide minor drift. This is a workaround, not a fix, and it also slightly reduces fine control near the center of the stick."
    },
    {
      question: "Do Hall Effect sticks prevent drift?",
      answer: "Hall Effect and TMR (tunneling magnetoresistance) sticks use magnets instead of physical contacts to detect position, so there's no surface to wear down the way there is with a potentiometer. They're significantly more resistant to drift, though not always advertised clearly on every controller."
    },
    {
      question: "Does stick drift affect Xbox, PS5, and PS4 controllers equally?",
      answer: "All three use similar potentiometer-based stick designs and are all susceptible to drift from the same wear mechanism. Some individual controller models have had more reported drift issues than others, but the underlying cause is the same across brands."
    },
    {
      question: "Does this test work for Xbox, PS5, and PS4 controllers?",
      answer: "Yes — any controller connected via USB or Bluetooth that your browser recognizes as a gamepad works with this test."
    },
    {
      question: "Does drift affect PC gaming too?",
      answer: "Yes — if you're using a PS5, PS4, or Xbox controller on PC (or a native PC gamepad), the same potentiometer wear applies, and drift will show up in games and in Windows' own controller settings the same way it does on console."
    },
    {
      question: "Do Nintendo Switch Joy-Cons get stick drift too?",
      answer: "Yes, Joy-Cons are widely known for drift, for the same underlying reason — worn potentiometers in the analog stick module. This test works for Joy-Cons as well, as long as they're connected to your computer or recognized as a Bluetooth gamepad by your browser."
    },
    {
      question: "Test shows drift, but the game feels fine — should I worry?",
      answer: "Games apply their own dead zone that can hide small amounts of drift. It's worth monitoring since hardware-based drift tends to get worse, but you don't necessarily need to act immediately if it's not affecting gameplay yet."
    },
    {
      question: "Should I buy a used controller if it shows drift?",
      answer: "It depends how much drift and how easy it is to fix — minor drift on an otherwise good controller can often be resolved by cleaning or a cheap replacement stick module. Significant drift is worth factoring into the price or avoiding altogether unless you're comfortable repairing it yourself."
    },
    {
      question: "Do I need to install anything to use this test?",
      answer: "No — the test runs entirely in your browser using the Gamepad API, with nothing to download or install."
    },
    {
      question: "Does this test work on mobile?",
      answer: "Yes, on Android browsers with Gamepad API support; iOS/Safari support is less consistent, especially over Bluetooth."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stick Drift Test Online | Check PS5 & Xbox Controller Drift",
    "url": "https://www.gamepadtest.tech/stick-drift-test",
    "description": "Test your controller for stick drift online. Check PS5, PS4, Xbox, Switch, and PC controllers with our free stick drift test tool.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <SEO
        title="Stick Drift Test Online | Check PS5 & Xbox Controller Drift"
        description="Test your controller for stick drift online. Check PS5, PS4, Xbox, Switch, and PC controllers with our free stick drift test tool."
        keywords="Stick Drift Test, controller drift tester, online stick drift test, ps5 dualsense stick drift test, ps4 dualshock 4 stick drift test, xbox controller stick drift test"
        structuredData={[structuredData, createFAQStructuredData(faqs)]}
      />

      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header Banner */}
          <div className="mb-8 text-center max-w-3xl mx-auto flex flex-col items-center justify-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 text-center flex justify-center items-center">
              Stick Drift Test
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-center">
              Run a free stick drift test on your controller instantly, right in your browser — no downloads, no installs, and no waiting. Just connect your PS5, PS4, or Xbox controller and move the sticks to see real-time results. In seconds, you'll know exactly whether your controller has drift.
            </p>
          </div>

          {/* Device Connection Bar */}
          <Card className="mb-6 border-slate-200 shadow-sm">
            <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className={cn(
                  "p-3 rounded-xl flex items-center justify-center transition-colors shrink-0",
                  activePad ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500"
                )}>
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-sm sm:text-base truncate">
                      {activePad ? activePad.id : "No Controller Detected"}
                    </h2>
                    {activePad && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] sm:text-xs shrink-0">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                    {activePad
                      ? `Index: ${activePad.index} • Axes: ${activePad.axes.length} • Buttons: ${activePad.buttons.length}`
                      : "Press any button or move a joystick on your controller to activate detection."}
                  </p>
                </div>
              </div>

              {/* Gamepad Selector if multiple */}
              {gamepads.length > 1 && (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-medium text-muted-foreground shrink-0">Select Gamepad:</span>
                  <select
                    className="text-xs border rounded-md px-2 py-1.5 bg-background w-full md:w-auto"
                    value={selectedIndex}
                    onChange={(e) => setSelectedIndex(Number(e.target.value))}
                  >
                    {gamepads.map((g, idx) => (
                      <option key={idx} value={idx}>
                        #{g.index}: {g.id.slice(0, 24)}...
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetPeakAndHistory}
                  className="text-xs flex items-center justify-center gap-1.5 h-9 sm:h-8 w-full sm:w-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Peaks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zeroBaseline}
                  disabled={!activePad}
                  className="text-xs flex items-center justify-center gap-1.5 h-9 sm:h-8 w-full sm:w-auto"
                >
                  <Crosshair className="w-3.5 h-3.5" /> Calibrate Zero Center
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={runStabilityTest}
                  disabled={!activePad || isTestingStability}
                  className="text-xs flex items-center justify-center gap-1.5 h-9 sm:h-8 w-full sm:w-auto"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isTestingStability ? `Testing (${stabilityTimeLeft}s)` : "5s Stability Test"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Virtual Deadzone Control */}
          <Card className="mb-6 bg-slate-50/50 border-slate-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Virtual In-Game Dead Zone Threshold</span>
                    <Badge variant="secondary" className="text-xs font-mono">{deadzone}%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adjust this slider to simulate different game deadzones and see if your stick drift breaches it.
                  </p>
                </div>
                <div className="w-full sm:w-64 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">0%</span>
                  <Slider
                    value={[deadzone]}
                    min={0}
                    max={25}
                    step={1}
                    onValueChange={(val) => setDeadzone(val[0])}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground font-mono">25%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Testing Warning / Guidance */}
          {!activePad && (
            <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-900">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="font-semibold text-blue-950">How to Start the Stick Drift Test</AlertTitle>
              <AlertDescription className="text-sm text-blue-800 mt-1">
                Plug in your controller via USB or pair it over Bluetooth, then <strong>press any button or wiggle an analog stick</strong>. Web browsers require an initial button press before streaming live joystick hardware data.
              </AlertDescription>
            </Alert>
          )}

          {/* Dual Stick Visualizers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* LEFT STICK CARD */}
            <Card className="border-slate-200 shadow-sm relative overflow-hidden">
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-blue-600" /> Left Analog Stick (LS)
                  </CardTitle>
                  {getDriftSeverityBadge(leftStick.current.distance)}
                </div>
                <CardDescription className="text-xs">
                  X-Axis & Y-Axis live drift diagnostic
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Canvas Visualizer */}
                <div className="flex justify-center items-center relative">
                  <canvas
                    ref={leftCanvasRef}
                    width={320}
                    height={320}
                    className="w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl border bg-white shadow-inner"
                  />
                  {circularityMode === "left" && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center">
                      <Sparkles className="w-8 h-8 text-purple-400 animate-spin mb-2" />
                      <p className="font-bold text-sm mb-1">Rotate Left Stick 360°</p>
                      <p className="text-xs text-slate-300 max-w-[200px] mb-3">Rotate stick fully around the edges to map circularity error.</p>
                      <Progress value={circularityProgress} className="w-3/4 h-2" />
                    </div>
                  )}
                </div>

                {/* Live Position Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">X-Axis</span>
                    <span className="font-mono font-bold text-sm">{leftStick.current.x > 0 ? `+${leftStick.current.x.toFixed(4)}` : leftStick.current.x.toFixed(4)}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Y-Axis</span>
                    <span className="font-mono font-bold text-sm">{leftStick.current.y > 0 ? `+${leftStick.current.y.toFixed(4)}` : leftStick.current.y.toFixed(4)}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Resting Drift</span>
                    <span className={cn(
                      "font-mono font-bold text-sm",
                      leftStick.current.distance > deadzone ? "text-red-600" : "text-emerald-600"
                    )}>
                      {leftStick.current.distance.toFixed(2)}%
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Peak Drift</span>
                    <span className="font-mono font-bold text-sm text-amber-600">{leftStick.peakDrift.toFixed(2)}%</span>
                  </div>
                </div>

                {/* Circularity Error Info */}
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Gauge className="w-4 h-4 text-purple-600" />
                    <span>Circularity Error:</span>
                    <span className="font-mono font-bold text-foreground">
                      {leftStick.circularityError !== null ? `${leftStick.circularityError.toFixed(2)}%` : "Not Tested"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startCircularityTest("left")}
                    disabled={!activePad || circularityMode !== "none"}
                    className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    Test Circularity
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RIGHT STICK CARD */}
            <Card className="border-slate-200 shadow-sm relative overflow-hidden">
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-indigo-600" /> Right Analog Stick (RS)
                  </CardTitle>
                  {getDriftSeverityBadge(rightStick.current.distance)}
                </div>
                <CardDescription className="text-xs">
                  X-Axis & Y-Axis live drift diagnostic
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Canvas Visualizer */}
                <div className="flex justify-center items-center relative">
                  <canvas
                    ref={rightCanvasRef}
                    width={320}
                    height={320}
                    className="w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl border bg-white shadow-inner"
                  />
                  {circularityMode === "right" && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center">
                      <Sparkles className="w-8 h-8 text-purple-400 animate-spin mb-2" />
                      <p className="font-bold text-sm mb-1">Rotate Right Stick 360°</p>
                      <p className="text-xs text-slate-300 max-w-[200px] mb-3">Rotate stick fully around the edges to map circularity error.</p>
                      <Progress value={circularityProgress} className="w-3/4 h-2" />
                    </div>
                  )}
                </div>

                {/* Live Position Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">X-Axis</span>
                    <span className="font-mono font-bold text-sm">{rightStick.current.x > 0 ? `+${rightStick.current.x.toFixed(4)}` : rightStick.current.x.toFixed(4)}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Y-Axis</span>
                    <span className="font-mono font-bold text-sm">{rightStick.current.y > 0 ? `+${rightStick.current.y.toFixed(4)}` : rightStick.current.y.toFixed(4)}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Resting Drift</span>
                    <span className={cn(
                      "font-mono font-bold text-sm",
                      rightStick.current.distance > deadzone ? "text-red-600" : "text-emerald-600"
                    )}>
                      {rightStick.current.distance.toFixed(2)}%
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Peak Drift</span>
                    <span className="font-mono font-bold text-sm text-amber-600">{rightStick.peakDrift.toFixed(2)}%</span>
                  </div>
                </div>

                {/* Circularity Error Info */}
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Gauge className="w-4 h-4 text-purple-600" />
                    <span>Circularity Error:</span>
                    <span className="font-mono font-bold text-foreground">
                      {rightStick.circularityError !== null ? `${rightStick.circularityError.toFixed(2)}%` : "Not Tested"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startCircularityTest("right")}
                    disabled={!activePad || circularityMode !== "none"}
                    className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    Test Circularity
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Stability Test Results Modal / Box */}
          {stabilityResults && (
            <Card className="mb-8 border-emerald-200 bg-emerald-50/40 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" /> 5-Second Stability & Jitter Test Report
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 text-xs sm:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1">
                    <span className="font-bold text-emerald-900 block">Left Stick Results:</span>
                    <p>Average Resting Drift: <strong className="font-mono">{stabilityResults.leftAvgDrift.toFixed(2)}%</strong></p>
                    <p>Max Peak Drift: <strong className="font-mono">{stabilityResults.leftMaxDrift.toFixed(2)}%</strong></p>
                    <p>Input Jitter Variance: <strong className="font-mono">{stabilityResults.leftJitter.toFixed(3)}</strong></p>
                    <div className="pt-1">
                      {stabilityResults.leftAvgDrift <= deadzone ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Passed: Inside virtual deadzone ({deadzone}%)
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Failed: Exceeds virtual deadzone ({deadzone}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1">
                    <span className="font-bold text-emerald-900 block">Right Stick Results:</span>
                    <p>Average Resting Drift: <strong className="font-mono">{stabilityResults.rightAvgDrift.toFixed(2)}%</strong></p>
                    <p>Max Peak Drift: <strong className="font-mono">{stabilityResults.rightMaxDrift.toFixed(2)}%</strong></p>
                    <p>Input Jitter Variance: <strong className="font-mono">{stabilityResults.rightJitter.toFixed(3)}</strong></p>
                    <div className="pt-1">
                      {stabilityResults.rightAvgDrift <= deadzone ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Passed: Inside virtual deadzone ({deadzone}%)
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Failed: Exceeds virtual deadzone ({deadzone}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Adsterra Middle Banner */}
          <div className="mb-10 flex justify-center">
            <AdsterraAd />
          </div>

          {/* New SEO Content Article */}
          <article className="prose prose-slate max-w-none dark:prose-invert space-y-8 mb-12">
            
            {/* What Is Stick Drift? */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">What Is Stick Drift?</h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Stick drift is when your controller registers stick movement even though you're not touching it — your character walks on its own, the camera slowly pans, or your cursor creeps across the menu. It's not a software glitch and it's not you imagining things; it's a hardware problem.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Inside every analog stick sits a potentiometer (or, on newer controllers, a Hall effect sensor) that reports the stick's exact position to the console or PC. Over time, the contacts inside a potentiometer wear down, or dust and grime work their way into the housing. The sensor starts sending a "resting" reading that isn't actually zero — and that phantom input is what you feel as drift.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                This test reads that raw sensor data directly, the same data your games use, so you can see exactly what your controller is reporting when the stick is sitting untouched.
              </p>
            </section>

            {/* How to Use the Test */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">How to Use the Test</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm sm:text-base text-slate-600">
                <li>
                  <strong>Connect your controller</strong> — plug it in via USB or pair it over Bluetooth.
                </li>
                <li>
                  <strong>Press any button on the controller once</strong>, so your browser detects it (browsers only recognize a gamepad after it receives input).
                </li>
                <li>
                  <strong>Let go of both sticks and watch the on-screen visualizer.</strong> It should sit dead-center.
                </li>
                <li>
                  <strong>Move each stick individually through its full range</strong> to check the deadzone and confirm both axes track smoothly.
                </li>
                <li>
                  <strong>Read the result</strong> — if the dot drifts off-center while the stick is untouched, or jitters instead of holding still, that's drift.
                </li>
              </ol>
            </section>

            {/* Device-Specific Stick Drift Tests */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Device-Specific Stick Drift Tests</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">PS5 DualSense Stick Drift Test</h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    The DualSense connects over USB-C or Bluetooth, and both work fine for this test — though a wired connection removes any doubt about wireless interference skewing your reading. DualSense controllers are the most widely reported drift case of the past few years, largely because of how exposed the potentiometers are to dust ingress. If you're testing a DualSense, check both sticks independently, since it's common for only one — usually the left — to drift first.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">PS4 DualShock 4 Stick Drift Test</h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    The DualShock 4 connects via USB or Bluetooth. It uses the same style of potentiometer-based sticks as most controllers of its generation, so wear-related drift is the most likely cause if the controller has seen heavy use. Older DualShock 4 units (especially ones bought used) are also worth testing for stick "sag" — a slow drift back to center after you release the stick — which shows up clearly in the visualizer as a delayed rather than instant return.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Xbox Controller Stick Drift Test</h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    Xbox controllers (One and Series X|S) connect via USB, Bluetooth, or the proprietary Xbox Wireless adapter/dongle. If you're testing over the dongle, make sure it's plugged directly into a USB port rather than a hub, since some hubs introduce polling delays that can look like jitter even on a healthy stick. Xbox controllers generally hold up well against drift compared to some competitors, but the same potentiometer wear applies with age or heavy use.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-sm text-slate-700">
                    For general controller testing beyond drift — button mapping, trigger response, D-pad — see our <Link to="/gamepad-tester" className="text-primary hover:underline font-semibold">Gamepad Tester</Link>.
                  </p>
                </div>
              </div>
            </section>

            {/* How the Test Detects Drift */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">How the Test Detects Drift</h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                This tool uses the browser's built-in Gamepad API to read your controller's raw axis values in real time — the same low-level data your operating system and games use. Each analog stick reports an X and Y value between -1 and 1, where 0 is dead center. When a stick is resting and untouched, a healthy controller reports values at or extremely close to 0. If those values sit noticeably off-zero, or fluctuate on their own, that's the sensor reporting phantom movement — drift.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Nothing here is a simulation or an estimate. You're watching the exact numbers your controller is sending, which is why this test is a reliable first check before assuming a hardware repair is needed.
              </p>
            </section>

            {/* Software Test vs. In-Console Calibration Menu */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Software Test vs. In-Console Calibration Menu</h2>
              <div className="overflow-x-auto my-4 border rounded-xl">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-100 border-b">
                      <th className="p-3 font-semibold text-slate-900">Feature</th>
                      <th className="p-3 font-semibold text-slate-900">Browser Stick Drift Test</th>
                      <th className="p-3 font-semibold text-slate-900">Console Calibration Menu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Setup</td>
                      <td className="p-3 text-slate-600">None — open the page</td>
                      <td className="p-3 text-slate-600">Buried in system settings</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Shows raw input values</td>
                      <td className="p-3 text-slate-600">Yes, live</td>
                      <td className="p-3 text-slate-600">Rarely, often just pass/fail</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Works across devices</td>
                      <td className="p-3 text-slate-600">Yes (PS5, PS4, Xbox, PC)</td>
                      <td className="p-3 text-slate-600">Console-specific only</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Detects minor/early drift</td>
                      <td className="p-3 text-slate-600">Yes — visual deadzone view</td>
                      <td className="p-3 text-slate-600">Often no, only obvious cases</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Fixes drift</td>
                      <td className="p-3 text-slate-600">No — diagnostic only</td>
                      <td className="p-3 text-slate-600">Some consoles offer basic recalibration</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Use the browser test to diagnose drift, and your console's calibration menu (if it has one) to attempt a basic fix — though calibration doesn't repair worn hardware, it just adjusts the deadzone around it.
              </p>
            </section>

            {/* Supported Platforms & Browsers */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Supported Platforms & Browsers</h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                This test runs on any browser that supports the W3C Gamepad API, which includes current versions of Chrome, Edge, Firefox, and Opera on both desktop and Android. Safari's support has historically been inconsistent, particularly over Bluetooth, so a wired connection is recommended if you're testing on Safari or iOS.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Wired (USB) connections give the most accurate, lowest-latency readings. Wireless connections (Bluetooth or proprietary dongles) work too, but interference or a low battery can occasionally introduce a small amount of jitter that isn't actually stick drift — worth keeping in mind if a wireless reading looks borderline.
              </p>
            </section>

            {/* Use Cases */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Use Cases</h2>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-slate-600">
                <li>
                  <strong>Buying a used controller</strong> — check for drift before you commit to a purchase.
                </li>
                <li>
                  <strong>Diagnosing before a repair</strong> — confirm it's actually drift (and not a game or software issue) before opening up the controller.
                </li>
                <li>
                  <strong>Verifying a repair</strong> — after replacing a potentiometer, thumbstick module, or doing a clean, confirm the fix actually worked.
                </li>
                <li>
                  <strong>Competitive precision checks</strong> — even sub-threshold drift can throw off aim in shooters or fine camera control, so periodic testing helps catch it early.
                </li>
              </ul>
            </section>

            {/* Troubleshooting */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Troubleshooting</h2>
              <div className="space-y-4 text-sm sm:text-base text-slate-600">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">Controller not detected</h3>
                  <p>Press a button on the controller first — browsers only register a gamepad after it sends input, simply plugging it in isn't enough. If it's still not showing up, try a different USB cable or re-pair the Bluetooth connection.</p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">Test shows drift, but the game feels fine</h3>
                  <p>Games apply their own deadzone, which can mask small amounts of drift that this test — reading raw values — will still pick up. Minor drift like this is worth monitoring, since it tends to worsen over time.</p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">Bluetooth lag affecting the reading</h3>
                  <p>Wireless interference can occasionally cause a stray jitter that looks like drift but isn't. If a wireless result looks inconsistent, retest with the controller plugged in via USB to rule this out.</p>
                </div>
              </div>
            </section>

            {/* FAQs Accordion */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">FAQs</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`}>
                    <AccordionTrigger className="text-left font-semibold text-sm sm:text-base">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Related Tools */}
            <section className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
              <h2 className="font-bold text-lg sm:text-xl text-foreground">Related Tools</h2>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild variant="outline" size="sm" className="bg-white text-xs">
                  <Link to="/gamepad-tester">Gamepad Tester</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-white text-xs">
                  <Link to="/gpu-tester">GPU Tester</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-white text-xs">
                  <Link to="/mic-tester">Microphone Tester</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-white text-xs">
                  <Link to="/touch-screen-test">Touch Screen Tester</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-white text-xs">
                  <Link to="/midi-tester">MIDI Tester</Link>
                </Button>
              </div>
            </section>

          </article>

        </div>
      </div>
    </>
  );
}
