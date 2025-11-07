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
          content="GPU tester for quick, reliable graphics card checks. Run free online GPU stress tests to measure performance, stability, and FPS—no installation needed."
        />
        <meta
          name="keywords"
          content="gpu tester, graphics card test, webgl benchmark, gpu performance test, graphics performance"
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
            </p>
          </header>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">
              Why Choose Our GPU Tester?
            </h3>
            <p>
              Choosing our{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                gpu tester tool
              </Link>{" "}
              means getting reliable, fast, and accessible diagnostics without
              the hassle. Our platform combines a free, browser-based approach
              with a professional-grade engine built on WebGL.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>
                Run a{" "}
                <Link to="/gpu-tester" className="text-primary underline">
                  free GPU tester
                </Link>{" "}
                in just a few seconds with real-time metrics
              </li>
              <li>
                No downloads or installations required — everything happens
                securely in your browser
              </li>
              <li>
                Clear performance feedback and stability insights for gamers and
                developers
              </li>
              <li>No sign-ups or hidden costs — completely free to use</li>
            </ul>
            <p className="text-muted-foreground">
              Whether you're a casual gamer, a developer, or someone who
              recently overclocked their rig, our{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                GPU checker online
              </Link>{" "}
              offers the clarity you need.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">
              How Does a GPU Tester Work?
            </h3>
            <p>
              Under the hood, our{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                graphic card checker
              </Link>{" "}
              leverages WebGL (or WebGPU, when available) to render complex 3D
              scenes. As it runs, it measures frames per second (FPS), frame
              times, and workload consistency.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>
                Pushes your GPU through demanding workloads to simulate
                real-world stress
              </li>
              <li>
                Shows live charts for FPS and stability during the{" "}
                <Link to="/gpu-tester" className="text-primary underline">
                  pc graphics card test online
                </Link>
              </li>
              <li>
                Gradually increases rendering complexity to test performance
                limits
              </li>
              <li>
                Provides performance scores indicating your GPU's health and
                rendering capability
              </li>
            </ul>
            <p className="text-muted-foreground">
              During the test, background processes monitor how your system
              reacts over time, giving you comprehensive insights into your
              hardware's performance.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">
              Supported Platforms and Devices
            </h3>
            <p>
              Our GPU testing tool supports a wide variety of hardware and
              environments. Because it's web-based, it's compatible with:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>
                Desktop GPUs from NVIDIA, AMD, and integrated GPUs on CPUs
              </li>
              <li>PCs running Windows 10, macOS, or Linux</li>
              <li>
                Laptops and workstations with modern browsers that support WebGL
              </li>
              <li>
                Low-power or integrated graphics devices (with meaningful stress
                insights for higher-end GPUs)
              </li>
            </ul>
            <p className="text-muted-foreground">
              Whether you want to run an{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                MSI GPU tester
              </Link>
              , an{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                NVIDIA GPU tester
              </Link>
              , or a general gaming{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                Graphics adapter tester
              </Link>
              , this online platform adapts to your hardware.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">
              How to Use a GPU Tester Online
            </h3>
            <p>
              Using our{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                GPU performance test
              </Link>{" "}
              is straightforward:
            </p>
            <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
              <li>
                Close any game launchers, renderers, or other heavy programs
                running in the background
              </li>
              <li>
                Open your browser (Chrome or another with WebGL support) and
                navigate to the GPU tester page
              </li>
              <li>
                Click the "Start Test" button to begin rendering scenes in real
                time
              </li>
              <li>
                Monitor FPS, frame time stability, and animation complexity as
                the test runs
              </li>
              <li>
                Review the summary of scores, potential bottlenecks, and
                suggestions after completion
              </li>
            </ol>
            <p className="text-muted-foreground">
              The tool provides clear feedback on your GPU's performance under
              stress, helping you identify any issues that need attention.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">
              Understanding GPU Stress Testing
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground">
                  What Is a GPU Stress Test?
                </h4>
                <p className="text-muted-foreground">
                  A{" "}
                  <Link to="/gpu-tester" className="text-primary underline">
                    gpu stress test online
                  </Link>{" "}
                  forces your graphics card to operate at or near its capacity
                  for an extended period. This helps identify stability issues,
                  thermal throttling, or power delivery problems that might not
                  appear during normal use.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">
                  When Should You Run a GPU Stress Test?
                </h4>
                <p className="text-muted-foreground">
                  Run a stress test if you notice graphical glitches, crashes,
                  or performance drops in games or creative apps. It's also
                  useful after overclocking, driver updates, or hardware
                  changes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">
                  What to Look For During a Stress Test
                </h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>
                    <strong>FPS Stability:</strong> Consistent frame rates
                    indicate good performance
                  </li>
                  <li>
                    <strong>Temperature:</strong> High temperatures can cause
                    throttling or damage
                  </li>
                  <li>
                    <strong>Artifacts:</strong> Visual glitches may signal
                    hardware issues
                  </li>
                  <li>
                    <strong>System Crashes:</strong> Could indicate instability
                    or power problems
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">
              GPU Tester vs. Graphics Card Checker
            </h3>
            <p>
              While the terms are often used interchangeably, there's a subtle
              difference:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>
                A <strong>GPU tester</strong> typically focuses on performance
                under load, measuring FPS, rendering capability, and stability
              </li>
              <li>
                A{" "}
                <Link to="/gpu-tester" className="text-primary underline">
                  graphics card checker
                </Link>{" "}
                often includes hardware detection, driver info, and basic
                diagnostics alongside performance metrics
              </li>
            </ul>
            <p className="text-muted-foreground">
              Our tool combines both approaches, offering comprehensive
              diagnostics and performance testing in one platform.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground">
                  Is it safe to run a GPU stress test online?
                </h4>
                <p className="text-muted-foreground">
                  Yes, our online GPU stress test is designed to be safe for
                  your hardware. It uses standard WebGL APIs and doesn't bypass
                  your system's built-in thermal and power protections.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">
                  How long does a GPU test take?
                </h4>
                <p className="text-muted-foreground">
                  A basic performance test takes about 30-60 seconds, while a
                  full stress test might run for 5-10 minutes to thoroughly
                  evaluate stability.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">
                  Can I test integrated graphics with this tool?
                </h4>
                <p className="text-muted-foreground">
                  Absolutely. Our GPU tester works with both discrete and
                  integrated graphics cards, providing meaningful performance
                  insights for all types of GPUs.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">
                  What's the difference between a GPU tester and a benchmark?
                </h4>
                <p className="text-muted-foreground">
                  A benchmark typically compares your performance against other
                  systems, while a GPU tester focuses on identifying issues with
                  your specific hardware configuration.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">Conclusion</h3>
            <p>
              Whether you're troubleshooting performance issues, validating an
              overclock, or simply curious about your GPU's capabilities, our
              free online GPU tester provides the tools you need. With
              comprehensive testing, real-time metrics, and clear performance
              ratings, you'll gain valuable insights into your graphics hardware
              without any installation or cost.
            </p>
            <p className="text-muted-foreground">
              Ready to test your GPU?{" "}
              <Link to="/gpu-tester" className="text-primary underline">
                Start the GPU test now
              </Link>{" "}
              and see how your graphics card performs under pressure.
            </p>
          </section>
        </section>
      </div>
    </div>
  );
}