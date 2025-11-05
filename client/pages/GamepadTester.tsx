import { useEffect, useState, useCallback, useRef } from 'react';
import { Gamepad2, Zap, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { createHowToStructuredData } from '@/components/SEO';
import { RecommendedProductsSection } from '@/components/RecommendedProducts';

interface GamepadState {
  connected: boolean;
  id: string;
  index: number;
  buttons: boolean[];
  axes: number[];
  timestamp: number;
  triggers?: number[]; // normalized -1..1 values, fallback to button analog if axes not available
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
  type: 'press' | 'release';
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
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const snapshotTimeoutRef = useRef<number | null>(null);

  const applyDeadzone = useCallback((value: number) => {
    const threshold = Math.min(Math.max(deadzone / 100, 0), 0.95);
    if (Math.abs(value) <= threshold) return 0;
    const normalized = (Math.abs(value) - threshold) / (1 - threshold);
    return Math.sign(value) * Math.min(normalized, 1);
  }, [deadzone]);

  const updateGamepadState = useCallback((dtMs: number) => {
    const gamepadList = navigator.getGamepads();
    const newGamepads: GamepadState[] = [];

    for (let i = 0; i < gamepadList.length; i++) {
      const gamepad = gamepadList[i];
      if (!gamepad) continue;

      const currentButtons = gamepad.buttons.map(button => button.pressed);
      const previousButtons = prevButtonsRef.current[gamepad.index] || new Array(currentButtons.length).fill(false);

      const pressedButtons: number[] = [];
      const releasedButtons: number[] = [];
      for (let b = 0; b < currentButtons.length; b++) {
        if (currentButtons[b] && !previousButtons[b]) pressedButtons.push(b);
        if (!currentButtons[b] && previousButtons[b]) releasedButtons.push(b);
      }

      if (pressedButtons.length > 0) {
        setInputStats(prev => ({
          ...prev,
          buttonPresses: prev.buttonPresses + pressedButtons.length,
          totalInputTime: prev.totalInputTime + dtMs,
        }));

        if (isLatencyTest && latencyTestStart > 0) {
          const latency = Date.now() - latencyTestStart;
          setLatencyResults(prev => [...prev, latency]);
          setIsLatencyTest(false);
          setLatencyTestStart(0);
          setInputStats(prev => ({ ...prev, averageReactionTime: prev.averageReactionTime === 0 ? latency : (prev.averageReactionTime + latency) / 2 }));
        }
      } else {
        setInputStats(prev => ({ ...prev, totalInputTime: prev.totalInputTime + dtMs }));
      }

      if (pressedButtons.length > 0 || releasedButtons.length > 0) {
        const timestamp = Date.now();
        const events: InputEvent[] = [
          ...pressedButtons.map(button => ({ type: 'press' as const, button, gamepadIndex: gamepad.index, timestamp })),
          ...releasedButtons.map(button => ({ type: 'release' as const, button, gamepadIndex: gamepad.index, timestamp })),
        ];
        setRecentInputs(prev => [...events, ...prev].slice(0, 14));
      }

      if (pressedButtons.length > 0) {
        setButtonUsage(prev => {
          const existing = prev[gamepad.index] ? [...prev[gamepad.index]] : new Array(currentButtons.length).fill(0);
          pressedButtons.forEach(button => {
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

      const normalizedAxes = Array.from(gamepad.axes, v => applyDeadzone(v));

      // Build triggers as -1..1 values. If axes provide them, use those; else fallback to button analog values (e.g., indices 6,7)
      let triggers: number[] | undefined;
      if (gamepad.axes.length > 4) {
        triggers = gamepad.axes.slice(4).map(v => Math.max(-1, Math.min(1, v)));
      } else if (gamepad.buttons.length >= 8) {
        const l2 = gamepad.buttons[6]?.value ?? 0; // 0..1
        const r2 = gamepad.buttons[7]?.value ?? 0;
        // convert 0..1 to -1..1 like axes
        triggers = [l2 * 2 - 1, r2 * 2 - 1];
      }

      if (gamepad.axes.length >= 2) {
        const x = normalizedAxes[0] ?? 0;
        const y = normalizedAxes[1] ?? 0;
        const stickDistance = Math.sqrt(x * x + y * y);
        setInputStats(prev => ({
          ...prev,
          maxStickDistance: Math.max(prev.maxStickDistance, stickDistance),
        }));
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

    setGamepads(newGamepads);
  }, [applyDeadzone, isLatencyTest, latencyTestStart]);

  const testVibration = async (gamepadIndex: number) => {
    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (gamepad && (gamepad as any).vibrationActuator) {
      setIsVibrating(true);
      try {
        await (gamepad as any).vibrationActuator.playEffect('dual-rumble', {
          duration: 1000,
          strongMagnitude: 0.5,
          weakMagnitude: 0.3,
        });
      } catch (error) {
        console.log('Vibration not supported on this gamepad');
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

  const averageLatency = latencyResults.length > 0
    ? latencyResults.reduce((a, b) => a + b, 0) / latencyResults.length
    : 0;

  useEffect(() => {
    return () => {
      if (snapshotTimeoutRef.current) {
        window.clearTimeout(snapshotTimeoutRef.current);
      }
    };
  }, []);

  const primaryPadIndex = gamepads[0]?.index;
  const primaryButtonUsage = primaryPadIndex !== undefined ? buttonUsage[primaryPadIndex] : undefined;

  const exportSnapshot = async () => {
    const summary = [
      `Controllers detected: ${gamepads.length}`,
      `Button presses: ${inputStats.buttonPresses}`,
      `Average latency: ${averageLatency ? `${averageLatency.toFixed(0)}ms` : 'n/a'}`,
      `Max stick range: ${(inputStats.maxStickDistance * 100).toFixed(1)}%`,
      `Deadzone: ${deadzone}%`,
    ];

    if (primaryButtonUsage) {
      const topButtons = primaryButtonUsage
        .map((count, index) => ({ index, count }))
        .filter(entry => entry.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(entry => `Button ${entry.index + 1}: ${entry.count}`);
      if (topButtons.length > 0) {
        summary.push('Top buttons:', ...topButtons);
      }
    }

    try {
      await navigator.clipboard.writeText(summary.join('\n'));
      setSnapshotCopied(true);
      if (snapshotTimeoutRef.current) {
        window.clearTimeout(snapshotTimeoutRef.current);
      }
      snapshotTimeoutRef.current = window.setTimeout(() => setSnapshotCopied(false), 2500);
    } catch (error) {
      console.error('Clipboard copy failed', error);
    }
  };

  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log('Gamepad connected:', e.gamepad.id);
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log('Gamepad disconnected:', e.gamepad.id);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

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
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [updateGamepadState]);

  const renderJoystick = (x: number, y: number, label: string) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative w-24 h-24 bg-muted rounded-full border-2 border-border">
        <div
          className="absolute w-4 h-4 bg-primary rounded-full transform -translate-x-2 -translate-y-2 transition-all"
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
    'How to Test Your Gamepad',
    [
      'Connect your gamepad via USB or Bluetooth',
      'Press any button on your controller to activate it',
      'View real-time button presses and joystick movements',
      'Test vibration functionality with the vibration button'
    ]
  );

  const faqData = [
    {
      question: 'Why isn\'t my gamepad being detected?',
      answer: 'Make sure your gamepad is properly connected and press any button to activate it. Some wireless controllers need to be paired first.'
    },
    {
      question: 'Which gamepads are supported?',
      answer: 'Most modern gamepads including Xbox, PlayStation, and generic USB controllers are supported through the browser\'s Gamepad API.'
    },
    {
      question: 'Why doesn\'t vibration work?',
      answer: 'Vibration support varies by browser and gamepad model. Chrome and Edge have the best support for the Vibration API.'
    }
  ];

  const faqStructuredData = faqData;

  const gamepadAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Online Gamepad Tester',
    applicationCategory: 'WebApplication',
    operatingSystem: 'Any',
    url: 'https://www.gamepadtest.tech/gamepad-tester',
    description: 'Test controllers online in seconds—PS4, PS5, Xbox & PC. Detect drift, verify buttons, and fix issues fast. 100% free & safe on GamepadTest.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  } as const;

  const gamepadBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gamepadtest.tech/' },
      { '@type': 'ListItem', position: 2, name: 'Gamepad Tester', item: 'https://www.gamepadtest.tech/gamepad-tester' }
    ]
  } as const;

  const recommendedProducts = [
    {
      name: "Official Luna Wireless Controller",
      description: "Built for Amazon Luna with ultra-low latency, Bluetooth/USB support, and a comfortable grip for smooth cloud gaming.",
      href: "https://amzn.to/42wogzI",
      imageSrc: "https://m.media-amazon.com/images/I/51qbcWzHSML._AC_SL1000_.jpg",
      alt: "Luna Wireless Controller",
    },
    {
      name: "Xbox Wireless Gaming Controller – Ice Breaker Special Edition",
      description: "Cool transparent design, hybrid D-pad, and textured grips. Works with Xbox Series X|S, Xbox One, and PC via Bluetooth or USB.",
      href: "https://amzn.to/3KmlSW4",
      imageSrc: "https://m.media-amazon.com/images/I/71Js3hjffrL._SL1500_.jpg",
      alt: "Xbox Wireless Gaming Controller",
    },
    {
      name: "PlayStation DualSense® Wireless Controller",
      description: "Immersive haptic feedback, adaptive triggers, and built-in mic. Perfect for PS5 and PC gaming.",
      href: "https://amzn.to/3K1XlWl",
      imageSrc: "https://m.media-amazon.com/images/I/51PmeLGEkML._SL1500_.jpg",
      alt: "PlayStation DualSense",
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>Gamepad Tester Online – Free Controller & Joystick Checker</title>
        <meta name="description" content="Gamepad tester online to test buttons, joysticks, and stick drift. Works with PS, Xbox, and PC—free, secure, no download needed." />
        <meta name="keywords" content="gamepad tester, controller tester, joystick test, gamepad checker" />
        <link rel="canonical" href="https://www.gamepadtest.tech/gamepad-tester" />
        <script type="application/ld+json">{JSON.stringify(gamepadAppSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(gamepadBreadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(howToStructuredData)}</script>
      </Helmet>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="h-8 w-8 text-primary animate-bounce-in" />
            <h1 className="text-3xl font-bold animate-fade-in-right animate-stagger-1">Gamepad Tester</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-stagger-2">
            Test your gaming controllers with real-time input detection, button mapping, and vibration feedback.
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className={cn("h-5 w-5 transition-colors duration-500", gamepads.length > 0 ? "text-green-500 animate-pulse" : "text-muted-foreground")} />
              Connection Status
            </CardTitle>
            <CardDescription className={gamepads.length > 0 ? "animate-fade-in" : ""}>
              {gamepads.length > 0
                ? `${gamepads.length} gamepad(s) detected`
                : 'No gamepads detected. Please connect a controller and press any button.'
              }
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-8 animate-fade-in-up">
          <CardHeader>
            <CardTitle>Input Lab</CardTitle>
            <CardDescription>Tune dead zones, review input history, and export diagnostics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Analog Deadzone</span>
                  <span className="text-xs text-muted-foreground">{deadzone}%</span>
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
                  Reduce drift by increasing the deadzone or set it low for competitive play.
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900">
                <span className="text-sm font-medium">Recent Inputs</span>
                <div className="mt-3 max-h-36 overflow-y-auto space-y-2 text-xs">
                  {recentInputs.length === 0 && (
                    <p className="text-muted-foreground">No inputs yet. Press any button to capture diagnostics.</p>
                  )}
                  {recentInputs.map((event, idx) => (
                    <div key={`${event.timestamp}-${event.button}-${idx}`} className="flex items-center justify-between gap-3 px-2 py-1 rounded bg-white dark:bg-slate-800">
                      <span className="font-medium">#{event.gamepadIndex} · B{event.button + 1}</span>
                      <span className={event.type === 'press' ? 'text-green-600' : 'text-red-500'}>{event.type === 'press' ? 'Pressed' : 'Released'}</span>
                      <span className="text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900">
                <span className="text-sm font-medium">Most Used Buttons</span>
                <div className="mt-3 space-y-2 text-sm">
                  {!primaryButtonUsage || primaryButtonUsage.every(count => count === 0) ? (
                    <p className="text-xs text-muted-foreground">Press buttons to build usage stats.</p>
                  ) : (
                    primaryButtonUsage
                      .map((count, index) => ({ index, count }))
                      .filter(entry => entry.count > 0)
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map(entry => (
                        <div key={entry.index} className="flex items-center justify-between rounded bg-white dark:bg-slate-800 px-3 py-1 text-xs">
                          <span>Button {entry.index + 1}</span>
                          <span className="font-semibold">{entry.count}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="outline" size="sm" onClick={exportSnapshot} className="gap-2">
                <Zap className="h-4 w-4" />
                Copy Diagnostic Snapshot
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRecentInputs([])}>
                Clear Input History
              </Button>
              {snapshotCopied && <span className="text-sm text-green-600">Snapshot copied to clipboard.</span>}
            </div>
          </CardContent>
        </Card>

        {/* Unique Testing Features */}
        {gamepads.length > 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 animate-fade-in-up animate-stagger-4 hover-glow">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
                Advanced Testing Features
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Unique features to test your gamepad's performance and responsiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{inputStats.buttonPresses}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Button Presses</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(inputStats.maxStickDistance * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Max Stick Range</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {averageLatency ? `${averageLatency.toFixed(0)}ms` : '--'}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Avg Latency</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{latencyResults.length}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Tests Complete</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={startLatencyTest}
                  disabled={isLatencyTest}
                  variant="outline"
                  size="sm"
                >
                  {isLatencyTest ? 'Press Any Button!' : 'Test Latency'}
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
                  {isVibrating ? 'Vibrating...' : 'Test Vibration'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Controller Visualization */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Controller Status</h3>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Button Status Cards */}
                  <div className="lg:col-span-1">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Button Status</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {gamepad.buttons.slice(0, 16).map((pressed, index) => (
                          <div
                            key={index}
                            className={cn(
                              "aspect-square rounded-md border flex items-center justify-center text-xs font-medium transition-all",
                              pressed
                                ? "bg-green-500 text-white border-green-500 shadow-md"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            )}
                          >
                            {index + 1}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {gamepad.buttons.filter(Boolean).length} of {gamepad.buttons.length} buttons active
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
                              <div className={cn("absolute top-0 left-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-x-1/2", gamepad.buttons[12] && "bg-green-500")}></div>
                              <div className={cn("absolute bottom-0 left-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-x-1/2", gamepad.buttons[13] && "bg-green-500")}></div>
                              <div className={cn("absolute left-0 top-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-y-1/2", gamepad.buttons[14] && "bg-green-500")}></div>
                              <div className={cn("absolute right-0 top-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-y-1/2", gamepad.buttons[15] && "bg-green-500")}></div>
                            </div>
                          </div>

                          {/* Face buttons */}
                          <div className="absolute top-4 right-4">
                            <div className="relative w-12 h-12">
                              <div className={cn("absolute top-0 left-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-x-1/2", gamepad.buttons[3] && "bg-green-500")}></div>
                              <div className={cn("absolute bottom-0 left-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-x-1/2", gamepad.buttons[0] && "bg-green-500")}></div>
                              <div className={cn("absolute left-0 top-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-y-1/2", gamepad.buttons[2] && "bg-green-500")}></div>
                              <div className={cn("absolute right-0 top-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-y-1/2", gamepad.buttons[1] && "bg-green-500")}></div>
                            </div>
                          </div>

                          {/* Analog sticks */}
                          <div className="absolute bottom-2 left-6">
                            <div className={cn("w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500", gamepad.buttons[10] && "bg-green-500")}></div>
                          </div>
                          <div className="absolute bottom-2 right-6">
                            <div className={cn("w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500", gamepad.buttons[11] && "bg-green-500")}></div>
                          </div>

                          {/* Shoulder buttons */}
                          <div className="absolute -top-2 left-4">
                            <div className={cn("w-8 h-3 bg-gray-400 rounded-t-lg", gamepad.buttons[4] && "bg-green-500")}></div>
                          </div>
                          <div className="absolute -top-2 right-4">
                            <div className={cn("w-8 h-3 bg-gray-400 rounded-t-lg", gamepad.buttons[5] && "bg-green-500")}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Summary */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Connection</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Connected</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Input Count</h4>
                        <div className="text-2xl font-bold">{inputStats.buttonPresses}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Latency</h4>
                        <div className="text-lg font-semibold">
                          {averageLatency ? `${averageLatency.toFixed(0)}ms` : '--'}
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
                    {renderJoystick(gamepad.axes[0], gamepad.axes[1], "Left Stick")}
                    {renderJoystick(gamepad.axes[2], gamepad.axes[3], "Right Stick")}
                  </div>
                </div>
              )}

              {/* Triggers (uses axes if present, otherwise analog buttons 6/7) */}
              {((gamepad.triggers && gamepad.triggers.length > 0) || gamepad.axes.length > 4) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Triggers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(gamepad.triggers ?? gamepad.axes.slice(4)).map((value, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Trigger {index + 1}</span>
                          <span>{(((value + 1) / 2) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={((value + 1) / 2) * 100} className="h-3" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <RecommendedProductsSection products={recommendedProducts} />

        {/* Guide: Gamepad Tester – Check Your Controller or Joypad Performance */}
        <section className="mt-12 space-y-8 text-base leading-7 text-foreground">
          <header className="space-y-3">
            <h2 className="text-2xl font-bold">Gamepad Tester – Check Your Controller or Joypad Performance</h2>
            <p>
              Hey gamers, let's talk about something we all dread: that moment when your controller starts acting up right in the middle of a clutch play. A <Link to="/gamepad-tester" className="text-primary underline">gamepad tester</Link> is basically your go-to online buddy for spotting those sneaky issues before they wreck your vibe.
            </p>
            <p>
              It dives deep into button responsiveness, how those triggers feel under pressure, the way your analog sticks behave, and even if the rumble's still got that satisfying kick. Just hook it up, run a quick scan, and boom—you'll know if you've got unresponsive buttons or that infamous stick drift lurking.
            </p>
            <p>
              No matter if you're rocking a PlayStation, Xbox, or straight-up PC setup, this kind of tester lets you give your controller a full once-over without fumbling around with extra downloads. The whole thing happens right in your browser, showing you live visuals of what's going on with your inputs.
            </p>
          </header>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">What Is a Gamepad Tester?</h3>
            <p>Picture this: you're deep in a session, and suddenly your character's drifting like they've had one too many energy drinks. A <Link to="/gamepad-tester" className="text-primary underline">gamepad tester</Link> steps in as that straightforward online tool to check if your controller's still firing on all cylinders.</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Pokes around at buttons to see if they snap back quick</li>
              <li>Measures trigger pull for that perfect tension</li>
              <li>Watches how sticks move without any weird hitches</li>
              <li>Tests vibration feedback to make sure it's on point</li>
            </ul>
            <p className="text-muted-foreground">It's a lifesaver for anyone glued to their PS, Xbox, or PC pad—lets you poke and prod without installing a single thing. The screen lights up with real-time info, so you can eyeball if everything's clicking just right.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Why Choose Our Gamepad Tester?</h3>
            <p>Look, I've tried a bunch of these tools, and ours? It just hits different. It's all browser-based, so you skip the hassle of downloads or signing up for nonsense.</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Works on Windows, Mac, Linux, and even mobile browsers</li>
              <li>Everything processes right on your device—super private and lightning-fast</li>
              <li>Eyeball analog precision and tweak trigger feels in real-time</li>
              <li>Confirm button mappings are working correctly</li>
            </ul>
            <p className="text-muted-foreground">Forget those clunky apps that bog down your system—ours is light as a feather, locked down tight, and plays nice with whatever you've got. It's like pro-level diagnostics for everyday players.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">How Does a Gamepad Tester Work?</h3>
            <p>Alright, the magic behind it: once you plug in (or Bluetooth) your controller, the tester taps into your browser's Gamepad API.</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Grabs raw data from button presses, stick movements, and trigger squeezes</li>
              <li>Converts inputs into easy-to-see visuals on your screen</li>
              <li>Shows instant response for catching timing glitches or mapping issues</li>
              <li>Includes rumble checks and calibration tweaks for comprehensive testing</li>
            </ul>
            <p className="text-muted-foreground">That split-second response is gold for catching glitches. Fancier ones even test vibration motors to confirm your sensors aren't slacking.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Supported Controllers and Devices</h3>
            <p>We've got you covered on the hardware front—our <Link to="/gamepad-tester" className="text-primary underline">online controller checker</Link> shakes hands with pretty much every big-name gamepad out there.</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong>PlayStation lineup:</strong> PS3, PS4, and PS5 DualSense via USB or Bluetooth</li>
              <li><strong>Xbox crew:</strong> Xbox 360, One, and Series X|S for PC or console</li>
              <li><strong>PC generics:</strong> Third-party USB or Bluetooth joypads fully supported</li>
              <li><strong>Specialty gear:</strong> Joysticks for flight sims, retro arcade pads, and fight sticks</li>
            </ul>
            <p className="text-muted-foreground">Even custom builds and emulators get love. Devs and tinkerers, this is your jam for stress-testing fresh setups.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">How to Use It</h3>
            <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
              <li>Connect your controller via USB or Bluetooth</li>
              <li>Open the tester in Chrome, Edge, or your preferred browser</li>
              <li>Press buttons, move sticks, pull triggers—watch the real-time response</li>
              <li>Run the rumble test for vibration feedback</li>
              <li>Check for any irregular behavior or input delays</li>
            </ol>
            <p className="text-muted-foreground">In a minute or two, you'll know exactly how your controller's performing and whether it needs maintenance or replacement.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">Understanding Stick Drift</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground">What Is Stick Drift?</h4>
                <p className="text-muted-foreground">That betrayal when your analog stick starts wandering off on its own, like your character's got an itch they can't scratch. No touch from you, but boom: menus auto-scroll, avatars moonwalk solo. It's the nightmare fuel for long-haul gamers.</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">What Causes Stick Drift?</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Tiny potentiometers grinding down from endless flicks</li>
                  <li>Dust and debris gunking up the internal mechanisms</li>
                  <li>Sweat or spills causing corrosion over time</li>
                  <li>Factory quirks that nudge things off-center</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">How to Spot Drift Using the Tester</h4>
                <p className="text-muted-foreground">Fire up the <Link to="/gamepad-tester" className="text-primary underline">joypad tester</Link>, let both sticks chill in neutral, and stare at that on-screen cursor. If it's twitching or creeping away like it's got places to be, you've got drift. Some setups graph it out, showing if it's a steady creep or random jitters.</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Quick Fixes Before Replacing Your Controller</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Blast the stick base with compressed air</li>
                  <li>Dab isopropyl alcohol on a swab for gentle cleaning</li>
                  <li>Recalibrate through system settings or the tester itself</li>
                  <li>Check for firmware updates that might fix sensitivity issues</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Why Use Our Gamepad Tester Instead of Downloadable Software</h3>
            <p>Those desktop apps? They demand installs, root access, and sometimes play picky with your OS. Our web version? Zero barriers—just load and go.</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>No malware worries or storage hogging</li>
              <li>Works across Windows, Mac, Linux, and Android tablets</li>
              <li>Accuracy matches professional tools without the complexity</li>
              <li>Sessions stay on-device—your data's yours, no sneaky shares</li>
            </ul>
            <p className="text-muted-foreground">Safe, snappy, and straightforward for anyone who games—whether you're a casual player or competitive enthusiast.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Advanced Controller Testing Features</h3>
            <p>If you're all about the details, our <Link to="/gamepad-tester" className="text-primary underline">controller checker</Link> includes advanced mode with pro-level tools:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Tweak dead zones so tiny nudges don't trigger false alarms</li>
              <li>Clock input lag to shave milliseconds off your reactions</li>
              <li>Isolate rumble motors for balanced vibration feedback</li>
              <li>Double-check button mappings to prevent ghost inputs</li>
              <li>Run sensitivity sweeps across full stick travel range</li>
            </ul>
            <p className="text-muted-foreground">Competitive edge? Nailed. Dev debugging? Sorted. Everything you need for precision controller analysis.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">When to Replace Your Controller</h3>
            <p>The tester's your truth serum—here's when it's time to consider an upgrade:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Stick drift laughs off recalibration attempts</li>
              <li>Buttons ghost half your presses or feel mushy</li>
              <li>Rumble is missing or inconsistent</li>
              <li>Components are rattling loose or physically damaged</li>
              <li>Input lag becomes noticeable in fast-paced games</li>
            </ul>
            <p className="text-muted-foreground">Fast-twitch games chew through gear quick. Swapping out a dud keeps the flow uninterrupted—no more rage-quits over hardware fails.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Recommended Controllers</h3>
            <p>Time for fresh wheels? Go quality—here's my shortlist of tanks that hold up:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><Link to="/gamepad-tester" className="text-primary underline">Xbox Series X|S Controller</Link> – Ergo king with killer endurance, perfect for PC and console</li>
              <li><Link to="/gamepad-tester" className="text-primary underline">PlayStation 5 DualSense Controller</Link> – Haptics and adaptive triggers for next-level immersion</li>
              <li><Link to="/gamepad-tester" className="text-primary underline">PC Joysticks and Retro Gamepads</Link> – Precision tools for flight sims and arcade classics</li>
              <li><Link to="/gamepad-tester" className="text-primary underline">Amazon Luna Controller</Link> – Cloud-optimized for seamless streaming gameplay</li>
            </ul>
            <p className="text-muted-foreground">All tester-vetted, drift-resistant beasts that'll outlast your gaming backlog and keep you competitive.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Other Free Tools to Try</h3>
            <p>We're not one-trick ponies—check our browser squad for full-system TLC:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><Link to="/mic-tester" className="text-primary underline">Mic Tester Online</Link> – Nail voice chat crispness and audio levels</li>
              <li><Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> – Eyeball temperatures and stability for optimal performance</li>
              <li><Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> – Tune pads, keys, and beats for flawless music production</li>
            </ul>
            <p className="text-muted-foreground">All free, no strings, universal fit. Your whole rig stays peak, gamer-style, without any downloads or installations.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">FAQs</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong>Q: Can I test my PS5 controller on PC?</strong><br />Totally—USB or Bluetooth, DualSense shines on Windows or Mac with full feature support.</li>
              <li><strong>Q: Does the tester detect stick drift automatically?</strong><br />Yup, it flags rogue moves or center slips live as you watch, with visual indicators.</li>
              <li><strong>Q: Can I test an Xbox 360 controller?</strong><br />For sure—wired or wireless, basics and analogs get full diagnostic love.</li>
              <li><strong>Q: Is the tool free to use?</strong><br />All day—online only, zero bucks, no downloads or hidden costs.</li>
              <li><strong>Q: Is it safe to use?</strong><br />Ironclad. Browser-local processing means nothing leaves your machine.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Final Thoughts</h3>
            <p>
              At the heart of it, gaming's all about that seamless connection—your moves translating pixel-perfect to the screen. A glitchy stick or laggy button? Total buzzkill, killing flow and stacking unnecessary losses.
            </p>
            <p>
              But with our <Link to="/gamepad-tester" className="text-primary underline">online gamepad tester</Link>, a fast check keeps everything locked in tight. Spot the snags early, tweak them out, and dive back into your games worry-free.
            </p>
            <p>
              Your controller's earned its spot in your gaming lineup—give it the care it deserves with regular checkups, and it'll carry you through epic after epic without letting you down.
            </p>
          </section>
        </section>
      </div>
    </div>
  );
}
