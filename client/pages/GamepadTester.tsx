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
    prevButtonsRef.current = null;
  };

  const averageLatency = latencyResults.length > 0
    ? latencyResults.reduce((a, b) => a + b, 0) / latencyResults.length
    : 0;

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
        <title>Gamepad Tester – Free Online Controller & Joystick Test</title>
        <meta name="description" content="Test PS4, PS5, Xbox & PC controllers online with GamepadTest. Detect stick drift and check buttons, triggers, and joysticks in seconds." />
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

        {/* Guide: Gamepad Tester – The Complete Guide */}
        <section className="mt-12 space-y-8 text-base leading-7 text-foreground">
          <header className="space-y-3">
            <h2 className="text-2xl font-bold">Gamepad Tester – The Complete Guide to Checking Your Controller Online</h2>
            <p>
              Gaming feels effortless when your controller works perfectly. When something is off — drifting joystick, sticky button, or unresponsive trigger — a gamepad tester becomes essential.
            </p>
            <p>
              Our tool lets you run a <Link to="/gamepad-tester" className="text-primary underline">controller tester online free</Link> in seconds. You’ll see real-time feedback for every button, trigger, and stick. This guide explains how to use the tester, fix common issues, and choose a replacement if needed.
            </p>
          </header>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Why You Should Test Your Gamepad</h3>
            <p>Controllers slowly degrade with use. Small issues can hurt aim, timing, and reaction speed.</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Detect stick drift early</li>
              <li>Confirm every input (buttons, triggers, bumpers)</li>
              <li>Catch dead zones that affect aiming</li>
              <li>Avoid wasted money by identifying simple calibration/cleaning fixes</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">What Makes This Tool Different</h3>
            <p>This is a browser-based gamepad tester — no downloads or sign-ups.</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Windows</li>
              <li>macOS</li>
              <li>Linux</li>
              <li>Mobile browsers (for Bluetooth controllers)</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Supported Controllers</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><Link to="/gamepad-tester" className="text-primary underline">PS4 Controller Tester</Link> – DualShock 4 via USB or Bluetooth</li>
              <li><Link to="/gamepad-tester" className="text-primary underline">PS5 Controller Tester PC</Link> – DualSense on Windows or Mac</li>
              <li><Link to="/gamepad-tester" className="text-primary underline">Xbox Controller Tester</Link> – Xbox One and Series X|S</li>
              <li><Link to="/gamepad-tester" className="text-primary underline">Xbox 360 Controller Test</Link> – Wired and wireless 360</li>
              <li><Link to="/gamepad-tester" className="text-primary underline">PS3 Controller</Link> – Legacy DualShock 3</li>
              <li><Link to="/gamepad-tester" className="text-primary underline">Generic Joypad Tester</Link> – Third‑party and budget pads</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">How to Use the Online Gamepad Test</h3>
            <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
              <li>Connect your controller via USB or Bluetooth.</li>
              <li>Open the <Link to="/gamepad-tester" className="text-primary underline">gamepad tester</Link>.</li>
              <li>Press buttons, move sticks, and pull triggers to see instant feedback.</li>
              <li>Check if sticks rest centered. Movement without input indicates stick drift.</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Understanding Stick Drift</h3>
            <p>Stick drift makes your character/camera move without input.</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Characters walk slowly</li>
              <li>Cars veer left or right</li>
              <li>Menus scroll on their own</li>
            </ul>
            <p className="text-muted-foreground">Common causes: dust/debris, worn potentiometers, physical/moisture damage.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">Troubleshooting Common Controller Problems</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-3 border">Problem</th>
                    <th className="p-3 border">What to Try</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border font-medium">Stick Drift</td>
                    <td className="p-3 border">Clean with compressed air, gently rotate sticks; isopropyl alcohol on cotton swab.</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-medium">Unresponsive Buttons</td>
                    <td className="p-3 border">Test on another device; clean contacts; may require internal repair.</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-medium">Trigger Issues</td>
                    <td className="p-3 border">Check for cracks/loose springs; update firmware if available.</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-medium">Laggy Input</td>
                    <td className="p-3 border">Use wired connection; reduce wireless interference; close background apps.</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-medium">Connection Drops</td>
                    <td className="p-3 border">Re‑pair controller; update USB/Bluetooth drivers.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Best Controllers to Buy</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Precise sticks with minimal dead zones</li>
              <li>Responsive triggers with good resistance</li>
              <li>Comfortable ergonomics for long sessions</li>
              <li>Low latency for competitive play</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Recommended Picks</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><Link to="/gamepad-tester" className="text-primary underline">Buy Xbox Controller</Link> – Official Series X|S for PC/console</li>
              <li><Link to="/gamepad-tester" className="text-primary underline">Buy PlayStation Controller PS5</Link> ��� DualSense for PS5/PC</li>
              <li><Link to="/gamepad-tester" className="text-primary underline">Buy Joystick for PC</Link> – Great for flight/retro games</li>
              <li><Link to="/gamepad-tester" className="text-primary underline">Buy Amazon Luna Controller</Link> – Cloud‑gaming ready</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Online vs Software Testers</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Instant access, no downloads</li>
              <li>Works across operating systems</li>
              <li>No storage space required</li>
              <li>Lower risk than installing unknown software</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Advanced Controller Testing</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Dead zones – verify small movements are detected</li>
              <li>Input lag – observe response speed</li>
              <li>Button mapping – confirm each input matches its action</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Other Tools You Can Try</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><Link to="/mic-tester" className="text-primary underline">Mic Tester</Link> – Check your microphone</li>
              <li><Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> – Test graphics card online</li>
              <li><Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> – Test MIDI keyboards/drum pads</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">FAQs</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Mac support? Yes — Safari/Chrome and most modern browsers.</li>
              <li>PS3 support? Yes — legacy controllers are supported.</li>
              <li>Stick drift detection? Yes — visible immediately during testing.</li>
              <li>Is it safe? Yes — runs entirely in your browser.</li>
              <li>Multiple controllers? Yes — reconnect and refresh.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Final Thoughts</h3>
            <p>
              Your controller is your link to the game world. Use our <Link to="/gamepad-tester" className="text-primary underline">controller tester online free</Link> for quick clarity — decide whether to clean, recalibrate, or replace.
            </p>
            <p>
              If it’s time for a new one, you can buy a gamepad for PC or grab an Xbox/PlayStation controller from the links on this page.
            </p>
          </section>
        </section>
      </div>
    </div>
  );
}
