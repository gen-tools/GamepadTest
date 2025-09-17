import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Monitor,
  Mic,
  Music,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { useScrollAnimation, useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation';

const testers = [
  {
    name: 'Gamepad Tester',
    description: 'Test your gaming controllers with real-time input detection, button mapping, and vibration feedback.',
    icon: Gamepad2,
    href: '/gamepad-tester',
    features: ['Real-time input', 'Vibration test', 'Button mapping'],
    color: 'bg-blue-500',
  },
  {
    name: 'GPU Tester',
    description: 'Analyze your graphics card performance with WebGL rendering tests and hardware information.',
    icon: Monitor,
    href: '/gpu-tester',
    features: ['WebGL benchmarks', 'Hardware info', 'Performance metrics'],
    color: 'bg-green-500',
  },
  {
    name: 'Microphone Tester',
    description: 'Test your microphone input with real-time audio visualization and quality analysis.',
    icon: Mic,
    href: '/mic-tester',
    features: ['Audio visualization', 'Input levels', 'Quality analysis'],
    color: 'bg-red-500',
  },
  {
    name: 'MIDI Tester',
    description: 'Test MIDI devices and keyboards with real-time signal detection and note visualization.',
    icon: Music,
    href: '/midi-tester',
    features: ['Device detection', 'Note visualization', 'Signal monitoring'],
    color: 'bg-purple-500',
  },
];

const features = [
  {
    name: 'Lightning Fast',
    description: 'Optimized for speed with instant loading and real-time feedback.',
    icon: Zap,
  },
  {
    name: 'Privacy First',
    description: 'All testing happens locally in your browser. No data is sent to our servers.',
    icon: Shield,
  },
  {
    name: 'Cross-Platform',
    description: 'Works on all modern browsers and devices - desktop, mobile, and tablet.',
    icon: Globe,
  },
];

const faqs = [
  {
    question: 'How does the gamepad tester work?',
    answer: 'Our gamepad tester uses the Gamepad API to detect connected controllers and display real-time input data including button presses, joystick movements, and trigger values.',
  },
  {
    question: 'Is my data safe when using these testers?',
    answer: 'Yes! All testing happens locally in your browser. We never collect, store, or transmit any of your device data or personal information.',
  },
  {
    question: 'Which browsers are supported?',
    answer: 'Our testers work on all modern browsers including Chrome, Firefox, Safari, and Edge. Some features may require specific browser permissions.',
  },
];

export default function Index() {

  // Animation hooks
  const toolsAnimation = useScrollAnimation({ threshold: 0.2 });
  const { containerRef: toolsContainerRef, visibleItems: toolsVisible } = useStaggeredScrollAnimation(4, { threshold: 0.2 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });
  const { containerRef: featuresContainerRef, visibleItems: featuresVisible } = useStaggeredScrollAnimation(3, { threshold: 0.2 });
  const faqAnimation = useScrollAnimation({ threshold: 0.2 });

  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GamepadTest',
    url: 'https://gamepadchecker.com',
    logo: 'https://gamepadchecker.com/logo.png',
    description: 'The #1 professional gamepad testing tool trusted by millions worldwide.',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@gamepadchecker.com'
    },
    sameAs: [
      'https://twitter.com/gamepadchecker',
      'https://facebook.com/gamepadchecker'
    ]
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gamepadchecker.com'
      }
    ]
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>GamepadTest | Free Online Controller, GPU, Mic & MIDI Tester</title>
        <meta name="description" content="GamepadTest lets you test controllers, GPU, mic, and MIDI online. Find stick drift, verify inputs, run benchmarks, and fix issues — free, no download." />
        <meta name="keywords" content="gamepadtest, gamepad tester, gpu tester, mic tester, midi tester" />
        <link rel="canonical" href="https://www.gamepadtest.tech/" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'GamepadTest',
          url: 'https://www.gamepadtest.tech'
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'GamepadTest',
          url: 'https://www.gamepadtest.tech',
          sameAs: [
            'https://twitter.com/gamepadchecker',
            'https://facebook.com/gamepadchecker'
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SiteNavigationElement',
          name: [
            'Gamepad Tester',
            'GPU Tester',
            'Mic Tester',
            'MIDI Tester',
            'Blog',
            'About'
          ],
          url: [
            'https://www.gamepadtest.tech/gamepad-tester',
            'https://www.gamepadtest.tech/gpu-tester',
            'https://www.gamepadtest.tech/mic-tester',
            'https://www.gamepadtest.tech/midi-tester',
            'https://www.gamepadtest.tech/blog',
            'https://www.gamepadtest.tech/about'
          ]
        })}</script>
      </Helmet>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 sm:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-pulse-glow absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="animate-pulse-glow absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in-down">
              <span className="text-gray-700 animate-scale-in">GamepadTest</span> – Free Online Gamepad & Controller Tester
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-in-up animate-stagger-1">
              Professional-grade gamepad testing tool trusted by millions. Test Xbox, PlayStation, and PC controllers with instant real-time results. 100% free, no downloads required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up animate-stagger-2">
              <Button asChild size="lg" className="gap-2 hover-lift hover-glow">
                <Link to="/gamepad-tester">
                  Start Testing
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="hover-scale">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* All Tools Section */}
      <section className="py-16 sm:py-24" ref={toolsAnimation.ref}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className={`mx-auto max-w-2xl text-center mb-12 transition-all duration-700 ${
            toolsAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-4">
              Choose Your Testing Tool
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional hardware testing tools for all your gaming and audio equipment
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto" ref={toolsContainerRef}>
            {/* Gamepad Tester */}
            <Link
              to="/gamepad-tester"
              className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${
                toolsVisible[0] ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
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
                  Test controllers with real-time input detection and vibration feedback
                </p>
              </div>
            </Link>

            {/* GPU Tester */}
            <Link
              to="/gpu-tester"
              className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${
                toolsVisible[1] ? 'animate-fade-in-up animate-stagger-1' : 'opacity-0 translate-y-8'
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
                toolsVisible[2] ? 'animate-fade-in-up animate-stagger-2' : 'opacity-0 translate-y-8'
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
                toolsVisible[3] ? 'animate-fade-in-up animate-stagger-3' : 'opacity-0 translate-y-8'
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
                  Test MIDI devices with real-time signal detection and visualization
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Comprehensive GamepadTest Content */}
      <section className="py-20 sm:py-32 bg-muted/50" ref={featuresAnimation.ref}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl animate-fade-in-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">GamepadTest: The Reliable Online Controller Tester</h2>
              <p className="mt-6 text-xl leading-8 text-muted-foreground">
                A smooth and accurate controller can make the difference between winning and losing in any game. When even one button fails or a joystick starts drifting the experience quickly becomes frustrating.
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
              {/* Introduction */}
              <div className="bg-white rounded-lg p-8 shadow-sm hover-lift transition-all duration-300 animate-fade-in-up animate-stagger-1">
                <p className="text-lg leading-relaxed">
                  GamepadTest is designed to help gamers test their controllers online for free without any software installation. It works with popular devices such as PlayStation, Xbox, and PC gamepads directly in your browser.
                </p>
              </div>

              {/* Why Testing Matters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up animate-stagger-2">
                <section className="hover-lift rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                    <Shield className="h-6 w-6 text-primary" />
                    Why Testing Your Controller Matters
                  </h3>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <p>Controllers are used for hours every week and over time they naturally develop issues. Joystick drift is one of the most common problems where the stick moves on its own without being touched.</p>
                    <p>A gamepad checker also gives peace of mind. Competitive players especially need to be sure that every button press is recorded instantly. Even a small delay or inaccurate input can ruin the outcome of a match.</p>
                  </div>
                </section>

                <section className="hover-lift rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                    <Zap className="h-6 w-6 text-primary" />
                    How GamepadTest Works
                  </h3>
                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <p>GamepadTest is an online application that shows live feedback as you press buttons, move sticks, or pull triggers. The interface is clear and easy to understand.</p>
                    <p>All you need to do is connect your device either through USB or Bluetooth and open the website. The tool immediately detects inputs and displays them in real time.</p>
                  </div>
                </section>
              </div>

              {/* Controllers Supported */}
              <div className="bg-gray-50 rounded-lg p-8 animate-fade-in-up animate-stagger-3">
                <h3 className="text-2xl font-bold mb-6 text-center text-foreground">Controllers Supported</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-white rounded-lg hover-scale transition-all duration-300">
                    <Gamepad2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">PlayStation Controllers</h4>
                    <p className="text-sm">PS3, PS4, and PS5 controller tester. Full support for PC testing with PS5 controllers.</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg hover-scale transition-all duration-300">
                    <Monitor className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">Xbox Controllers</h4>
                    <p className="text-sm">From Xbox 360 to Xbox Series X/S. Full gamepad tester Xbox compatibility with PC setups.</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg hover-scale transition-all duration-300">
                    <Globe className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">PC & Generic Gamepads</h4>
                    <p className="text-sm">Any USB or Bluetooth controller. Third-party joypads and older devices fully supported.</p>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="animate-fade-in-up animate-stagger-4">
                <h3 className="text-2xl font-bold mb-8 text-center text-foreground">Key Features of the Online Tester</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "Real-time Accuracy", desc: "Every movement and button press is shown instantly so you know exactly how your controller responds.", icon: Zap },
                    { title: "No Downloads Required", desc: "GamepadTest runs directly in your browser which makes it fast and secure.", icon: Globe },
                    { title: "Cross-platform Support", desc: "Built for all major brands - PS4, PS5, Xbox, and PC controllers.", icon: Monitor },
                    { title: "Stick Drift Detection", desc: "Our gamepad tester stick drift function detects joystick movement issues early.", icon: Gamepad2 },
                    { title: "Free and Unlimited", desc: "Anyone can access the controller tester online free of charge with no restrictions.", icon: CheckCircle },
                    { title: "Universal Compatibility", desc: "Works with any device that supports modern web browsers.", icon: Shield }
                  ].map((feature) => (
                    <div key={feature.title} className="hover-lift rounded-lg border bg-white p-6">
                      <feature.icon className="h-8 w-8 text-primary mb-4" />
                      <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                      <p className="text-sm">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Problems */}
              <div className="bg-red-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-center text-foreground">Common Problems You Can Identify</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-foreground">Stick Drift</h4>
                        <p className="text-sm">When your joystick registers movement without being touched.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-foreground">Unresponsive Buttons</h4>
                        <p className="text-sm">Buttons that only work sometimes or require extra pressure.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-foreground">Trigger Sensitivity Loss</h4>
                        <p className="text-sm">Triggers that no longer register gradual pressure.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-foreground">Connection Issues</h4>
                        <p className="text-sm">Input lag or dropped signals detected during testing.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to Use */}
              <div className="bg-blue-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-center text-foreground">How to Use the Controller Checker Online</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    "Connect your controller via USB or Bluetooth",
                    "Open GamepadTest in your browser",
                    "Press every button and move joysticks",
                    "Watch the live display for verification",
                    "Note any issues and take action"
                  ].map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm font-medium text-foreground">{step}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-center text-muted-foreground">
                  This process only takes a minute yet it can save hours of frustration in competitive play.
                </p>
              </div>

              {/* Why Trusted */}
              <div className="text-center bg-white rounded-lg p-8 shadow-sm">
                <h3 className="text-2xl font-bold mb-4 text-foreground">Why GamepadTest is Trusted</h3>
                <p className="text-lg mb-6">
                  Unlike many tools that only support one brand, our platform is designed for universal use. Whether you need a joystick tester online for a generic gamepad or a professional Xbox controller tester for competitive play, GamepadTest is optimized for accuracy and simplicity.
                </p>
                <p className="text-base">
                  The tool is also safe to use. It does not collect personal information or install extra software. Everything runs inside your browser and disappears once you close the page.
                </p>
              </div>

              {/* Call to Action */}
              <div className="text-center bg-primary text-white rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-4">Test Your Controller Today</h3>
                <p className="text-lg mb-6">
                  Your controller is one of the most important parts of your gaming setup. When it fails even slightly, your entire experience suffers.
                </p>
                <Button asChild size="lg" variant="secondary" className="hover-scale">
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
          <div className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            faqAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Everything you need to know about our hardware testing tools.
            </p>
          </div>
          <div className={`mx-auto mt-16 max-w-2xl transition-all duration-700 ${
            faqAnimation.isVisible ? 'animate-fade-in-up animate-stagger-1' : 'opacity-0 translate-y-8'
          }`}>
            <dl className="space-y-8">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className={`transition-all duration-500 hover-scale hover:bg-muted/30 rounded-lg p-4 -m-4 ${
                    faqAnimation.isVisible ? 'animate-fade-in-left' : 'opacity-0 translate-x-8'
                  }`}
                  style={{ animationDelay: `${(index + 2) * 200}ms` }}
                >
                  <dt className="text-base font-semibold leading-7 flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 transition-transform duration-300 hover:scale-125" />
                    {faq.question}
                  </dt>
                  <dd className="mt-2 ml-7 text-base leading-7 text-muted-foreground">{faq.answer}</dd>
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
