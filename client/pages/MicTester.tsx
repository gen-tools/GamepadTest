import { useEffect, useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Activity, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { RecommendedProductsSection } from '@/components/RecommendedProducts';
import type { RecommendedProductItem } from '@/components/RecommendedProducts';

interface AudioStats {
  level: number;
  peak: number;
  noiseFloor: number;
  signalToNoise: number;
  frequency: number;
}

export default function MicTester() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStats, setAudioStats] = useState<AudioStats>({
    level: 0,
    peak: 0,
    noiseFloor: 0,
    signalToNoise: 0,
    frequency: 0
  });
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [sensitivity, setSensitivity] = useState([50]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ambientNoise, setAmbientNoise] = useState<number | null>(null);
  const [calibrationStatus, setCalibrationStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [peakHold, setPeakHold] = useState(0);
  const [levelHistory, setLevelHistory] = useState<number[]>([]);
  const [speechDetected, setSpeechDetected] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  // Recommended products for Mic Tester page (edit these items as needed)
  const micProducts: RecommendedProductItem[] = [
    {
      name: "Logitech for Creators Blue Microphones Yeti USB Microphone (Blackout)",
      description: "Studio-quality sound with multiple pickup patterns, perfect for streaming, podcasts, and voiceovers.",
      href: "https://amzn.to/46sl4Xn",
      imageSrc: "https://m.media-amazon.com/images/I/61KTMvS5JBL._AC_SL1500_.jpg",
      alt: "Blue Yeti USB Microphone"
    },
    {
      name: "HyperX SoloCast – USB Condenser Gaming Microphone, for PC, PS4, PS5 and Mac",
      description: "Compact, plug-and-play mic with tap-to-mute and crisp sound for gaming, meetings, and streaming.",
      href: "https://amzn.to/3IncdOu",
      imageSrc: "https://m.media-amazon.com/images/I/71HnM5DFBBL._AC_SL1500_.jpg",
      alt: "HyperX SoloCast – USB Condenser Gaming Microphone"
    },
    {
      name: "Shure SM58 Pro Dynamic Microphone with 25-Foot XLR Cable",
      description: "Legendary vocal mic with built-in pop filter and XLR cable, ideal for live performance and recording.",
      href: "https://www.amazon.com/dp/B07QR6Z1JB",
      imageSrc: "https://m.media-amazon.com/images/I/616y7aDplTL._AC_SL1500_.jpg",
      alt: "Shure SM58 Pro Dynamic Microphone "
    }
  ];
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const calibrationRef = useRef<{ active: boolean; sum: number; samples: number; start: number }>({
    active: false,
    sum: 0,
    samples: 0,
    start: 0
  });
  const summaryTimeoutRef = useRef<number | null>(null);

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setDevices(audioInputs);
      if (audioInputs.length > 0) {
        const stillExists = audioInputs.some(d => d.deviceId === selectedDevice);
        if (!selectedDevice || !stillExists) {
          setSelectedDevice(audioInputs[0].deviceId);
        }
      }
    } catch (err) {
      setError('Unable to enumerate audio devices');
    }
  }, [selectedDevice]);

  useEffect(() => {
    getDevices();

    // Request permissions and refresh device list
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        getDevices();
      })
      .catch(() => {
        setError('Microphone access denied. Please allow microphone access to test your audio input.');
      });

    const handleDeviceChange = () => {
      getDevices();
    };
    if (navigator.mediaDevices && 'addEventListener' in navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    }
    return () => {
      if (navigator.mediaDevices && 'removeEventListener' in navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      }
    };
  }, [getDevices]);

  useEffect(() => {
    return () => {
      if (summaryTimeoutRef.current) {
        window.clearTimeout(summaryTimeoutRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      setSummaryCopied(false);
      setSpeechDetected(false);
      setPeakHold(0);
      setLevelHistory([]);
      setCalibrationStatus(ambientNoise !== null ? 'complete' : 'idle');
      calibrationRef.current = { active: false, sum: 0, samples: 0, start: 0 };

      const constraints = {
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);

      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioContext = audioContextRef.current;
      
      // Create analyser
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.3;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // Connect source to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      setIsRecording(true);
      analyzeAudio();
      
    } catch (err: any) {
      setError(`Failed to access microphone: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    calibrationRef.current = { active: false, sum: 0, samples: 0, start: 0 };
    setIsRecording(false);
    setCalibrationStatus(ambientNoise !== null ? 'complete' : 'idle');
    setSpeechDetected(false);
    setLevelHistory([]);
    setPeakHold(0);
    if (summaryTimeoutRef.current) {
      window.clearTimeout(summaryTimeoutRef.current);
      summaryTimeoutRef.current = null;
    }
    setSummaryCopied(false);
    setAudioStats({
      level: 0,
      peak: 0,
      noiseFloor: 0,
      signalToNoise: 0,
      frequency: 0
    });
  };

  const startCalibration = () => {
    setAmbientNoise(null);
    calibrationRef.current = {
      active: true,
      sum: 0,
      samples: 0,
      start: performance.now()
    };
    setCalibrationStatus('running');
    setSummaryCopied(false);
  };

  const resetPeakHold = () => {
    setPeakHold(0);
  };

  const copyQualitySummary = async () => {
    const summaryLines = [
      `Current level: ${Math.round(audioStats.level)}%`,
      `Peak hold: ${Math.round(peakHold)}%`,
      `Noise floor: ${audioStats.noiseFloor.toFixed(1)}%`,
      `Signal-to-noise: ${audioStats.signalToNoise.toFixed(1)} dB`,
      ambientNoise !== null ? `Ambient baseline: ${ambientNoise.toFixed(1)}%` : 'Ambient baseline: not calibrated',
      `Speech detected: ${speechDetected ? 'Yes' : 'No'}`
    ];

    try {
      await navigator.clipboard.writeText(summaryLines.join('\n'));
      setSummaryCopied(true);
      if (summaryTimeoutRef.current) {
        window.clearTimeout(summaryTimeoutRef.current);
      }
      summaryTimeoutRef.current = window.setTimeout(() => setSummaryCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy session summary', err);
    }
  };

  const analyzeAudio = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const bufferLength = analyser.frequencyBinCount;

    (analyser as any).getByteFrequencyData(dataArray as any);

    // Calculate RMS level
    let sum = 0;
    let peak = 0;
    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255;
      sum += value * value;
      peak = Math.max(peak, value);
    }
    const rms = Math.sqrt(sum / bufferLength);
    const level = rms * 100 * (sensitivity[0] / 50);

    // Find dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 1; i < bufferLength / 2; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }
    const frequency = (maxIndex * (audioContextRef.current?.sampleRate || 44100)) / (2 * bufferLength);

    // Estimate noise floor (average of lower frequencies)
    let noiseSum = 0;
    const noiseRange = Math.min(50, bufferLength / 4);
    for (let i = 1; i < noiseRange; i++) {
      noiseSum += dataArray[i];
    }
    const noiseFloor = (noiseSum / noiseRange) / 255 * 100;

    // Calculate signal-to-noise ratio
    const signalToNoise = level > 0 && noiseFloor > 0 ? 20 * Math.log10(level / noiseFloor) : 0;

    if (calibrationRef.current.active) {
      calibrationRef.current.sum += noiseFloor;
      calibrationRef.current.samples += 1;
      if (performance.now() - calibrationRef.current.start >= 2000) {
        const baseline = calibrationRef.current.sum / Math.max(calibrationRef.current.samples, 1);
        setAmbientNoise(Number(baseline.toFixed(1)));
        setCalibrationStatus('complete');
        calibrationRef.current = { active: false, sum: 0, samples: 0, start: 0 };
      } else {
        setCalibrationStatus('running');
      }
    }

    setPeakHold(prev => Math.max(prev, peak * 100));
    setLevelHistory(prev => {
      const next = [...prev.slice(-119), Math.min(100, level)];
      return next;
    });

    const speechThreshold = ambientNoise !== null ? ambientNoise + 8 : 25;
    setSpeechDetected(level > speechThreshold);

    setAudioStats({
      level: Math.min(level, 100),
      peak: peak * 100,
      noiseFloor,
      signalToNoise: Math.max(0, signalToNoise),
      frequency: maxValue > 50 ? frequency : 0
    });

    drawVisualization(dataArray);
    animationRef.current = requestAnimationFrame(analyzeAudio);
  };

  const drawVisualization = (dataArray: Uint8Array) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgb(15, 15, 15)';
    ctx.fillRect(0, 0, width, height);

    // Draw frequency bars
    const barWidth = width / dataArray.length * 2;
    let x = 0;

    for (let i = 0; i < dataArray.length / 2; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.8;
      
      const hue = (i / (dataArray.length / 2)) * 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }

    // Draw level indicator
    const levelHeight = (audioStats.level / 100) * height;
    ctx.fillStyle = audioStats.level > 80 ? '#ef4444' : audioStats.level > 50 ? '#f59e0b' : '#10b981';
    ctx.fillRect(width - 20, height - levelHeight, 15, levelHeight);
  };

  const playTestTone = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);

    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 1000);
  };

  const getLevelColor = (level: number) => {
    if (level < 20) return 'bg-gray-400';
    if (level < 40) return 'bg-green-500';
    if (level < 70) return 'bg-yellow-500';
    if (level < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getQualityRating = () => {
    if (audioStats.signalToNoise > 40) return { rating: 'Excellent', color: 'text-green-600' };
    if (audioStats.signalToNoise > 30) return { rating: 'Good', color: 'text-blue-600' };
    if (audioStats.signalToNoise > 20) return { rating: 'Fair', color: 'text-yellow-600' };
    return { rating: 'Poor', color: 'text-red-600' };
  };

  const micAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Online Mic Tester',
    applicationCategory: 'WebApplication',
    operatingSystem: 'Any',
    url: 'https://www.gamepadtest.tech/mic-tester',
    description: 'Instantly test your mic online—free & secure. Check sound levels in seconds and fix mic issues fast.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  } as const;

  const micBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gamepadtest.tech/' },
      { '@type': 'ListItem', position: 2, name: 'Mic Tester', item: 'https://www.gamepadtest.tech/mic-tester' }
    ]
  } as const;

  const micFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'How to test my microphone online?', acceptedAnswer: { '@type': 'Answer', text: 'Open the mic tester, allow mic permission, and speak. If the level bar moves, your mic works.' }},
      { '@type': 'Question', name: 'How to test microphone on Windows 10?', acceptedAnswer: { '@type': 'Answer', text: 'Use Sound settings to monitor input, or run our mic tester online for quick verification.' }},
      { '@type': 'Question', name: 'Why is my microphone not working?', acceptedAnswer: { '@type': 'Answer', text: 'Check mute switches, input selection, drivers, permissions, and cables.' }},
      { '@type': 'Question', name: 'Best online microphone test?', acceptedAnswer: { '@type': 'Answer', text: 'Our browser-based tester is fast, secure, and requires no downloads.' }}
    ]
  } as const;

  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>Free Mic Test Online – Test & Troubleshoot Your Microphone</title>
        <meta name="description" content="Test your microphone online for free. Our mic tester lets you check sound input, troubleshoot issues, and quickly fix common mic problems." />
        <meta name="keywords" content="microphone tester, mic test, audio input test, microphone quality test, mic level test, audio analyzer, microphone sensitivity test" />
        <link rel="canonical" href="https://www.gamepadtest.tech/mic-tester" />
        <script type="application/ld+json">{JSON.stringify(micAppSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(micBreadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(micFAQ)}</script>
      </Helmet>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mic className="h-8 w-8 text-red-600 animate-bounce-in" />
            <h1 className="text-3xl font-bold animate-fade-in-right animate-stagger-1">Microphone Tester</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-stagger-2">
            Test your microphone with real-time audio visualization, level monitoring, and quality analysis.
          </p>
        </div>

        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 animate-fade-in-up animate-stagger-3">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
              <CardDescription className="text-red-700">{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Device Selection */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-3">
          <CardHeader>
            <CardTitle>Microphone Selection</CardTitle>
            <CardDescription>Choose your microphone device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <select 
                value={selectedDevice} 
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={isRecording}
              >
                {devices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className="gap-2"
                  variant={isRecording ? "destructive" : "default"}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      Stop Testing
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Start Testing
                    </>
                  )}
                </Button>

                <Button 
                  onClick={playTestTone}
                  disabled={isPlaying}
                  variant="outline"
                  className="gap-2"
                >
                  {isPlaying ? (
                    <>
                      <VolumeX className="h-4 w-4" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Test Speaker
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio Visualization */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4 hover-glow">
          <CardHeader>
            <CardTitle>Audio Visualization</CardTitle>
            <CardDescription>Real-time frequency spectrum and level meters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Activity className="h-4 w-4 text-primary" />
                  Live Monitoring
                </div>
                <Badge variant={speechDetected ? "default" : "outline"} className={speechDetected ? "bg-emerald-600 text-white border-transparent" : ""}>
                  {speechDetected ? 'Speech Detected' : 'Listening'}
                </Badge>
              </div>
              <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full border rounded-lg bg-gray-900"
                style={{ maxWidth: '100%', height: '200px' }}
              />

              <div className="rounded-lg p-4 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Input Level</span>
                  <span className="text-sm text-muted-foreground">{Math.round(audioStats.level)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-4 relative overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${getLevelColor(audioStats.level)}`}
                    style={{ width: `${Math.min(audioStats.level, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4 text-[10px] text-muted-foreground">
                    {[25, 50, 75].map((threshold) => (
                      <span key={threshold}>{threshold}%</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sensitivity: {sensitivity[0]}%</label>
                <Slider
                  value={sensitivity}
                  onValueChange={setSensitivity}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg border p-3 bg-background">
                  <div className="text-muted-foreground">Ambient Baseline</div>
                  <div className="text-lg font-semibold">{ambientNoise !== null ? `${ambientNoise.toFixed(1)}%` : 'Not calibrated'}</div>
                </div>
                <div className="rounded-lg border p-3 bg-background">
                  <div className="text-muted-foreground">Peak Hold</div>
                  <div className="text-lg font-semibold">{Math.round(peakHold)}%</div>
                </div>
                <div className="rounded-lg border p-3 bg-background">
                  <div className="text-muted-foreground">Signal-to-Noise</div>
                  <div className="text-lg font-semibold">{audioStats.signalToNoise.toFixed(1)} dB</div>
                </div>
                <div className="rounded-lg border p-3 bg-background">
                  <div className="text-muted-foreground">Sensitivity</div>
                  <div className="text-lg font-semibold">{sensitivity[0]}%</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Level History (last 120 samples)</div>
                <div className="flex items-end gap-[3px] h-16 rounded-md bg-muted/50 px-2 pb-2">
                  {levelHistory.length === 0 ? (
                    <div className="text-xs text-muted-foreground self-center">No history yet</div>
                  ) : (
                    levelHistory.slice(-60).map((value, index) => (
                      <div
                        key={index}
                        className="w-[3px] bg-primary/40 rounded-sm"
                        style={{ height: `${Math.min(100, value)}%` }}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={startCalibration}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  disabled={!isRecording}
                >
                  <Activity className="h-4 w-4" />
                  {calibrationStatus === 'running' ? 'Calibrating…' : 'Start Calibration'}
                </Button>
                <Button onClick={resetPeakHold} size="sm" variant="ghost" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset Peak Hold
                </Button>
                <Button
                  onClick={copyQualitySummary}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  disabled={!isRecording && levelHistory.length === 0}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Copy Quality Summary
                </Button>
              </div>

              {calibrationStatus === 'running' && (
                <p className="text-xs text-amber-600">
                  Hold quiet for two seconds to capture your ambient noise baseline.
                </p>
              )}

              {summaryCopied && (
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <ClipboardCheck className="h-4 w-4" />
                  Quality summary copied.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Audio Statistics */}
        {isRecording && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Audio Analysis</CardTitle>
              <CardDescription>Real-time microphone performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(audioStats.level)}%
                  </div>
                  <div className="text-sm text-blue-700">Current Level</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(audioStats.peak)}%
                  </div>
                  <div className="text-sm text-green-700">Peak Level</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {audioStats.signalToNoise.toFixed(1)}dB
                  </div>
                  <div className="text-sm text-purple-700">Signal/Noise</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {audioStats.frequency > 0 ? `${Math.round(audioStats.frequency)}Hz` : '--'}
                  </div>
                  <div className="text-sm text-orange-700">Dominant Freq</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Microphone Quality:</span>
                  <Badge className={getQualityRating().color}>
                    {getQualityRating().rating}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {audioStats.level < 10 && "Speak louder or move closer to the microphone."}
                  {audioStats.level >= 10 && audioStats.level < 90 && "Good audio levels detected."}
                  {audioStats.level >= 90 && "Audio level is too high. Move away from microphone or reduce input gain."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <RecommendedProductsSection title="Recommended Products" products={micProducts} />
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test Your Microphone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Testing Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Select your microphone from the dropdown</li>
                  <li>Click "Start Testing" and allow microphone access</li>
                  <li>Speak normally into your microphone</li>
                  <li>Watch the visualization and level meters</li>
                  <li>Adjust sensitivity if needed</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Quality Indicators:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Green levels (20-70%) indicate good audio</li>
                  <li>Signal-to-noise ratio above 30dB is excellent</li>
                  <li>Consistent frequency response is important</li>
                  <li>Avoid red zone (90%+) to prevent clipping</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mic Tester: New SEO content */}
        {/* Mic Tester: The Complete Guide to Checking Your Microphone Online */}
        <article className="mt-10 space-y-10 text-base leading-7">
          <section className="space-y-3" id="mic-tester-complete-guide">
            <h2 className="text-2xl font-bold">Mic Tester – Free Online Microphone Checker</h2>
            <p>
              When your mic starts glitching out right in the middle of a meeting, a heated game session, or a recording take, it's not just frustrating—it's a total buzzkill. That's why having a solid mic tester at your fingertips can be a game-changer.
            </p>
            <p>
              It lets you double-check that your voice comes through crystal clear, your headset's hooked up right, and your audio input is firing on all cylinders. The real beauty? You don't have to mess with downloads. A quick <Link to="/mic-tester" className="text-primary underline">mic test online</Link> handles everything straight from your browser.
            </p>
          </section>

          <section className="space-y-3" id="why-you-need-mic-tester">
            <h3 className="text-xl font-semibold">Why You Need a Mic Tester</h3>
            <p>
              Your microphone is essentially your direct line to whoever's on the other end—be it colleagues on a video call, squad mates in a match, or fans tuning into your content. But mics are finicky little things. Even minor glitches like static noise, low volume, sudden dropouts, or headset mic failing to pick up can throw everything off.
            </p>
            <p>
              An <Link to="/mic-tester" className="text-primary underline">online mic tester</Link> is like a speedy diagnostic scan. In mere seconds, it tells you if:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Your mic is being picked up by your computer</li>
              <li>Input levels are hitting just right and holding steady</li>
              <li>Any unwanted background noise or distortion is sneaking in</li>
              <li>Your headset or earbud mic is pulling its weight</li>
            </ul>
            <p>
              It's basically a quick listen to your audio setup's heartbeat—straightforward, no fuss, and spot-on reliable.
            </p>
          </section>

          <section className="space-y-3" id="how-mic-tester-works">
            <h3 className="text-xl font-semibold">How Does an Online Microphone Tester Work?</h3>
            <p>
              The average <Link to="/mic-tester" className="text-primary underline">free online mic tester</Link> taps into your browser's built-in audio tools. Here's the no-brainer rundown:
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-1">
              <li>You click "Start Test"</li>
              <li>The browser pops up a request for mic access—give it the green light</li>
              <li>You talk, hum a tune, or just clap—whatever gets some sound going</li>
              <li>The tool flashes back a live visual cue, like a bouncing waveform or rising bars</li>
            </ol>
            <p>
              Zero installs. No tangled setup. Pure, immediate results. This setup shines for those last-second checks before you hit record, go live, or dial into a call. Some fancier <Link to="/mic-tester" className="text-primary underline">audio input testers</Link> even measure decibels and flag things like clipping or fuzzy distortion.
            </p>
          </section>

          <section className="space-y-3" id="online-vs-downloadable">
            <h3 className="text-xl font-semibold">Online vs Downloadable Microphone Testers</h3>
            <p>Got a mic to test? You've basically got two paths:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Mic Tester Online</h4>
                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                  <li>Browser-based action</li>
                  <li>Ideal for fast spot-checks</li>
                  <li>No downloads, ever</li>
                  <li>Totally free and effortless</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Downloadable Tools</h4>
                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                  <li>Deeper dives into monitoring</li>
                  <li>Record and dissect sound quality</li>
                  <li>A must for pros</li>
                  <li>Software like Audacity or OBS</li>
                </ul>
              </div>
            </div>
            <p>
              For everyday "is this thing on?" moments, a <Link to="/mic-tester" className="text-primary underline">computer mic checker online</Link> covers you. But if you're deep into podcasting, belting out songs, or streaming full-time, layering in some dedicated software for extra scrutiny makes sense.
            </p>
          </section>

          <section className="space-y-3" id="key-features">
            <h3 className="text-xl font-semibold">Key Features of a Good Microphone Tester</h3>
            <p>Not every tester is worth your time. A top-notch <Link to="/mic-tester" className="text-primary underline">headphone mic tester</Link> delivers:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><span className="font-medium">Instant visual cues</span> – Watch your words light up the display</li>
              <li><span className="font-medium">Volume pickup</span> – Confirm those levels aren't dipping too quiet</li>
              <li><span className="font-medium">Works everywhere</span> – Smooth sailing on Windows, macOS, and phones</li>
              <li><span className="font-medium">Browser-only</span> – Jump right in, no extras</li>
              <li><span className="font-medium">Handles headsets and earbuds</span> – Spots built-in mics and plug-and-play ones alike</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Quick heads-up: If your <Link to="/mic-tester" className="text-primary underline">headset mic test</Link> shows zilch, hop into your system's sound preferences and double-check it's set as the main input.
            </p>
          </section>

          <section className="space-y-3" id="common-issues">
            <h3 className="text-xl font-semibold">Common Issues a Mic Tester Can Reveal</h3>
            <p>A solid <Link to="/mic-tester" className="text-primary underline">computer microphone test</Link> shines a light on those hidden gremlins:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><span className="font-medium">Low Volume</span> – Might need to crank up the gain</li>
              <li><span className="font-medium">Background Noise</span> – That fan whir or crackle bleeding through</li>
              <li><span className="font-medium">Headset Mic Not Detected</span> – OS input settings playing tricks</li>
              <li><span className="font-medium">Distortion</span> – Levels cranked too high, leading to clips</li>
              <li><span className="font-medium">No Input at All</span> – Could be hardware or outdated drivers</li>
            </ul>
            <p>
              What makes an <Link to="/mic-tester" className="text-primary underline">online mic tester</Link> so clutch? You spot these trouble signs early, dodging that awkward "can you hear me now?" loop mid-convo.
            </p>
          </section>

          <section className="space-y-3" id="when-to-test">
            <h3 className="text-xl font-semibold">When Should You Run a Microphone Test?</h3>
            <p>Pinpoint the perfect moments for a mic tester run:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Right before that big meeting or lecture kicks off</li>
              <li>Just prior to streaming or hitting record on a project</li>
              <li>After swapping in fresh headsets or earphones</li>
              <li>When you're hooking up a new USB mic</li>
              <li>The second a buddy mentions, "Dude, your audio's acting up"</li>
            </ul>
            <p>
              A <Link to="/mic-tester" className="text-primary underline">PC microphone test</Link> clocks in at under 10 seconds but wards off way bigger headaches down the line.
            </p>
          </section>

          <section className="space-y-3" id="step-by-step">
            <h3 className="text-xl font-semibold">Step-by-Step: How to Test Your Mic Online</h3>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-1">
              <li>Shut down any apps hogging your mic (think Zoom, Discord, or Teams)</li>
              <li>Pull up the <Link to="/mic-tester" className="text-primary underline">mic tester online</Link> page</li>
              <li>Tap Start Test</li>
              <li>Okay the browser's access request</li>
              <li>Chat away or rustle up some sound</li>
              <li>Eyeball the visuals for movement</li>
            </ol>
            <p>
              Bars jumping or waveform dancing? You're golden—mic's good to go. Flatline? Switch inputs in your sound settings and give the <Link to="/mic-tester" className="text-primary underline">audio test microphone</Link> another whirl.
            </p>
          </section>

          <section className="space-y-3" id="best-practices">
            <h3 className="text-xl font-semibold">Best Practices for Clear Audio</h3>
            <p>Testing's your starting line; nailing ongoing clarity is the win. Try these:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Position the mic about 6–8 inches from your mouth</li>
              <li>Slap on a pop filter or windscreen to tame those harsh bursts</li>
              <li>Dial down ambient racket (fans off, AC low, keys quiet)</li>
              <li>Keep drivers fresh with regular updates</li>
              <li>Wipe down jacks and ports on your headset</li>
            </ul>
            <p>
              Remember, even the slickest <Link to="/mic-tester" className="text-primary underline">microphone tester</Link> can't patch sloppy setup—so prime yourself for prime sound.
            </p>
          </section>

          <section className="space-y-3" id="other-tools">
            <h3 className="text-xl font-semibold">Try Our Other Free Tools</h3>
            <p>Your mic's not the only gear begging for a once-over. Tag-team the <Link to="/mic-tester" className="text-primary underline">mic test online</Link> with these:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link> – Test your controller to sniff out stick drift or laggy buttons</li>
              <li><Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> – Probe your MIDI keyboard for key response, pads, and velocity feel</li>
              <li><Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> – Scan your GPU health to keep graphics humming</li>
            </ul>
            <p>
              Like the <Link to="/mic-tester" className="text-primary underline">mic tester online</Link>, they're all browser-native—no downloads in sight.
            </p>
          </section>

          <section className="space-y-4" id="faqs">
            <h3 className="text-xl font-semibold">FAQs About Online Mic Testing</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">What is a mic tester?</h4>
                <p className="text-muted-foreground">A mic tester is a straightforward tool for verifying your microphone's in working order. It scans input strength, hunts down audio glitches, and confirms your mic's linked up right.</p>
              </div>
              <div>
                <h4 className="font-semibold">Can I test my microphone online for free?</h4>
                <p className="text-muted-foreground">You bet. Fire off a <Link to="/mic-tester" className="text-primary underline">mic test online free</Link> right in your browser—no apps or fees attached.</p>
              </div>
              <div>
                <h4 className="font-semibold">Does a mic tester record my voice?</h4>
                <p className="text-muted-foreground">Nope, the typical online version just listens for input and mirrors it back live. Nothing gets saved or stashed.</p>
              </div>
              <div>
                <h4 className="font-semibold">Will it work with a headset microphone?</h4>
                <p className="text-muted-foreground">For sure. A <Link to="/mic-tester" className="text-primary underline">headset mic test</Link> mirrors the process for laptop built-ins or USB setups.</p>
              </div>
              <div>
                <h4 className="font-semibold">How do I fix it if my mic isn't detected?</h4>
                <p className="text-muted-foreground">Peek at your sound settings, pick the right input, and retry. Still nada? Update those drivers or loop back with another <Link to="/mic-tester" className="text-primary underline">audio input tester</Link>.</p>
              </div>
              <div>
                <h4 className="font-semibold">Can I test earphone microphones too?</h4>
                <p className="text-muted-foreground">Yep. Earphone microphone tests roll the same as headsets—plug in, test, talk.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3" id="final-thoughts">
            <h3 className="text-xl font-semibold">Final Thoughts</h3>
            <p>
              Strong audio is one of those unsung heroes that elevates everything from work pitches to buddy gaming nights or fresh content drops. A fast pass with a <Link to="/mic-tester" className="text-primary underline">mic tester</Link> heads off those tech tantrums before they start.
            </p>
            <p>
              Armed with a <Link to="/mic-tester" className="text-primary underline">free microphone tester online</Link>, you'll lock in sharp sound, verify your headset's locked in, and rest easy knowing your voice cuts through clean. Round it out with extras like the <Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link> or <Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> for a full-spectrum hardware tune-up—all browser-bound and blissfully simple.
            </p>
            <p>
              Clear audio matters more than most people realize. Whether you're presenting at work, gaming with friends, or recording content, a quick run with a mic tester can save you from technical headaches.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
