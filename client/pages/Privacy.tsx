import { Shield, Eye, Lock, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';

export default function Privacy() {
  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>Privacy Policy - GamepadTest</title>
        <meta name="description" content="GamepadTest Privacy Policy. Learn how we protect your data, what information we collect, and your privacy rights when using our hardware testing tools." />
        <meta name="keywords" content="privacy policy, data protection, privacy rights, gamepadchecker privacy" />
        <link rel="canonical" href="https://www.gamepadtest.tech/privacy" />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Database, BarChart, Cookie, Globe, CheckCircle, Calendar, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-primary animate-bounce-in" />
            <h1 className="text-4xl font-bold animate-fade-in-right animate-stagger-1">Privacy Policy</h1>
          </div>
          <h2 className="text-xl text-muted-foreground animate-fade-in-up animate-stagger-2">
            How We Protect Your Privacy and Handle Your Data
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 8, 2026
          </p>
        </div>

        {/* Privacy Overview */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              <h2>Our Privacy Commitment</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed mb-4">
              At GamepadTest, we really care about your privacy. Testing your hardware should be straightforward, quick, and safe, without ever risking your personal info. Our goal is to offer tools that run right in your browser, so all your data stays right on your device—with you.
            </p>
            <p className="text-lg leading-relaxed">
              This Privacy Policy breaks down exactly what info we collect (and what we don't), how we use the little bit we do gather, and your rights when it comes to your data. We've made our approach clear, simple to follow, and all about keeping your privacy safe.
            </p>
          </CardContent>
        </Card>

        {/* What We Don't Collect */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-blue-600" />
              <h2>What We DON'T Collect</h2>
            </CardTitle>
            <CardDescription>
              Here's the key part of our privacy policy: we grab very little personal info—pretty much nothing at all.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h2 className="font-semibold text-lg">Hardware Test Data</h2>
                  <p className="text-muted-foreground">
                    All the testing happens right on your end. Inputs from your gamepads, MIDI devices, GPU stats, or mic audio stay put on your device. So, any signals from your hardware during a test get handled totally in your browser and never hit our servers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h2 className="font-semibold text-lg">Personal Information</h2>
                  <p className="text-muted-foreground">
                    We don't ask for or store names, emails, phone numbers, or anything that could identify you. You can jump in and use our tools completely anonymously, no personal stuff required.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h2 className="font-semibold text-lg">Device Information</h2>
                  <p className="text-muted-foreground">
                    We don't keep details about your specific hardware, like serial numbers or setups. Any info about your gear is just temporary, used only during your session for the test, and that's it.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h2 className="font-semibold text-lg">Audio or Video Content</h2>
                  <p className="text-muted-foreground">
                    For mic tests, your audio gets processed locally—we never record, save, or send it anywhere. And if we add video features down the line, we'll stick to the same rule: all media stays and gets handled on your device.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                By skipping these kinds of sensitive data, we make sure your privacy is protected from the start.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What We Do Collect */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-orange-600" />
              <h2>What We DO Collect</h2>
            </CardTitle>
            <CardDescription>
              Minimal, anonymous data to improve our service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h2 className="font-semibold text-lg mb-2">Basic Website Analytics</h2>
                <p className="text-muted-foreground mb-2">
                  We use everyday web analytics to see overall trends. This covers things like:
                </p>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• How many page views we get and which tools folks like most</li>
                  <li>• Rough locations of users (just country or state level)</li>
                  <li>• What browsers and versions people are using, to keep things compatible</li>
                  <li>• General, anonymous habits to boost speed and ease of use</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  All this is bundled up and made anonymous, so it can't point back to any one person.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-lg mb-2">Technical Information</h2>
                <p className="text-muted-foreground mb-2">
                  To keep our tools running well on various setups, we might gather:
                </p>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• Browser compatibility details</li>
                  <li>• Error reports to fix bugs</li>
                  <li>• Performance stats for tweaks</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  None of this has personal identifiers—it's all just tech stuff to help us maintain and upgrade things.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-6 w-6 text-purple-600" />
              <h2>How We Use the Information</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-lg">Improving Our Tools</h2>
                <p className="text-muted-foreground">
                  Anonymous usage info lets us spot which features you all love and which could use some work. That way, we put our energy into what really helps.
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-lg">Fixing Bugs and Issues</h2>
                <p className="text-muted-foreground">
                  Those error logs and tech feedback help us catch problems fast and sort them out, so our tools are more reliable for everyone.
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-lg">Ensuring Compatibility</h2>
                <p className="text-muted-foreground">
                  Knowing about browser types and device performance means we can make sure everything works great, no matter if you're on a desktop, laptop, or phone.
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                By keeping it all anonymous, we protect your privacy while still giving you a top-notch experience.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies and Local Storage */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-6 w-6 text-amber-600" />
              <h2>Cookies and Local Storage</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-lg">Essential Cookies</h2>
                <p className="text-muted-foreground">
                  We only use a few cookies, and just for basic site functions. Like, one might remember if you prefer light or dark mode. These don't track anything beyond the essentials.
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-lg">No Tracking Cookies</h2>
                <p className="text-muted-foreground">
                  We skip ad cookies or any from third parties that spy on you. Nothing here follows you around the web, builds profiles, or hits you with targeted ads.
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-lg">Local Storage</h2>
                <p className="text-muted-foreground">
                  Some settings, like your theme choice, get saved right in your browser for ease. This stays on your device, totally in your hands.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                You can tweak or wipe these cookies and local storage anytime via your browser options. Our tools will keep working fine even if you tighten things up or block them.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-600" />
              <h2>Third-Party Services</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We keep third-party stuff to a minimum, but a couple are needed to run the site:
            </p>
            <div className="space-y-3">
              <div>
                <h2 className="font-semibold text-lg">Web Hosting</h2>
                <p className="text-muted-foreground">
                  Our site sits on secure, privacy-minded hosts that meet global privacy rules. We pick them carefully so your data stays private and safe.
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-lg">Analytics</h2>
                <p className="text-muted-foreground">
                  We go with analytics services that respect privacy, just to check usage and make improvements. They don't track individuals or make personal profiles.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              By limiting third parties and choosing privacy-focused ones, we stay in control of your info.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2>Your Privacy Rights</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-lg">Right to Privacy</h2>
                <p className="text-muted-foreground">
                  Since we don't grab personal data, your privacy is built-in safe. There's no personal info stored that you'd need to check, change, or delete.
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-lg">Browser Controls</h2>
                <p className="text-muted-foreground">
                  Handle cookies, local storage, and other browser data through your settings. Our tools are made to work even with tough privacy modes or blocked cookies.
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-lg">Questions or Concerns</h2>
                <p className="text-muted-foreground">
                  Got questions or worries about how we handle privacy? Hit us up via the site—we take these seriously and get back to you quickly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Updates */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-orange-600" />
              <h2>Policy Updates</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We might tweak this Privacy Policy now and then to match changes in what we do or legal stuff. Big changes will get highlighted right on the site.
            </p>
            <p className="text-muted-foreground mt-4">
              Since we collect so little, updates usually beef up privacy rather than dial it back. When we change things, we'll make it obvious what's new so you can keep using our tools without worry.
            </p>
          </CardContent>
        </Card>

        {/* Final Notes */}
        <Card className="animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2>Final Notes</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Privacy is the heart of what we do at GamepadTest. We've built our tools and site to collect as little as possible, handle stuff locally when we can, and be upfront about everything.
            </p>
            <p className="text-muted-foreground mb-4">
              With this privacy-by-design approach, testing your gamepads, GPUs, mics, or MIDI gear is secure, safe, and private—just how it ought to be.
            </p>
            <p className="text-muted-foreground">
              Thanks for choosing GamepadTest. We hope you have fun testing your hardware, knowing your privacy is always in good hands.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last Updated: January 8, 2026
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
