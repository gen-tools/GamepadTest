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
  Users, // Added Users icon import
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

      {/* GamepadTest – Check Your Devices Online in Seconds */}
      <section className="py-20 sm:py-32 bg-muted/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl animate-fade-in-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                GamepadTest – Check Your Devices Online in Seconds
              </h2>
              <p className="mt-6 text-xl leading-8 text-muted-foreground">
                GamepadTest is an easy way to see if your controller or other devices are working properly. You open it in your browser, plug in your device, and test it right away. No downloads, no installs, and no setup headaches.
              </p>
              <p className="mt-4 text-xl leading-8 text-muted-foreground">
                People use GamepadTest before gaming, streaming, or recording just to be sure everything responds the way it should. It shows what your device is actually doing, not what it's supposed to do.
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
              {/* What You Can Do With GamepadTest */}
              <div className="bg-white rounded-lg p-8 shadow-sm hover-lift transition-all duration-300 animate-fade-in-up animate-stagger-1">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  What You Can Do With GamepadTest
                </h2>
                <p className="text-lg leading-relaxed">
                  Device problems usually show up when you least expect them. A button stops responding, a stick drifts, or your mic sounds too quiet. GamepadTest helps you catch these problems early.
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  You can use it to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>See if a controller, microphone, GPU, or MIDI device is responding</li>
                  <li>Find issues like missed button presses, drifting sticks, dead zones, or low mic volume</li>
                  <li>Run quick checks without installing large programs</li>
                </ul>
                <p className="text-lg leading-relaxed mt-4">
                  If something feels wrong, this tool helps you figure out what's happening without guessing.
                </p>
              </div>

              {/* Available Tools */}
              <div className="bg-gray-50 rounded-lg p-8 animate-fade-in-up animate-stagger-2">
                <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
                  Available Tools
                </h2>
                <p className="text-center mb-8">
                  GamepadTest includes different tools for different devices. Each one shows live feedback so you can see how your hardware reacts as you use it.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Gamepad Tester */}
                  <div className="text-center p-6 bg-white rounded-lg hover-scale transition-all duration-300">
                    <Gamepad2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h2 className="font-semibold text-foreground mb-2">
                      Gamepad Tester
                    </h2>
                    <p className="text-sm mb-4">
                      What it shows: The Gamepad Tester reads controller input through your browser. It shows button presses, stick movement, triggers, and D-pad input as you press them.
                    </p>
                    <p className="text-sm">
                      Why people use it: Buttons that only work sometimes, stick drift or uneven movement, testing new or used controllers.
                    </p>
                  </div>

                  {/* GPU Tester */}
                  <div className="text-center p-6 bg-white rounded-lg hover-scale transition-all duration-300">
                    <Monitor className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h2 className="font-semibold text-foreground mb-2">
                      GPU Tester
                    </h2>
                    <p className="text-sm mb-4">
                      What it does: The GPU Tester runs simple graphics checks in your browser. It doesn't push your system hard, but it helps spot basic display or rendering problems.
                    </p>
                    <p className="text-sm">
                      Why people use it: Quick GPU checks before gaming or streaming, finding visual glitches, checking if display issues are GPU-related.
                    </p>
                  </div>

                  {/* Microphone Tester */}
                  <div className="text-center p-6 bg-white rounded-lg hover-scale transition-all duration-300">
                    <Mic className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h2 className="font-semibold text-foreground mb-2">
                      Microphone Tester
                    </h2>
                    <p className="text-sm mb-4">
                      What it does: The Microphone Tester lets you see and hear your mic input live. You can check volume levels and listen to playback.
                    </p>
                    <p className="text-sm">
                      Why people use it: Making sure the mic works before calls or streams, adjusting input volume, fixing weak or distorted sound.
                    </p>
                  </div>

                  {/* MIDI Tester */}
                  <div className="text-center p-6 bg-white rounded-lg hover-scale transition-all duration-300">
                    <Music className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h2 className="font-semibold text-foreground mb-2">
                      MIDI Tester
                    </h2>
                    <p className="text-sm mb-4">
                      What it does: The MIDI Tester shows incoming and outgoing MIDI signals from connected devices.
                    </p>
                    <p className="text-sm">
                      Why people use it: Testing MIDI keyboards and pads, checking connections, making sure devices send data correctly.
                    </p>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up animate-stagger-3">
                <section className="hover-lift rounded-lg border bg-white p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                    <Zap className="h-6 w-6 text-primary" />
                    How It Works
                  </h2>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <p>
                      Using GamepadTest is simple:
                    </p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Plug your device into your computer</li>
                      <li>Open the matching test page</li>
                      <li>Use the device and watch the response</li>
                    </ol>
                    <p>
                      No accounts, no background apps, no learning curve.
                    </p>
                  </div>
                </section>

                <section className="hover-lift rounded-lg border bg-white p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                    <Users className="h-6 w-6 text-primary" />
                    Who This Tool Is For
                  </h2>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <p>
                      GamepadTest is useful for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Gamers testing controllers</li>
                      <li>Streamers and remote workers checking microphones</li>
                      <li>Musicians testing MIDI devices</li>
                      <li>Repair techs and DIY users diagnosing hardware</li>
                    </ul>
                    <p>
                      If you rely on input devices, this tool helps you know if they're working properly.
                    </p>
                  </div>
                </section>
              </div>

              {/* Accuracy and Privacy */}
              <div className="bg-green-50 rounded-lg p-8 animate-fade-in-up animate-stagger-4">
                <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
                  Accuracy and Privacy
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h2 className="font-semibold text-foreground mb-4">
                      How It Works:
                    </h2>
                    <p>
                      GamepadTest uses standard browser features to read device input. What you see is what your browser receives.
                    </p>
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground mb-4">
                      Key Features:
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>No installs</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>No tracking</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>No personal data saved</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Everything runs locally in your browser</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Common Questions */}
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  Common Questions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <h2 className="font-semibold text-foreground mb-2">
                        Does it work on all browsers?
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        It works on modern browsers. Chrome, Edge, and Firefox give the best results.
                      </p>
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground mb-2">
                        Are the results reliable?
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Yes. The tests are accurate for finding common problems like drift, missed inputs, lag, and audio issues.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h2 className="font-semibold text-foreground mb-2">
                        Do I need drivers?
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        As long as your system recognizes the device, the tool can read it.
                      </p>
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground mb-2">
                        Is it really free?
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Yes. GamepadTest is completely free with no hidden costs or subscriptions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Useful Links */}
              <div className="bg-blue-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
                  Useful Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4">
                    <Link to="/gamepad-tester" className="block text-blue-600 hover:text-blue-800 font-medium">
                      Gamepad Tester
                    </Link>
                  </div>
                  <div className="text-center p-4">
                    <Link to="/gpu-tester" className="block text-blue-600 hover:text-blue-800 font-medium">
                      GPU Tester
                    </Link>
                  </div>
                  <div className="text-center p-4">
                    <Link to="/mic-tester" className="block text-blue-600 hover:text-blue-800 font-medium">
                      Microphone Tester
                    </Link>
                  </div>
                  <div className="text-center p-4">
                    <Link to="/midi-tester" className="block text-blue-600 hover:text-blue-800 font-medium">
                      MIDI Tester
                    </Link>
                  </div>
                </div>
              </div>

              {/* Start Testing */}
              <div className="text-center bg-primary text-white rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4">
                  Start Testing
                </h2>
                <p className="text-lg mb-6">
                  GamepadTest keeps things simple. Plug in your device, open the tool, and check how it works.
                </p>
                <p className="text-lg mb-6">
                  Pick a tool and start testing now.
                </p>
                <div className="mt-6 flex justify-center">
                  <Link
                    to="/gamepad-tester"
                    className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md"
                  >
                    Start Testing Now
                  </Link>
                </div>
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
