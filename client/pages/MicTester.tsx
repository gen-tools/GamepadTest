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
        <title>Mic Tester Online – Free Microphone Test Tool</title>
        <meta name="description" content="Test your microphone online free with our mic tester. Check audio input, detect issues, and ensure clear sound quality without downloads." />
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
            <h1 className="text-3xl font-bold animate-fade-in-right animate-stagger-1">Mic Tester</h1>
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

        {/* Mic Tester: Free Online Microphone Test */}
        <article className="mt-10 space-y-10 text-base leading-7">
          <section className="space-y-3" id="mic-tester-free-online">
            <h2 className="text-2xl font-bold">Mic Tester – Free Online Microphone Test</h2>
            <p>
              Ever had that nagging doubt about whether your mic is actually picking up your voice, or if it's just pretending to be there? A <Link to="/mic-tester" className="text-primary underline">mic tester</Link> is one of those straightforward online tools that lets you figure out if your microphone is behaving itself.
            </p>
            <p>
              It dives into your audio signal, checks the volume, and sniffs out any sneaky background noise—all happening live in your browser. You don't need to mess around with downloads or anything; just fire it up on your laptop, desktop, or phone.
            </p>
            <p>
              Perfect timing if you're about to jump on a work call, lay down some podcast tracks, stream a gaming marathon, or catch up with buddies online. It makes sure your words come across crisp and true, without any weird fuzz or dropouts. For streamers, also test your <Link to="/gamepad-tester" className="text-primary underline">controller</Link> and <Link to="/gpu-tester" className="text-primary underline">graphics card</Link> to ensure a smooth broadcast.
            </p>
          </section>

          <section className="space-y-3" id="why-test-microphone">
            <h3 className="text-xl font-semibold">Why You Should Test Your Microphone Online</h3>
            <p>
              There's that gut-wrenching moment when you hit "join" on a meeting or stream, and... crickets from your mic. A <Link to="/mic-tester" className="text-primary underline">free online mic test</Link> is your preemptive strike against that nightmare—it double-checks that your input's firing on all cylinders before the show's on.
            </p>
            <p>
              Pop open a <Link to="/mic-tester" className="text-primary underline">computer mic test</Link>, and you'll get those real-time visuals of your audio levels bouncing along. It's a game-changer for tweaking volume or catching if your voice is coming out muffled, like a bad phone line, or bouncing back with an echo.
            </p>
            <p>In a flash, you can uncover stuff like:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Super low or patchy sound quality</li>
              <li>That annoying hum from your fan or some static in the air</li>
              <li>A lag that makes you sound like you're on satellite delay</li>
              <li>Picking the wrong input device by mistake</li>
            </ul>
            <p>
              Getting ahead of it means no scrambling mid-convo and no awkward "can you hear me?" moments.
            </p>
          </section>

          <section className="space-y-3" id="how-mic-tester-works">
            <h3 className="text-xl font-semibold">How Does a Mic Tester Work?</h3>
            <p>
              The way most online testers roll is by tapping into your browser's permission system for the mic. Hit "Start Test," and it'll pop up asking if it's cool to listen in. Give the nod, and boom—it's grabbing your audio feed.
            </p>
            <p>
              You'll spot those wavy lines or bars lighting up as you talk, which is your green light that everything's connected. Some fancier ones throw in playback, so you can eavesdrop on how you actually sound to the rest of the world.
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-1">
              <li>Let the browser access your microphone</li>
              <li>Chat or hum a tune like you would normally</li>
              <li>Keep an eye on the screen's reaction to your voice</li>
              <li>Tweak settings or try again if something's off</li>
            </ol>
            <p>
              Super snappy, dead accurate, and all in the browser—no fuss, no downloads, just immediate results.
            </p>
          </section>

          <section className="space-y-3" id="online-vs-downloadable">
            <h3 className="text-xl font-semibold">Online vs. Downloadable Microphone Testers</h3>
            <p>You've got a couple paths to mic-check central: the web-based quickie or the full-on software download.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Online Mic Testers</h4>
                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                  <li>Speedy and cost nothing</li>
                  <li>Skip the install drama completely</li>
                  <li>Perfect for quick pre-call checks</li>
                  <li>Works for virtual classes and casual podcasts</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Software-Based Testers</h4>
                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                  <li>Deep dive into frequencies and noise floors</li>
                  <li>Advanced waveform analysis</li>
                  <li>Tailor-made for audio professionals</li>
                  <li>Software like Audacity, OBS, or Voicemeeter</li>
                </ul>
              </div>
            </div>
            <p>
              Truth is, for the rest of us, the <Link to="/mic-tester" className="text-primary underline">online version</Link> covers it. Light as a feather, works everywhere, and just gets the job done without any complications.
            </p>
          </section>

          <section className="space-y-3" id="supported-devices">
            <h3 className="text-xl font-semibold">Supported Devices and Setups</h3>
            <p>A solid <Link to="/mic-tester" className="text-primary underline">PC mic test</Link> plays nice with all sorts of gear:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Your laptop's everyday built-in microphone</li>
              <li>USB or condenser mics for that professional touch</li>
              <li>Bluetooth headsets or the wired classics</li>
              <li>Earbuds with those little built-in mics</li>
              <li>Fancy external sound mixers and interfaces</li>
            </ul>
            <p>
              Whatever OS you're rocking—Windows, macOS, Linux, or even ChromeOS—it hums along in Chrome, Safari, Firefox, or Edge without a hitch. Running a <Link to="/mic-tester" className="text-primary underline">laptop mic tester</Link>? It sniffs out your options and helps you lock in the best one before you dive into that important call.
            </p>
          </section>

          <section className="space-y-4" id="testing-different-microphones">
            <h3 className="text-xl font-semibold">Testing Different Microphones</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground">Headset and Earphone Mics</h4>
                <p className="text-muted-foreground">
                  Headsets have this habit of letting your computer pick the lame built-in mic over the good one. A <Link to="/mic-tester" className="text-primary underline">headset mic test</Link> straightens that out, making sure it's channeling from the right spot. Earphones are no different—those inline mics can get overlooked. An <Link to="/mic-tester" className="text-primary underline">earphone mic test</Link> confirms they're online and delivering sound that's clear, not garbled.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Laptop and Desktop Mics</h4>
                <p className="text-muted-foreground">
                  On a laptop, it's all about dodging last-minute shocks before a huddle. A <Link to="/mic-tester" className="text-primary underline">computer mic test</Link> runs the gamut: detection, levels, how sensitive it is. Desktop crew? Plug in via USB or the headphone jack, and the test makes sure your rig sees it and treats it right.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Webcam Microphones</h4>
                <p className="text-muted-foreground">
                  Got a webcam with its own mic? A <Link to="/mic-tester" className="text-primary underline">cam and mic tester</Link> ties audio and video together, so nothing's out of sync for calls or video clips. Perfect for ensuring both your visual and audio quality are on point.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3" id="how-to-run-test">
            <h3 className="text-xl font-semibold">How to Run a Mic Test Online</h3>
            <p>Nailing a quick audio check is a breeze with these steps:</p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-1">
              <li>Shut down any mic-hogging apps (looking at you, Zoom, Skype, Discord)</li>
              <li>Fire up your go-to <Link to="/mic-tester" className="text-primary underline">online mic tester</Link> in the browser</li>
              <li>When it asks, okay the microphone access permission</li>
              <li>Talk or make noise like it's no big deal</li>
              <li>Watch those visual indicators dance with your voice</li>
              <li>If playback's available, listen back to check your audio quality</li>
            </ol>
            <p>
              Levels flatlining? Poke around your input settings and give it another go. Usually a quick settings adjustment is all it takes to get your microphone working properly.
            </p>
          </section>

          <section className="space-y-3" id="common-problems">
            <h3 className="text-xl font-semibold">Common Problems a Mic Tester Can Reveal</h3>
            <p>Your <Link to="/mic-tester" className="text-primary underline">computer mic test</Link> is like an early warning system for the usual culprits:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><span className="font-medium">Low Input Volume</span> – Too far away or gain's asleep at the wheel</li>
              <li><span className="font-medium">Background Noise</span> – AC drone, fan whine, or some electrical buzz interfering</li>
              <li><span className="font-medium">No Input Detected</span> – Permissions playing hardball or a cable's come loose</li>
              <li><span className="font-medium">Distortion or Clipping</span> – Crank the gain down or back off the microphone</li>
              <li><span className="font-medium">Wrong Input Device</span> – Defaulting to a mic that's gathering dust instead of your main one</li>
            </ul>
            <p>
              Flagging these issues early means no red-faced fixes on the fly during important calls or recordings.
            </p>
          </section>

          <section className="space-y-3" id="playback-recording">
            <h3 className="text-xl font-semibold">Mic Tester with Playback and Recording</h3>
            <p>
              The ones with playback or recording baked in? Total upgrade—you get to audition your own voice, just like your listeners will. A <Link to="/mic-tester" className="text-primary underline">bug tester with playback</Link> lets you dial in your position, your pitch, how loud you're going.
            </p>
            <p>
              For the creative types, a <Link to="/mic-tester" className="text-primary underline">recorder tester</Link> is gold. Mock up your setup, mess with noise tweaks, and make sure it stays buttery smooth. Singers or voice-over folks swear by it for keeping that tone on lock and ensuring consistent audio quality.
            </p>
          </section>

          <section className="space-y-3" id="streamers-gamers">
            <h3 className="text-xl font-semibold">Live Mic Testing for Streamers and Gamers</h3>
            <p>
              If you're streaming or gaming, a <Link to="/mic-tester" className="text-primary underline">live mic tester</Link> keeps your chatter crystal during the clutch plays. No more wondering if your Discord squad or Steam crew's getting your genius strats.
            </p>
            <p>
              A <Link to="/mic-tester" className="text-primary underline">Steam bug tester</Link> pings your mic's snap-back while you're in the thick of it. Callouts, quips, all landing loud and clear. Pair it with OBS or Twitch via a <Link to="/mic-tester" className="text-primary underline">webcam and mic tester</Link>, and you're balancing sound and sight like a boss before the stream kicks off.
            </p>
          </section>

          <section className="space-y-3" id="online-meetings">
            <h3 className="text-xl font-semibold">Using a Mic Tester for Online Meetings</h3>
            <p>
              Pre-call ritual: Whip out a <Link to="/mic-tester" className="text-primary underline">PA tester for Zoom</Link> or whatever platform you're using. It vets volume, squashes echoes, and nails the correct audio source.
            </p>
            <p>
              <Link to="/mic-tester" className="text-primary underline">Laptop mic tester</Link>? It green-lights your built-in or headset before the team's waiting. Works wonders for Teams, Meet, Skype—dodges those "hello? hello?" loops every time and ensures professional audio quality for business meetings.
            </p>
          </section>

          <section className="space-y-3" id="platform-compatibility">
            <h3 className="text-xl font-semibold">Platform Compatibility</h3>
            <p>This <Link to="/mic-tester" className="text-primary underline">mic tester</Link> has wide coverage on platforms and browsers:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Windows 10/11/8:</strong> Handles USB and old-school analog without blinking</li>
              <li><strong>macOS:</strong> Chrome, Safari, Edge—all good to go with full compatibility</li>
              <li><strong>Linux and ChromeOS:</strong> Browser-based testing works flawlessly</li>
              <li><strong>Mobile Devices:</strong> Android/iOS browsers deliver full microphone functionality</li>
            </ul>
            <p>
              Device agnostic—just open your browser, run the test, and get immediate feedback on your microphone's performance.
            </p>
          </section>

          <section className="space-y-3" id="microphone-maintenance">
            <h3 className="text-xl font-semibold">Keeping Your Microphone in Good Shape</h3>
            <p>Top-shelf mics still need a little TLC. Stay ahead with these maintenance tips:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Regularly dust-busting those screens or pop filters</li>
              <li>Avoid hollering straight into condenser microphones</li>
              <li>Keeping firmware and drivers updated to the latest versions</li>
              <li>Storing microphones in dry, temperature-controlled environments</li>
              <li>Running an <Link to="/mic-tester" className="text-primary underline">audio test</Link> periodically to catch issues early</li>
            </ul>
            <p>
              Tiny habits, big payoffs—keeps your sound professional and predictable across all your recordings and calls.
            </p>
          </section>

          <section className="space-y-3" id="other-tools">
            <h3 className="text-xl font-semibold">Other Free Tools Worth Trying</h3>
            <p>Mic's not the only player; give these browser gems a spin too:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link> – Check buttons and joysticks for drift-free performance</li>
              <li><Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> – See how your graphics card holds up under heavy loads</li>
              <li><Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> – Verify keyboards or pads are firing signals correctly</li>
            </ul>
            <p>
              Like the <Link to="/mic-tester" className="text-primary underline">mic tester</Link>—completely free, browser-only, and no installation drama required for any of them.
            </p>
          </section>

          <section className="space-y-4" id="faqs">
            <h3 className="text-xl font-semibold">FAQs About Mic Testing</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">What is a mic tester?</h4>
                <p className="text-muted-foreground">It's that browser buddy checking your mic's quality, levels, and if it's even awake and functioning properly.</p>
              </div>
              <div>
                <h4 className="font-semibold">Can I test my microphone online for free?</h4>
                <p className="text-muted-foreground">Yep—zero bucks, instant check, all online without any hidden costs or requirements.</p>
              </div>
              <div>
                <h4 className="font-semibold">Does it record my voice?</h4>
                <p className="text-muted-foreground">Nah, most keep it visual. Playback's just a local echo, gone when you're done—nothing stored or transmitted.</p>
              </div>
              <div>
                <h4 className="font-semibold">Can it test my headset or earphone mic?</h4>
                <p className="text-muted-foreground">For sure—headset or earphone, it confirms they're pulling weight and delivering clear audio.</p>
              </div>
              <div>
                <h4 className="font-semibold">What should I do if my mic isn't detected?</h4>
                <p className="text-muted-foreground">Check permissions, review settings, swap inputs—then test again. Usually resolves most issues.</p>
              </div>
              <div>
                <h4 className="font-semibold">Is this safe to use?</h4>
                <p className="text-muted-foreground">Totally—stays in your browser, nothing leaves the building. Your privacy is maintained throughout the testing process.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3" id="final-thoughts">
            <h3 className="text-xl font-semibold">Final Thoughts</h3>
            <p>
              Good audio's the unsung hero of your digital life. Meeting, stream, podcast—nail the sound, and everything flows smoothly without technical distractions.
            </p>
            <p>
              A quick <Link to="/mic-tester" className="text-primary underline">online mic test</Link> hands you that "all set" vibe, with your voice popping clear as day. Effortless, spot-on, browser magic—no installs, no sweat, just reliable audio verification.
            </p>
            <p>
              Next time you're gearing up for an important call or recording, take a moment to <Link to="/mic-tester" className="text-primary underline">test your microphone</Link>. Smooth talks, killer content, happy crowd—every single time.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
