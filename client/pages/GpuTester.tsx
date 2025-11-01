import { useEffect, useState, useRef } from "react";
import { Monitor, Zap, Info, Play, Pause } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { RecommendedProductsSection } from "@/components/RecommendedProducts";
import { GpuBenchmarkAnimation } from "@/components/GpuBenchmarkAnimation";

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

interface DisplayMetrics {
  width: number;
  height: number;
  effectiveWidth: number;
  effectiveHeight: number;
  colorDepth: number;
  pixelRatio: number;
}

interface BenchmarkResult {
  trianglesPerSecond: number;
  fps: number;
  duration: number;
  score: number;
  fillRate: number;
  renderWidth: number;
  renderHeight: number;
}

export default function GpuTester() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gpuInfo, setGpuInfo] = useState<GPUInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [benchmarkResult, setBenchmarkResult] =
    useState<BenchmarkResult | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const [webglSupported, setWebglSupported] = useState(true);
  const [displayMetrics, setDisplayMetrics] = useState<DisplayMetrics>({
    width: 0,
    height: 0,
    effectiveWidth: 0,
    effectiveHeight: 0,
    colorDepth: 0,
    pixelRatio: 1,
  });

  useEffect(() => {
    const updateMetrics = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const width = Math.round(window.innerWidth);
      const height = Math.round(window.innerHeight);
      setDisplayMetrics({
        width,
        height,
        effectiveWidth: Math.round(width * pixelRatio),
        effectiveHeight: Math.round(height * pixelRatio),
        colorDepth: window.screen?.colorDepth || 24,
        pixelRatio,
      });
    };

    updateMetrics();
    window.addEventListener("resize", updateMetrics);

    return () => {
      window.removeEventListener("resize", updateMetrics);
    };
  }, []);

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

    canvas.addEventListener(
      "webglcontextlost",
      onLost as EventListener,
      { passive: false } as any,
    );
    canvas.addEventListener(
      "webglcontextrestored",
      onRestored as EventListener,
    );

    return () => {
      canvas.removeEventListener("webglcontextlost", onLost as EventListener);
      canvas.removeEventListener(
        "webglcontextrestored",
        onRestored as EventListener,
      );
    };
  }, []);

  const formatCompactNumber = (value: number) =>
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  const getGL = (canvas: HTMLCanvasElement) => {
    // Prefer high-performance GPU if available
    const attrs: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      desynchronized: true as any,
    };
    return (canvas.getContext("webgl", attrs) ||
      canvas.getContext(
        "experimental-webgl",
        attrs,
      )) as WebGLRenderingContext | null;
  };

  const detectGPU = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const gl = getGL(canvas);

    if (!gl) {
      setWebglSupported(false);
      return;
    }

    const debugInfo = (gl as WebGLRenderingContext).getExtension(
      "WEBGL_debug_renderer_info",
    ) as any;

    const info: GPUInfo = {
      vendor: debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : gl.getParameter(gl.VENDOR),
      renderer: debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
      maxVertexTextureImageUnits: gl.getParameter(
        gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS,
      ),
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
    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const colorLocation = gl.getAttribLocation(program, "a_color");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

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
        x,
        y,
        Math.random(),
        Math.random(),
        Math.random(),
        x + size,
        y,
        Math.random(),
        Math.random(),
        Math.random(),
        x + size / 2,
        y + size,
        Math.random(),
        Math.random(),
        Math.random(),
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
        const trianglesPerSecond =
          ((triangleCount * frameCount) / actualDuration) * 1000;
        const score = Math.min(
          Math.round((fps * trianglesPerSecond) / 10000),
          10000,
        );
        const fillRate = fps * canvas.width * canvas.height;

        setBenchmarkResult({
          trianglesPerSecond: Math.round(trianglesPerSecond),
          fps: Math.round(fps),
          duration: Math.round(actualDuration),
          score,
          fillRate: Math.round(fillRate),
          renderWidth: canvas.width,
          renderHeight: canvas.height,
        });

        setIsTesting(false);
        setTestProgress(100);
      }
    };

    requestAnimationFrame(animate);
  };

  const recommendedProducts = [
    {
      name: "MSI Gaming GeForce GT 710 2GB GDRR3 64-bit HDCP Support DirectX 12 OpenGL 4.5 Single Fan Low Profile Graphics Card (GT 710 2GD3 LP)",
      description:
        "Reliable entry-level graphics card for everyday use, light gaming, and multi-display setups. Low-profile design fits compact PCs.",
      href: "https://amzn.to/4mjlF3p",
      imageSrc:
        "https://m.media-amazon.com/images/I/61XV8hG5mtL._AC_SL1200_.jpg",
      alt: "MSI Gaming GeForce GT 710 2GB GDRR3",
    },
    {
      name: "MSI Gaming GeForce RTX 3060 12GB 15 Gbps GDRR6 192-Bit HDMI/DP PCIe 4 Torx Twin Fan Ampere OC Graphics Card",
      description:
        "Powerful mid-range GPU with 12GB GDDR6, ray tracing, and DLSS support for smooth 1080p and 1440p gaming.",
      href: "https://amzn.to/41Q21EP",
      imageSrc:
        "https://m.media-amazon.com/images/I/71tduSp8ooL._AC_SL1500_.jpg",
      alt: "MSI Gaming GeForce RTX 3060 12GB 15 Gbps GDRR6",
    },
    {
      name: "ASUS Dual NVIDIA GeForce RTX 3050 6GB OC Edition Gaming Graphics Card - PCIe 4.0, 6GB GDDR6 Memory, HDMI 2.1, DisplayPort 1.4a, 2-Slot Design",
      description:
        "Dual-fan cooling, 6GB GDDR6 memory, and PCIe 4.0 support for efficient, quiet 1080p gaming performance.",
      href: "https://amzn.to/46l2Err",
      imageSrc:
        "https://m.media-amazon.com/images/I/81mwcITtHBL._AC_SL1500_.jpg",
      alt: "ASUS Dual NVIDIA GeForce RTX 3050 6GB OC",
    },
  ];

  const gpuAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Online GPU Tester",
    applicationCategory: "WebApplication",
    operatingSystem: "Any",
    url: "https://www.gamepadtest.tech/gpu-tester",
    description:
      "Test your GPU online free. Detect overheating, glitches & performance issues in seconds.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  } as const;

  const gpuBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.gamepadtest.tech/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "GPU Tester",
        item: "https://www.gamepadtest.tech/gpu-tester",
      },
    ],
  } as const;

  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>
          GPU Tester – Free Online Graphics Card Benchmark & Checker
        </title>
        <meta
          name="description"
          content="Run a quick GPU test online to check performance, temps, FPS, and stability. Works with NVIDIA, AMD, and integrated graphics — no download needed."
        />
        <meta
          name="keywords"
          content="gpu tester, graphics card test, webgl benchmark, gpu performance test, graphics performance, hardware testing, gpu specs, rendering test"
        />
        <link rel="canonical" href="https://www.gamepadtest.tech/gpu-tester" />
        <script type="application/ld+json">
          {JSON.stringify(gpuAppSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(gpuBreadcrumb)}
        </script>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Monitor className="h-8 w-8 text-green-600 animate-bounce-in" />
            <h1 className="text-3xl font-bold animate-fade-in-right animate-stagger-1">
              GPU Tester
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-stagger-2">
            Test your graphics card performance with advanced WebGL rendering
            benchmarks and hardware analysis.
          </p>
        </div>

        {!webglSupported ? (
          <Card className="mb-8 border-red-200 bg-red-50 animate-fade-in-up animate-stagger-3">
            <CardHeader>
              <CardTitle className="text-red-800">
                WebGL Not Supported
              </CardTitle>
              <CardDescription className="text-red-700">
                Your browser doesn't support WebGL or it's disabled. Please
                enable WebGL to use the GPU tester.
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
                        <p className="text-sm text-muted-foreground">
                          {gpuInfo.renderer}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold">Vendor:</span>
                        <p className="text-sm text-muted-foreground">
                          {gpuInfo.vendor}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold">WebGL Version:</span>
                        <p className="text-sm text-muted-foreground">
                          {gpuInfo.version}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold">Shading Language:</span>
                        <p className="text-sm text-muted-foreground">
                          {gpuInfo.shadingLanguageVersion}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold">Max Texture Size:</span>
                        <p className="text-sm text-muted-foreground">
                          {gpuInfo.maxTextureSize}px
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold">Max Viewport:</span>
                        <p className="text-sm text-muted-foreground">
                          {gpuInfo.maxViewportDims[0]} x{" "}
                          {gpuInfo.maxViewportDims[1]}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold">
                          Vertex Attributes:
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {gpuInfo.maxVertexAttributes}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold">Texture Units:</span>
                        <p className="text-sm text-muted-foreground">
                          {gpuInfo.maxTextureImageUnits}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mb-8 animate-fade-in-up">
              <CardHeader>
                <CardTitle>Live Metrics Overview</CardTitle>
                <CardDescription>
                  Current display settings and your most recent benchmark
                  highlights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Current Resolution
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {displayMetrics.width
                        ? `${displayMetrics.width} x ${displayMetrics.height}px`
                        : "Detecting..."}
                    </p>
                    {displayMetrics.width ? (
                      <p className="text-xs text-slate-500">
                        Effective {displayMetrics.effectiveWidth} x{" "}
                        {displayMetrics.effectiveHeight}px @{" "}
                        {displayMetrics.pixelRatio.toFixed(2)}x
                      </p>
                    ) : null}
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-emerald-600">
                      Color Depth
                    </p>
                    <p className="text-lg font-semibold text-emerald-700">
                      {displayMetrics.colorDepth
                        ? `${displayMetrics.colorDepth}-bit`
                        : "Detecting..."}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-blue-600">
                      Max Texture Size
                    </p>
                    <p className="text-lg font-semibold text-blue-700">
                      {gpuInfo ? `${gpuInfo.maxTextureSize}px` : "Enable WebGL"}
                    </p>
                  </div>
                  <div className="bg-violet-50 p-4 rounded-lg shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-violet-600">
                      Last Measured FPS
                    </p>
                    <p className="text-lg font-semibold text-violet-700">
                      {benchmarkResult
                        ? `${benchmarkResult.fps}`
                        : "Run the benchmark"}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-orange-600">
                      Fill Rate
                    </p>
                    <p className="text-lg font-semibold text-orange-700">
                      {benchmarkResult
                        ? `${formatCompactNumber(benchmarkResult.fillRate)} px/s`
                        : "Run the benchmark"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                <div className="relative border rounded-lg overflow-hidden bg-gray-900">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-96 block"
                    style={{ maxWidth: "100%", height: "384px" }}
                  />
                  <GpuBenchmarkAnimation
                    isRunning={isTesting}
                    progress={testProgress}
                  />
                </div>

                {/* Results */}
                {benchmarkResult && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {benchmarkResult.score}
                      </div>
                      <div className="text-sm text-green-700">
                        Performance Score
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {benchmarkResult.fps}
                      </div>
                      <div className="text-sm text-blue-700">Average FPS</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(benchmarkResult.trianglesPerSecond / 1000).toFixed(1)}
                        K
                      </div>
                      <div className="text-sm text-purple-700">
                        Triangles/sec
                      </div>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-teal-600">
                        {formatCompactNumber(benchmarkResult.fillRate)}
                      </div>
                      <div className="text-sm text-teal-700">
                        Pixels/sec Fill Rate
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {(benchmarkResult.duration / 1000).toFixed(1)}s
                      </div>
                      <div className="text-sm text-orange-700">
                        Test Duration
                      </div>
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
                      <Badge className="bg-green-500">
                        Excellent Performance
                      </Badge>
                    )}
                    {benchmarkResult.score >= 3000 &&
                      benchmarkResult.score < 5000 && (
                        <Badge className="bg-blue-500">Good Performance</Badge>
                      )}
                    {benchmarkResult.score >= 1500 &&
                      benchmarkResult.score < 3000 && (
                        <Badge className="bg-yellow-500">
                          Average Performance
                        </Badge>
                      )}
                    {benchmarkResult.score < 1500 && (
                      <Badge className="bg-red-500">
                        Below Average Performance
                      </Badge>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {benchmarkResult.score >= 5000 &&
                        "Your GPU can handle demanding graphics tasks and modern games at high settings."}
                      {benchmarkResult.score >= 3000 &&
                        benchmarkResult.score < 5000 &&
                        "Your GPU performs well for most graphics tasks and games at medium-high settings."}
                      {benchmarkResult.score >= 1500 &&
                        benchmarkResult.score < 3000 &&
                        "Your GPU can handle basic graphics tasks and games at medium settings."}
                      {benchmarkResult.score < 1500 &&
                        "Your GPU may struggle with demanding graphics tasks. Consider upgrading for better performance."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
        <RecommendedProductsSection products={recommendedProducts} />
        {/* Guide: Online GPU Tester – Free GPU Stress Test & Graphics Card Checker */}
        <section className="mt-10 space-y-8 text-base leading-7">
          <header className="space-y-3">
            <h2 className="text-2xl font-bold">
              Online GPU Tester – Free GPU Stress Test & Graphics Card Checker
            </h2>
            <p>
              A GPU tester — sometimes called a{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                graphics card checker
              </Link>{" "}
              — is a tool that evaluates the performance, stability, and health
              of your graphics processing unit. Whether you're running a quick
              benchmark or a full-blown stress session, a Graphics Processing
              Unit tester gives you insights into how well your GPU handles
              real-world loads.
            </p>
            <p>
              These tests help detect issues like overheating, rendering errors,
              or under-utilization before they start affecting your gaming or
              creative work. A{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                GPU tester online
              </Link>
              , or browser-based GPU checker, is especially helpful because it
              doesn't require installation. You can run a{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                gpu stress test online
              </Link>{" "}
              or a simple{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                gpu test online
              </Link>{" "}
              using your web browser.
 
         <section className="space-y-2">
            <h3 className="text-xl font-semibold">FAQs – GPU Testing Online</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">

              <li>
                <strong>Q: Can I test my NVIDIA GPU using this tool?</strong>
                <br />
                Yes — the online GPU tester supports most NVIDIA graphics cards,
                including older and newer models.
              </li>
              <li>
                <strong>
                  Q: Is there any risk to running a browser-based stress test?
                </strong>
                <br />
                Very little. WebGL-based stress tests are generally safe and run
                within browser security constraints. They won't overclock or
                permanently change your hardware settings.
              </li>
              <li>
                <strong>
                  Q: How accurate are online GPU test results compared to full
                  benchmarking software?
                </strong>
                <br />
                Browser-based GPU tests provide a good estimate of real-world
                performance, but downloadable benchmarks (like 3DMark or
                Unigine) offer more detailed load patterns and specialized
                workloads.
              </li>
              <li>
                <strong>
                  Q: Can I test both GPU and CPU together with the same tool?
                </strong>
                <br />
                Some combined online testers measure both graphics and compute
                performance. For dedicated{" "}
                <Link to="/gpu-tester" className="text-primary underline">
                  pc stress test
                </Link>{" "}
                coverage, you may need a separate tool.
              </li>
              <li>
                <strong>Q: How often should I run a GPU stress test?</strong>
                <br />A monthly or quarterly check is sufficient for most users.
                Run tests after significant changes — like driver updates,
                overclocking, or hardware upgrades.
              </li>

              <li><strong>Q: Can I test my NVIDIA GPU using this tool?</strong><br />Yes — the online GPU tester supports most NVIDIA graphics cards, including older and newer models.</li>
              <li><strong>Q: Is there any risk to running a browser-based stress test?</strong><br />Very little. WebGL-based stress tests are generally safe and run within browser security constraints. They won't overclock or permanently change your hardware settings.</li>
              <li><strong>Q: How accurate are online GPU test results compared to full benchmarking software?</strong><br />Browser-based GPU tests provide a good estimate of real-world performance, but downloadable benchmarks (like 3DMark or Unigine) offer more detailed load patterns and specialized workloads.</li>
              <li><strong>Q: Can I test both GPU and CPU together with the same tool?</strong><br />Some combined online testers measure both graphics and compute performance. For dedicated <Link to="/gpu-tester" className="text-primary underline">pc stress test</Link> coverage, you may need a separate tool.</li>
              <li><strong>Q: How often should I run a GPU stress test?</strong><br />A monthly or quarterly check is sufficient for most users. Run tests after significant changes — like driver updates, overclocking, or hardware upgrades.</li>

            </ul>
          </section>

          <footer className="space-y-2">
            <h3 className="text-xl font-semibold">Final Thoughts</h3>
            <p>

              A{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                gpu tester online
              </Link>{" "}
              is a powerful and accessible way to understand your graphics
              card's real-world performance and stability. Running a{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                gpu stress test online
              </Link>{" "}
              helps you detect overheating, instability, or other issues before
              they impact your gaming or productivity.
            </p>
            <p>
              With our browser-based tool, there's no installation fuss — just
              real-time metrics, accurate graphics stress, and clear insights.
              Whether you're maintaining your current setup or considering an
              upgrade, regular GPU testing ensures your system remains reliable
              and performs at its best when you need it most.

              A <Link to="/gpu-tester" className="text-primary underline">gpu tester online</Link> is a powerful and accessible way to understand your graphics card's real-world performance and stability. Running a <Link to="/gpu-tester" className="text-primary underline">gpu stress test online</Link> helps you detect overheating, instability, or other issues before they impact your gaming or productivity.
            </p>
            <p>
              With our browser-based tool, there's no installation fuss — just real-time metrics, accurate graphics stress, and clear insights. Whether you're maintaining your current setup or considering an upgrade, regular GPU testing ensures your system remains reliable and performs at its best when you need it most.

            </p>
          </footer>
        </section>
      </div>
    </div>
  );
}
