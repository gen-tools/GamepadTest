import { Link } from "react-router-dom";
import {
  Gamepad2,
  Monitor,
  Mic,
  Music,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import {
  useScrollAnimation,
  useStaggeredScrollAnimation,
} from "@/hooks/useScrollAnimation";

const testers = [
  {
    name: "Gamepad Tester",
    description:
      "Test your gaming controllers with real-time input detection, button mapping, and vibration feedback.",
    icon: Gamepad2,
    href: "/gamepad-tester",
    features: ["Real-time input", "Vibration test", "Button mapping"],
    color: "bg-blue-500",
  },
  {
    name: "GPU Tester",
    description:
      "Analyze your graphics card performance with WebGL rendering tests and hardware information.",
    icon: Monitor,
    href: "/gpu-tester",
    features: ["WebGL benchmarks", "Hardware info", "Performance metrics"],
    color: "bg-green-500",
  },
  {
    name: "Microphone Tester",
    description:
      "Test your microphone input with real-time audio visualization and quality analysis.",
    icon: Mic,
    href: "/mic-tester",
    features: ["Audio visualization", "Input levels", "Quality analysis"],
    color: "bg-red-500",
  },
  {
    name: "MIDI Tester",
    description:
      "Test MIDI devices and keyboards with real-time signal detection and note visualization.",
    icon: Music,
    href: "/midi-tester",
    features: ["Device detection", "Note visualization", "Signal monitoring"],
    color: "bg-purple-500",
  },
];

const features = [
  {
    name: "Lightning Fast",
    description:
      "Optimized for speed with instant loading and real-time feedback.",
    icon: Zap,
  },
  {
    name: "Privacy First",
    description:
      "All testing happens locally in your browser. No data is sent to our servers.",
    icon: Shield,
  },
  {
    name: "Cross-Platform",
    description:
      "Works on all modern browsers and devices - desktop, mobile, and tablet.",
    icon: Globe,
  },
];

const faqs = [
  {
    question: "How does the gamepad tester work?",
    answer:
      "Our gamepad tester uses the Gamepad API to detect connected controllers and display real-time input data including button presses, joystick movements, and trigger values.",
  },
  {
    question: "Is my data safe when using these testers?",
    answer:
      "Yes! All testing happens locally in your browser. We never collect, store, or transmit any of your device data or personal information.",
  },
  {
    question: "Which browsers are supported?",
    answer:
      "Our testers work on all modern browsers including Chrome, Firefox, Safari, and Edge. Some features may require specific browser permissions.",
  },
];

export default function Index() {
  // Animation hooks
  const toolsAnimation = useScrollAnimation({ threshold: 0.2 });
  const { containerRef: toolsContainerRef, visibleItems: toolsVisible } =
    useStaggeredScrollAnimation(4, { threshold: 0.2 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });
  const faqAnimation = useScrollAnimation({ threshold: 0.2 });

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GamepadTest",
    url: "https://gamepadtest.tech",
    logo: "https://gamepadtest.tech/logo.png",
    description:
      "The #1 professional gamepad testing tool trusted by millions worldwide.",
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@gamepadchecker.com",
    },
    sameAs: [
      "https://twitter.com/gamepadtest",
      "https://facebook.com/gamepadtest",
    ],
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://gamepadtest.tech",
      },
    ],
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>GamepadTest | Free Online Hardware Tester</title>
        <meta
          name="description"
          content="GamepadTest lets you instantly test game controllers, GPU, microphones, and MIDI devices online. Free, browser-based diagnostics to ensure optimal hardware."
        />
        <meta
          name="keywords"
          content="GamepadTest, Gamepad Tester, Mic Tester, GPU Tester, MIDI Tester"
        />
        <link rel="canonical" href="https://www.gamepadtest.tech/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "GamepadTest",
            url: "https://www.gamepadtest.tech",
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "GamepadTest",
            url: "https://www.gamepadtest.tech",
            sameAs: [
              "https://twitter.com/gamepadtest",
              "https://facebook.com/gamepadtest",
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SiteNavigationElement",
            name: [
              "Gamepad Tester",
              "GPU Tester",
              "Mic Tester",
              "MIDI Tester",
              "Blog",
              "About",
            ],
            url: [
              "https://www.gamepadtest.tech/gamepad-tester",
              "https://www.gamepadtest.tech/gpu-tester",
              "https://www.gamepadtest.tech/mic-tester",
              "https://www.gamepadtest.tech/midi-tester",
              "https://www.gamepadtest.tech/blog",
              "https://www.gamepadtest.tech/about",
            ],
          })}
        </script>
      </Helmet>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 sm:py-32">
        {/* Animated Background Elements - disabled on mobile for performance */}
        <div className="absolute inset-0 overflow-hidden hidden sm:block">
          <div className="animate-pulse-glow absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div
            className="animate-pulse-glow absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in-down">
              <span className="text-gray-700 animate-scale-in">
                GamepadTest
              </span>{" "}
              – Free Online Hardware Tester
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-in-up animate-stagger-1">
              GamepadTest lets you test controllers, GPU, mic, and MIDI online.
              Find stick drift, verify inputs, run benchmarks, and fix issues —
              free, no download. required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up animate-stagger-2">
              <Button asChild size="lg" className="gap-2 hover-lift hover-glow">
                <Link to="/gamepad-tester">
                  Start Testing
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="hover-scale"
              >
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* All Tools Section */}
      <section className="py-16 sm:py-24" ref={toolsAnimation.ref}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className={`mx-auto max-w-2xl text-center mb-12 transition-all duration-700 ${
              toolsAnimation.isVisible
                ? "animate-fade-in-up"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-4">
              Choose Your Testing Tool
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional hardware testing tools for all your gaming and audio
              equipment
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto"
            ref={toolsContainerRef}
          >
            {/* Gamepad Tester */}
            <Link
              to="/gamepad-tester"
              className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${
                toolsVisible[0]
                  ? "animate-fade-in-up"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Gamepad2 className="h-8 w-8 text-gray-700" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                  Gamepad Tester
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Test controllers with real-time input detection and vibration
                  feedback
                </p>
              </div>
            </Link>

            {/* GPU Tester */}
            <Link
              to="/gpu-tester"
              className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${
                toolsVisible[1]
                  ? "animate-fade-in-up animate-stagger-1"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Monitor className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                  GPU Tester
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Analyze graphics card performance with WebGL rendering tests
                </p>
              </div>
            </Link>

            {/* Mic Tester */}
            <Link
              to="/mic-tester"
              className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${
                toolsVisible[2]
                  ? "animate-fade-in-up animate-stagger-2"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Mic className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                  Mic Tester
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Test microphone input with real-time audio visualization
                </p>
              </div>
            </Link>

            {/* MIDI Tester */}
            <Link
              to="/midi-tester"
              className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${
                toolsVisible[3]
                  ? "animate-fade-in-up animate-stagger-3"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Music className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                  MIDI Tester
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Test MIDI devices with real-time signal detection and
                  visualization
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Comprehensive GamepadTest Content */}
      {/* GamepadTest – Free Online Hardware Testing Tools */}
      <section
        className="py-20 sm:py-32 bg-muted/50"
        ref={featuresAnimation.ref}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl animate-fade-in-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                GamepadTest – Free Online Hardware Testing Tools
              </h2>
              <p className="mt-6 text-xl leading-8 text-muted-foreground">
                Technology is the core of how we play, work, and create. From
                gaming sessions with friends to professional streaming, music
                production, or graphic-heavy projects, the performance of your
                hardware can make or break your experience.
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
              {/* Introduction */}
              <div className="bg-white rounded-lg p-8 shadow-sm hover-lift transition-all duration-300 animate-fade-in-up animate-stagger-1">
                <p className="text-lg leading-relaxed">
                  But like anything else, devices wear out. Controllers develop
                  stick drift, graphics cards overheat, microphones cut out, and
                  MIDI keyboards lose sensitivity. That's why we created
                  GamepadTest — an all-in-one hub for free online testing tools.
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  With no downloads or installations, you can check your game
                  controllers, GPUs, microphones, and MIDI devices instantly
                  inside your web browser. We've built each tester to be fast,
                  simple, and accurate so you can catch problems before they
                  ruin your gaming session, work presentation, or recording.
                </p>
              </div>

              {/* Why Testing Matters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up animate-stagger-2">
                <section className="hover-lift rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                    <Shield className="h-6 w-6 text-primary" />
                    Why Online Testing Matters
                  </h3>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <p>
                      Most diagnostic software is heavy, complicated, or tied to
                      a single brand. Our tools take a different approach:
                      lightweight, browser-based testers that anyone can use. No
                      technical knowledge required.
                    </p>
                    <p>
                      Using our testers means you can run a gamepad tester in
                      seconds to spot unresponsive buttons or drifting
                      joysticks, perform a GPU tester benchmark to confirm
                      stability, use a mic tester to ensure your audio is crisp,
                      and verify your MIDI controllers respond correctly.
                    </p>
                  </div>
                </section>

                <section className="hover-lift rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                    <Zap className="h-6 w-6 text-primary" />
                    Free and Accessible
                  </h3>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <p>
                      Best of all, it's completely free. Whether you're a casual
                      gamer, professional musician, or competitive player, our
                      tools are available anytime, anywhere.
                    </p>
                    <p>
                      The tool is also safe to use. It does not collect personal
                      information or install extra software. Everything runs
                      inside your browser and disappears once you close the
                      page.
                    </p>
                  </div>
                </section>
              </div>

              {/* Tools Supported */}
              <div className="bg-gray-50 rounded-lg p-8 animate-fade-in-up animate-stagger-3">
                <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
                  Our Testing Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-white rounded-lg hover-scale transition-all duration-300">
                    <Gamepad2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">
                      Gamepad Tester
                    </h4>
                    <p className="text-sm">
                      Check controllers for stick drift, button response, and
                      connection issues. Supports PlayStation, Xbox, and PC
                      gamepads.
                    </p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg hover-scale transition-all duration-300">
                    <Monitor className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">
                      GPU Tester
                    </h4>
                    <p className="text-sm">
                      Measure graphics card performance, check temperatures, and
                      detect stability issues with real-time monitoring.
                    </p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg hover-scale transition-all duration-300">
                    <Mic className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">
                      Mic Tester
                    </h4>
                    <p className="text-sm">
                      Test microphone quality, detect static or distortion, and
                      ensure your audio is clear for calls and recordings.
                    </p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg hover-scale transition-all duration-300">
                    <Music className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">
                      MIDI Tester
                    </h4>
                    <p className="text-sm">
                      Verify keyboard, pads, and controllers for correct note
                      data, velocity sensitivity, and connection issues.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="animate-fade-in-up animate-stagger-4">
                <h3 className="text-2xl font-bold mb-8 text-center text-foreground">
                  Comprehensive Testing Solutions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: "Gamepad Testing",
                      desc: "Detect stick drift, verify button response, test trigger sensitivity, and check for connection lag.",
                      icon: Gamepad2,
                    },
                    {
                      title: "GPU Performance",
                      desc: "Real-time FPS monitoring, temperature tracking, stress testing, and performance dip detection.",
                      icon: Monitor,
                    },
                    {
                      title: "Audio Quality",
                      desc: "Live microphone input testing, static detection, volume level confirmation, and clarity assessment.",
                      icon: Mic,
                    },
                    {
                      title: "MIDI Verification",
                      desc: "Key and pad testing, velocity sensitivity checks, knob and fader validation, DAW connectivity.",
                      icon: Music,
                    },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="hover-lift rounded-lg border bg-white p-6"
                    >
                      <feature.icon className="h-8 w-8 text-primary mb-4" />
                      <h4 className="font-semibold text-foreground mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gamepad Tester Details */}
              <div className="bg-blue-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
                  Gamepad Tester – Check Controllers Instantly
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">
                      What You Can Test:
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>
                          Detect stick drift when a joystick moves on its own
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>
                          Verify button response to confirm every press
                          registers
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Test trigger sensitivity for gradual inputs</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Check for connection lag or dropped signals</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">
                      Supported Controllers:
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <span>PlayStation (PS3, PS4, PS5)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <span>Xbox (Xbox 360, Xbox One, Series X/S)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <span>PC & third-party gamepads</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <span>Generic USB or Bluetooth controllers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Tools Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="hover-lift rounded-lg border bg-white p-6 shadow-sm">
                  <Monitor className="h-8 w-8 text-green-500 mb-4" />
                  <h4 className="font-semibold text-foreground mb-3">
                    GPU Tester – Free Online Graphics Card Checker
                  </h4>
                  <p className="text-sm mb-4">
                    Your graphics card is the powerhouse of your system. When it
                    struggles, you notice frame drops, overheating, or sudden
                    crashes.
                  </p>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Real-time FPS monitoring</li>
                    <li>• Temperature tracking</li>
                    <li>• Stress testing capabilities</li>
                    <li>• Throttling detection</li>
                  </ul>
                </div>

                <div className="hover-lift rounded-lg border bg-white p-6 shadow-sm">
                  <Mic className="h-8 w-8 text-purple-500 mb-4" />
                  <h4 className="font-semibold text-foreground mb-3">
                    Mic Tester – Check Your Microphone Online
                  </h4>
                  <p className="text-sm mb-4">
                    Eliminate guesswork by hearing your microphone's live input
                    directly in your browser.
                  </p>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Detect static, distortion, or noise</li>
                    <li>• Confirm mute status and volume</li>
                    <li>• Test built-in, USB, or external mics</li>
                    <li>• Quick setup for calls and recordings</li>
                  </ul>
                </div>

                <div className="hover-lift rounded-lg border bg-white p-6 shadow-sm">
                  <Music className="h-8 w-8 text-orange-500 mb-4" />
                  <h4 className="font-semibold text-foreground mb-3">
                    MIDI Tester – Keyboard, Pads & Controllers
                  </h4>
                  <p className="text-sm mb-4">
                    Verify your equipment before recording or performing to
                    ensure everything responds as expected.
                  </p>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Test keys and pads for note data</li>
                    <li>• Check velocity sensitivity</li>
                    <li>• Validate knobs and faders</li>
                    <li>• Diagnose DAW connection issues</li>
                  </ul>
                </div>
              </div>

              {/* Common Problems */}
              <div className="bg-red-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
                  Common Problems You Can Solve
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Controller Issues
                        </h4>
                        <p className="text-sm">
                          Stick drift, unresponsive buttons, and connection
                          problems.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          GPU Problems
                        </h4>
                        <p className="text-sm">
                          Crashes, overheating, poor frame rates, and
                          performance dips.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Audio Troubles
                        </h4>
                        <p className="text-sm">
                          Mic silence, distortion, echo, or background noise.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          MIDI Failures
                        </h4>
                        <p className="text-sm">
                          Pads or keys failing to trigger, velocity issues,
                          connection drops.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Who Benefits */}
              <div className="bg-green-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
                  Who Can Benefit from GamepadTest?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: "Gamers",
                      desc: "Ensure flawless controller performance before online matches and tournaments.",
                    },
                    {
                      title: "Streamers",
                      desc: "Maintain reliable mic and GPU performance for uninterrupted broadcasts.",
                    },
                    {
                      title: "Professionals",
                      desc: "Test equipment before important video calls and presentations.",
                    },
                    {
                      title: "Musicians",
                      desc: "Verify MIDI gear and audio equipment before recording sessions.",
                    },
                  ].map((item, index) => (
                    <div key={index} className="text-center p-4">
                      <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Choose */}
              <div className="text-center bg-white rounded-lg p-8 shadow-sm">
                <h3 className="text-2xl font-bold mb-6 text-foreground">
                  Why Choose GamepadTest Over Other Tools?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                  {[
                    {
                      title: "Universal",
                      desc: "Works with controllers, GPUs, mics, and MIDI devices in one place.",
                    },
                    {
                      title: "Free Forever",
                      desc: "No subscriptions, no hidden charges, completely free to use.",
                    },
                    {
                      title: "Instant",
                      desc: "Connect your device and see results right away with no delays.",
                    },
                    {
                      title: "User-Friendly",
                      desc: "Designed for beginners and pros alike with intuitive interfaces.",
                    },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="hover-lift rounded-lg border bg-gray-50 p-6"
                    >
                      <h4 className="font-semibold text-foreground mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center bg-primary text-white rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-4">
                  Start Testing Your Hardware Today
                </h3>
                <p className="text-lg mb-6">
                  Your hardware is the foundation of your digital life. Don't
                  let issues slow you down or cost you progress. With
                  GamepadTest, you can run comprehensive tests anytime, all for
                  free.
                </p>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="hover-scale"
                >
                  <Link to="/gamepad-tester">
                    Start Testing Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-32" ref={faqAnimation.ref}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
              faqAnimation.isVisible
                ? "animate-fade-in-up"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Everything you need to know about our hardware testing tools.
            </p>
          </div>
          <div
            className={`mx-auto mt-16 max-w-2xl transition-all duration-700 ${
              faqAnimation.isVisible
                ? "animate-fade-in-up animate-stagger-1"
                : "opacity-0 translate-y-8"
            }`}
          >
            <dl className="space-y-8">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className={`transition-all duration-500 hover-scale hover:bg-muted/30 rounded-lg p-4 -m-4 ${
                    faqAnimation.isVisible
                      ? "animate-fade-in-left"
                      : "opacity-0 translate-x-8"
                  }`}
                  style={{ animationDelay: `${(index + 2) * 200}ms` }}
                >
                  <dt className="text-base font-semibold leading-7 flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 transition-transform duration-300 hover:scale-125" />
                    {faq.question}
                  </dt>
                  <dd className="mt-2 ml-7 text-base leading-7 text-muted-foreground">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Related Links Section */}
      <section className="py-16 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">Learn More</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover guides and detailed information about our testing tools.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/blog/gamepad-tester-guide"
              className="group block rounded-lg border p-6 hover:bg-white hover:shadow-sm transition-all duration-300"
            >
              <Gamepad2 className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                Gamepad Guide
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Complete guide to testing controllers
              </p>
            </Link>
            <Link
              to="/blog/gpu-tester-guide"
              className="group block rounded-lg border p-6 hover:bg-white hover:shadow-sm transition-all duration-300"
            >
              <Monitor className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                GPU Guide
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Graphics performance testing guide
              </p>
            </Link>
            <Link
              to="/blog/mic-tester-guide"
              className="group block rounded-lg border p-6 hover:bg-white hover:shadow-sm transition-all duration-300"
            >
              <Mic className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                Mic Guide
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Microphone testing tutorial
              </p>
            </Link>
            <Link
              to="/about"
              className="group block rounded-lg border p-6 hover:bg-white hover:shadow-sm transition-all duration-300"
            >
              <Globe className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                About Us
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Learn about GamepadTest
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
