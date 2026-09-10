import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Gamepad2, Monitor, Mic, Music, Touchpad } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';

const blogPosts = [
  {
    id: 'how-to-fix-trigger-issues-on-a-controller',
    title: 'How to Fix Trigger Issues on a Controller',
    excerpt: 'Learn how to fix trigger issues on Xbox, PlayStation, and Switch controllers. Fix trigger drift, stuck triggers, partial range, and unresponsiveness.',
    category: 'Controller Hardware & Repair',
    readTime: '8 min read',
    publishDate: '2026-08-08',
    icon: Gamepad2,
    href: '/blog/how-to-fix-trigger-issues-on-a-controller',
    color: 'bg-gray-100',
    iconColor: 'text-gray-700'
  },
  {
    id: 'how-to-test-a-touch-screen-for-dead-zones',
    title: 'How to Test a Touch Screen for Dead Zones',
    excerpt: 'Diagnose touchscreen dead zones step-by-step. Learn grid tests, free-draw checks, causes of touch unresponsiveness, and what your results mean.',
    category: 'Display & Touch Hardware',
    readTime: '9 min read',
    publishDate: '2026-08-08',
    icon: Touchpad,
    href: '/blog/how-to-test-a-touch-screen-for-dead-zones',
    color: 'bg-gray-100',
    iconColor: 'text-gray-700'
  },
  {
    id: 'controller-connected-but-not-working',
    title: "Controller Connected but Not Working on PC? Here's How to Actually Fix It",
    excerpt: 'Fix controller connected but not working on PC. Resolve driver conflicts, XInput/DirectInput mismatches, Bluetooth sync issues, and Steam Input settings.',
    category: 'Gamepad Testing',
    readTime: '10 min read',
    publishDate: '2026-08-07',
    icon: Gamepad2,
    href: '/blog/controller-connected-but-not-working-on-pc-heres-how-to-actually-fix-it',
    color: 'bg-gray-100',
    iconColor: 'text-gray-700'
  },
  {
    id: 'controller-buttons-not-working',
    title: "Controller Buttons Not Working? Here's How to Actually Fix It",
    excerpt: 'Learn how to fix unresponsive, sticky, or dead controller buttons on Xbox, PlayStation, Switch, and PC controllers. Simple cleaning, hardware, and software fixes.',
    category: 'Gamepad Testing',
    readTime: '9 min read',
    publishDate: '2026-08-07',
    icon: Gamepad2,
    href: '/blog/controller-buttons-not-working-heres-how-to-actually-fix-it',
    color: 'bg-gray-100',
    iconColor: 'text-gray-700'
  },
  {
    id: 'how-to-test-a-touch-screen-online',
    title: 'How to Test a Touch Screen Online (Without Downloading Anything)',
    excerpt: 'Test your phone, tablet, or laptop touchscreen online without downloading anything. Quickly diagnose touch dead spots, ghost touches, and multi-touch response.',
    category: 'Display & Touch Hardware',
    readTime: '8 min read',
    publishDate: '2026-08-07',
    icon: Touchpad,
    href: '/blog/how-to-test-a-touch-screen-online-without-downloading-anything',
    color: 'bg-gray-100',
    iconColor: 'text-gray-700'
  },
  {
    id: 'how-to-fix-stick-drift',
    title: 'How to Fix Stick Drift: A Complete Repair Guide for Xbox, PlayStation, and Switch Controllers',
    excerpt: 'Learn how to fix controller stick drift on Xbox, PS5, and Switch with free calibration, cleaning techniques, and hardware repair guides.',
    category: 'Gamepad Testing',
    readTime: '10 min read',
    publishDate: '2026-08-07',
    icon: Gamepad2,
    href: '/blog/how-to-fix-stick-drift-a-complete-repair-guide-for-xbox-playstation-and-switch-controllers',
    color: 'bg-gray-100',
    iconColor: 'text-gray-700'
  },
  {
    id: 'gamepad-tester-guide',
    title: 'Complete Guide to Testing Your Gaming Controllers',
    excerpt: 'Everything you need to know about testing Xbox, PlayStation, and PC controllers for optimal gaming performance.',
    category: 'Gamepad Testing',
    readTime: '8 min read',
    publishDate: '2026-08-07',
    icon: Gamepad2,
    href: '/blog/gamepad-tester-guide',
    color: 'bg-gray-100',
    iconColor: 'text-gray-700'
  },
  {
    id: 'gpu-performance-testing',
    title: 'Ultimate GPU Performance Testing Guide',
    excerpt: 'Learn how to benchmark your graphics card, identify performance issues, and optimize your gaming setup.',
    category: 'GPU Testing',
    readTime: '10 min read',
    publishDate: '2026-08-07',
    icon: Monitor,
    href: '/blog/gpu-performance-testing',
    color: 'bg-gray-100',
    iconColor: 'text-gray-700'
  },
  {
    id: 'microphone-testing-guide',
    title: 'Professional Microphone Testing Techniques',
    excerpt: 'Master microphone testing with our comprehensive guide covering audio quality, latency, and troubleshooting.',
    category: 'Audio Testing',
    readTime: '7 min read',
    publishDate: '2026-08-07',
    icon: Mic,
    href: '/blog/microphone-testing-guide',
    color: 'bg-gray-100',
    iconColor: 'text-gray-700'
  },
  {
    id: 'midi-device-testing',
    title: 'MIDI Device Testing and Troubleshooting',
    excerpt: 'Complete guide to testing MIDI keyboards, controllers, and interfaces for music production and performance.',
    category: 'MIDI Testing',
    readTime: '9 min read',
    publishDate: '2026-08-07',
    icon: Music,
    href: '/blog/midi-device-testing',
    color: 'bg-gray-100',
    iconColor: 'text-gray-700'
  },
  {
    id: 'touch-screen-testing',
    title: 'How to Test & Diagnose Touchscreen Digitizer Issues',
    excerpt: 'Comprehensive guide to identifying touch dead spots, verifying multi-touch support, and troubleshooting ghost touches.',
    category: 'Display & Touch Hardware',
    readTime: '5 min read',
    publishDate: '2026-08-07',
    icon: Touchpad,
    href: '/blog/touch-screen-testing',
    color: 'bg-gray-100',
    iconColor: 'text-gray-700'
  }
];

