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

  const prevButtonsRef = useRef<boolean[] | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const applyDeadzone = (value: number, threshold = 0.08) => {
    if (Math.abs(value) < threshold) return 0;
    return (value - Math.sign(value) * threshold) / (1 - threshold);
  };

  const updateGamepadState = useCallback((dtMs: number) => {
    const gamepadList = navigator.getGamepads();
    const newGamepads: GamepadState[] = [];

    for (let i = 0; i < gamepadList.length; i++) {
      const gamepad = gamepadList[i];
      if (gamepad) {
        const currentButtons = gamepad.buttons.map(button => button.pressed);
        const previousButtons = prevButtonsRef.current || new Array(currentButtons.length).fill(false);

        let newPresses = 0;
        for (let b = 0; b < currentButtons.length; b++) {
          if (currentButtons[b] && !previousButtons[b]) newPresses++;
        }

        if (newPresses > 0) {
          setInputStats(prev => ({
            ...prev,
            buttonPresses: prev.buttonPresses + newPresses,
            totalInputTime: prev.totalInputTime + dtMs,
          }));

          if (isLatencyTest && latencyTestStart > 0) {
            const latency = Date.now() - latencyTestStart;
            setLatencyResults(prev => [...prev, latency]);
            setIsLatencyTest(false);
            setLatencyTestStart(0);
            setInputStats(prev => ({ ...prev, averageReactionTime: (prev.averageReactionTime + latency) / 2 }));
          }
        } else {
          setInputStats(prev => ({ ...prev, totalInputTime: prev.totalInputTime + dtMs }));
        }

        let normalizedAxes = Array.from(gamepad.axes, v => applyDeadzone(v));

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

        prevButtonsRef.current = currentButtons;

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
    }

    setGamepads(newGamepads);
  }, [isLatencyTest, latencyTestStart]);

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

  const recommendedProducts = [
    {
      name: "Official Luna Wireless Controller",
      href: "https://amzn.to/42wogzI",
      imageSrc: "https://m.media-amazon.com/images/I/51qbcWzHSML._AC_SL1000_.jpg",
      alt: "Luna Wireless Controller",
    },
    {
      name: "Xbox Wireless Gaming Controller – Ice Breaker Special Edition",
      href: "https://amzn.to/3KmlSW4",
      imageSrc: "https://m.media-amazon.com/images/I/71Js3hjffrL._SL1500_.jpg",
      alt: "Xbox Wireless Gaming Controller",
    },
    {
      name: "PlayStation DualSense® Wireless Controller",
      href: "https://amzn.to/3K1XlWl",
      imageSrc: "https://m.media-amazon.com/images/I/51PmeLGEkML._SL1500_.jpg",
      alt: "PlayStation DualSense",
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>Online Gamepad Tester | Test Drift, Buttons & Sticks Free</title>
        <meta name="description" content="Test controllers online in seconds—PS4, PS5, Xbox & PC. Detect drift, verify buttons, and fix issues fast. 100% free & safe on GamepadTest." />
        <meta name="keywords" content="gamepad tester, controller tester, joystick test, gamepad checker" />
        <link rel="canonical" href="https://www.gamepadtest.tech/gamepad-tester" />
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

        {/* FAQ and Comprehensive Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Controller Testing Guide & FAQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 text-base leading-7 text-foreground">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Online Gamepad & Controller Tester – Check Your Controller Instantly</h2>
              <p>
                Controllers are at the heart of gaming. Whether you’re grinding ranked matches online or casually exploring a new open-world title, every button press matters. But controllers wear down over time. A joystick might drift, a bumper may stop responding, or a trigger could lose sensitivity. The question is, how do you know if the problem is the game or the controller itself?
              </p>
              <p>
                That’s where an online controller checker comes in. Our tool helps you test every button, joystick, and trigger in real time. You can run a quick check to confirm stick drift, verify if all inputs are registering, and get instant peace of mind—all without installing any software.
              </p>
              <p>
                Whether you’re looking for a <Link to="/gamepad-tester" className="text-primary underline">PS4 controller tester</Link>, <Link to="/gamepad-tester" className="text-primary underline">PS5 controller tester</Link>, <Link to="/gamepad-tester" className="text-primary underline">Xbox controller tester</Link>, or even a classic <Link to="/gamepad-tester" className="text-primary underline">PS3 controller</Link> test, this page is your complete guide to using our <Link to="/gamepad-tester" className="text-primary underline">gamepad tester online free</Link> tool. You’ll also learn how to troubleshoot common problems, why testing matters, and what you can do if your controller fails.
              </p>
              <div className="pt-2">
                <Button asChild className="gap-2">
                  <Link to="/gamepad-tester">👉 Start now with our Gamepad Tester</Link>
                </Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Why Use a Controller Tester Online?</h3>
              <p>
                Gaming hardware doesn’t last forever. The more hours you put in, the faster your controller shows signs of wear. Common issues include:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Stick drift – your joystick moves on its own without input.</li>
                <li>Unresponsive buttons – pressing jump or reload doesn’t always register.</li>
                <li>Weak triggers – you have to squeeze harder to shoot or accelerate.</li>
                <li>Laggy input – noticeable delays between pressing and on-screen action.</li>
              </ul>
              <p>
                Buying a new controller isn’t always the first answer. Sometimes a simple cleaning or settings adjustment can fix the problem. But before you do anything, you need to diagnose the issue.
              </p>
              <p>That’s why a controller tester online free tool helps. Instead of guessing, you can:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Detect stick drift instantly.</li>
                <li>Confirm every button press.</li>
                <li>Test bumpers, triggers, and thumbsticks.</li>
                <li>Check input lag in real time.</li>
                <li>Compare performance across devices (Windows, macOS, Linux, even browsers).</li>
              </ul>
              <p>In less than a minute, you’ll know whether your controller is fine, needs cleaning, or should be replaced.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Supported Controllers</h3>
              <p>One of the best parts of this gamepad tester is that it works with a wide range of devices. Whether you’re loyal to PlayStation, Xbox, or PC gaming, this tool supports them all.</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><Link to="/gamepad-tester" className="text-primary underline">PS4 Controller Tester</Link> – Check DualShock 4 buttons, sticks, and triggers via USB or Bluetooth.</li>
                <li><Link to="/gamepad-tester" className="text-primary underline">PS5 Controller Tester PC</Link> – Ideal for testing DualSense controllers on Windows or Mac.</li>
                <li><Link to="/gamepad-tester" className="text-primary underline">Xbox Controller Tester</Link> – Works with Xbox One and Series X|S controllers.</li>
                <li><Link to="/gamepad-tester" className="text-primary underline">Xbox 360 Controller Test</Link> – Still holding onto your 360 pad? This tester works with it too.</li>
                <li><Link to="/gamepad-tester" className="text-primary underline">PS3 Controller</Link> – Test legacy DualShock 3 controllers with ease.</li>
                <li><Link to="/gamepad-tester" className="text-primary underline">Joystick Tester Online</Link> – Supports generic USB gamepads and third-party controllers.</li>
              </ul>
              <p>Most devices don’t require extra drivers. Just plug in your controller and launch the <Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link>.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">How to Use the Online Gamepad Tester</h3>
              <p>Using the tool is simple and doesn’t require any technical know-how.</p>
              <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
                <li>Connect your controller via USB or Bluetooth.</li>
                <li>Open the tester in your browser.</li>
                <li>Press buttons, triggers, and joysticks to see instant feedback.</li>
                <li>Check joystick alignment by observing if the stick stays centered when untouched.</li>
              </ol>
              <p>If the display shows movement without your input, that’s a sign of stick drift. If certain buttons don’t light up, they might be unresponsive.</p>
              <div className="pt-2">
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/gamepad-tester">👉 Try it now with our Controller Tester Online Free</Link>
                </Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">What Is Stick Drift and Why Does It Matter?</h3>
              <p>Stick drift is one of the most frustrating issues gamers face. It happens when your joystick sends movement signals even when you’re not touching it.</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Your character slowly walks forward in a shooter.</li>
                <li>A racing car veers slightly without steering.</li>
                <li>Menus scroll endlessly on their own.</li>
              </ul>
              <h4 className="font-semibold">Causes of Stick Drift</h4>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Dust or dirt trapped under the joystick module.</li>
                <li>Natural wear of potentiometers (the sensors that track movement).</li>
                <li>Moisture or accidental pressure damage.</li>
              </ul>
              <p>Using a gamepad tester stick drift tool, you’ll see right away whether your joystick rests in the center or sends unwanted signals.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Online vs Software Testers</h3>
              <p>You may have seen downloadable controller test programs. While they work, they come with downsides: installation time, system compatibility issues, and possible security risks.</p>
              <p>An online gamepad tester avoids these issues.</p>
              <h4 className="font-semibold">Benefits of online testing:</h4>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Instant access in your browser.</li>
                <li>Works across operating systems.</li>
                <li>Free to use without sign-ups.</li>
                <li>No downloads, no risk of malware.</li>
              </ul>
              <p>For quick checks, online tools are the fastest and safest solution.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Common Controller Problems and Fixes</h3>
              <p>Testing tells you what’s wrong, but fixing it is the next step. Here are common issues and troubleshooting tips.</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Stick Drift</h4>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Clean around the joystick using compressed air.</li>
                    <li>Apply isopropyl alcohol with a cotton swab to remove dirt.</li>
                    <li>If drift persists, the analog stick may need replacement.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Unresponsive Buttons</h4>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Dust buildup often causes this. Gently clean around the button edges.</li>
                    <li>Test on another device to confirm if the button itself is failing.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Trigger Issues</h4>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Check for physical damage or looseness.</li>
                    <li>Adjust input sensitivity in game or console settings.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Connectivity Problems</h4>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Update Bluetooth or USB drivers.</li>
                    <li>Re-pair your controller with your system.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Laggy Input</h4>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Switch to a wired connection for faster response.</li>
                    <li>Close background apps that may be interfering.</li>
                  </ul>
                </div>
              </div>
              <p>The tester helps you confirm if the issue is hardware or software.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Advanced Testing: Input Lag and Calibration</h3>
              <p>Beyond simple button checks, advanced players often use a controller checker online to test for:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Input lag – the time between pressing a button and action appearing on screen.</li>
                <li>Dead zones – areas where small stick movements don’t register.</li>
                <li>Button mapping – verifying that inputs are recognized correctly.</li>
              </ul>
              <p>For competitive gamers, these small differences matter. Calibrating your controller through settings can extend its life and improve accuracy.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Other Tools on Our Website</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link> – check PlayStation, Xbox, and PC controllers.</li>
                <li><Link to="/mic-tester" className="text-primary underline">Mic Tester</Link> – verify your microphone works before calls or streams.</li>
                <li><Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> – test MIDI keyboards, drum pads, and controllers.</li>
                <li><Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> – run a gpu test online to check your graphics card performance.</li>
              </ul>
              <p>
                You can also learn more about us on the <Link to="/about" className="text-primary underline">About</Link> page, reach us through <Link to="/contact" className="text-primary underline">Contact</Link>, or find tips and guides on the <Link to="/blog" className="text-primary underline">Blog</Link>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">FAQs</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">1. Can I test my PS4 controller online?</h3>
                  <p>Yes. The <Link to="/gamepad-tester" className="text-primary underline">PS4 controller tester</Link> works directly in your browser.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">2. How do I test an Xbox controller online free?</h3>
                  <p>Connect your controller, open the <Link to="/gamepad-tester" className="text-primary underline">Xbox controller tester</Link>, and press buttons to see real-time input.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">3. Does this tool work with PS5 DualSense controllers?</h3>
                  <p>Yes. The tool functions as a <Link to="/gamepad-tester" className="text-primary underline">PS5 controller tester PC</Link>. Connect via USB or Bluetooth.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">4. Can this detect stick drift?</h3>
                  <p>Absolutely. If the joystick moves without input, the tester highlights it immediately.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">5. Is it safe to use?</h3>
                  <p>Yes. It runs entirely in your browser. No downloads or installations are required.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">6. Does it support generic gamepads?</h3>
                  <p>Yes, the <Link to="/gamepad-tester" className="text-primary underline">joystick tester online</Link> feature works with most third-party controllers.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">7. What about older models like PS3 or Xbox 360?</h3>
                  <p>The tool supports both <Link to="/gamepad-tester" className="text-primary underline">PS3 controller</Link> and <Link to="/gamepad-tester" className="text-primary underline">Xbox 360 controller test</Link>.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">8. Can I test on Mac or Linux?</h3>
                  <p>Yes. The tester is browser-based, so it works across platforms.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Final Thoughts</h2>
              <p>
                Controllers are the bridge between you and your game. Even the smallest problem—like stick drift or an unresponsive button—can ruin immersion. Instead of guessing, use a <Link to="/gamepad-tester" className="text-primary underline">controller tester online free</Link> to confirm the issue.
              </p>
              <p>
                Our <Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link> makes it easy to check every input in real time. Whether you’re troubleshooting before a tournament, setting up a new controller, or just curious about stick drift, this tool gives you quick answers.
              </p>
              <p>
                Pair it with our <Link to="/mic-tester" className="text-primary underline">Mic Tester</Link>, <Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link>, and <Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> to keep your entire setup running smoothly. With free, browser-based diagnostics, you’ll spend less time worrying about hardware and more time actually playing.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
