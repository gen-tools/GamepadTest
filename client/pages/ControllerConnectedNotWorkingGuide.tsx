import { Link } from 'react-router-dom';
import { Gamepad2, ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle, Wrench, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';

export default function ControllerConnectedNotWorkingGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Controller Connected but Not Working on PC? Here's How to Actually Fix It",
    "description": "Fix controller connected but not working on PC. Resolve driver conflicts, XInput/DirectInput mismatches, Bluetooth sync issues, and Steam Input settings.",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://gamepadtest.vercel.app/blog/controller-connected-but-not-working-on-pc-heres-how-to-actually-fix-it"
    },
    "author": {
      "@type": "Organization",
      "name": "GamepadTest"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GamepadTest",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gamepadtest.vercel.app/favicon.svg"
      }
    },
    "datePublished": "2026-08-07",
    "dateModified": "2026-08-07",
    "image": "https://gamepadtest.vercel.app/og-image.jpg"
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://gamepadtest.vercel.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://gamepadtest.vercel.app/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Controller Connected but Not Working on PC? Here's How to Actually Fix It",
        "item": "https://gamepadtest.vercel.app/blog/controller-connected-but-not-working-on-pc-heres-how-to-actually-fix-it"
      }
    ]
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>Controller Connected but Not Working on PC? Here's How to Actually Fix It - GamepadTest</title>
        <meta name="description" content="Fix controller connected but not working on PC. Resolve driver conflicts, XInput/DirectInput mismatches, Bluetooth sync issues, and Steam Input settings." />
        <meta name="keywords" content="controller connected but not working pc, controller detected but no input, fix pc controller connected not responding, controller connected but buttons don't work, xbox controller connected but not working pc" />
        <link rel="canonical" href="https://gamepadtest.vercel.app/blog/controller-connected-but-not-working-on-pc-heres-how-to-actually-fix-it" />

        {/* Open Graph */}
        <meta property="og:title" content="Controller Connected but Not Working on PC? Here's How to Actually Fix It - GamepadTest" />
        <meta property="og:description" content="Fix controller connected but not working on PC. Resolve driver conflicts, XInput/DirectInput mismatches, Bluetooth sync issues, and Steam Input settings." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://gamepadtest.vercel.app/blog/controller-connected-but-not-working-on-pc-heres-how-to-actually-fix-it" />
        <meta property="og:site_name" content="GamepadTest" />
        <meta property="og:image" content="https://gamepadtest.vercel.app/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GamepadTest" />
        <meta name="twitter:title" content="Controller Connected but Not Working on PC? Here's How to Actually Fix It - GamepadTest" />
        <meta name="twitter:description" content="Fix controller connected but not working on PC. Resolve driver conflicts, XInput/DirectInput mismatches, Bluetooth sync issues, and Steam Input settings." />
        <meta name="twitter:image" content="https://gamepadtest.vercel.app/twitter-image.jpg" />

        {/* JSON-LD Schemas */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-down">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline">Gamepad Testing</Badge>
            <span className="text-sm text-muted-foreground">Published August 7, 2026 • 10 min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center flex justify-center items-center animate-fade-in-right animate-stagger-1">
            Controller Connected but Not Working on PC? Here's How to Actually Fix It
          </h1>
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none animate-fade-in-up animate-stagger-3">
          <p className="text-lg leading-relaxed mb-6">
            You plug in your controller, or pair it over Bluetooth, and Windows says it's connected. The light is on. Everything looks fine. Then you open a game and nothing happens — no movement, no button presses registering, sometimes not even a response in the menu.
          </p>

          <p className="mb-6">
            This is one of the more frustrating PC gaming problems because it doesn't feel like a connection issue. The controller clearly is connected. So the usual advice — "check your cable" or "re-pair the device" — often misses the real cause.
          </p>

          <p className="mb-8">
            The truth is that "connected but not working" almost always comes down to one of a handful of things: Windows sees the hardware but the wrong driver is loaded, the game is listening for an input type your controller isn't sending, a background app is stealing the input, or a leftover "ghost" device is conflicting with the real one. Let's go through each of these properly, starting with how to diagnose what's actually happening before you start changing settings blindly.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Why a Controller Shows as Connected but Doesn't Respond</h2>

          <p className="mb-4">
            Before jumping into fixes, it helps to understand what's going on under the hood. A controller "working" on a PC actually depends on three separate layers, and a failure in any one of them can produce this exact symptom:
          </p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>The physical/wireless connection — USB, Bluetooth, or a proprietary wireless dongle. This is the layer Windows checks when it shows "connected."</li>
            <li>The driver layer — the software that translates raw controller signals into something Windows and games can understand.</li>
            <li>The input API layer — how the game actually reads that data. Most PC games expect either XInput (the Xbox-style standard) or DirectInput (the older, more generic standard).</li>
          </ul>

          <p className="mb-6">
            A controller can pass layer one perfectly and still fail at layer two or three. That's why it shows as connected while doing absolutely nothing in-game.
          </p>

          <p className="mb-4 font-semibold">Common root causes include:</p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Outdated, corrupted, or conflicting drivers</li>
            <li>A game expecting XInput when your controller only speaks DirectInput (or vice versa)</li>
            <li>Leftover "ghost" controller entries in Device Manager confusing Windows about which device to send input to</li>
            <li>USB power-saving settings putting the controller to sleep mid-session</li>
            <li>Steam or another launcher intercepting input before it reaches the game</li>
            <li>Bluetooth pairing that's technically connected but not fully synced</li>
            <li>The game's own control settings pointing to the wrong input device</li>
          </ul>

          <p className="mb-8">
            Most guides jump straight to "update your drivers." That's a reasonable first step, but it only solves maybe a third of cases. The rest need something more specific, which is why it's worth diagnosing first.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Step 1: Confirm Windows Actually Recognizes the Controller Correctly</h2>

          <p className="mb-6">
            Don't skip this step, even if you're confident the controller is detected. There's a difference between Windows detecting a device and Windows detecting it correctly.
          </p>

          <p className="font-semibold mb-2">Check Game Controller Settings:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Press Win + R to open Run.</li>
            <li>Type joy.cpl and hit Enter.</li>
            <li>Look at your controller's status. It should say "OK." If it says anything else, or the controller isn't listed at all, you've found your problem before even opening a game.</li>
            <li>Click Properties, then the Test tab, and move the sticks or press a few buttons. If nothing lights up here, the issue is happening before the game even gets involved — which rules out anything game-specific.</li>
          </ol>

          <p className="font-semibold mb-2">Check Device Manager for duplicates or errors:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Right-click the Start button and choose Device Manager.</li>
            <li>Expand Human Interface Devices, Sound, video and game controllers, and (for wireless controllers) Bluetooth.</li>
            <li>Look for your controller listed more than once, or with a yellow warning triangle.</li>
            <li>Also click View &gt; Show hidden devices to reveal "ghost" entries — controllers you've connected in the past that Windows never fully removed. These sit in the background and can quietly conflict with the active device, even though they're not physically connected anymore.</li>
          </ol>

          <p className="mb-8">
            If you spot duplicates or ghost entries, right-click each one and select Uninstall device. Then disconnect the controller, restart your PC, and reconnect it. Windows will reinstall a clean driver automatically.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Step 2: Test the Controller Outside the Game First</h2>

          <p className="mb-6">
            This is the step most troubleshooting guides skip, and it's genuinely the fastest way to narrow down where the problem lives. Instead of guessing based on what happens in one specific game, test the raw input directly with a browser-based <Link to="/gamepad-tester" className="text-primary font-medium hover:underline">gamepad tester</Link>. It reads every button, trigger, and stick axis in real time, with no game or launcher involved.
          </p>

          <p className="font-semibold mb-2">Why this matters:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>If buttons register in the <Link to="/gamepad-tester" className="text-primary font-medium hover:underline">tester</Link> but not in your game → the problem is game-specific (wrong input API, wrong controller selected in settings, or a launcher conflict).</li>
            <li>If nothing registers in the <Link to="/gamepad-tester" className="text-primary font-medium hover:underline">tester</Link> either → the problem is at the Windows/driver level, and no amount of in-game tweaking will fix it.</li>
            <li>If only some inputs register (sticks work but buttons don't, or vice versa) → this usually points to a driver mismatch or a failing controller component, which changes your next steps entirely.</li>
          </ul>

          <p className="mb-8">
            This one test can save you from spending an hour adjusting settings for the wrong problem.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Step 3: Fix Driver Conflicts (The Most Common Cause)</h2>

          <p className="mb-6">
            If the controller doesn't respond even in a <Link to="/gamepad-tester" className="text-primary font-medium hover:underline">raw input tester</Link>, driver issues are the most likely culprit. Here's how to clear them properly, not just superficially.
          </p>

          <p className="font-semibold mb-2">Reinstall the driver from scratch:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Open Device Manager and locate your controller.</li>
            <li>Right-click it and choose Uninstall device. Tick the box for "Delete the driver software for this device" if it appears.</li>
            <li>Unplug the controller (or turn off Bluetooth for wireless ones).</li>
            <li>Restart your PC.</li>
            <li>Reconnect the controller. Windows should detect it fresh and install a matching driver automatically.</li>
          </ol>

          <p className="font-semibold mb-2">If Windows installs the wrong driver:</p>
          <p className="mb-4">
            Sometimes Windows assigns a generic or outdated driver instead of the correct one. You can check this by going to the driver's Properties &gt; Driver tab and clicking Update Driver &gt; Browse my computer for drivers &gt; Let me pick from a list. If multiple entries show up here for the same device type, that's often the source of the conflict — pick the one matching your actual controller brand rather than a generic HID entry.
          </p>

          <p className="mb-8">
            For Xbox controllers specifically, Windows sometimes lists them under "Xbox 360 Peripherals" even when it's a newer Xbox One or Series controller. This isn't usually a problem on its own, but if the driver under that entry is old or corrupted, updating it (or letting the Xbox Accessories app manage firmware) often resolves persistent input drops.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Step 4: Match the Controller to the Right Input API</h2>

          <p className="mb-6">
            This is the fix most articles gloss over, but it explains a huge share of "connected but not working" cases, especially with older or third-party controllers.
          </p>

          <p className="mb-4">
            Windows PC games generally expect input through one of two systems:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>XInput — the standard Xbox controllers use. Most modern games are built around it first.</li>
            <li>DirectInput — an older, more generic standard used by many third-party, retro-style, or non-Xbox-shaped controllers.</li>
          </ul>

          <p className="mb-6">
            If your controller only supports DirectInput and the game you're playing was coded to expect XInput exclusively, the controller can connect fine and even respond in Windows' own test menu, while doing absolutely nothing inside that specific game.
          </p>

          <p className="font-semibold mb-2">How to tell which one you're dealing with:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>If the controller shows up as an "Xbox 360 Controller for Windows" in Device Manager, it's using XInput.</li>
            <li>If it shows up under a generic name like "HID-compliant game controller" or the manufacturer's own name, it's likely DirectInput.</li>
          </ul>

          <p className="font-semibold mb-2">Fixes for this mismatch:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Check whether the game has a setting to switch controller input type (some do, buried in control or accessibility settings).</li>
            <li>Use a wrapper tool like x360ce, which emulates an Xbox controller so DirectInput devices can be recognized by XInput-only games. This is a common, well-established workaround, not a hack — many PC gamers with non-Xbox controllers rely on it.</li>
            <li>If you're buying a new controller specifically for PC use, prioritize one that natively supports XInput to avoid this entirely.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Step 5: Rule Out Power Management Settings</h2>

          <p className="mb-6">
            USB ports on Windows have a power-saving feature that can put connected devices to sleep, including controllers, especially during longer play sessions or when the PC is on battery power (for laptops).
          </p>

          <p className="font-semibold mb-2">To disable this:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Open Device Manager.</li>
            <li>Expand Universal Serial Bus controllers.</li>
            <li>Right-click each USB Root Hub entry, choose Properties &gt; Power Management.</li>
            <li>Uncheck Allow the computer to turn off this device to save power.</li>
            <li>Repeat for all USB Root Hub entries, since there are usually several.</li>
          </ol>

          <p className="mb-8">
            This fix specifically explains cases where a controller works fine for a few minutes and then randomly stops responding mid-session, even though it still shows as "connected."
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Step 6: Bluetooth-Specific Fixes for Wireless Controllers</h2>

          <p className="mb-6">
            Wireless controllers introduce an extra failure point: Bluetooth can report a "connected" status without a fully synced input session actually being established. This is different from a wired connection issue and needs its own approach.
          </p>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Fully unpair and re-pair, rather than just reconnecting. Go to Settings &gt; Bluetooth &amp; devices, remove the controller entirely, then add it again as a new device.</li>
            <li>Check for interference. Wi-Fi routers, USB 3.0 ports, and other 2.4GHz devices sitting near your PC can degrade Bluetooth signal quality enough to cause dropped or partial input, even at close range.</li>
            <li>Confirm sync state, not just connection state. On some controllers (Switch Pro Controller and various third-party pads included), the sync light needs to stay in a specific pattern to indicate an active input session. If it goes solid too early or flickers unexpectedly, the pairing hasn't fully completed even though Windows lists it as connected.</li>
            <li>Use a wired connection to test. If a USB cable resolves the issue immediately, you've confirmed it's Bluetooth-specific rather than a driver or game problem, which narrows your next steps considerably.</li>
            <li>Keep controller firmware updated. Manufacturer companion apps (Xbox Accessories, DualSense firmware via PS5 console, etc.) occasionally patch Bluetooth stability issues that show up specifically on PC.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Step 7: Check In-Game Controller Settings</h2>

          <p className="mb-6">
            Even with everything working correctly at the Windows level, some games simply aren't listening to the controller because of how their settings are configured.
          </p>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Look for a controller/input device selector in the game's settings menu — some games let multiple input devices stay "active" at once and default to the wrong one.</li>
            <li>Check whether "Controller Support" or "Enable Gamepad" is toggled off by default, which is common in older PC ports.</li>
            <li>If you have more than one controller connected (even an old one left plugged into a spare USB port), disconnect the extras. Some games get confused when multiple input devices are present and silently listen to the wrong one.</li>
            <li>Restart the game after making any input changes — most games only read controller settings on launch, not live.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Step 8: Fix Steam-Specific Conflicts</h2>

          <p className="mb-6">
            If you're launching games through Steam, there's an extra layer that causes a lot of confusion: Steam Input. This feature intercepts controller signals and remaps them before they ever reach the game, and it can conflict with a game's own native controller support.
          </p>

          <p className="font-semibold mb-2">To check and fix this:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Open Steam and go to Settings &gt; Controller &gt; General Controller Settings.</li>
            <li>See which options are enabled (Xbox Configuration Support, PlayStation Configuration Support, Generic Gamepad Configuration Support).</li>
            <li>If a game has excellent native controller support already, try disabling Steam Input for that specific title: right-click the game in your library, go to Properties &gt; Controller, and set it to "Disable Steam Input."</li>
            <li>If native support is poor or the game doesn't recognize the controller at all, try the opposite — force Steam Input on and use a community controller configuration.</li>
          </ol>

          <p className="mb-8">
            This single setting resolves a surprising number of "works everywhere except this one game" reports.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Xbox Controller-Specific Troubleshooting</h2>

          <p className="mb-4">
            Xbox controllers are generally the most PC-friendly option, but they still run into this issue, usually for one of these reasons:
          </p>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Wireless adapter driver issues. If you're using the official Xbox Wireless Adapter, it needs its own driver separate from the controller itself. Update both independently through Device Manager or the Xbox Accessories app.</li>
            <li>Xbox Accessories app conflicts. Occasionally the app itself interferes with background input handling. Closing it after checking firmware/battery status (rather than leaving it running) resolves some persistent cases.</li>
            <li>Battery-related dropouts on wireless models — a controller can report "connected" right up until the battery drops too low to sustain a stable signal, at which point input becomes erratic before disconnecting entirely.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">PlayStation Controller (DualShock 4 / DualSense) Troubleshooting</h2>

          <p className="mb-4">
            PlayStation controllers aren't natively built for Windows the way Xbox controllers are, so they need a bit more setup:
          </p>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Windows detects DualShock 4 and DualSense controllers as generic HID devices by default, which means many games won't recognize them without help.</li>
            <li>Third-party tools like DS4Windows translate PlayStation input into XInput signals that far more games understand natively. This is the standard fix, not a workaround of last resort.</li>
            <li>Some newer games (and Steam specifically) have added native DualSense support, including touchpad and adaptive trigger features, but this varies title by title — don't assume every game supports it out of the box.</li>
            <li>If using a cable, make sure it supports data transfer, not just charging. Some third-party USB-C cables are power-only and will show a "connected" charging state while sending no input data at all.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Nintendo Switch Pro Controller / Joy-Con Troubleshooting</h2>

          <p className="mb-4">
            These are the most likely to show "connected but not working" symptoms on PC, mainly because Windows support for them is unofficial:
          </p>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Pairing over Bluetooth can appear successful while the input session never fully activates — the sync light pattern is the most reliable indicator, not the Windows Bluetooth status.</li>
            <li>Most games need a translation layer, similar to DS4Windows, to interpret Joy-Con or Pro Controller input correctly.</li>
            <li>Motion controls and gyro won't carry over to PC in most cases, even when button input works fine.</li>
            <li>If you're only getting partial input (sticks work, buttons don't, or vice versa), this is often a sign the translation software isn't fully mapping every input type — check for an updated version.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">When It's Actually a Hardware Problem</h2>

          <p className="mb-4">
            If you've worked through drivers, input APIs, power settings, Bluetooth pairing, and in-game settings and it's still not working, it's worth ruling out a hardware fault before spending more time on software fixes.
          </p>

          <p className="font-semibold mb-2">Signs pointing to a hardware issue rather than a software one:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>The controller fails the same way on a completely different PC or console.</li>
            <li>Only specific buttons or one stick axis fail consistently, while everything else works — this pattern rarely comes from software.</li>
            <li>The controller works fine when freshly powered on but degrades within minutes (can indicate a failing battery or a loose internal connection).</li>
            <li>A wired controller only works when the cable is held at a specific angle, suggesting a damaged port or cable rather than a driver problem.</li>
          </ul>

          <p className="mb-8">
            Testing on a raw input reader is the fastest way to confirm this, since it removes every game and launcher variable from the equation. If inputs are missing or inconsistent there too, no driver reinstall is going to fix it.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>

          <div className="space-y-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Why does my controller vibrate and light up but not respond to any buttons?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This usually means the physical/power connection is fine but the driver or input API layer is failing — the controller has power but its signals aren't being interpreted correctly by Windows or the game.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Does restarting my PC actually fix this?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sometimes, yes — a restart clears out stuck driver states and lets Windows re-initialize the connection cleanly. It's worth trying before deeper fixes, but it won't resolve input API mismatches or ghost device conflicts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Why does my controller work in one game but not another?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This almost always points to input API mismatches (XInput vs. DirectInput) or a game-specific setting, since the controller and Windows are clearly functioning correctly elsewhere.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Can a USB hub cause this issue?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes. Some USB hubs, especially unpowered ones, don't reliably pass through the data signals a controller needs, even though they supply enough power to show as "connected." Connecting directly to a PC's USB port is a useful diagnostic step.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Is it safe to use third-party tools like DS4Windows or x360ce?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Both are long-established, widely used tools for exactly this purpose, and they don't modify your controller's firmware. That said, only download them from their official sources to avoid bundled software you don't want.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  Why does my controller disconnect and reconnect repeatedly?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This pattern usually points to power management settings, a failing battery on wireless models, or interference on Bluetooth — rarely a driver issue on its own.
                </p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Quick Reference: Troubleshooting Checklist</h2>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Confirm status in joy.cpl shows "OK"</li>
            <li>Test raw input with a <Link to="/gamepad-tester" className="text-primary font-medium hover:underline">gamepad tester</Link> before touching any game settings</li>
            <li>Remove ghost/duplicate devices in Device Manager</li>
            <li>Reinstall the controller driver from scratch</li>
            <li>Confirm XInput vs. DirectInput compatibility with the game</li>
            <li>Disable USB power-saving on all Root Hub entries</li>
            <li>Fully unpair and re-pair Bluetooth controllers (don't just reconnect)</li>
            <li>Check the game's own controller/input settings</li>
            <li>Review Steam Input settings if launching through Steam</li>
            <li>Rule out hardware failure by testing on another PC or console</li>
          </ul>

          <p className="text-lg font-medium mb-8">
            Working through these in order — diagnose first, then fix — will resolve the vast majority of "connected but not working" cases without wasting time on the wrong layer of the problem.
          </p>
        </article>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 mt-12 animate-fade-in-up">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Test Your Gamepad Now</CardTitle>
            <CardDescription className="text-lg">
              Check all buttons, analog sticks, triggers, and vibration in real time directly in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              to="/gamepad-tester"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-all hover-scale"
            >
              <Gamepad2 className="h-5 w-5" />
              Open Online Gamepad Tester
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