export default function Blog() {
  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>GamepadTest Blog - Hardware Testing Guides &amp; Tips</title>
        <meta name="description" content="Expert guides on testing gaming controllers, GPUs, microphones, and MIDI devices. Learn professional testing techniques and troubleshooting tips." />
        <meta name="keywords" content="hardware testing blog, gamepad testing guide, gpu benchmark guide, microphone testing tips, midi device testing" />
        <link rel="canonical" href="https://gamepadtest.vercel.app/blog" />

        {/* Open Graph */}
        <meta property="og:title" content="GamepadTest Blog - Hardware Testing Guides & Tips" />
        <meta property="og:description" content="Expert guides on testing gaming controllers, GPUs, microphones, and MIDI devices. Learn professional testing techniques and troubleshooting tips." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gamepadtest.vercel.app/blog" />
        <meta property="og:site_name" content="GamepadTest" />
        <meta property="og:image" content="https://gamepadtest.vercel.app/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GamepadTest" />
        <meta name="twitter:title" content="GamepadTest Blog - Hardware Testing Guides & Tips" />
        <meta name="twitter:description" content="Expert guides on testing gaming controllers, GPUs, microphones, and MIDI devices. Learn professional testing techniques and troubleshooting tips." />
        <meta name="twitter:image" content="https://gamepadtest.vercel.app/twitter-image.jpg" />
      </Helmet>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="text-4xl font-bold mb-4 text-center flex justify-center items-center">Hardware Testing Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-stagger-1">
            Expert guides, tips, and insights for testing your gaming and audio equipment like a professional
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <Card 
              key={post.id} 
              className={`group hover:shadow-lg transition-all duration-300 hover-lift hover-glow ${
                index === 0 ? 'animate-fade-in-left animate-stagger-2' :
                index === 1 ? 'animate-fade-in-right animate-stagger-2' :
                index === 2 ? 'animate-fade-in-left animate-stagger-3' :
                'animate-fade-in-right animate-stagger-3'
              }`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${post.color} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <post.icon className={`h-6 w-6 ${post.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {post.category}
                    </Badge>
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {post.excerpt}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.publishDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
                <Link 
                  to={post.href}
                  className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary/80 transition-colors group"
                >
                  Read Full Guide
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 animate-fade-in-up animate-stagger-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ready to Test Your Hardware?</CardTitle>
            <CardDescription className="text-lg">
              Use our professional testing tools to ensure your gaming equipment performs perfectly
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/gamepad-tester"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 px-6 py-3 rounded-lg font-medium transition-all hover-scale"
              >
                <Gamepad2 className="h-5 w-5" />
                Test Gamepad
              </Link>
              <Link 
                to="/gpu-tester"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 px-6 py-3 rounded-lg font-medium transition-all hover-scale"
              >
                <Monitor className="h-5 w-5" />
                Test GPU
              </Link>
              <Link 
                to="/mic-tester"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 px-6 py-3 rounded-lg font-medium transition-all hover-scale"
              >
                <Mic className="h-5 w-5" />
                Test Microphone
              </Link>
              <Link 
                to="/midi-tester"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 px-6 py-3 rounded-lg font-medium transition-all hover-scale"
              >
                <Music className="h-5 w-5" />
                Test MIDI
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
