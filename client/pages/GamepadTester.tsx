import React, { useEffect, useState, useCallback, useRef } from "react";
import { Gamepad2, Zap, CheckCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { createHowToStructuredData } from "@/components/SEO";
import { RecommendedProductsSection } from "@/components/RecommendedProducts";
import AdsterraAd from "@/components/AdsterraAd";

interface GamepadState {
  connected: boolean;
  id: string;
  index: number;
  buttons: boolean[];
  axes: number[];
  timestamp: number;
  triggers?: number[];
  hapticActuators?: any[];
  pose?: any;
  hand?: string;
}

interface InputStats {
  buttonPresses: number;
  totalInputTime: number;
  averageReactionTime: number;
  maxStickDistance: number;
}

interface InputEvent {
  type: "press" | "release";
  button: number;
  gamepadIndex: number;
  timestamp: number;
}

export default function GamepadTester() {
  const [gamepads, setGamepads] = useState<GamepadState[]>([]);
  const [isVibrating, setIsVibrating] = useState(false);
  const [inputStats, setInputStats] = useState<InputStats>({
    buttonPresses: 0,
    totalInputTime: 0,
    averageReactionTime: 0,
    maxStickDistance: 0,
  });
  const [isLatencyTest, setIsLatencyTest] = useState(false);
  const [latencyTestStart, setLatencyTestStart] = useState<number>(0);
  const [latencyResults, setLatencyResults] = useState<number[]>([]);
  const [deadzone, setDeadzone] = useState(8);
  const [recentInputs, setRecentInputs] = useState<InputEvent[]>([]);
  const [buttonUsage, setButtonUsage] = useState<Record<number, number[]>>({});
  const [snapshotCopied, setSnapshotCopied] = useState(false);

  const prevButtonsRef = useRef<Record<number, boolean[]>>({});
  const prevGamepadsRef = useRef<GamepadState[]>([]);
  const maxStickDistRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const snapshotTimeoutRef = useRef<number | null>(null);

  const applyDeadzone = useCallback(
    (value: number) => {
      const threshold = Math.min(Math.max(deadzone / 100, 0), 0.95);
      if (Math.abs(value) <= threshold) return 0;
      const normalized = (Math.abs(value) - threshold) / (1 - threshold);
      return Math.sign(value) * Math.min(normalized, 1);
    },
    [deadzone],
  );

  const areGamepadsEqual = (a: GamepadState[], b: GamepadState[]): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const g1 = a[i];
      const g2 = b[i];
      if (
        g1.index !== g2.index ||
        g1.connected !== g2.connected ||
        g1.id !== g2.id
      )
        return false;
      if (g1.buttons.length !== g2.buttons.length) return false;
      for (let j = 0; j < g1.buttons.length; j++) {
        if (g1.buttons[j] !== g2.buttons[j]) return false;
      }
      if (g1.axes.length !== g2.axes.length) return false;
      for (let j = 0; j < g1.axes.length; j++) {
        if (Math.abs(g1.axes[j] - g2.axes[j]) > 0.0015) return false;
      }
      const t1 = g1.triggers || [];
      const t2 = g2.triggers || [];
      if (t1.length !== t2.length) return false;
      for (let j = 0; j < t1.length; j++) {
        if (Math.abs(t1[j] - t2[j]) > 0.0015) return false;
      }
    }
    return true;
  };

  const updateGamepadState = useCallback(
    (dtMs: number) => {
      if (typeof navigator === "undefined" || !navigator.getGamepads) return;
      const gamepadList = navigator.getGamepads();
      const newGamepads: GamepadState[] = [];

      for (let i = 0; i < gamepadList.length; i++) {
        const gamepad = gamepadList[i];
        if (!gamepad) continue;

        const currentButtons = gamepad.buttons.map((button) => button.pressed);
        const previousButtons =
          prevButtonsRef.current[gamepad.index] ||
          new Array(currentButtons.length).fill(false);

        const pressedButtons: number[] = [];
        const releasedButtons: number[] = [];
        for (let b = 0; b < currentButtons.length; b++) {
          if (currentButtons[b] && !previousButtons[b]) pressedButtons.push(b);
          if (!currentButtons[b] && previousButtons[b]) releasedButtons.push(b);
        }

        if (pressedButtons.length > 0) {
          setInputStats((prev) => ({
            ...prev,
            buttonPresses: prev.buttonPresses + pressedButtons.length,
            totalInputTime: prev.totalInputTime + dtMs,
          }));

          if (isLatencyTest && latencyTestStart > 0) {
            const latency = Date.now() - latencyTestStart;
            setLatencyResults((prev) => [...prev, latency]);
            setIsLatencyTest(false);
            setLatencyTestStart(0);
            setInputStats((prev) => ({
              ...prev,
              averageReactionTime:
                prev.averageReactionTime === 0
                  ? latency
                  : (prev.averageReactionTime + latency) / 2,
            }));
          }
        }

        if (pressedButtons.length > 0 || releasedButtons.length > 0) {
          const timestamp = Date.now();
          const events: InputEvent[] = [
            ...pressedButtons.map((button) => ({
              type: "press" as const,
              button,
              gamepadIndex: gamepad.index,
              timestamp,
            })),
            ...releasedButtons.map((button) => ({
              type: "release" as const,
              button,
              gamepadIndex: gamepad.index,
              timestamp,
            })),
          ];
          setRecentInputs((prev) => [...events, ...prev].slice(0, 14));
        }

        if (pressedButtons.length > 0) {
          setButtonUsage((prev) => {
            const existing = prev[gamepad.index]
              ? [...prev[gamepad.index]]
              : new Array(currentButtons.length).fill(0);
            pressedButtons.forEach((button) => {
              if (button >= existing.length) {
                const extendBy = button - existing.length + 1;
                existing.push(...new Array(extendBy).fill(0));
              }
              existing[button] = (existing[button] ?? 0) + 1;
            });
            return { ...prev, [gamepad.index]: existing };
          });
        }

        if (releasedButtons.length > 0 && isLatencyTest) {
          setIsLatencyTest(false);
          setLatencyTestStart(0);
        }

        const normalizedAxes = Array.from(gamepad.axes, (v) =>
          applyDeadzone(v),
        );

        let triggers: number[] | undefined;
        if (gamepad.axes.length > 4) {
          triggers = gamepad.axes
            .slice(4)
            .map((v) => Math.max(-1, Math.min(1, v)));
        } else if (gamepad.buttons.length >= 8) {
          const l2 = gamepad.buttons[6]?.value ?? 0;
          const r2 = gamepad.buttons[7]?.value ?? 0;
          triggers = [l2 * 2 - 1, r2 * 2 - 1];
        }

        if (gamepad.axes.length >= 2) {
          const x = normalizedAxes[0] ?? 0;
          const y = normalizedAxes[1] ?? 0;
          const stickDistance = Math.sqrt(x * x + y * y);
          if (stickDistance > maxStickDistRef.current) {
            maxStickDistRef.current = stickDistance;
            setInputStats((prev) => ({
              ...prev,
              maxStickDistance: stickDistance,
            }));
          }
        }

        prevButtonsRef.current[gamepad.index] = currentButtons;

        newGamepads.push({
          connected: gamepad.connected,
          id: gamepad.id,
          index: gamepad.index,
          buttons: currentButtons,
          axes: normalizedAxes,
          timestamp: gamepad.timestamp,
          triggers,
        });
      }

      if (!areGamepadsEqual(prevGamepadsRef.current, newGamepads)) {
        prevGamepadsRef.current = newGamepads;
        setGamepads(newGamepads);
      }
    },
    [applyDeadzone, isLatencyTest, latencyTestStart],
  );

  const testVibration = async (gamepadIndex: number) => {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return;
    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (gamepad && (gamepad as any).vibrationActuator) {
      setIsVibrating(true);
      try {
        await (gamepad as any).vibrationActuator.playEffect("dual-rumble", {
          duration: 1000,
          strongMagnitude: 0.5,
          weakMagnitude: 0.3,
        });
      } catch (error) {
        console.log("Vibration not supported on this gamepad");
      }
      setTimeout(() => setIsVibrating(false), 1000);
    }
  };

  const startLatencyTest = () => {
    setIsLatencyTest(true);
    setLatencyTestStart(Date.now());
  };

  const resetStats = () => {
    setInputStats({
      buttonPresses: 0,
      totalInputTime: 0,
      averageReactionTime: 0,
      maxStickDistance: 0,
    });
    setLatencyResults([]);
    prevButtonsRef.current = {};
    setButtonUsage({});
    setRecentInputs([]);
  };

  const averageLatency =
    latencyResults.length > 0
      ? latencyResults.reduce((a, b) => a + b, 0) / latencyResults.length
      : 0;

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && snapshotTimeoutRef.current) {
        window.clearTimeout(snapshotTimeoutRef.current);
      }
    };
  }, []);

  const primaryPadIndex = gamepads[0]?.index;
  const primaryButtonUsage =
    primaryPadIndex !== undefined ? buttonUsage[primaryPadIndex] : undefined;

  const exportSnapshot = async () => {
    if (typeof navigator === "undefined" || typeof window === "undefined")
      return;

    const summary = [
      `Controllers detected: ${gamepads.length}`,
      `Button presses: ${inputStats.buttonPresses}`,
      `Average latency: ${averageLatency ? `${averageLatency.toFixed(0)}ms` : "n/a"}`,
      `Max stick range: ${(inputStats.maxStickDistance * 100).toFixed(1)}%`,
      `Deadzone: ${deadzone}%`,
    ];

    if (primaryButtonUsage) {
      const topButtons = primaryButtonUsage
        .map((count, index) => ({ index, count }))
        .filter((entry) => entry.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((entry) => `Button ${entry.index + 1}: ${entry.count}`);
      if (topButtons.length > 0) {
        summary.push("Top buttons:", ...topButtons);
      }
    }

    try {
      await navigator.clipboard.writeText(summary.join("\n"));
      setSnapshotCopied(true);
      if (snapshotTimeoutRef.current) {
        window.clearTimeout(snapshotTimeoutRef.current);
      }
      snapshotTimeoutRef.current = window.setTimeout(
        () => setSnapshotCopied(false),
        2500,
      );
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log("Gamepad connected:", e.gamepad.id);
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log("Gamepad disconnected:", e.gamepad.id);
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    const loop = (t: number) => {
      const last = lastTimeRef.current ?? t;
      const dt = Math.min(100, t - last);
      lastTimeRef.current = t;
      updateGamepadState(dt);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener(
        "gamepaddisconnected",
        handleGamepadDisconnected,
      );
    };
  }, [updateGamepadState]);

  const renderJoystick = (x: number, y: number, label: string) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative w-24 h-24 bg-muted rounded-full border-2 border-border">
        <div
          className="absolute w-4 h-4 bg-primary rounded-full transform -translate-x-2 -translate-y-2 will-change-transform transform-gpu"
          style={{
            left: `${((x + 1) / 2) * 100}%`,
            top: `${((y + 1) / 2) * 100}%`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-border rounded-full" />
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        X: {x.toFixed(2)} Y: {y.toFixed(2)}
      </div>
    </div>
  );

  const howToStructuredData = createHowToStructuredData(
    "How to Test Your Gamepad",
    [
      "Connect your gamepad via USB or Bluetooth",
      "Press any button on your controller to activate it",
      "View real-time button presses and joystick movements",
      "Test vibration functionality with the vibration button",
    ],
  );

  const faqData = [
    {
      question: "Why isn't my gamepad being detected?",
      answer:
        "Make sure your gamepad is properly connected and press any button to activate it. Some wireless controllers need to be paired first.",
    },
    {
      question: "Which gamepads are supported?",
      answer:
        "Most modern gamepads including Xbox, PlayStation, and generic USB controllers are supported through the browser's Gamepad API.",
    },
    {
      question: "Why doesn't vibration work?",
      answer:
        "Vibration support varies by browser and gamepad model. Chrome and Edge have the best support for the Vibration API.",
    },
  ];

  const gamepadAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Gamepad Tester",
    applicationCategory: "WebApplication",
    operatingSystem: "Any",
    url: "https://gamepadtest.vercel.app/gamepad-tester",
    description:
      "Test controllers online in seconds—PS4, PS5, Xbox & PC. Detect drift, verify buttons, and fix issues fast. 100% free & safe on GamepadTest.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const gamepadBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://gamepadtest.vercel.app/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Gamepad Tester",
        item: "https://gamepadtest.vercel.app/gamepad-tester",
      },
    ],
  };

  const recommendedProducts = [
    {
      name: "Official Luna Wireless Controller",
      description:
        "Built for Amazon Luna with ultra-low latency, Bluetooth/USB support, and a comfortable grip for smooth cloud gaming.",
      href: "https://amzn.to/42wogzI",
      imageSrc:
        "https://m.media-amazon.com/images/I/51qbcWzHSML._AC_SL1000_.jpg",
      alt: "Luna Wireless Controller",
    },
    {
      name: "Xbox Wireless Gaming Controller – Ice Breaker Special Edition",
      description:
        "Cool transparent design, hybrid D-pad, and textured grips. Works with Xbox Series X|S, Xbox One, and PC via Bluetooth or USB.",
      href: "https://amzn.to/3KmlSW4",
      imageSrc: "https://m.media-amazon.com/images/I/71Js3hjffrL._SL1500_.jpg",
      alt: "Xbox Wireless Gaming Controller",
    },
    {
      name: "PlayStation DualSense® Wireless Controller",
      description:
        "Immersive haptic feedback, adaptive triggers, and built-in mic. Perfect for PS5 and PC gaming.",
      href: "https://amzn.to/3K1XlWl",
      imageSrc: "https://m.media-amazon.com/images/I/51PmeLGEkML._SL1500_.jpg",
      alt: "PlayStation DualSense",
    },
  ];

  // Effect to handle Ezoic ads initialization
  useEffect(() => {
    // Check if Ezoic is available
    if (typeof window !== 'undefined' && (window as any).ezstandalone) {
      const ez = (window as any).ezstandalone;
      
      // Initialize ads after component mounts
      setTimeout(() => {
        if (ez && ez.cmd && typeof ez.cmd.push === 'function') {
          // First ad placement
          ez.cmd.push(function() {
            ez.showAds(101);
          });
          
          // Second ad placement (with different ID)
          ez.cmd.push(function() {
            ez.showAds(102);
          });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="container mx-auto px-6 py-12">
      {/* SEO Meta Tags - Fixed Structure */}
      <Helmet>
        <html lang="en" />
        <title>Online Gamepad Tester – Test PS5, Xbox & PC Controllers</title>
        <meta
          name="description"
          content="Gamepad Tester lets you test PS5, PS4, Xbox, Nintendo Switch Pro, and PC controllers online. Check stick drift, buttons, triggers, vibration, and polling rate."
        />
        <meta
          name="keywords"
          content="gamepad tester, controller tester, joystick test, gamepad checker, PS5 controller test"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="canonical"
          href="https://gamepadtest.vercel.app/gamepad-tester"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://gamepadtest.vercel.app/gamepad-tester"
        />
        <meta
          property="og:title"
          content="Gamepad Tester Online – Free Controller & Joypad Checker"
        />
        <meta
          property="og:description"
          content="Test controllers online in seconds—PS4, PS5, Xbox & PC. Detect drift, verify buttons, and fix issues fast. 100% free & safe on GamepadTest."
        />
        <meta
          property="og:image"
          content="https://gamepadtest.vercel.app/og-image.jpg"
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="https://gamepadtest.vercel.app/gamepad-tester"
        />
        <meta
          property="twitter:title"
          content="Gamepad Tester Online – Free Controller & Joypad Checker"
        />
        <meta
          property="twitter:description"
          content="Test controllers online in seconds—PS4, PS5, Xbox & PC. Detect drift, verify buttons, and fix issues fast. 100% free & safe on GamepadTest."
        />
        <meta
          property="twitter:image"
          content="https://gamepadtest.vercel.app/twitter-image.jpg"
        />

        <script type="application/ld+json">
          {JSON.stringify(gamepadAppSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(gamepadBreadcrumb)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(howToStructuredData)}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          {/* First Ezoic Ad */}
          <div id="ezoic-pub-ad-placeholder-101"></div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="h-8 w-8 text-primary animate-bounce-in" />
            <h1 className="text-3xl font-bold animate-fade-in-right animate-stagger-1 text-center flex justify-center items-center">
              Gamepad Tester
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-stagger-2">
            Test your gaming controllers with real-time input detection, button
            mapping, and vibration feedback.
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle
                className={cn(
                  "h-5 w-5 transition-colors duration-500",
                  gamepads.length > 0
                    ? "text-green-500 animate-pulse"
                    : "text-muted-foreground",
                )}
              />
              Connection Status
            </CardTitle>
            <CardDescription
              className={gamepads.length > 0 ? "animate-fade-in" : ""}
            >
              {gamepads.length > 0
                ? `${gamepads.length} gamepad(s) detected`
                : "No gamepads detected. Please connect a controller and press any button."}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-8 animate-fade-in-up">
          <CardHeader>
            <CardTitle>Input Lab</CardTitle>
            <CardDescription>
              Tune dead zones, review input history, and export diagnostics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Analog Deadzone</span>
                  <span className="text-xs text-muted-foreground">
                    {deadzone}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={1}
                  value={deadzone}
                  onChange={(event) => setDeadzone(Number(event.target.value))}
                  className="w-full mt-3"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Reduce drift by increasing the deadzone or set it low for
                  competitive play.
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900">
                <span className="text-sm font-medium">Recent Inputs</span>
                <div className="mt-3 max-h-36 overflow-y-auto space-y-2 text-xs">
                  {recentInputs.length === 0 && (
                    <p className="text-muted-foreground">
                      No inputs yet. Press any button to capture diagnostics.
                    </p>
                  )}
                  {recentInputs.map((event, idx) => (
                    <div
                      key={`${event.timestamp}-${event.button}-${idx}`}
                      className="flex items-center justify-between gap-3 px-2 py-1 rounded bg-white dark:bg-slate-800"
                    >
                      <span className="font-medium">
                        #{event.gamepadIndex} · B{event.button + 1}
                      </span>
                      <span
                        className={
                          event.type === "press"
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {event.type === "press" ? "Pressed" : "Released"}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900">
                <span className="text-sm font-medium">Most Used Buttons</span>
                <div className="mt-3 space-y-2 text-sm">
                  {!primaryButtonUsage ||
                  primaryButtonUsage.every((count) => count === 0) ? (
                    <p className="text-xs text-muted-foreground">
                      Press buttons to build usage stats.
                    </p>
                  ) : (
                    primaryButtonUsage
                      .map((count, index) => ({ index, count }))
                      .filter((entry) => entry.count > 0)
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map((entry) => (
                        <div
                          key={entry.index}
                          className="flex items-center justify-between rounded bg-white dark:bg-slate-800 px-3 py-1 text-xs"
                        >
                          <span>Button {entry.index + 1}</span>
                          <span className="font-semibold">{entry.count}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={exportSnapshot}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Copy Diagnostic Snapshot
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRecentInputs([])}
              >
                Clear Input History
              </Button>
              {snapshotCopied && (
                <span className="text-sm text-green-600">
                  Snapshot copied to clipboard.
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rest of the component remains the same */}
        {gamepads.length > 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 animate-fade-in-up animate-stagger-4 hover-glow">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
                Advanced Testing Features
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Unique features to test your gamepad's performance and
                responsiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {inputStats.buttonPresses}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Button Presses
                  </div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(inputStats.maxStickDistance * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Max Stick Range
                  </div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {averageLatency ? `${averageLatency.toFixed(0)}ms` : "--"}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Avg Latency
                  </div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {latencyResults.length}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Tests Complete
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={startLatencyTest}
                  disabled={isLatencyTest}
                  variant="outline"
                  size="sm"
                >
                  {isLatencyTest ? "Press Any Button!" : "Test Latency"}
                </Button>
                <Button onClick={resetStats} variant="outline" size="sm">
                  Reset Stats
                </Button>
              </div>
              {isLatencyTest && (
                <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <div className="text-yellow-800 dark:text-yellow-200 font-semibold">
                    Latency Test Active - Press any button as fast as you can!
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {gamepads.length === 0 && (
          <Card className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
                How to Connect Your Gamepad
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-orange-700 dark:text-orange-300">
              <div className="flex items-start gap-2 animate-fade-in-left animate-stagger-1">
                <span className="font-semibold">1.</span>
                <span>Connect your gamepad via USB or Bluetooth</span>
              </div>
              <div className="flex items-start gap-2 animate-fade-in-left animate-stagger-2">
                <span className="font-semibold">2.</span>
                <span>Press any button on your controller to activate it</span>
              </div>
              <div className="flex items-start gap-2 animate-fade-in-left animate-stagger-3">
                <span className="font-semibold">3.</span>
                <span>Your gamepad will appear below once detected</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gamepad Display */}
        {gamepads.map((gamepad) => (
          <Card key={gamepad.index} className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">#{gamepad.index}</Badge>
                    Gamepad Connected
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {gamepad.id}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => testVibration(gamepad.index)}
                  disabled={isVibrating}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {isVibrating ? "Vibrating..." : "Test Vibration"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Controller Visualization */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Controller Status
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Button Status Cards */}
                  <div className="lg:col-span-1">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Button Status
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {gamepad.buttons.slice(0, 16).map((pressed, index) => (
                          <div
                            key={index}
                            className={cn(
                              "aspect-square rounded-md border flex items-center justify-center text-xs font-medium transition-all",
                              pressed
                                ? "bg-green-500 text-white border-green-500 shadow-md"
                                : "bg-gray-100 text-gray-600 border-gray-200",
                            )}
                          >
                            {index + 1}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {gamepad.buttons.filter(Boolean).length} of{" "}
                        {gamepad.buttons.length} buttons active
                      </div>
                    </div>
                  </div>

                  {/* Controller Visual */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 rounded-xl p-6 border">
                      <div className="relative w-full max-w-sm mx-auto">
                        {/* Controller body */}
                        <div className="relative bg-gray-300 rounded-2xl px-8 py-4 shadow-lg">
                          {/* D-pad */}
                          <div className="absolute top-4 left-4">
                            <div className="relative w-12 h-12">
                              <div
                                className={cn(
                                  "absolute top-0 left-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-x-1/2",
                                  gamepad.buttons[12] && "bg-green-500",
                                )}
                              ></div>
                              <div
                                className={cn(
                                  "absolute bottom-0 left-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-x-1/2",
                                  gamepad.buttons[13] && "bg-green-500",
                                )}
                              ></div>
                              <div
                                className={cn(
                                  "absolute left-0 top-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-y-1/2",
                                  gamepad.buttons[14] && "bg-green-500",
                                )}
                              ></div>
                              <div
                                className={cn(
                                  "absolute right-0 top-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-y-1/2",
                                  gamepad.buttons[15] && "bg-green-500",
                                )}
                              ></div>
                            </div>
                          </div>

                          {/* Face buttons */}
                          <div className="absolute top-4 right-4">
                            <div className="relative w-12 h-12">
                              <div
                                className={cn(
                                  "absolute top-0 left-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-x-1/2",
                                  gamepad.buttons[3] && "bg-green-500",
                                )}
                              ></div>
                              <div
                                className={cn(
                                  "absolute bottom-0 left-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-x-1/2",
                                  gamepad.buttons[0] && "bg-green-500",
                                )}
                              ></div>
                              <div
                                className={cn(
                                  "absolute left-0 top-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-y-1/2",
                                  gamepad.buttons[2] && "bg-green-500",
                                )}
                              ></div>
                              <div
                                className={cn(
                                  "absolute right-0 top-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-y-1/2",
                                  gamepad.buttons[1] && "bg-green-500",
                                )}
                              ></div>
                            </div>
                          </div>

                          {/* Analog sticks */}
                          <div className="absolute bottom-2 left-6">
                            <div
                              className={cn(
                                "w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500",
                                gamepad.buttons[10] && "bg-green-500",
                              )}
                            ></div>
                          </div>
                          <div className="absolute bottom-2 right-6">
                            <div
                              className={cn(
                                "w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500",
                                gamepad.buttons[11] && "bg-green-500",
                              )}
                            ></div>
                          </div>

                          {/* Shoulder buttons */}
                          <div className="absolute -top-2 left-4">
                            <div
                              className={cn(
                                "w-8 h-3 bg-gray-400 rounded-t-lg",
                                gamepad.buttons[4] && "bg-green-500",
                              )}
                            ></div>
                          </div>
                          <div className="absolute -top-2 right-4">
                            <div
                              className={cn(
                                "w-8 h-3 bg-gray-400 rounded-t-lg",
                                gamepad.buttons[5] && "bg-green-500",
                              )}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Summary */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Connection
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Connected</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Input Count
                        </h4>
                        <div className="text-2xl font-bold">
                          {inputStats.buttonPresses}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Latency
                        </h4>
                        <div className="text-lg font-semibold">
                          {averageLatency
                            ? `${averageLatency.toFixed(0)}ms`
                            : "--"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analog Sticks */}
              {gamepad.axes.length >= 4 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Analog Sticks</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
                    {renderJoystick(
                      gamepad.axes[0],
                      gamepad.axes[1],
                      "Left Stick",
                    )}
                    {renderJoystick(
                      gamepad.axes[2],
                      gamepad.axes[3],
                      "Right Stick",
                    )}
                  </div>
                </div>
              )}

              {/* Triggers */}
              {((gamepad.triggers && gamepad.triggers.length > 0) ||
                gamepad.axes.length > 4) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Triggers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(gamepad.triggers ?? gamepad.axes.slice(4)).map(
                      (value, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Trigger {index + 1}</span>
                            <span>{(((value + 1) / 2) * 100).toFixed(0)}%</span>
                          </div>
                          <Progress
                            value={((value + 1) / 2) * 100}
                            className="h-3"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Second Ezoic Ad with unique ID */}
        <div id="ezoic-pub-ad-placeholder-102" className="my-8"></div>

        <AdsterraAd />
        <RecommendedProductsSection products={recommendedProducts} />
{/* Free Online Gamepad Tester */}
        <section className="mt-12 space-y-8 text-base leading-7 text-foreground">
          <header className="space-y-3">
            <h2 className="text-2xl font-bold">Free Online Gamepad Tester</h2>
            <p>
              Test your controller directly in your browser. Check button inputs, analog sticks, triggers, vibration support, polling rate, and stick drift without installing software or creating an account.
            </p>
            <p>
              Whether you're using a PS5 DualSense, PS4 DualShock, Xbox controller, Nintendo Switch Pro Controller, or a generic USB gamepad, this gamepad tester shows you live hardware input so you can spot connection or performance issues fast. Think of it as a controller tester, controller checker, and gamepad diagnostics tool rolled into one page — no separate app needed for each type of check.
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">What You Can Test</h2>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Analog Stick Accuracy</h3>
              <p>
                Watch both analog sticks move in real time while their X and Y axis values update on screen. This joystick tester and analog stick tester view is where most people first notice something's wrong. It can reveal:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Stick drift</li>
                <li>An off-center resting position</li>
                <li>Uneven movement</li>
                <li>Deadzones that are too wide or too narrow</li>
                <li>A limited range of motion</li>
                <li>Calibration problems after a repair</li>
              </ul>
              <p>Even tiny unwanted inputs show up here long before they'd cause noticeable problems in a game.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Button Response</h3>
              <p>Every press registers instantly and shows up on screen, so you can check for:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Unresponsive buttons</li>
                <li>Double inputs from a single press</li>
                <li>Sticky buttons that don't spring back</li>
                <li>Incorrect button mapping</li>
                <li>Worn contact pads</li>
              </ul>
              <p>If a button won't register consistently, you'll at least know whether you're dealing with a mechanical fault or something more software-related.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Trigger Testing</h3>
              <p>Rather than just confirming a trigger "works," this measures its full range of travel. That lets you check:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Whether the trigger moves smoothly through its full range</li>
                <li>Its maximum and minimum reported values</li>
                <li>Uneven sensitivity between the two triggers</li>
                <li>Whether trigger calibration is off</li>
              </ul>
              <p>This comes in handy after swapping trigger components or tweaking controller settings.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Vibration Support</h3>
              <p>If your controller supports force feedback, you can test it directly. Run a controller vibration test to confirm:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>The left motor is working</li>
                <li>The right motor is working</li>
                <li>Overall rumble feels right</li>
              </ul>
              <p>When vibration doesn't work, the cause isn't always the controller — browser support, Bluetooth limitations, and drivers can all be the culprit.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Polling Rate</h3>
              <p>Polling rate is how often your controller reports its state back to the computer. A higher rate generally means less input delay, which matters most in competitive games. Use this polling rate test to compare things like:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Wired versus Bluetooth performance</li>
                <li>Different controller models against each other</li>
                <li>How driver configuration affects reporting</li>
              </ul>
              <p>What you see reflects the controller's actual reporting frequency under your current setup, and it doubles as a rough controller latency test if you're comparing connection types side by side.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Supported Controllers</h2>
            <p>This online gamepad tester works with most controllers your operating system already recognizes, including:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                <h3 className="font-semibold text-foreground mb-2">PlayStation</h3>
                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                  <li>PS5 DualSense</li>
                  <li>PS5 DualSense Edge</li>
                  <li>PS4 DualShock 4</li>
                  <li>PS3 controllers</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/40 p-4 rounded-lg border border-green-100 dark:border-green-900">
                <h3 className="font-semibold text-foreground mb-2">Xbox</h3>
                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                  <li>Xbox Series X controllers</li>
                  <li>Xbox Series S controllers</li>
                  <li>Xbox One controllers</li>
                  <li>Xbox 360 controllers (via adapter)</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-lg border border-red-100 dark:border-red-900">
                <h3 className="font-semibold text-foreground mb-2">Nintendo</h3>
                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                  <li>Nintendo Switch Pro Controller</li>
                  <li>Joy-Con (standard gamepad mode)</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-lg border border-purple-100 dark:border-purple-900">
                <h3 className="font-semibold text-foreground mb-2">PC & Third-Party</h3>
                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                  <li>8BitDo controllers</li>
                  <li>Logitech gamepads</li>
                  <li>Generic USB controllers</li>
                  <li>Generic Bluetooth gamepads</li>
                  <li>Many other third-party models</li>
                </ul>
              </div>
            </div>

            <p className="text-muted-foreground">
              If your browser sees the controller through the standard Gamepad API, it should show up automatically once you interact with it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">How to Connect Your Controller Before Testing</h2>
            <p>
              Your controller needs to actually be talking to your browser before any of the tests below will show live data. This only takes a minute, and the steps depend on which controller and connection type you're using.
            </p>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Wired (USB)</h3>
              <p>This is the most reliable option across every platform:</p>
              <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
                <li>Plug the controller directly into a USB port on your computer using a data-capable cable.</li>
                <li>Wait a few seconds for your operating system to recognize it.</li>
                <li>Press any button or move a stick — browsers won't expose gamepad data until you interact with it, even once it's connected.</li>
              </ol>
              <p className="text-muted-foreground">
                If nothing happens, try a different cable first. A lot of charging cables carry power but not data, which lets the controller light up without ever being detected.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Bluetooth (Wireless)</h3>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <strong className="text-foreground block mb-1">Windows</strong>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Open Settings &gt; Bluetooth &amp; devices.</li>
                    <li>Put your controller into pairing mode (this varies by controller — see below).</li>
                    <li>Select it from the list of available devices and confirm pairing.</li>
                    <li>Come back to this page and press a button to activate detection.</li>
                  </ol>
                </div>
                <div>
                  <strong className="text-foreground block mb-1">macOS</strong>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Open System Settings &gt; Bluetooth.</li>
                    <li>Put your controller into pairing mode.</li>
                    <li>Click Connect once it appears in the device list.</li>
                    <li>Return here and interact with the controller to trigger detection.</li>
                  </ol>
                </div>
                <div>
                  <strong className="text-foreground block mb-1">Android</strong>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Open Settings &gt; Connected devices &gt; Bluetooth.</li>
                    <li>Put your controller into pairing mode.</li>
                    <li>Tap it once it shows up, then confirm.</li>
                    <li>Chrome will pick it up once you press a button on the page.</li>
                  </ol>
                </div>
                <div>
                  <strong className="text-foreground block mb-1">Chromebook</strong>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Open the Quick Settings panel and select Bluetooth.</li>
                    <li>Put your controller into pairing mode.</li>
                    <li>Select it from the list to connect.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Putting Specific Controllers Into Pairing Mode</h3>
              <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                <li><strong>PS5 DualSense / DualSense Edge</strong> — Hold the PS button and Create button together until the light bar starts flashing.</li>
                <li><strong>PS4 DualShock 4</strong> — Hold the PS button and Share button together until the light bar flashes rapidly.</li>
                <li><strong>Xbox Series X/S and Xbox One controllers</strong> — Hold the Xbox button to turn it on, then press and hold the small pairing button on top until the Xbox logo flashes.</li>
                <li><strong>Nintendo Switch Pro Controller</strong> — Press and hold the small sync button on the top edge until the four player-indicator lights start scrolling back and forth.</li>
                <li><strong>Joy-Con</strong> — Press and hold the small sync button on the side rail until the lights scroll.</li>
                <li><strong>8BitDo and most third-party controllers</strong> — Usually a dedicated pairing button or a specific button combo; check the controller's manual, since this varies by model.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">After Connecting</h3>
              <p className="text-muted-foreground">
                Once your OS shows the controller as paired or connected, come back to this page and press any button or move a stick. That interaction is what tells your browser to start reporting live input data — simply being paired isn't enough on its own.
              </p>
              <p className="text-muted-foreground">
                If the controller still doesn't show up after that, jump to the Troubleshooting section below for connection-specific fixes.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Supported Browsers</h2>
            <p>Since the tester runs on the HTML5 Gamepad API, the browser you're using has a real effect on what you can test.</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Google Chrome</strong> — full support for buttons, sticks, triggers, and vibration on most systems.</li>
              <li><strong>Microsoft Edge</strong> — built on Chromium, so it behaves almost identically to Chrome.</li>
              <li><strong>Mozilla Firefox</strong> — handles buttons and analog input well, though vibration and some polling details can differ slightly from Chromium browsers.</li>
              <li><strong>Safari</strong> — the Gamepad API is supported at a basic level, but vibration and some of the more advanced controller data may be limited or missing depending on your macOS or iOS version.</li>
            </ul>
            <p>If you're chasing consistent results across every test category, a recent version of Chrome or Edge is your safest bet. And if something seems to be missing, it's worth trying a second browser before assuming the controller itself is broken.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">How the Gamepad Tester Works</h2>
            <p>Under the hood, this tool uses the browser's HTML5 Gamepad API to pull controller input straight from your operating system. Once the browser grants access, it keeps receiving live values for things like:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Button states</li>
              <li>Trigger values</li>
              <li>Analog stick positions</li>
              <li>Connection status</li>
              <li>Controller identification</li>
            </ul>
            <p>All of this happens locally, right inside your browser. Nothing about your controller data gets uploaded, stored, or shared anywhere — the Gamepad API only ever exposes input state to the page you're already on, and this tester just reads and displays it.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Understanding Stick Drift</h2>
            <p>Stick drift is what happens when an analog stick reports movement even though nobody's touching it. A stick in good shape should settle back near its center point every time, sitting comfortably inside its expected deadzone.</p>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">What causes it</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Wear on the potentiometer, the component most traditional sticks rely on to measure position</li>
                <li>Dust or debris that's worked its way under the stick module</li>
                <li>Mechanical damage from drops or years of heavy use</li>
                <li>Calibration that's drifted (no pun intended) over time</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">How to spot it</h3>
              <p>Set the controller down without touching either stick and watch the values in the tester. If the on-screen dot won't stay centered, or the numbers keep shifting on their own, you're looking at drift.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Deadzones</h3>
              <p>A deadzone is that small buffer zone around center where minor resting noise gets ignored rather than treated as real input. Once drift gets bad enough to push past the deadzone, you'll start noticing it in actual gameplay — a character drifting on its own, a camera creeping sideways, aim that won't sit still.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Hall Effect sticks</h3>
              <p>Newer controllers, and a lot of aftermarket replacement parts, are moving toward Hall Effect sticks. These use magnets to sense position instead of physical contact points, so there's no wear surface to degrade in the first place. That's why they tend to hold up against drift far better than the older potentiometer-based design.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Calibration, cleaning, and repair</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Some platforms include a built-in calibration option that can fix minor drift without any hardware changes.</li>
                <li>A can of compressed air, or careful cleaning around the base of the stick, often solves drift caused by dust or debris.</li>
                <li>If drift is still there after cleaning and calibration, the stick module has probably worn out and needs professional repair or a full replacement.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Common Controller Problems</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Controller not detected</strong> — the browser hasn't picked it up yet, or the connection method isn't supported.</li>
              <li><strong>USB issues</strong> — a charge-only cable can deliver power but no data.</li>
              <li><strong>Bluetooth issues</strong> — dropped pairing, interference, or a Bluetooth profile the OS doesn't fully support.</li>
              <li><strong>Button not responding</strong> — worn contact pads, debris, or a mechanical fault underneath.</li>
              <li><strong>Incorrect button mapping</strong> — the browser or OS is reading inputs in a layout you weren't expecting.</li>
              <li><strong>Vibration not working</strong> — browser, OS, or Bluetooth restrictions on force feedback.</li>
              <li><strong>Polling rate differences</strong> — wired connections are almost always more consistent than Bluetooth.</li>
              <li><strong>Trigger issues</strong> — uneven resistance, incomplete travel, or values that never hit their max.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Troubleshooting</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>Controller not detected</strong> — Press a button or nudge a stick right after connecting — most browsers won't expose gamepad data until you interact with the device. If that doesn't help, reconnect the cable or re-pair over Bluetooth, then refresh the page.</p>
              <p><strong>USB issues</strong> — Try a different cable or a different port. Some cables only carry power, and a power-only cable will keep your controller from being detected at all.</p>
              <p><strong>Bluetooth issues</strong> — Get closer to reduce interference, re-pair through your OS's Bluetooth settings, and close any nearby Bluetooth devices that might be competing for the connection.</p>
              <p><strong>Button not responding</strong> — Clean around the button with compressed air, then test it again in the tester. Still nothing? The contact pad or membrane underneath is probably worn out.</p>
              <p><strong>Incorrect button mapping</strong> — Switch browsers first — different Gamepad API implementations can map buttons slightly differently. If the mapping's still off after that, check whether a firmware update is available.</p>
              <p><strong>Vibration not working</strong> — Test over a wired USB connection before blaming the controller. Plenty of Bluetooth connections and browsers limit or disable vibration entirely.</p>
              <p><strong>Polling rate differences</strong> — Compare the same controller on USB versus Bluetooth. A lower Bluetooth reading is expected here, not necessarily a problem.</p>
              <p><strong>Trigger issues</strong> — Slowly push the trigger through its full range while you watch the value. A smooth line is what you want — jumps or gaps usually point to something mechanical going on inside the trigger.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Common Use Cases</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li><strong>Buying a used controller</strong> — confirm every stick, button, and trigger works before you hand over money.</li>
              <li><strong>Selling a controller</strong> — show a potential buyer that it passes a full gamepad test.</li>
              <li><strong>Testing after a repair</strong> — check that a stick swap, cleaning job, or soldering fix actually worked.</li>
              <li><strong>Checking a brand-new controller</strong> — catch a factory defect while you can still return or exchange it.</li>
              <li><strong>Competitive gaming</strong> — compare polling rate and responsiveness across controllers or connection types.</li>
              <li><strong>Emulator testing</strong> — make sure a controller is recognized and mapped correctly before setting it up in emulator software.</li>
              <li><strong>Latency comparison</strong> — line up wired versus Bluetooth performance using the polling rate test.</li>
              <li><strong>Diagnosing stick drift</strong> — figure out whether unwanted movement is coming from one stick, one axis, or both.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Privacy</h2>
            <p>Every test runs locally, inside your own browser session. Button presses, stick positions, trigger values, and vibration checks all come straight from your operating system through the Gamepad API and get displayed right there on the page — none of it is uploaded, stored, or sent to any server. Close the tab, and nothing about that session sticks around.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Device Compatibility</h2>
            <p>Because the tester is just a web page, it works across most desktop and mobile operating systems, as long as your browser and OS both support the Gamepad API for your connection type:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Windows</strong> — solid support over USB and Bluetooth in Chrome, Edge, and Firefox.</li>
              <li><strong>macOS</strong> — generally works well in Chrome and Edge; Safari is more limited for vibration and some of the finer controller data.</li>
              <li><strong>Linux</strong> — works in Chrome and Firefox, though how well Bluetooth controllers behave can depend on your distro's drivers.</li>
              <li><strong>Android</strong> — Chrome supports USB-OTG and Bluetooth controllers, though results vary a bit by device and controller model.</li>
              <li><strong>ChromeOS</strong> — reliable overall, since ChromeOS is Chromium-based and the Gamepad API is well established there.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
            <div className="space-y-3 divide-y divide-border">
              <div className="pt-2">
                <p className="font-semibold text-foreground">Why isn't my controller detected?</p>
                <p className="text-muted-foreground text-sm mt-1">Most browsers only expose controller data after you've interacted with it. Press a button, reconnect it, or refresh the page and try again.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Can this detect stick drift?</p>
                <p className="text-muted-foreground text-sm mt-1">Yes. Leave the controller untouched and watch the stick's values — any movement without input means drift.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Does this work with Bluetooth controllers?</p>
                <p className="text-muted-foreground text-sm mt-1">It does, as long as your operating system and browser both recognize the controller over Bluetooth.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Is my data uploaded anywhere?</p>
                <p className="text-muted-foreground text-sm mt-1">No. Everything's processed locally in your browser and never leaves your device.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Can I test adaptive triggers?</p>
                <p className="text-muted-foreground text-sm mt-1">The Gamepad API can read trigger position, but it generally has no way to control or report on adaptive trigger resistance itself.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Why doesn't vibration work on my controller?</p>
                <p className="text-muted-foreground text-sm mt-1">Some browsers, operating systems, and Bluetooth connections restrict vibration. A wired connection tends to be the most reliable option.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Can I test more than one controller at a time?</p>
                <p className="text-muted-foreground text-sm mt-1">Most browsers can report input from several connected controllers, though this tester is designed around focusing on one at a time so the results stay easy to read.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Can I test a PS5 DualSense or DualSense Edge?</p>
                <p className="text-muted-foreground text-sm mt-1">Yes — both connect over USB or Bluetooth and are picked up through the standard Gamepad API.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Can I test Xbox Elite controllers?</p>
                <p className="text-muted-foreground text-sm mt-1">Yes, they're read the same way as a standard Xbox controller through the Gamepad API, though the extra paddle buttons can map a little differently depending on the browser.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Does it work on Linux?</p>
                <p className="text-muted-foreground text-sm mt-1">Yes, in Chrome and Firefox — just keep in mind Bluetooth pairing reliability can vary by distro and driver setup.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Can I test Nintendo Switch controllers?</p>
                <p className="text-muted-foreground text-sm mt-1">The Pro Controller and Joy-Cons both work, provided your computer recognizes them as a standard gamepad.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">How accurate is the polling rate reading?</p>
                <p className="text-muted-foreground text-sm mt-1">It reflects the controller's reporting frequency on your specific browser and connection, so it's useful for comparisons but isn't a certified lab measurement.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">How accurate is the tester overall?</p>
                <p className="text-muted-foreground text-sm mt-1">It reads the same raw values your browser and OS expose through the Gamepad API, so its accuracy really comes down to that underlying implementation rather than anything independent this tool is doing on its own.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Does it support generic USB controllers?</p>
                <p className="text-muted-foreground text-sm mt-1">Yes — most generic USB gamepads your OS already recognizes will show up automatically.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Does it work on mobile?</p>
                <p className="text-muted-foreground text-sm mt-1">On Android, Chrome supports USB and Bluetooth controllers. iOS is more limited, and results depend on the browser and controller involved.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Can I use this to check a used controller before buying it?</p>
                <p className="text-muted-foreground text-sm mt-1">Definitely, and it's one of the more common reasons people end up here — it takes under a minute to confirm sticks, buttons, and triggers are all working before you commit to a purchase.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Why do wired and Bluetooth polling rates look so different?</p>
                <p className="text-muted-foreground text-sm mt-1">Wired connections typically report more often and more consistently than Bluetooth. That gap is normal, not a sign something's broken.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Can this replace a proper repair diagnosis?</p>
                <p className="text-muted-foreground text-sm mt-1">It's a great first step for spotting drift, dead buttons, or trigger trouble, but a technician may still need to confirm exactly what's wrong inside the controller.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Does the tester keep a history of past sessions?</p>
                <p className="text-muted-foreground text-sm mt-1">No. Each session stands on its own — nothing from a previous test or controller is saved anywhere.</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">A button works here but not in my game — what's going on?</p>
                <p className="text-muted-foreground text-sm mt-1">Check the game's own control settings and button mapping. If the tester sees the input, your browser's reading it fine — the game itself just may not be interpreting it the way you'd expect.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Why Use This Gamepad Tester?</h2>
            <p>
              Unlike a basic connection checker, this tool shows you live controller data that can point to a real hardware issue before it ever shows up in a game.
            </p>
            <p>
              Whether you're chasing down stick drift, confirming a repair actually worked, comparing wired versus wireless performance, or just giving a new controller a once-over, you get accurate input data in seconds — no extra software required.
            </p>
          </section>
        </section>
      </div>
    </div>
  );
}
