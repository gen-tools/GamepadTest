import { useEffect, useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

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
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  const startRecording = async () => {
    try {
      setError('');
      
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
    
    setIsRecording(false);
    setAudioStats({
      level: 0,
      peak: 0,
      noiseFloor: 0,
      signalToNoise: 0,
      frequency: 0
    });
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

  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>Online Mic Tester | Check Microphone Instantly – GamepadTest</title>
        <meta name="description" content="Instantly test your mic online—free & secure. Check sound levels in seconds, fix mic issues fast, and join calls with confidence on GamepadTest." />
        <meta name="keywords" content="microphone tester, mic test, audio input test, microphone quality test, mic level test, audio analyzer, microphone sensitivity test" />
        <link rel="canonical" href="https://www.gamepadtest.tech/mic-tester" />
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

        {/* Comprehensive Guide & FAQs */}
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Mic Testing Guide & FAQs</CardTitle>
            <CardDescription>Everything you need to know about testing your microphone online</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-base leading-7">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Online Mic Tester – Check If Your Microphone Works</h2>
              <p>
                A working microphone has become as important as the keyboard or the mouse. You need it for online meetings, virtual classes, voice chats while gaming, and recording content. Yet microphones fail more often than we expect. Sometimes your friends say your voice is too quiet, other times the mic does not respond at all. Before you buy a new one or spend hours adjusting settings, the easiest step is to run a quick mic test online free.
              </p>
              <p>
                That is exactly what this tool does. Our mic tester online checks your microphone instantly in the browser. No software, no downloads, no complicated setup. You just open the page, give the browser permission to access the mic, and speak. If the sound levels move, your microphone is working. If not, you know where the problem starts.
              </p>
              <div className="pt-2">
                <Button asChild className="gap-2">
                  <Link to="/mic-tester">👉 Try it now: Mic Tester</Link>
                </Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Why You Need a Mic Tester</h3>
              <p>You may think you can test a mic by simply joining a call. The trouble is that it often wastes time. You only realize something is wrong when the meeting has already begun. A proper mic test online lets you confirm everything in advance.</p>
              <p>There are many situations where a mic tester helps:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Before starting a video call for work or school</li>
                <li>When preparing to record a podcast, lecture, or song</li>
                <li>While setting up a gaming headset before streaming</li>
                <li>After updating your operating system or audio drivers</li>
                <li>When switching from a laptop mic to a USB or Bluetooth microphone</li>
              </ul>
              <p>Instead of guessing, you get a clear answer in seconds.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">How the Online Mic Tester Works</h3>
              <p>The tool is designed to be simple. Here is what happens when you use it.</p>
              <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
                <li>You open the <Link to="/mic-tester" className="text-primary underline">Mic Tester</Link> page.</li>
                <li>Your browser asks for permission to access the microphone.</li>
                <li>Once allowed, the tool listens to your input and shows activity on screen.</li>
                <li>You speak into the mic, clap, or make any sound. The tool shows movement if audio is detected.</li>
              </ol>
              <p>There is no recording or storage involved. The test only shows whether sound is reaching your device in real time.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Benefits of Testing Your Mic Online</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Instant feedback – no need to record, save, and play back.</li>
                <li>Works on any device – desktop, laptop, or phone.</li>
                <li>Free forever – run a mic test online free anytime.</li>
                <li>Safe – runs in your browser, nothing gets downloaded.</li>
              </ul>
              <p>This is why many streamers, teachers, and office workers check their microphone here before going live.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">When to Run a Mic Test</h3>
              <p>You do not need to wait until your microphone fails completely. In fact, regular checks prevent surprises. Here are some good times to use the tester:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Right before an online exam or job interview</li>
                <li>When setting up new equipment such as a headset or USB mic</li>
                <li>After a system crash or sudden sound problem</li>
                <li>Before important gaming sessions where communication matters</li>
                <li>When others say your voice sounds muffled or unclear</li>
              </ul>
              <p>Running a mic test online takes less than a minute but saves you from stress later.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Troubleshooting Microphone Problems</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold">Check connections</h4>
                  <p>Make sure the microphone is properly plugged in. For Bluetooth devices, confirm they are paired.</p>
                </div>
                <div>
                  <h4 className="font-semibold">Check permissions</h4>
                  <p>Browsers and apps often block access to microphones until you allow it manually.</p>
                </div>
                <div>
                  <h4 className="font-semibold">Adjust system settings</h4>
                  <p>Open your computer’s sound settings and increase input volume.</p>
                </div>
                <div>
                  <h4 className="font-semibold">Update drivers</h4>
                  <p>Outdated drivers can prevent your system from detecting the microphone.</p>
                </div>
                <div>
                  <h4 className="font-semibold">Test another app or device</h4>
                  <p>Running the mic test online free on another computer helps confirm if the issue is with the mic or the system.</p>
                </div>
              </div>
              <p>If none of these work, the microphone may indeed be faulty.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Types of Microphones You Can Test</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Built-in laptop microphones – check before joining online classes or meetings</li>
                <li>USB microphones – ideal for podcasters, streamers, and voice-over artists</li>
                <li>Headset microphones – make sure your gaming headset mic is working properly</li>
                <li>Bluetooth microphones – quickly confirm wireless devices are connected</li>
                <li>External audio interfaces – verify connected professional microphones</li>
              </ul>
              <p>No matter which mic you use, the tester works the same way.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Mic Tester Online vs Recording Software</h3>
              <p>Recording apps require you to capture a sound clip, save it, and then play it back. That process is slower and less convenient. An online mic tester shows instant feedback. You can see the sound activity as you speak, without creating unnecessary files.</p>
              <p>It is also safer. Many recording programs ask for installation or access to files on your computer. The tester here runs only in your browser and disappears as soon as you close the tab.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Other Free Tools on Our Website</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link> – lets you check PlayStation, Xbox, and PC controllers</li>
                <li><Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> – helps you run a gpu test online to verify graphics card performance</li>
                <li><Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> – designed for musicians who want to test MIDI keyboards and devices</li>
              </ul>
              <p>
                You can also visit our <Link to="/about" className="text-primary underline">About</Link> page to learn more about the project, use <Link to="/contact" className="text-primary underline">Contact</Link> to reach out, or explore tips and tutorials on our <Link to="/blog" className="text-primary underline">Blog</Link>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">How do I test my mic online free</h3>
                  <p>Open the <Link to="/mic-tester" className="text-primary underline">Mic Tester</Link>, allow microphone access, and speak. If the input levels move, your mic works.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Does the mic tester online record my voice</h3>
                  <p>No. The tool only checks live audio levels in your browser. Nothing is stored or shared.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Can I use this on my phone</h3>
                  <p>Yes. You can open the tester in your mobile browser and check built-in or external microphones.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Why does my mic not show any response</h3>
                  <p>Check your connection, allow permissions, and adjust system input settings. If it still does not work, the microphone may be faulty.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Can this tool improve microphone quality</h3>
                  <p>No. It only shows if the mic is working. For higher quality, you may need better hardware or software filters.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Conclusion</h2>
              <p>
                Your microphone is the voice of your digital life. It allows you to speak, teach, perform, and connect. But when it fails, the impact is immediate and frustrating. Instead of waiting until you are already in a call or stream, use our mic test online free to confirm everything in advance.
              </p>
              <p>
                It takes less than a minute. Open the <Link to="/mic-tester" className="text-primary underline">Mic Tester</Link>, speak into your microphone, and get instant confirmation. No downloads, no hassle, just a clear answer.
              </p>
              <p>
                And if you want to make sure the rest of your setup is in top shape, try our <Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link>, <Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link>, and <Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> as well. Our goal is to give you simple tools that keep your devices working when you need them most.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
