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
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-primary animate-bounce-in" />
            <h1 className="text-4xl font-bold animate-fade-in-right animate-stagger-1">Privacy Policy</h1>
          </div>
          <p className="text-xl text-muted-foreground animate-fade-in-up animate-stagger-2">
            How we protect your privacy and handle your data
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 15, 2024
          </p>
        </div>

        {/* Privacy Overview */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-green-600" />
              Our Privacy Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed mb-4">
              At GamepadTest, your privacy is our top priority. We believe that testing your hardware should never compromise your personal data or privacy. Our tools are designed to work entirely in your browser, ensuring your information stays exactly where it belongs—with you.
            </p>
            <p className="text-lg leading-relaxed">
              This privacy policy explains what information we collect (spoiler: very little), how we use it, and what rights you have regarding your data.
            </p>
          </CardContent>
        </Card>

        {/* What We Don't Collect */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-blue-600" />
              What We DON'T Collect
            </CardTitle>
            <CardDescription>
              The most important part of our privacy policy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold">Hardware Test Data</h4>
                  <p className="text-sm text-muted-foreground">Your gamepad inputs, GPU performance data, microphone audio, or MIDI signals never leave your device.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold">Personal Information</h4>
                  <p className="text-sm text-muted-foreground">We don't collect names, email addresses, phone numbers, or any other personal identifying information.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold">Device Information</h4>
                  <p className="text-sm text-muted-foreground">We don't store information about your specific hardware, serial numbers, or device configurations.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold">Audio or Video Content</h4>
                  <p className="text-sm text-muted-foreground">Microphone tests process audio locally in your browser—we never record, store, or transmit your audio.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What We Do Collect */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-orange-600" />
              What We DO Collect
            </CardTitle>
            <CardDescription>
              Minimal, anonymous data to improve our service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Basic Website Analytics</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  We use standard web analytics to understand how our tools are used, including:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Page views and which tools are most popular</li>
                  <li>• General geographic regions (country/state level)</li>
                  <li>• Browser types and versions for compatibility</li>
                  <li>• Anonymous usage patterns to improve our tools</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  This data is aggregated and anonymized—we can't trace it back to individual users.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Technical Information</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  To ensure our tools work properly across different setups:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Browser compatibility information</li>
                  <li>• Error logs for debugging (no personal data)</li>
                  <li>• Performance metrics for optimization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle>How We Use Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Improving Our Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Anonymous usage data helps us understand which features are most valuable and where we should focus development efforts.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Fixing Bugs and Issues</h4>
                <p className="text-sm text-muted-foreground">
                  Error logs help us identify and fix problems that might affect your testing experience.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Ensuring Compatibility</h4>
                <p className="text-sm text-muted-foreground">
                  Browser and device information helps us maintain compatibility across different platforms and configurations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies and Local Storage */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle>Cookies and Local Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Essential Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  We use minimal cookies for basic website functionality, such as remembering your theme preference (dark/light mode).
                </p>
              </div>
              <div>
                <h4 className="font-semibold">No Tracking Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  We don't use advertising cookies, tracking cookies, or any cookies that follow you across other websites.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Local Storage</h4>
                <p className="text-sm text-muted-foreground">
                  Some preferences (like theme settings) are stored locally in your browser for convenience. This data never leaves your device.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              We use minimal third-party services to operate our website:
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">Web Hosting</h4>
                <p className="text-sm text-muted-foreground">
                  Our website is hosted on secure, privacy-focused platforms that comply with international privacy standards.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  We use privacy-focused analytics that don't track individual users or create personal profiles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle>Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Right to Privacy</h4>
                <p className="text-sm text-muted-foreground">
                  Since we don't collect personal data, your privacy is protected by design. There's no personal data to access, modify, or delete.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Browser Controls</h4>
                <p className="text-sm text-muted-foreground">
                  You can control cookies and local storage through your browser settings. Our tools will continue to work even with strict privacy settings.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Questions or Concerns</h4>
                <p className="text-sm text-muted-foreground">
                  If you have any questions about our privacy practices, please contact us through our website.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle>Policy Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We may update this privacy policy occasionally to reflect changes in our practices or legal requirements. 
              Any significant changes will be clearly communicated on our website. Since we collect minimal data, 
              most updates will likely expand privacy protections rather than reduce them.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              This policy was last updated on January 15, 2024.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
