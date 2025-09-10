import { useEffect, useState, useRef } from 'react';
import { Monitor, Zap, Info, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

interface GPUInfo {
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  maxTextureSize: number;
  maxVertexAttributes: number;
  maxFragmentUniforms: number;
  maxRenderBufferSize: number;
  maxCubeMapTextureSize: number;
  maxVertexTextureImageUnits: number;
  maxTextureImageUnits: number;
  maxViewportDims: number[];
  aliasedLineWidthRange: number[];
  aliasedPointSizeRange: number[];
}

interface BenchmarkResult {
  trianglesPerSecond: number;
  fps: number;
  duration: number;
  score: number;
}

export default function GpuTester() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gpuInfo, setGpuInfo] = useState<GPUInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    detectGPU();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const onLost = (e: Event) => {
      e.preventDefault();
      setIsTesting(false);
      setWebglSupported(false);
    };
    const onRestored = () => {
      setWebglSupported(true);
      detectGPU();
    };

    canvas.addEventListener('webglcontextlost', onLost as EventListener, { passive: false } as any);
    canvas.addEventListener('webglcontextrestored', onRestored as EventListener);

    return () => {
      canvas.removeEventListener('webglcontextlost', onLost as EventListener);
      canvas.removeEventListener('webglcontextrestored', onRestored as EventListener);
    };
  }, []);

  const getGL = (canvas: HTMLCanvasElement) => {
    // Prefer high-performance GPU if available
    const attrs: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      desynchronized: true as any,
    };
    return (canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs)) as WebGLRenderingContext | null;
  };

  const detectGPU = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const gl = getGL(canvas);

    if (!gl) {
      setWebglSupported(false);
      return;
    }

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info') as any;

    const info: GPUInfo = {
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
      maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
      maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
      aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
    };

    setGpuInfo(info);
  };

  const runBenchmark = async () => {
    if (!canvasRef.current || !webglSupported) return;

    setIsTesting(true);
    setTestProgress(0);
    setBenchmarkResult(null);

    const canvas = canvasRef.current;
    const gl = getGL(canvas);
    if (!gl) return;

    // match canvas size to display size for crisp rendering
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(384 * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec3 a_color;
      varying vec3 v_color;
      uniform vec2 u_resolution;
      uniform float u_time;

      void main() {
        vec2 position = a_position + sin(u_time * 3.0 + a_position.x * 0.01) * 4.0;
        vec2 zeroToOne = position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        v_color = a_color;
      }
    `;

    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      varying vec3 v_color;
      uniform float u_time;

      void main() {
        vec3 color = v_color + vec3(sin(u_time*0.9), sin(u_time*1.1), sin(u_time*1.3)) * 0.2;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Generate triangles based on canvas size
    const triangleCount = 12000;
    const vertices: number[] = [];

    for (let i = 0; i < triangleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = 4 + Math.random() * 12;

      vertices.push(
        x, y, Math.random(), Math.random(), Math.random(),
        x + size, y, Math.random(), Math.random(), Math.random(),
        x + size/2, y + size, Math.random(), Math.random(), Math.random()
      );
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 20, 0);

    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 20, 8);

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    const startTime = performance.now();
    let frameCount = 0;
    const duration = 5000; // 5 seconds

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      setTestProgress(Math.min(elapsed / duration, 1) * 100);

      if (elapsed < duration) {
        gl.clearColor(0.06, 0.06, 0.06, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform1f(timeLocation, elapsed * 0.001);
        gl.drawArrays(gl.TRIANGLES, 0, triangleCount * 3);

        frameCount++;
        requestAnimationFrame(animate);
      } else {
        const endTime = performance.now();
        const actualDuration = endTime - startTime;
        const fps = (frameCount / actualDuration) * 1000;
        const trianglesPerSecond = (triangleCount * frameCount / actualDuration) * 1000;
        const score = Math.min(Math.round(fps * trianglesPerSecond / 10000), 10000);

        setBenchmarkResult({
          trianglesPerSecond: Math.round(trianglesPerSecond),
          fps: Math.round(fps),
          duration: Math.round(actualDuration),
          score
        });

        setIsTesting(false);
        setTestProgress(100);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>Online GPU Tester | Check Graphics Instantly – GamepadTest</title>
        <meta name="description" content="Test your GPU online free. Detect overheating, glitches & performance issues in seconds. Safe, browser-based graphics card checker—try it now on GamepadTest." />
        <meta name="keywords" content="gpu tester, graphics card test, webgl benchmark, gpu performance test, graphics performance, hardware testing, gpu specs, rendering test" />
        <link rel="canonical" href="https://www.gamepadtest.tech/gpu-tester" />
      </Helmet>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Monitor className="h-8 w-8 text-green-600 animate-bounce-in" />
            <h1 className="text-3xl font-bold animate-fade-in-right animate-stagger-1">GPU Tester</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-stagger-2">
            Test your graphics card performance with advanced WebGL rendering benchmarks and hardware analysis.
          </p>
        </div>

        {!webglSupported ? (
          <Card className="mb-8 border-red-200 bg-red-50 animate-fade-in-up animate-stagger-3">
            <CardHeader>
              <CardTitle className="text-red-800">WebGL Not Supported</CardTitle>
              <CardDescription className="text-red-700">
                Your browser doesn't support WebGL or it's disabled. Please enable WebGL to use the GPU tester.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {/* GPU Information */}
            {gpuInfo && (
              <Card className="mb-8 animate-fade-in-up animate-stagger-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-green-600 transition-transform duration-300 hover:scale-125" />
                    Graphics Hardware Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold">GPU:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.renderer}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Vendor:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.vendor}</p>
                      </div>
                      <div>
                        <span className="font-semibold">WebGL Version:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.version}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Shading Language:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.shadingLanguageVersion}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold">Max Texture Size:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.maxTextureSize}px</p>
                      </div>
                      <div>
                        <span className="font-semibold">Max Viewport:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.maxViewportDims[0]} x {gpuInfo.maxViewportDims[1]}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Vertex Attributes:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.maxVertexAttributes}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Texture Units:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.maxTextureImageUnits}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benchmark Test */}
            <Card className="mb-8 animate-fade-in-up animate-stagger-4 hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600 transition-transform duration-300 hover:scale-125" />
                  Performance Benchmark
                </CardTitle>
                <CardDescription>
                  Run a WebGL rendering test to measure your GPU's performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={runBenchmark} 
                    disabled={isTesting}
                    className="gap-2"
                  >
                    {isTesting ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Benchmark
                      </>
                    )}
                  </Button>
                  
                  {isTesting && (
                    <div className="flex-1 max-w-md">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(testProgress)}%</span>
                      </div>
                      <Progress value={testProgress} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Canvas */}
                <div className="border rounded-lg overflow-hidden bg-gray-900">
                  <canvas 
                    ref={canvasRef}
                    className="w-full h-96 block"
                    style={{ maxWidth: '100%', height: '384px' }}
                  />
                </div>

                {/* Results */}
                {benchmarkResult && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {benchmarkResult.score}
                      </div>
                      <div className="text-sm text-green-700">Performance Score</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {benchmarkResult.fps}
                      </div>
                      <div className="text-sm text-blue-700">Average FPS</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(benchmarkResult.trianglesPerSecond / 1000).toFixed(1)}K
                      </div>
                      <div className="text-sm text-purple-700">Triangles/sec</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {(benchmarkResult.duration / 1000).toFixed(1)}s
                      </div>
                      <div className="text-sm text-orange-700">Test Duration</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Rating */}
            {benchmarkResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {benchmarkResult.score >= 5000 && (
                      <Badge className="bg-green-500">Excellent Performance</Badge>
                    )}
                    {benchmarkResult.score >= 3000 && benchmarkResult.score < 5000 && (
                      <Badge className="bg-blue-500">Good Performance</Badge>
                    )}
                    {benchmarkResult.score >= 1500 && benchmarkResult.score < 3000 && (
                      <Badge className="bg-yellow-500">Average Performance</Badge>
                    )}
                    {benchmarkResult.score < 1500 && (
                      <Badge className="bg-red-500">Below Average Performance</Badge>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {benchmarkResult.score >= 5000 && "Your GPU can handle demanding graphics tasks and modern games at high settings."}
                      {benchmarkResult.score >= 3000 && benchmarkResult.score < 5000 && "Your GPU performs well for most graphics tasks and games at medium-high settings."}
                      {benchmarkResult.score >= 1500 && benchmarkResult.score < 3000 && "Your GPU can handle basic graphics tasks and games at medium settings."}
                      {benchmarkResult.score < 1500 && "Your GPU may struggle with demanding graphics tasks. Consider upgrading for better performance."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
        {/* Comprehensive Guide & FAQs */}
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>GPU Testing Guide & FAQs</CardTitle>
            <CardDescription>Everything you need to know about testing your graphics card online</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-base leading-7">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Online GPU Tester – Check Your Graphics Card Instantly</h2>
              <p>
                Your graphics card is one of the most critical parts of your computer. Whether you’re a gamer, a video editor, a 3D designer, or someone who simply streams movies in high resolution, your GPU is constantly at work. It powers visuals, accelerates performance, and ensures smooth multitasking.
              </p>
              <p>
                But like any piece of hardware, a GPU isn’t immune to problems. Over time, you might notice your computer lagging, games crashing, or graphics not rendering properly. These symptoms often raise a frustrating question: is the issue with your software, your drivers, or the GPU itself?
              </p>
              <p>
                Instead of guessing, you can run a GPU test online free. Our tool makes it simple to check the health of your graphics card without installing bulky benchmarking programs. It works directly in your browser, giving you quick insights into how well your GPU is performing.
              </p>
              <div className="pt-2">
                <Button asChild className="gap-2">
                  <Link to="/gpu-tester">👉 Ready to begin? Start with our GPU Tester</Link>
                </Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Why Use an Online GPU Tester?</h3>
              <p>
                Unlike CPUs or RAM, which only face occasional stress, your GPU is pushed constantly. High-resolution displays, modern video games, 3D modeling software, and even basic streaming put heavy demands on it. If something goes wrong, your entire system performance can take a hit.
              </p>
              <p>Here’s why an online graphics card checker can be valuable:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Run a PC graphics card test online without downloading large files.</li>
                <li>Detect early signs of overheating before it damages your card.</li>
                <li>Identify glitches, visual artifacts, or driver conflicts.</li>
                <li>Compare your GPU’s stability across different workloads.</li>
                <li>Troubleshoot problems faster by ruling out hardware failure.</li>
              </ul>
              <p>
                👉 Not just GPUs—test other devices too with our <Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link>, <Link to="/mic-tester" className="text-primary underline">Mic Tester</Link>, and <Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link>.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">How Does an Online GPU Tester Work?</h3>
              <p>
                A GPU test website works by running lightweight graphical tasks directly in your browser. These tasks mimic real-life graphics rendering, though at a smaller scale than full benchmarks.
              </p>
              <p>During the test, the tool evaluates how your graphics card responds to different workloads. It typically measures:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Frame rate stability – Are frames being processed smoothly?</li>
                <li>Rendering accuracy – Do shapes, colors, and images display correctly?</li>
                <li>Response time – Does the GPU respond instantly to tasks?</li>
                <li>Visual artifacts – Are there random lines, flashing textures, or distortion?</li>
                <li>Thermal behavior – Does your GPU heat up unusually fast?</li>
              </ul>
              <p>
                Think of it like a health check. It doesn’t replace full professional stress tests, but it gives you an immediate sense of whether your graphics card is functioning properly.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">When Should You Test Your GPU?</h3>
              <p>You don’t need to wait for a major crash to run a graphics card tester online. In fact, testing regularly can help you catch problems early.</p>
              <p>Here are common signs it’s time to run a GPU checker online:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Sudden crashes during games or creative work – Your system shuts down or freezes mid-task.</li>
                <li>Visual distortions – You see strange colors, lines, or flickering.</li>
                <li>Performance drops – Games that used to run smoothly now stutter or lag.</li>
                <li>Fan noise and overheating – Your GPU fans spin loudly even during light use.</li>
                <li>Driver conflicts – After updating drivers, your system becomes unstable.</li>
                <li>Black screens – Display randomly cuts out during gameplay or video playback.</li>
              </ul>
              <p>By running a quick graphics card checker online, you’ll know whether your GPU is the culprit or if the problem lies elsewhere.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Advantages of an Online GPU Tester</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>No installation required – Just open the website and start.</li>
                <li>Cross-platform – Works on Windows, macOS, Linux, and even laptops.</li>
                <li>Fast and simple – Results in minutes instead of hours.</li>
                <li>Safe to use – No risk of downloading malware or unnecessary files.</li>
                <li>Completely free – No hidden costs or paywalls.</li>
              </ul>
              <p>For anyone who needs a quick check, this is the fastest way to verify GPU health.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">How to Use the GPU Tester</h3>
              <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
                <li>Open the <Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> in your browser.</li>
                <li>Grant permission for the tool to access your GPU.</li>
                <li>Watch as test patterns and graphics run on your screen.</li>
                <li>Review the displayed data, including frame rates and rendering quality.</li>
                <li>Look for signs of errors such as stuttering, glitches, or inconsistent frame output.</li>
              </ol>
              <p>
                If everything looks smooth, your GPU is likely fine. But if you see unusual results, you may need to troubleshoot further.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Common GPU Problems a Test Can Reveal</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">1. Overheating</h4>
                  <p>GPUs naturally get hot, but excessive temperatures can damage them permanently. If the test shows rising heat even during simple tasks, you may need to:</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Clean your PC’s fans and vents.</li>
                    <li>Reapply thermal paste.</li>
                    <li>Improve airflow inside your case.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">2. Driver Issues</h4>
                  <p>Sometimes the hardware is fine, but outdated or corrupted drivers cause problems. Updating to the latest drivers often fixes:</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Black screens.</li>
                    <li>Random crashes.</li>
                    <li>Poor performance in games.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">3. Hardware Failure</h4>
                  <p>Artifacts—like random colored lines, flashing textures, or pixelation—are usually signs of failing VRAM or GPU circuitry.</p>
                </div>
                <div>
                  <h4 className="font-semibold">4. Underperformance</h4>
                  <p>If your GPU performs much worse than expected in a PC graphics card test online, it might be throttling due to:</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Power supply issues.</li>
                    <li>Thermal limits.</li>
                    <li>Background software interfering with performance.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Online GPU Checker vs Full Benchmarks</h3>
              <p>
                It’s important to understand the difference between an online graphics card checker and full stress-testing benchmarks.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><span className="font-semibold">GPU Checker Online</span> – Quick, light, safe, browser-based. Perfect for spotting obvious problems, checking stability, and peace of mind.</li>
                <li><span className="font-semibold">Professional Benchmarks</span> – Heavy-duty software that pushes your GPU to maximum load. Better for competitive gamers, overclockers, or hardware reviewers.</li>
              </ul>
              <p>For everyday use, online GPU testing is more than enough.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Troubleshooting After a GPU Test</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Clean your system – Dust buildup causes overheating.</li>
                <li>Update drivers – Always download from official NVIDIA or AMD websites.</li>
                <li>Check power supply – A weak PSU may not deliver enough power to your GPU.</li>
                <li>Lower graphics settings – Reduce strain by adjusting in-game visuals.</li>
                <li>Test on another machine – If the GPU works elsewhere, your motherboard or PSU may be the issue.</li>
              </ul>
              <p>If problems continue, the card may need professional repair—or replacement if it’s older.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold">Internal Tools for Complete Device Testing</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><Link to="/gamepad-tester" className="text-primary underline">Gamepad Tester</Link> – Check your PS4, PS5, Xbox, and PC controllers.</li>
                <li><Link to="/mic-tester" className="text-primary underline">Mic Tester</Link> – Make sure your microphone works before meetings or streams.</li>
                <li><Link to="/midi-tester" className="text-primary underline">MIDI Tester</Link> – Musicians can test keyboards, drum pads, and MIDI controllers.</li>
                <li><Link to="/about" className="text-primary underline">About</Link> – Learn more about our mission and tools.</li>
                <li><Link to="/contact" className="text-primary underline">Contact</Link> – Reach us for support.</li>
                <li><Link to="/blog" className="text-primary underline">Blog</Link> – Find tutorials, troubleshooting guides, and hardware tips.</li>
              </ul>
              <p>This makes our site a one-stop resource for device diagnostics.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">FAQs</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">1. Can I test GPU online for free?</h3>
                  <p>Yes. Our <Link to="/gpu-tester" className="text-primary underline">GPU Tester</Link> lets you run a GPU test online free, right from your browser.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">2. Does this work with all graphics cards?</h3>
                  <p>The tool supports most modern GPUs, including dedicated and integrated cards.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">3. Is an online graphics card checker safe?</h3>
                  <p>Absolutely. Since it runs in your browser, there’s no risk of malware or unwanted installations.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">4. Can I use this on laptops?</h3>
                  <p>Yes. Laptops with integrated or dedicated GPUs can be tested the same way.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">5. How do I know if my GPU is failing?</h3>
                  <p>Look for warning signs like overheating, visual glitches, crashes, or unusual performance drops during testing.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Conclusion</h2>
              <p>
                Your graphics card is the backbone of your computer’s visual performance. Whether you’re gaming, editing videos, or simply browsing, a failing GPU can disrupt your entire workflow.
              </p>
              <p>
                By running a PC graphics card test online, you get instant insights into your GPU’s condition. You’ll know whether your graphics card is healthy, overheating, underperforming, or showing early signs of failure.
              </p>
              <p>Don’t wait until crashes become frequent or performance plummets. Test your GPU online today and get peace of mind.</p>
              <div className="pt-2 flex flex-wrap gap-2">
                <Button asChild className="gap-2">
                  <Link to="/gpu-tester">👉 Start now with our GPU Tester</Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/gamepad-tester">Explore Gamepad Tester</Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/mic-tester">Explore Mic Tester</Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/midi-tester">Explore MIDI Tester</Link>
                </Button>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
