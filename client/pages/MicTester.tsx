import { useEffect, useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw, Activity, ClipboardSignature, ClipboardCheck } from 'lucide-react';
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
            <div className="space-y-4">
              <canvas 
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full border rounded-lg bg-gray-900"
                style={{ maxWidth: '100%', height: '200px' }}
              />
              
              {/* Level Meter */}
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Input Level</span>
                  <span className="text-sm text-muted-foreground">{Math.round(audioStats.level)}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-4 relative overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-100 ${getLevelColor(audioStats.level)}`}
                    style={{ width: `${Math.min(audioStats.level, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex space-x-1">
                      {[20, 40, 60, 80].map(threshold => (
                        <div 
                          key={threshold}
                          className="w-px h-2 bg-gray-600"
                          style={{ marginLeft: `${threshold - 2}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sensitivity Control */}
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
        <article className="mt-10 space-y-10 text-base leading-7">
          <section className="space-y-3" id="mic-tester-online">
            <h2 className="text-2xl font-bold">Mic Tester Online – Check Your Microphone Instantly</h2>
            <p>
              If your microphone stops working, it can turn an important call, stream, or recording session into a frustrating mess. The good news is you can quickly run a mic tester online and figure out what’s wrong before wasting time in meetings or games with no audio.
            </p>
            <p>
              This guide will help you use our mic test online free tool, troubleshoot common microphone issues, and even choose the best hardware if you need an upgrade.
            </p>
          </section>

          <section className="space-y-3" id="why-you-need-an-online-mic-tester">
            <h3 className="text-xl font-semibold">Why You Need an Online Mic Tester</h3>
            <p>
              Microphones can fail for many reasons — wrong settings, software bugs, damaged cables, or even muted input devices. A simple online microphone test helps you:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Confirm if your mic is picking up sound</li>
              <li>Troubleshoot whether the issue is hardware or software</li>
              <li>Avoid embarrassment in video calls or streaming sessions</li>
              <li>Test a new mic before recording</li>
            </ul>
            <p>
              Instead of installing heavy programs or fiddling with drivers right away, start with a quick mic tester online and save time.
            </p>
          </section>

          <section className="space-y-3" id="instant-results">
            <h3 className="text-xl font-semibold">Mic Tester Online – Instant Results</h3>
            <p>
              Our mic tester online tool is browser-based, meaning no installation is required. You just open the page, grant microphone access, and start speaking. You’ll see a real-time sound level bar move as you talk — if it reacts, your mic is working.
            </p>
            <p>This microphone test tool works on:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Windows PCs</li>
              <li>macOS laptops</li>
              <li>Linux systems</li>
              <li>Android phones</li>
              <li>iOS devices</li>
            </ul>
            <p>
              It’s perfect for testing headsets, USB microphones, gaming mics, and even built-in laptop microphones.
            </p>
          </section>

          <section className="space-y-3" id="free-online-mic-test">
            <h3 className="text-xl font-semibold">Free Online Mic Test – No Downloads</h3>
            <p>One of the best things about a free online mic test is that it runs entirely in your browser. That means:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>No software to install</li>
              <li>No risk of malware</li>
              <li>Instant results</li>
              <li>Works across browsers like Chrome, Edge, Firefox, and Safari</li>
            </ul>
            <p>
              This makes it an excellent choice if you just want a quick mic check before joining a Zoom call or starting a stream.
            </p>
          </section>

          <section className="space-y-3" id="test-microphone-online">
            <h3 className="text-xl font-semibold">Test Microphone Online – Step by Step</h3>
            <p>Here’s how to test microphone online quickly and accurately:</p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-1">
              <li>Make sure your microphone is plugged in or enabled</li>
              <li>Close other apps that might be using the mic</li>
              <li>
                Open our <Link to="/mic-tester" className="text-primary underline">mic test online</Link> page
              </li>
              <li>Allow microphone access when prompted</li>
              <li>Speak normally and watch the sound level meter move</li>
            </ol>
            <p>
              If you see movement, your microphone is working. If not, check your system settings or try a different input device.
            </p>
          </section>

          <section className="space-y-3" id="benefits-of-online-mic-test">
            <h3 className="text-xl font-semibold">Benefits of Using an Online Microphone Test</h3>
            <p>Running an online microphone test gives you peace of mind before important events. It helps with:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Remote meetings (Zoom, Google Meet, Teams)</li>
              <li>Online classes and webinars</li>
              <li>Voice chats in games (Discord, Steam, Xbox Live)</li>
              <li>Streaming setups (Twitch, YouTube)</li>
              <li>Podcast recording</li>
            </ul>
            <p>
              Instead of joining a call and wasting time saying “Can you hear me?” — run a test microphone online first.
            </p>
          </section>

          <section className="space-y-3" id="advanced-features">
            <h3 className="text-xl font-semibold">Advanced Features of a Microphone Test Tool</h3>
            <p>A good microphone test tool is more than just a basic checker. You can:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Detect background noise and interference</li>
              <li>Check left/right audio balance on stereo mics</li>
              <li>Test sensitivity for singing or ASMR recording</li>
              <li>Verify multiple input devices before switching</li>
            </ul>
            <p>If you’re serious about content creation, testing often helps catch issues early.</p>
          </section>

          <section className="space-y-3" id="common-problems-and-fixes">
            <h3 className="text-xl font-semibold">Common Microphone Problems and Fixes</h3>
            <p>Sometimes a mic test online shows no input. Here’s what to check:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><span className="font-medium">Muted microphone</span> – Look for a physical mute switch or mute button in your software</li>
              <li><span className="font-medium">Wrong input selected</span> – Choose the correct device in system settings</li>
              <li><span className="font-medium">Driver issues</span> – Update audio drivers</li>
              <li><span className="font-medium">Damaged cable</span> – Try a different cable or USB port</li>
              <li><span className="font-medium">Permissions blocked</span> – Make sure your browser has mic access enabled</li>
            </ul>
            <p>
              If your mic passes the mic tester online but you still have issues in apps, check each app’s input settings individually.
            </p>
          </section>

          <section className="space-y-3" id="internal-links">
            <h3 className="text-xl font-semibold">Internal Links to Other Tools</h3>
            <p>You can keep your setup running smoothly with our other tools too:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>
                <Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link> – Diagnose controller input issues
              </li>
              <li>
                <Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> �� Run a GPU test online to check graphics card performance
              </li>
              <li>
                <Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> – Test MIDI keyboards and controllers
              </li>
            </ul>
            <p>Internal linking helps users troubleshoot their full system without leaving your site.</p>
          </section>

          <section className="space-y-3" id="choosing-the-best-microphone">
            <h3 className="text-xl font-semibold">Choosing the Best Microphone</h3>
            <p>If your microphone fails even after troubleshooting, it may be time to replace it. Look for:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>USB plug-and-play mics – great for calls and streaming</li>
              <li>XLR microphones – best for studio setups</li>
              <li>Headset mics – convenient for gaming and meetings</li>
            </ul>
            <p>Adding a buying guide on your page lets visitors buy microphones online directly after testing.</p>
          </section>

          <section className="space-y-4" id="faqs">
            <h3 className="text-xl font-semibold">FAQs</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">How to test my microphone online?</h4>
                <p>Just open our mic tester online, grant browser permission, and start speaking. If you see the bar move, your mic is working.</p>
              </div>
              <div>
                <h4 className="font-semibold">How to test microphone on Windows 10?</h4>
                <p>Right-click the sound icon, go to “Sounds,” then “Recording.” Select your mic, click “Properties,” then “Listen.” Or simply run our mic test online free tool for quicker results.</p>
              </div>
              <div>
                <h4 className="font-semibold">Why is my microphone not working?</h4>
                <p>Common reasons include muted hardware, wrong input device selected, outdated drivers, or blocked permissions. Try our test microphone online tool to confirm if the issue is hardware or software.</p>
              </div>
              <div>
                <h4 className="font-semibold">Best online microphone test?</h4>
                <p>Our tool is one of the fastest and most reliable ways to run a free online mic test — no downloads, no account needed.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3" id="final-thoughts">
            <h3 className="text-xl font-semibold">Final Thoughts</h3>
            <p>
              Running a mic tester online takes just seconds but can save you from wasted calls, failed recordings, or awkward silences. Whether you’re testing a headset, a podcasting mic, or your laptop’s built-in microphone, our mic test online tool gives instant feedback.
            </p>
            <p>
              Pair this tool with our <Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> and <Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link> to make sure every part of your setup works smoothly. A quick microphone test tool now means fewer tech headaches later — and more time focusing on your calls, streams, or creative work.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
