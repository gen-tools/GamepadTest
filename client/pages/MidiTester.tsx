import { useEffect, useState, useCallback, useRef } from 'react';
import { Music, Piano, Volume2, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { RecommendedProductsSection } from '@/components/RecommendedProducts';

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

  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>Online MIDI Tester | Check & Monitor MIDI Devices Free</title>
        <meta name="description" content="Test your MIDI keyboard, drum pad, or controller online—free & secure. Monitor signals, hear notes, and troubleshoot devices instantly on GamepadTest." />
        <meta name="keywords" content="midi tester, midi device test, midi keyboard test, midi input monitor, midi controller test, midi message analyzer" />
        <link rel="canonical" href="https://www.gamepadtest.tech/midi-tester" />
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

        <RecommendedProductsSection />
        {/* Comprehensive Guide & FAQs */}
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>MIDI Testing Guide & FAQs</CardTitle>
            <CardDescription>Learn how to test and monitor your MIDI devices online</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-base leading-7">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">MIDI Tester Online – Check and Monitor Your MIDI Devices</h2>
              <p>
                Musicians and producers rely on MIDI devices every day. Whether it’s a keyboard, drum pad, or controller, the smooth flow of MIDI signals makes the difference between a perfect session and endless frustration. A broken key or unresponsive pad can ruin creativity in seconds. That’s why having a MIDI tester online is so useful.
              </p>
              <p>
                Our free MIDI tester helps you check if your instrument or controller is sending signals properly. You can use it in your browser without installing anything. Just connect your device, open the tool, and start pressing keys or pads. Each signal shows up instantly. If you hear sound through the MIDI tester with sound feature, you know everything is working.
              </p>
              <div className="pt-2">
                <Button asChild className="gap-2">
                  <Link to="/midi-tester">👉 Try it now: MIDI Tester</Link>
                </Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">What Is a MIDI Tester</h3>
              <p>
                A MIDI tester is a tool that shows whether your MIDI device is sending the right data. Every time you hit a note, press a button, or move a slider, the device sends a MIDI message. The tester captures those signals and displays them in real time.
              </p>
              <p>
                Our tool acts like a simple MIDI monitor. You don’t need advanced software or a complicated setup. It’s designed for quick checks so you can spend less time troubleshooting and more time making music.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Why Musicians Need a MIDI Device Tester</h3>
              <p>There are plenty of moments when a MIDI device tester becomes essential. Maybe your keyboard suddenly stops responding in your DAW. Maybe a drum pad keeps triggering two notes instead of one. Or maybe you’re setting up a new controller and want to be sure it works before a live show.</p>
              <p>Testing with a MIDI monitor online gives you instant answers:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Confirm that keys and pads are working before recording</li>
                <li>Check velocity sensitivity and button response</li>
                <li>Verify if your DAW problem comes from the device or the software</li>
                <li>Test new equipment as soon as it arrives</li>
                <li>Troubleshoot cables and USB connections</li>
              </ul>
              <p>Instead of guessing what’s wrong, you can see each MIDI message appear in real time.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">How the Online MIDI Tester Works</h3>
              <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
                <li>Open the <Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> page in your browser.</li>
                <li>Connect your MIDI device with USB or interface.</li>
                <li>Choose your device from the list if needed.</li>
                <li>Press keys, hit pads, or move controls.</li>
                <li>The tester displays every MIDI signal and, if enabled, plays sound for each note.</li>
              </ol>
              <p>
                This way, you can confirm that the hardware is sending proper MIDI data. The MIDI monitor online output makes it clear if certain notes are stuck, not responding, or sending double triggers.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Features of the Free MIDI Tester</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Real-time MIDI monitoring – see every signal as you play</li>
                <li>Sound feedback option – hear notes while you test</li>
                <li>Cross-platform use – works on Windows, macOS, Linux, and even mobile browsers</li>
                <li>Free forever – no sign-ups, no downloads</li>
                <li>Simple interface – designed to work without technical knowledge</li>
              </ul>
              <p>Whether you want a MIDI monitor for a studio setup or a MIDI tester with sound for live gear, this tool covers the basics.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">When to Use a MIDI Tester</h3>
              <p>You don’t have to wait until gear fails completely. Running quick checks saves time in the studio and on stage. Common use cases include:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Before live performances to avoid technical surprises</li>
                <li>During studio sessions when a controller is unresponsive</li>
                <li>After buying a new keyboard or pad controller</li>
                <li>While teaching music to confirm student devices work</li>
                <li>After system updates that may affect MIDI connections</li>
              </ul>
              <p>Musicians often rely on intuition, but testing your setup with a MIDI monitor online ensures your creativity isn’t interrupted.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Troubleshooting with a MIDI Monitor</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold">Connection problems</h4>
                  <p>Check your USB cable or MIDI interface. Sometimes the simplest fix is swapping the cable.</p>
                </div>
                <div>
                  <h4 className="font-semibold">Driver or permission issues</h4>
                  <p>Some systems require drivers or access permissions. Make sure the browser has access to MIDI devices.</p>
                </div>
                <div>
                  <h4 className="font-semibold">Device not recognized</h4>
                  <p>Unplug and reconnect your device, then refresh the MIDI tester online page.</p>
                </div>
                <div>
                  <h4 className="font-semibold">Wrong MIDI channel</h4>
                  <p>Certain devices send data on specific channels. Switch channels in your device settings if needed.</p>
                </div>
              </div>
              <p>
                Using a simple MIDI monitor helps narrow down the issue. If the tester shows signals but your DAW does not, the problem is software-related. If nothing shows in the tester, the device may be at fault.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Advantages of Using a MIDI Tester Online</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Quick access – open your browser and start testing</li>
                <li>No setup – no downloads or complicated installations</li>
                <li>Universal – works on different operating systems</li>
                <li>Portable – test your gear on any computer without installing apps</li>
              </ul>
              <p>
                For musicians on the go, a free MIDI tester is especially helpful. You can plug into any machine and verify your gear within seconds.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Other Device Testing Tools You Might Need</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link> – test PlayStation, Xbox, and PC controllers online</li>
                <li><Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> – run a gpu test online and check graphics card performance</li>
                <li><Link to="/mic-tester" className="text-primary underline">Mic Tester</Link> – quickly confirm your microphone is working</li>
                <li><Link to="/about" className="text-primary underline">About</Link> – learn more about our tools and mission</li>
                <li><Link to="/contact" className="text-primary underline">Contact</Link> – reach out if you have questions or suggestions</li>
                <li><Link to="/blog" className="text-primary underline">Blog</Link> – read tutorials, tips, and guides for musicians and gamers</li>
              </ul>
              <p>Each tool is browser-based, safe, and free to use.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">How do I test my MIDI device online</h3>
                  <p>Open the <Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link>, connect your device, and start pressing keys or pads. The signals appear instantly.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Does the MIDI tester online produce sound</h3>
                  <p>Yes, you can enable the MIDI tester with sound option to hear notes while testing.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Can I use this with drum pads and controllers</h3>
                  <p>Absolutely. The MIDI device tester works with keyboards, drum machines, pad controllers, and other MIDI gear.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Is the free MIDI tester safe</h3>
                  <p>Yes. It runs directly in your browser and does not save or record your input.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">What is the difference between a MIDI tester and a MIDI monitor</h3>
                  <p>They are nearly the same. A MIDI monitor focuses on displaying data, while a MIDI tester often adds sound feedback so you can hear notes as well.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Conclusion</h2>
              <p>
                MIDI is the language of modern music production. When devices fail, creativity stalls. Instead of wasting time guessing why your keyboard or pad isn’t working, use our MIDI tester online. It gives you quick, clear feedback about your gear.
              </p>
              <p>
                Whether you need a simple MIDI monitor for troubleshooting, a MIDI tester with sound for live feedback, or just a free tool to confirm your setup, this page has you covered.
              </p>
              <p>
                Open the <Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> now and run your first test. And if you want to make sure the rest of your setup is working, check out our <Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link>, <Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link>, and <Link to="/mic-tester" className="text-primary underline">Mic Tester</Link>. Our goal is to provide simple tools that help musicians and gamers stay focused on what matters most: creating and playing without interruptions.
              </p>
            </section>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
