import { Link } from "react-router-dom";
import {
  Gamepad2,
  Monitor,
  Mic,
  Music,
  Touchpad,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import AdsterraAd from "@/components/AdsterraAd";
import {
  useScrollAnimation,
  useStaggeredScrollAnimation,
} from "@/hooks/useScrollAnimation";
const testers = [
  {
    name: "Gamepad Tester",
    description:
      "Gamepad Tester lets you test PS5, PS4, Xbox, Nintendo Switch Pro, and PC controllers online. Check stick drift, buttons, triggers, vibration, and polling rate.",
    icon: Gamepad2,
    href: "/gamepad-tester",
    features: ["Real-time input", "Vibration test", "Button mapping"],
    color: "bg-blue-500",
  },
  {
    name: "Stick Drift Tester",
    description:
      "Test Xbox, PS5, PS4, Switch, and PC controllers specifically for analog stick drift, dead zone breaches, circularity error %, and input jitter in real-time.",
    icon: Gamepad2,
    href: "/stick-drift-test",
    features: ["Resting drift meter", "Circularity error %", "Dead zone simulator"],
    color: "bg-indigo-500",
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
  {
    name: "Touch Screen Tester",
    description:
      "Test single and multi-touch screen displays online. Check touch points, detect dead spots, and measure simultaneous touch limits.",
    icon: Touchpad,
    href: "/touch-screen-test",
    features: ["Multi-touch tracking", "Dead-spot grid test", "Peak touch counter"],
    color: "bg-amber-500",
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

export default function Index() {
  // Animation hooks
  const toolsAnimation = useScrollAnimation({ threshold: 0.2 });
  const { containerRef: toolsContainerRef, visibleItems: toolsVisible } =
    useStaggeredScrollAnimation(6, { threshold: 0.2 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GamepadTest",
    url: "https://gamepadtest.vercel.app",
    logo: "https://gamepadtest.vercel.app/logo.png",
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
        item: "https://gamepadtest.vercel.app",
      },
    ],
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>GamepadTest – Free Controller, Mic & GPU Tester Online</title>
        <meta
          name="description"
          content="Test your controller, mic, GPU, and MIDI gear free online. Detect stick drift, dead inputs, and touch issues instantly — no download, no signup."
        />
        <meta
          name="keywords"
          content="GamepadTest, Gamepad Tester, Mic Tester, GPU Tester, MIDI Tester"
        />
        <link rel="canonical" href="https://gamepadtest.vercel.app/" />

        {/* Open Graph */}
        <meta property="og:title" content="GamepadTest | Free Online Hardware Testers" />
        <meta property="og:description" content="GamepadTest lets you instantly test game controllers, GPU, microphones, and MIDI devices online. Free, browser-based diagnostics to ensure optimal hardware." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gamepadtest.vercel.app/" />
        <meta property="og:site_name" content="GamepadTest" />
        <meta property="og:image" content="https://gamepadtest.vercel.app/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GamepadTest" />
        <meta name="twitter:title" content="GamepadTest | Free Online Hardware Testers" />
        <meta name="twitter:description" content="GamepadTest lets you instantly test game controllers, GPU, microphones, and MIDI devices online. Free, browser-based diagnostics to ensure optimal hardware." />
        <meta name="twitter:image" content="https://gamepadtest.vercel.app/twitter-image.jpg" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "GamepadTest",
            url: "https://gamepadtest.vercel.app",
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "GamepadTest",
            url: "https://gamepadtest.vercel.app",
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
              "https://gamepadtest.vercel.app/gamepad-tester",
              "https://gamepadtest.vercel.app/gpu-tester",
              "https://gamepadtest.vercel.app/mic-tester",
              "https://gamepadtest.vercel.app/midi-tester",
              "https://gamepadtest.vercel.app/blog",
              "https://gamepadtest.vercel.app/about",
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
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in-down text-center text-gray-900 leading-tight">
              GamepadTest — Free Online Hardware Tester
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-in-up animate-stagger-1">
              Test your controller, mic, GPU, or MIDI gear in seconds — right in your browser, no download required. Catch stick drift, dead buttons, weak mic levels, or unresponsive touch spots before they cost you a match, a stream, or a session. Everything runs live and local, so nothing you test is ever saved or uploaded.
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
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

            {/* Stick Drift Tester */}
            <Link
              to="/stick-drift-test"
              className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${
                toolsVisible[1]
                  ? "animate-fade-in-up animate-stagger-1"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-indigo-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Gamepad2 className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                  Stick Drift Tester
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Check analog sticks for drift, circularity error %, and dead zone accuracy
                </p>
              </div>
            </Link>

            {/* Touch Screen Tester */}
            <Link
              to="/touch-tester"
              className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${
                toolsVisible[2]
                  ? "animate-fade-in-up animate-stagger-2"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-teal-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Touchpad className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                  Touch Screen Tester
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Test single and multi-touch displays, touch points, and dead spots
                </p>
              </div>
            </Link>

            {/* GPU Tester */}
            <Link
              to="/gpu-tester"
              className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${
                toolsVisible[3]
                  ? "animate-fade-in-up animate-stagger-3"
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
                toolsVisible[4]
                  ? "animate-fade-in-up animate-stagger-4"
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
                toolsVisible[5]
                  ? "animate-fade-in-up animate-stagger-5"
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
     
      {/* New Content Section */}
      <section className="py-20 sm:py-32 bg-muted/50 cv-auto">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl animate-fade-in-up">
            {/* Ad Section before content */}
            <div className="mb-12">
              <AdsterraAd />
            </div>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-center">
                GamepadTest – Test Your Gaming and Audio Hardware Online, Free
              </h2>
              <p className="mt-6 text-xl leading-8 text-muted-foreground">
                Something feels off with your controller, mic, or screen and you want an answer right now — not a download, not a sign-up form, not a scan that takes ten minutes. GamepadTest is a browser-based hardware testing site. Open a tool, connect your device, and you'll see exactly how it's behaving in real time.
              </p>
              <p className="mt-4 text-xl leading-8 text-muted-foreground">
                Everything runs locally in your browser. Nothing you do here gets recorded, uploaded, or stored.
              </p>
            </div>

            <div className="space-y-12">
              {/* Why People Come Here */}
              <div className="bg-white rounded-lg p-8 shadow-sm hover-lift transition-all duration-300">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  Why People Come Here
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Hardware rarely fails all at once. It fades. A stick starts pulling slightly left. A trigger reads 40% when you haven't touched it. A mic sounds fine to you but muddy to everyone on the call. These are the kinds of problems that are easy to dismiss and easy to miss — until they cost you a match, a stream, or a session.
                </p>
                <p className="text-lg leading-relaxed mt-4 text-muted-foreground">
                  GamepadTest exists to make these problems visible. Instead of guessing, you get a live readout of what your hardware is actually sending your computer.
                </p>
              </div>

              {/* The Full Toolset */}
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-center text-foreground">
                  The Full Toolset
                </h2>

                {/* Gamepad Tester */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Gamepad2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        <Link to="/gamepad-tester" className="hover:text-primary transition-colors">
                          Gamepad Tester
                        </Link>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Connect any controller — Xbox, PlayStation, Switch Pro, or a generic USB pad — and the Gamepad Tester maps every input live. Press a button and watch it light up on screen. Push a stick and watch the tracked position move with it. If a button doesn't register, or a stick doesn't return cleanly to center, you'll see it happen in real time instead of wondering why your character keeps drifting in-game.
                      </p>
                      <p className="mt-3 text-muted-foreground leading-relaxed">
                        This is usually the first stop for anyone buying a used controller, troubleshooting a competitive-play issue, or just double-checking a pad before a long session.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stick Drift Test */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Gamepad2 className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        <Link to="/stick-drift-test" className="hover:text-primary transition-colors">
                          Stick Drift Test
                        </Link>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Drift is one of the most common — and most denied — controller problems out there. It creeps in slowly, so a lot of players adjust their playstyle around it without realizing what's actually wrong. The Stick Drift Test isolates each analog stick and tracks its resting position against its full range of motion. If the stick reports movement while it's sitting untouched, or the dead zone has grown larger than it should be, this tool shows the exact deviation instead of leaving you to guess whether it's "just you."
                      </p>
                      <p className="mt-3 text-muted-foreground leading-relaxed">
                        It's worth running this test periodically even if nothing feels wrong yet — catching drift early is a lot cheaper than replacing a controller later.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Touch Screen Test */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-teal-100 rounded-lg">
                      <Touchpad className="h-8 w-8 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        <Link to="/touch-tester" className="hover:text-primary transition-colors">
                          Touch Screen Test
                        </Link>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Built for phones, tablets, and touchscreen laptops, the Touch Screen Test checks whether your display is registering touch accurately across its entire surface. It tracks multi-touch points, response speed, and dead zones — areas of the screen that don't register a tap at all. This kind of dead spot is common on older or damaged devices and easy to miss during normal use, since you naturally avoid tapping where the screen doesn't respond. Run a few swipes and taps across every edge and corner to see where the coverage actually stops.
                      </p>
                    </div>
                  </div>
                </div>

                {/* GPU Tester */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Monitor className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        <Link to="/gpu-tester" className="hover:text-primary transition-colors">
                          GPU Tester
                        </Link>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        The GPU Tester runs lightweight rendering checks directly in your browser to help you spot visual issues before they become a bigger headache. It won't stress-test your card the way a dedicated benchmarking suite would, but it's built for a different job: giving you a fast read on whether something you're seeing on screen — tearing, flickering, odd artifacts — is actually a GPU issue or something else entirely.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Microphone Tester */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Mic className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        <Link to="/mic-tester" className="hover:text-primary transition-colors">
                          Microphone Tester
                        </Link>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Before a call, a stream, or a recording session, the Mic Tester lets you see your input level and hear your own playback in real time. You'll catch a mic that's too quiet, too hot, or picking up more background noise than you'd like — before your audience does. It's a thirty-second check that saves you from finding out mid-stream that your levels were wrong the whole time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* MIDI Tester */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Music className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        <Link to="/midi-tester" className="hover:text-primary transition-colors">
                          MIDI Tester
                        </Link>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        For musicians and producers, the MIDI Tester displays incoming and outgoing MIDI messages from any connected device — keyboards, pad controllers, control surfaces. You can confirm a device is actually sending data, check that notes and velocity are coming through correctly, and rule out a hardware or connection issue before you even open your DAW.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to Use Any Tool on This Site & Who Uses GamepadTest */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                    How to Use Any Tool on This Site
                  </h2>
                  <ol className="list-decimal pl-6 space-y-2 text-lg text-muted-foreground">
                    <li>Plug in or connect your device.</li>
                    <li>Open the matching test page.</li>
                    <li>Interact with the device and watch the live response on screen.</li>
                  </ol>
                  <p className="mt-4 text-lg font-medium text-foreground">
                    No account, no install, no background software. Just the tool, your device, and a live readout.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground mb-4">
                    <Users className="h-6 w-6 text-primary" />
                    Who Uses GamepadTest
                  </h2>
                  <ul className="list-disc pl-6 space-y-2 text-lg text-muted-foreground">
                    <li>Gamers checking a controller for drift, dead buttons, or lag before a ranked session</li>
                    <li>Streamers and remote workers confirming their mic sounds right before going live</li>
                    <li>Musicians and producers verifying MIDI gear before a session</li>
                    <li>Mobile and tablet users checking a touchscreen for unresponsive areas</li>
                    <li>Repair techs and resellers diagnosing hardware or verifying a device before it's sold</li>
                    <li>Anyone buying used gear who wants proof it works before handing over money</li>
                  </ul>
                </div>
              </div>

              {/* Privacy and Accuracy */}
              <div className="bg-green-50 rounded-lg p-8 border border-green-200">
                <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
                  Privacy and Accuracy
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      All tests here read directly from standard browser APIs — the same input data your operating system already receives. There's nothing to install, nothing running in the background, and nothing saved once you close the tab.
                    </p>
                  </div>
                  <div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span className="text-lg">No downloads required</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span className="text-lg">No accounts or sign-ups</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span className="text-lg">No data collected, stored, or transmitted</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span className="text-lg">Everything processes locally, in your browser</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Frequently Asked Questions */}
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Does GamepadTest work on all browsers?
                    </h3>
                    <p className="text-muted-foreground">
                      It works on any modern browser, but Chrome, Edge, and Firefox tend to give the most consistent results, especially for gamepad and MIDI input.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      How accurate are the results?
                    </h3>
                    <p className="text-muted-foreground">
                      The tools read raw input data as your browser receives it, so what you see reflects exactly what your device is reporting — no interpretation layer in between. They're reliable for catching common issues like drift, missed inputs, dead zones, audio distortion, and unresponsive touch areas.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Do I need to install drivers?
                    </h3>
                    <p className="text-muted-foreground">
                      If your operating system already recognizes the device, GamepadTest can read it. No extra drivers or software needed.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Is my data safe when I use these tools?
                    </h3>
                    <p className="text-muted-foreground">
                      Yes. Everything runs locally in your browser. Nothing is uploaded, logged, or stored.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Which tool should I start with?
                    </h3>
                    <p className="text-muted-foreground">
                      If a controller feels off, start with the Gamepad Tester, then run the Stick Drift Test if the sticks seem inconsistent. For phones and tablets, the Touch Screen Test is the right starting point. For anything audio or MIDI related, jump straight to the Microphone Tester or MIDI Tester.
                    </p>
                  </div>
                </div>
              </div>

              {/* Start Testing */}
              <div className="text-center bg-primary text-white rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4 text-center flex justify-center items-center">
                  Start Testing
                </h2>
                <p className="text-lg mb-6">
                  Pick a tool, connect your device, and see exactly how it's performing — no downloads, no sign-ups, no guesswork.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium pt-2">
                  <Link to="/gamepad-tester" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md transition-colors">
                    Gamepad Tester
                  </Link>
                  <span>·</span>
                  <Link to="/stick-drift-test" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md transition-colors">
                    Stick Drift Test
                  </Link>
                  <span>·</span>
                  <Link to="/touch-tester" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md transition-colors">
                    Touch Screen Test
                  </Link>
                  <span>·</span>
                  <Link to="/gpu-tester" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md transition-colors">
                    GPU Tester
                  </Link>
                  <span>·</span>
                  <Link to="/mic-tester" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md transition-colors">
                    Microphone Tester
                  </Link>
                  <span>·</span>
                  <Link to="/midi-tester" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md transition-colors">
                    MIDI Tester
                  </Link>
                </div>
              </div>
            </div>
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
              Also check this <a href="https://text-repeater0.vercel.app/">Text repeater</a>
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
