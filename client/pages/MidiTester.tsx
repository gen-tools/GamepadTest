import { useEffect, useState, useCallback, useRef } from 'react';
import { Music, Piano, Volume2, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { RecommendedProductsSection } from '@/components/RecommendedProducts';
import type { RecommendedProductItem } from '@/components/RecommendedProducts';

interface MIDIDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  version: string;
  type: 'input' | 'output';
  state: 'connected' | 'disconnected';
}

interface MIDIMessage {
  timestamp: number;
  type: 'noteOn' | 'noteOff' | 'controlChange' | 'pitchBend' | 'programChange' | 'aftertouch' | 'other';
  channel: number;
  note?: number;
  velocity?: number;
  controller?: number;
  value?: number;
  raw: number[];
}

interface NoteInfo {
  note: number;
  name: string;
  octave: number;
  frequency: number;
  isActive: boolean;
  velocity: number;
}

export default function MidiTester() {
  const [midiAccess, setMidiAccess] = useState<any>(null);
  const [devices, setDevices] = useState<MIDIDeviceInfo[]>([]);
  const [messages, setMessages] = useState<MIDIMessage[]>([]);
  const [activeNotes, setActiveNotes] = useState<Map<number, NoteInfo>>(new Map());
  const [midiSupported, setMidiSupported] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [midiError, setMidiError] = useState<string | null>(null);

  // Recommended products for MIDI Tester page (edit these items as needed)
  const midiProducts: RecommendedProductItem[] = [
    {
      name: "Akai Professional MPK Mini MK3 - 25 Key USB MIDI Keyboard Controller",
      description: "25-key MIDI controller with drum pads, knobs, and bundled production software — great for music creation.",
      href: "https://amzn.to/4n15UiE",
      imageSrc: "https://m.media-amazon.com/images/I/717qmGlA7ZL._AC_SL1500_.jpg",
      alt: "AKAI MPK Mini MK3"
    },
    {
      name: "M-VAVE 25 Key USB MIDI Keyboard Controller With 8 Backlit Drum Pads",
      description: "Bluetooth MIDI controller with semi-weighted keys, pads, and knobs for portable beat-making.",
      href: "https://amzn.to/47MPWE5",
      imageSrc: "https://m.media-amazon.com/images/I/61NyksD22vL._AC_SL1500_.jpg",
      alt: "MIDI Keyboard Controller"
    },
    {
      name: "Arturia MiniLab 3 - Universal MIDI Controller for Music Production",
      description: "Compact 25-key controller with pads, controls, and software for seamless music production.",
      href: "https://www.amazon.com/dp/B0711V4S8N",
      imageSrc: "https://m.media-amazon.com/images/I/61EjCG4omGL._AC_SL1500_.jpg",
      alt: "Arturia MiniLab 3"
    }
  ];

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Audio synth for optional sound feedback
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscRef = useRef<Map<number, { osc: OscillatorNode; gain: GainNode }>>(new Map());
  const userInteractedRef = useRef<boolean>(false);
  const sustainRef = useRef<boolean>(false);
  const sustainedNotesRef = useRef<Set<number>>(new Set());

  const ensureAudioContext = async () => {
    if (!audioCtxRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      try { await audioCtxRef.current.resume(); } catch {}
    }
  };

  const markUserInteracted = async () => {
    userInteractedRef.current = true;
    await ensureAudioContext();
  };

  useEffect(() => {
    const onPointer = () => { markUserInteracted(); };
    window.addEventListener('pointerdown', onPointer, { once: true });
    return () => window.removeEventListener('pointerdown', onPointer);
  }, []);

  const bendSemitonesRef = useRef<number>(0); // range approx [-2, 2]

  const applyPitchToAll = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const ratio = Math.pow(2, bendSemitonesRef.current / 12);
    activeOscRef.current.forEach((entry: any) => {
      const base = entry.baseFreq as number;
      entry.osc.frequency.setValueAtTime(base * ratio, ctx.currentTime);
    });
  };

  const playNote = (note: number, velocity: number) => {
    if (!userInteractedRef.current) return; // respect autoplay policies
    if (!audioCtxRef.current) return;

    const baseFreq = 440 * Math.pow(2, (note - 69) / 12);
    const ctx = audioCtxRef.current;

    if (activeOscRef.current.has(note)) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';

    const ratio = Math.pow(2, bendSemitonesRef.current / 12);
    osc.frequency.value = baseFreq * ratio;

    const v = Math.max(0.05, Math.min(1, velocity / 127));
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25 * v, ctx.currentTime + 0.01);

    osc.connect(gain).connect(ctx.destination);
    osc.start();

    activeOscRef.current.set(note, { osc, gain, baseFreq });
  };

  const stopNote = (note: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const entry = activeOscRef.current.get(note);
    if (!entry) return;

    if (sustainRef.current) {
      sustainedNotesRef.current.add(note);
      return;
    }

    entry.gain.gain.cancelScheduledValues(ctx.currentTime);
    entry.gain.gain.setValueAtTime(entry.gain.gain.value, ctx.currentTime);
    entry.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
    entry.osc.stop(ctx.currentTime + 0.1);
    activeOscRef.current.delete(note);
  };

  const releaseSustain = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    for (const note of sustainedNotesRef.current) {
      const entry = activeOscRef.current.get(note);
      if (!entry) continue;
      entry.gain.gain.cancelScheduledValues(ctx.currentTime);
      entry.gain.gain.setValueAtTime(entry.gain.gain.value, ctx.currentTime);
      entry.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
      entry.osc.stop(ctx.currentTime + 0.1);
      activeOscRef.current.delete(note);
    }
    sustainedNotesRef.current.clear();
  };

  const getNoteInfo = (midiNote: number): { name: string; octave: number; frequency: number } => {
    const name = noteNames[midiNote % 12];
    const octave = Math.floor(midiNote / 12) - 1;
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    return { name, octave, frequency };
  };

  const getMIDIMessageType = (status: number): MIDIMessage['type'] => {
    const messageType = status & 0xF0;
    switch (messageType) {
      case 0x80: return 'noteOff';
      case 0x90: return 'noteOn';
      case 0xB0: return 'controlChange';
      case 0xC0: return 'programChange';
      case 0xD0: return 'aftertouch';
      case 0xE0: return 'pitchBend';
      default: return 'other';
    }
  };

  const handleMIDIMessage = useCallback((event: any) => {
    const data: number[] = Array.from(event.data as Iterable<number>);
    const status: number = data[0] as number;
    const channel: number = ((status & 0x0F) + 1) as number;
    const type = getMIDIMessageType(status as number);

    const message: MIDIMessage = {
      timestamp: event.timeStamp,
      type,
      channel,
      raw: data
    };

    if (type === 'noteOn' || type === 'noteOff') {
      const note: number = data[1] as number;
      const velocity: number = data[2] as number;
      message.note = note;
      message.velocity = velocity;

      const noteInfo = getNoteInfo(note);
      
      setActiveNotes(prev => {
        const newMap = new Map(prev);
        if (type === 'noteOn' && velocity > 0) {
          newMap.set(note, {
            note,
            name: `${noteInfo.name}${noteInfo.octave}`,
            octave: noteInfo.octave,
            frequency: noteInfo.frequency,
            isActive: true,
            velocity
          });
          playNote(note, velocity);
        } else {
          // Note off (or note on with velocity 0)
          newMap.delete(note);
          stopNote(note);
        }
        return newMap;
      });
    } else if (type === 'controlChange') {
      message.controller = data[1] as number;
      message.value = data[2] as number;
      if (message.controller === 64) {
        // Sustain pedal
        sustainRef.current = (message.value || 0) >= 64;
        if (!sustainRef.current) releaseSustain();
      }
    } else if (type === 'pitchBend') {
      message.value = ((data[2] as number) << 7) | (data[1] as number);
      const bendVal = (message.value - 8192) / 8192; // -1..1
      bendSemitonesRef.current = bendVal * 2; // assume +/- 2 semitone range
      applyPitchToAll();
    } else if (type === 'aftertouch') {
      // Channel pressure 0..127 -> light modulation of gain
      const pressure = data[1] as number;
      const factor = Math.min(1.0, 0.25 + (pressure / 127) * 0.25);
      const ctx = audioCtxRef.current;
      if (ctx) {
        activeOscRef.current.forEach(entry => {
          entry.gain.gain.setTargetAtTime(factor * 0.25, ctx.currentTime, 0.02);
        });
      }
    } else if (type === 'programChange') {
      message.value = data[1] as number;
    }

    setMessages(prev => [message, ...prev.slice(0, 49)]);
    setTotalMessages(prev => prev + 1);
  }, []);

  const requestMIDIAccess = async () => {
    try {
      if (!navigator.requestMIDIAccess) {
        setMidiSupported(false);
        return;
      }

      const access = await navigator.requestMIDIAccess({ sysex: false });
      setMidiAccess(access);
      setIsConnected(true);

      updateDeviceList(access);
      access.onstatechange = () => updateDeviceList(access);
      setupInputListeners(access);

    } catch (error: any) {
      setMidiSupported(false);
      const message = typeof error?.message === 'string' ? error.message : '';
      if (error?.name === 'SecurityError' || /permissions policy/i.test(message)) {
        setMidiError('Web MIDI is blocked by Permissions Policy in this context. Open this page directly (not in an embedded preview) or use a browser that allows Web MIDI.');
      } else {
        setMidiError('MIDI access failed. Please ensure your browser supports Web MIDI and try again.');
      }
    }
  };

  const updateDeviceList = (access: any) => {
    const deviceList: MIDIDeviceInfo[] = [];
    
    for (const input of access.inputs.values()) {
      deviceList.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || 'Unknown',
        version: input.version || '1.0',
        type: 'input',
        state: input.state
      });
    }

    for (const output of access.outputs.values()) {
      deviceList.push({
        id: output.id,
        name: output.name || 'Unknown Device',
        manufacturer: output.manufacturer || 'Unknown',
        version: output.version || '1.0',
        type: 'output',
        state: output.state
      });
    }

    setDevices(deviceList);
  };

  const setupInputListeners = (access: any) => {
    for (const input of access.inputs.values()) {
      input.onmidimessage = handleMIDIMessage;
    }
  };

  const sendTestNote = async () => {
    if (!midiAccess) return;

    await markUserInteracted();

    const outputs = Array.from(midiAccess.outputs.values()) as any[];
    const note = 60; // Middle C
    const velocity = 90;
    const channel = 0;

    if (outputs.length > 0) {
      const output: any = outputs[0];
      output.send([0x90 | channel, note, velocity]);
      setTimeout(() => output.send([0x80 | channel, note, 0]), 500);
    }

    // local synth feedback as well
    playNote(note, velocity);
    setTimeout(() => stopNote(note), 500);
  };

  const clearMessages = () => {
    setMessages([]);
    setTotalMessages(0);
  };

  const formatMIDIData = (data: number[]) => {
    return data.map((byte: number) => byte.toString(16).padStart(2, '0').toUpperCase()).join(' ');
  };

  useEffect(() => {
    return () => {
      const ctx = audioCtxRef.current;
      activeOscRef.current.forEach(entry => {
        try {
          entry.gain.gain.cancelScheduledValues(ctx?.currentTime || 0);
          entry.gain.gain.setValueAtTime(0, (ctx?.currentTime || 0));
          entry.osc.stop((ctx?.currentTime || 0) + 0.01);
        } catch {}
      });
      activeOscRef.current.clear();
    };
  }, []);

  const renderPianoKey = (note: number, isBlack: boolean = false) => {
    const noteInfo = activeNotes.get(note);
    const isActive = noteInfo?.isActive || false;
    
    return (
      <div
        key={note}
        className={`
          ${isBlack 
            ? 'w-8 h-24 bg-gray-800 absolute transform -translate-x-1/2 z-10' 
            : 'w-12 h-40 bg-white border border-gray-300'
          }
          ${isActive 
            ? isBlack ? 'bg-purple-600' : 'bg-blue-200' 
            : ''
          }
          transition-colors duration-100 rounded-b-md
        `}
        style={isBlack ? { left: '50%' } : {}}
      >
        {isActive && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="text-xs text-center">
              <div className="font-bold">{noteInfo.name}</div>
              <div className="text-[10px]">{noteInfo.velocity}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPianoKeyboard = () => {
    const whiteKeys = [] as JSX.Element[];
    const blackKeys = [] as JSX.Element[];
    
    // Render 2 octaves starting from C4 (note 60)
    for (let octave = 0; octave < 2; octave++) {
      const baseNote = 60 + (octave * 12);
      
      // White keys
      [0, 2, 4, 5, 7, 9, 11].forEach((offset) => {
        whiteKeys.push(
          <div key={baseNote + offset} className="relative">
            {renderPianoKey(baseNote + offset)}
          </div>
        );
      });
      
      // Black keys
      [1, 3, 6, 8, 10].forEach(offset => {
        blackKeys.push(
          <div 
            key={baseNote + offset} 
            className="absolute"
            style={{ 
              left: `${(offset === 1 ? 8.5 : offset === 3 ? 25.5 : offset === 6 ? 56 : offset === 8 ? 73 : 90) + (octave * 84)}px`
            }}
          >
            {renderPianoKey(baseNote + offset, true)}
          </div>
        );
      });
    }

    return (
      <div className="relative flex bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <div className="flex relative">
          {whiteKeys}
          {blackKeys}
        </div>
      </div>
    );
  };

  const midiAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Online MIDI Tester',
    applicationCategory: 'WebApplication',
    operatingSystem: 'Any',
    url: 'https://www.gamepadtest.tech/midi-tester',
    description: 'Test MIDI keyboards, pads, and controllers online with real-time monitoring and optional sound.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  } as const;

  const midiBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gamepadtest.tech/' },
      { '@type': 'ListItem', position: 2, name: 'MIDI Tester', item: 'https://www.gamepadtest.tech/midi-tester' }
    ]
  } as const;

  const midiFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'How to test keyboard buttons online?', acceptedAnswer: { '@type': 'Answer', text: 'Press keys and watch the monitor update. Silent keys may indicate hardware or driver issues.' }},
      { '@type': 'Question', name: 'Controller not working test?', acceptedAnswer: { '@type': 'Answer', text: 'Run a connection check and verify device selection in your DAW and browser.' }},
      { '@type': 'Question', name: 'How do I test my keyboard online?', acceptedAnswer: { '@type': 'Answer', text: 'Connect your device, open the tester, and play—signals display in real time.' }},
      { '@type': 'Question', name: 'Keyboard troubleshooting online', acceptedAnswer: { '@type': 'Answer', text: 'Check channels, drivers, permissions, and DAW connections.' }}
    ]
  } as const;

  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>MIDI Tester – Test Your Keyboard, Pads & Controllers Online</title>
        <meta name="description" content="Test your MIDI keyboard, drum pads, and controllers online. Get instant note feedback, troubleshoot connection issues, and ensure your gear works perfectly." />
        <meta name="keywords" content="midi tester, midi device test, midi keyboard test, midi input monitor, midi controller test" />
        <link rel="canonical" href="https://www.gamepadtest.tech/midi-tester" />
        <script type="application/ld+json">{JSON.stringify(midiAppSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(midiBreadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(midiFAQ)}</script>
      </Helmet>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="h-8 w-8 text-purple-600 animate-bounce-in" />
            <h1 className="text-3xl font-bold animate-fade-in-right animate-stagger-1">MIDI Tester</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-stagger-2">
            Test your MIDI devices with real-time message monitoring, note visualization, and device detection.
          </p>
        </div>

        {!midiSupported ? (
          <Card className="mb-8 border-red-200 bg-red-50 animate-fade-in-up animate-stagger-3">
            <CardHeader>
              <CardTitle className="text-red-800">MIDI Not Available</CardTitle>
              <CardDescription className="text-red-700">
                {midiError || "Your browser doesn't support the Web MIDI API. Please use Chrome, Edge, or Opera for MIDI testing."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {/* Connection Status */}
            <Card className="mb-8 animate-fade-in-up animate-stagger-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className={`h-5 w-5 transition-colors duration-500 ${isConnected ? 'text-green-500 animate-pulse' : 'text-red-500'}`} />
                  MIDI Connection Status
                </CardTitle>
                <CardDescription>
                  {isConnected 
                    ? `Connected to MIDI system - ${devices.length} device(s) detected`
                    : 'Not connected to MIDI system'
                  }
                </CardDescription>
              </CardHeader>
              {!isConnected && (
                <CardContent>
                  <Button onClick={async () => { await markUserInteracted(); requestMIDIAccess(); }} className="gap-2">
                    <Zap className="h-4 w-4" />
                    Connect to MIDI
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Devices */}
            {devices.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>MIDI Devices</CardTitle>
                  <CardDescription>Connected MIDI input and output devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.map(device => (
                      <div key={device.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{device.name}</h4>
                          <div className="flex gap-2">
                            <Badge variant={device.type === 'input' ? 'default' : 'secondary'}>
                              {device.type}
                            </Badge>
                            <Badge variant={device.state === 'connected' ? 'default' : 'destructive'}>
                              {device.state}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>Manufacturer: {device.manufacturer}</div>
                          <div>Version: {device.version}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {devices.some(d => d.type === 'output') && (
                    <div className="mt-4">
                      <Button onClick={sendTestNote} variant="outline" className="gap-2">
                        <Piano className="h-4 w-4" />
                        Send Test Note
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Active Notes Display */}
            {activeNotes.size > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Active Notes</CardTitle>
                  <CardDescription>Currently pressed keys and their information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from(activeNotes.values()).map(note => (
                      <div key={note.note} className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {note.name}
                        </div>
                        <div className="text-sm text-purple-700">
                          <div>MIDI Note: {note.note}</div>
                          <div>Velocity: {note.velocity}</div>
                          <div>Frequency: {note.frequency.toFixed(1)}Hz</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Piano Visualization */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Piano Visualization</CardTitle>
                <CardDescription>Virtual piano showing active notes in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                {renderPianoKeyboard()}
              </CardContent>
            </Card>

            {/* Statistics */}
            {totalMessages > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>MIDI Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalMessages}</div>
                      <div className="text-sm text-blue-700">Total Messages</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{activeNotes.size}</div>
                      <div className="text-sm text-green-700">Active Notes</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {devices.filter(d => d.type === 'input' && d.state === 'connected').length}
                      </div>
                      <div className="text-sm text-purple-700">Active Inputs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Message Log */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>MIDI Message Log</CardTitle>
                    <CardDescription>Real-time MIDI message monitoring (last 50 messages)</CardDescription>
                  </div>
                  <Button onClick={clearMessages} variant="outline" size="sm">
                    Clear Log
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No MIDI messages received yet.</p>
                    <p className="text-sm">Connect a MIDI device and start playing to see messages here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {messages.map((message, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{message.type}</Badge>
                          <span>Ch: {message.channel}</span>
                          {message.note !== undefined && (
                            <span>Note: {message.note} ({getNoteInfo(message.note).name}{getNoteInfo(message.note).octave})</span>
                          )}
                          {message.velocity !== undefined && <span>Vel: {message.velocity}</span>}
                          {message.controller !== undefined && <span>CC: {message.controller}</span>}
                          {message.value !== undefined && <span>Val: {message.value}</span>}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {formatMIDIData(message.raw)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <RecommendedProductsSection title="Recommended Products" products={midiProducts} />
        {/* MIDI Tester: New SEO content */}
        <article className="mt-10 space-y-10 text-base leading-7">
          <section className="space-y-3" id="midi-tester-online">
            <h2 className="text-2xl font-bold">MIDI Tester Online – Check Your Devices Easily</h2>
            <p>
              If you're a musician, producer, or just someone who loves tinkering with gear, there's nothing worse than dealing with a keyboard, controller, or device that's acting up. Our MIDI tester lets you check every button, knob, and key in real-time without any hassle. No need for downloads or complicated setups—just a simple, free tool to make sure your setup is running smoothly.
            </p>
            <p>
              Whether you're breaking in a new keyboard or figuring out what's wrong with an older controller, our free MIDI Tester delivers quick feedback so you can get back to creating music instead of troubleshooting glitches.
            </p>
          </section>

          <section className="space-y-3" id="why-you-need-a-tester">
            <h3 className="text-xl font-semibold">Why You Need a MIDI Tester</h3>
            <p>
              Devices like these are at the core of so many music setups these days. Even one sticky key or unresponsive button can throw off your groove. That's where a keyboard checker online comes in handy—it helps you:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Spot-check every key, knob, and button to ensure they're responding right</li>
              <li>Keep an eye on signals as they happen to catch problems early</li>
              <li>Diagnose connection hiccups between your device and your software</li>
              <li>Steer clear of those little errors that can derail a whole recording session</li>
            </ul>
            <p>
              With our device checker, you've got an easy, dependable way to give your gear a quick once-over before you dive in, saving you time and sparing you the headache.
            </p>
          </section>

          <section className="space-y-3" id="features">
            <h3 className="text-xl font-semibold">Features of Our MIDI Tester</h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-semibold">Real-Time Monitoring</h4>
                <p>Our monitor displays every signal your device sends out right as it happens. It shows note on/off, control changes, and program shifts in real-time so you can spot glitches instantly.</p>
              </div>
              <div>
                <h4 className="font-semibold">Sound Feedback</h4>
                <p>Prefer to hear it for yourself? The MIDI test with sound plays back each input so you can listen in and tell if it's hardware, software, or a connection issue.</p>
              </div>
              <div>
                <h4 className="font-semibold">Works With Any Device</h4>
                <p>Whether it's a high-end controller or a simple keyboard, our MIDI Tester handles them all—across brands and models—without compatibility worries.</p>
              </div>
              <div>
                <h4 className="font-semibold">Easy to Use</h4>
                <p>The monitor is intuitive. Buttons and signals show up clearly, and you can start testing with just a few clicks.</p>
              </div>
              <div>
                <h4 className="font-semibold">Completely Free</h4>
                <p>Our free MIDI test is available to anyone, anytime. No accounts or signups—just open your browser and start checking your gear.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3" id="how-to-test">
            <h3 className="text-xl font-semibold">How to Test Your MIDI</h3>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-1">
              <li>Hook up your keyboard or controller to your computer.</li>
              <li>Open the <Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> in your browser.</li>
              <li>Pick your device from the list of detected hardware.</li>
              <li>Hit the keys, tweak the knobs, or slide the faders, and watch the monitor for signals.</li>
              <li>If something doesn't show up, check our FAQs or try basic troubleshooting.</li>
            </ol>
            <p>It's the simplest way to test a controller online—no extra apps or waiting around.</p>
          </section>

          <section className="space-y-4" id="faqs">
            <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">How to Test Keyboard Buttons Online?</h4>
                <p>Press each key on your keyboard and watch the monitor light up. If a key stays silent, it may be a hardware quirk or an outdated driver. Our keyboard tester online pinpoints which keys or buttons are failing.</p>
              </div>
              <div>
                <h4 className="font-semibold">Controller Not Working Test</h4>
                <p>If your controller isn't showing up on your computer or in your DAW, run a basic connection check. This helps determine whether it's hardware or a software clash.</p>
              </div>
              <div>
                <h4 className="font-semibold">How Do I Test My Keyboard Online?</h4>
                <p>Plug in your device, open our MIDI Tester, and start pressing keys. The device tester shows real-time signals, highlighting what's working and what needs attention.</p>
              </div>
              <div>
                <h4 className="font-semibold">Keyboard Troubleshooting Online</h4>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Keys or buttons that won't respond</li>
                  <li>Messed-up channels</li>
                  <li>DAW connection woes</li>
                </ul>
                <p>These quick tips often fix things fast—no pro repair needed.</p>
              </div>
              <div>
                <h4 className="font-semibold">Check Device Connection Online</h4>
                <p>Connection issues happen—use our tool to confirm signals are flowing and pinpoint weak spots.</p>
              </div>
              <div>
                <h4 className="font-semibold">Related Tools and Synonyms</h4>
                <p>Our platform doubles as a diagnostic tool, keyboard checker, signal test, and monitor online—terms people search for when they need this.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3" id="benefits">
            <h3 className="text-xl font-semibold">Benefits of Using a Monitor</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Instant insights on every key and control</li>
              <li>Fewer slip-ups in your recording sessions</li>
              <li>Easy spotting of wonky keys or buttons</li>
              <li>Quick checks for DAW compatibility</li>
            </ul>
            <p>Regular testing keeps your workflow smooth for top-notch productions.</p>
          </section>

          <section className="space-y-3" id="internal-links">
            <h3 className="text-xl font-semibold">Internal Links for Easy Navigation</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link> – Test your game controllers quickly.</li>
              <li><Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> – Verify your graphics card performance.</li>
              <li><Link to="/mic-tester" className="text-primary underline">Mic Tester Online</Link> – Ensure your microphone is working properly.</li>
            </ul>
            <p>Internal linking makes it easy to navigate and helps SEO.</p>
          </section>

          <section className="space-y-3" id="final-thoughts">
            <h3 className="text-xl font-semibold">Final Thoughts</h3>
            <p>
              Our MIDI tester online is a quick, trustworthy, and totally free resource for anyone with keyboards, controllers, or MIDI-capable devices. Whether you're after a monitor, keyboard tester online, or a diagnostic tool, our setup lets you verify every input in no time.
            </p>
          </section>
        </article>

      </div>
    </div>
  );
}
