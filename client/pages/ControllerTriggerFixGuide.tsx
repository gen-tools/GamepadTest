import { Link } from 'react-router-dom';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';

export default function ControllerTriggerFixGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "How to Fix Trigger Issues on a Controller",
    "description": "Learn how to fix trigger issues on Xbox, PlayStation, and Switch controllers. Fix trigger drift, stuck triggers, partial range, and unresponsiveness.",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://gamepadtest.vercel.app/blog/how-to-fix-trigger-issues-on-a-controller"
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
    "datePublished": "2026-08-08",
    "dateModified": "2026-08-08",
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
        "name": "How to Fix Trigger Issues on a Controller",
        "item": "https://gamepadtest.vercel.app/blog/how-to-fix-trigger-issues-on-a-controller"
      }
    ]
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>How to Fix Trigger Issues on a Controller - GamepadTest</title>
        <meta name="description" content="Learn how to fix trigger issues on Xbox, PlayStation, and Switch controllers. Fix trigger drift, stuck triggers, partial range, and unresponsiveness." />
        <meta name="keywords" content="fix controller trigger, controller trigger drift, trigger not working, L2 R2 trigger fix, LT RT trigger fix" />
        <link rel="canonical" href="https://gamepadtest.vercel.app/blog/how-to-fix-trigger-issues-on-a-controller" />

        {/* Open Graph */}
        <meta property="og:title" content="How to Fix Trigger Issues on a Controller - GamepadTest" />
        <meta property="og:description" content="Learn how to fix trigger issues on Xbox, PlayStation, and Switch controllers. Fix trigger drift, stuck triggers, partial range, and unresponsiveness." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://gamepadtest.vercel.app/blog/how-to-fix-trigger-issues-on-a-controller" />
        <meta property="og:site_name" content="GamepadTest" />
        <meta property="og:image" content="https://gamepadtest.vercel.app/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GamepadTest" />
        <meta name="twitter:title" content="How to Fix Trigger Issues on a Controller - GamepadTest" />
        <meta name="twitter:description" content="Learn how to fix trigger issues on Xbox, PlayStation, and Switch controllers. Fix trigger drift, stuck triggers, partial range, and unresponsiveness." />
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
            <Badge variant="outline">Controller Hardware & Repair</Badge>
            <span className="text-sm text-muted-foreground">Published August 8, 2026 • 8 min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center flex justify-center items-center animate-fade-in-right animate-stagger-1">
            How to Fix Trigger Issues on a Controller
          </h1>
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none animate-fade-in-up animate-stagger-3">
          <p className="text-lg leading-relaxed mb-6">
            Your trigger isn't your thumbstick, and it isn't a regular button either. It's the pressure-sensitive part under your index finger — L2/R2 on PlayStation, LT/RT on Xbox, ZL/ZR on Nintendo — and when it starts acting up, it breaks the game in a very specific way. Racing games won't accelerate properly. Shooters fire when you're not touching anything. Aiming feels like it's stuck halfway.
          </p>

          <p className="mb-8">
            Most guides online lump this in with stick drift, but triggers are a different part with different failure points, so they need different fixes. This guide is only about triggers: what goes wrong, why it happens, and exactly how to fix it, whether the cause is dust, software, or a worn-out part inside.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">What Counts as a "Trigger Issue"</h2>

          <p className="mb-4">
            Before fixing anything, it helps to know exactly what you're dealing with. Trigger problems usually fall into one of these patterns:
          </p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>No response at all.</strong> You pull the trigger and nothing happens in-game, even though other buttons work fine.</li>
            <li><strong>Partial range.</strong> The trigger works, but never reaches full power no matter how hard you pull it — your car never hits top speed, your gun never fires at full rate.</li>
            <li><strong>Trigger drift.</strong> The trigger sends a signal even when you're not touching it, similar to stick drift but on the analog trigger instead of the thumbstick.</li>
            <li><strong>Sticking or slow return.</strong> You pull the trigger and it doesn't spring back on its own, or it feels gritty and uneven as it moves.</li>
            <li><strong>One trigger works, the other doesn't.</strong> A very common pattern that usually points to one specific part rather than a general controller fault.</li>
            <li><strong>Works sometimes, fails other times.</strong> Inconsistent response, often tied to a loose connection or worn contact point rather than a total failure.</li>
            <li><strong>Adaptive trigger problems (DualSense only).</strong> The trigger's resistance feels stuck, too heavy, too light, or doesn't change at all between games.</li>
          </ul>

          <p className="mb-8">
            Each of these has a slightly different root cause, so the first real step isn't fixing anything — it's figuring out exactly which of these you're seeing.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Step 1: Confirm What's Actually Happening</h2>

          <p className="mb-4">
            Don't guess based on what happens in one game. Games apply their own dead zones and sensitivity curves, which can hide or exaggerate a trigger problem and lead you to the wrong fix.
          </p>

          <p className="mb-4">
            Instead, check the raw trigger signal directly using a browser-based <Link to="/gamepad-tester" className="text-primary hover:underline font-medium">gamepad tester</Link>. It shows the trigger's actual input value in real time, completely separate from any game.
          </p>

          <p className="mb-2 font-semibold">Here's what to look for:</p>

          <ol className="list-decimal pl-6 mb-6 space-y-3">
            <li><strong>Rest state.</strong> With your finger completely off the trigger, the value should sit at zero (or very close to it). If it shows any value at rest, that's trigger drift.</li>
            <li><strong>Full pull.</strong> Press the trigger all the way down. It should hit its maximum value smoothly. If it stalls partway no matter how hard you press, that's a partial-range issue.</li>
            <li><strong>Smoothness.</strong> Pull slowly and watch the value climb. It should rise evenly. Jumps, freezes, or sudden drops during a slow pull point to a dirty or worn internal sensor.</li>
            <li><strong>Left vs. right comparison.</strong> Test both triggers the same way and compare. If one behaves normally and the other doesn't, you've confirmed it's isolated to a single trigger, not a controller-wide fault.</li>
          </ol>

          <p className="mb-8">
            This test alone tells you whether you're dealing with a software problem, a dirt problem, or a worn-out part — and that decision shapes everything else in this guide.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Why Triggers Fail: The Real Causes</h2>

          <p className="mb-4">
            Understanding the "why" matters because it tells you whether a five-minute cleaning will fix it, or whether you're looking at a part replacement.
          </p>

          <p className="mb-3">
            <strong>Dust and debris.</strong> Triggers move constantly across a small sensor, and even tiny particles — skin oils, dust, crumbs — can work their way in and interfere with the reading. This is genuinely the most common cause, especially on controllers that are more than a few months old.
          </p>

          <p className="mb-3">
            <strong>Worn internal sensor.</strong> Most standard controllers measure trigger position using a small sliding contact called a potentiometer. Like a volume knob that gets scratchy after years of use, this part wears down with repeated use and starts sending inaccurate signals — this is the hardware version of drift.
          </p>

          <p className="mb-3">
            <strong>Spring or mechanical wear.</strong> The trigger's return spring can weaken or shift out of place over time, which causes the sticking or slow-return feeling rather than an input accuracy problem.
          </p>

          <p className="mb-3">
            <strong>Software dead zone settings.</strong> Sometimes there's nothing wrong with the hardware at all — a dead zone setting (in the game, in Windows, or in a platform like Steam) is simply cutting off part of the trigger's range or ignoring small movements near the rest position.
          </p>

          <p className="mb-3">
            <strong>Firmware bugs.</strong> Controller firmware occasionally ships with bugs that cause exactly this kind of erratic trigger behavior, and manufacturers patch these more often than most players realize.
          </p>

          <p className="mb-3">
            <strong>Loose or damaged connection.</strong> On wired controllers, a worn cable or loose internal connector can cause the inconsistent, "works sometimes" pattern, since the signal is being interrupted rather than misread.
          </p>

          <p className="mb-8">
            <strong>Adaptive trigger motor issues (DualSense specific).</strong> The DualSense's adaptive resistance is powered by a small motor and gear system inside the trigger. If it's jammed by debris or worn down, you'll notice resistance behaving strangely well before you notice any actual input accuracy problem.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Fixing Software-Related Trigger Issues First</h2>

          <p className="mb-6">
            Software fixes are worth trying first because they take a few minutes, they're completely reversible, and they solve more cases than people expect.
          </p>

          <h3 className="text-xl font-bold mt-6 mb-3">Adjust Dead Zone Settings</h3>

          <p className="mb-4">
            Most games let you set an inner dead zone (how far you must press before input registers) and sometimes an outer dead zone (how close to full press counts as maximum). If your trigger tests fine in a raw input tester but still feels off in-game, this is very often the reason.
          </p>

          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Open the game's control or input settings.</li>
            <li>Look for <strong>Trigger Dead Zone</strong> or <strong>Analog Sensitivity</strong>.</li>
            <li>If your trigger shows minor drift at rest, raise the inner dead zone slightly — just enough to ignore the false signal without dulling your actual input.</li>
            <li>If the trigger struggles to reach full value, lower the outer dead zone so the game registers "full press" a little earlier.</li>
          </ol>

          <h3 className="text-xl font-bold mt-6 mb-3">Recalibrate on Windows</h3>

          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Press <code className="bg-muted px-1.5 py-0.5 rounded text-sm">Win + R</code>, type <code className="bg-muted px-1.5 py-0.5 rounded text-sm">joy.cpl</code>, and press Enter.</li>
            <li>Select your controller and click <strong>Properties</strong>.</li>
            <li>On the <strong>Test</strong> tab, watch the trigger axis while you press it. This confirms whether Windows itself is reading the trigger correctly, separate from any game.</li>
            <li>If there's a <strong>Settings</strong> or <strong>Calibrate</strong> tab available for your controller model, run it and follow the on-screen steps, pressing each trigger fully when asked.</li>
          </ol>

          <h3 className="text-xl font-bold mt-6 mb-3">Use the Manufacturer's App</h3>

          <p className="mb-3">
            Xbox, PlayStation, and several third-party controller brands offer companion software with dedicated calibration tools:
          </p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Xbox Accessories app</strong> (Windows/Xbox) — includes trigger and stick calibration under the controller's settings menu.</li>
            <li><strong>PS5 system settings</strong> (Settings &gt; Accessories &gt; Controllers) — DualSense calibration and firmware updates live here.</li>
            <li><strong>Manufacturer apps for third-party controllers</strong> — most major brands (Razer, SCUF, Turtle Beach, and others) include their own calibration tools, and running one after a firmware update is a good habit even if nothing feels wrong yet.</li>
          </ul>

          <h3 className="text-xl font-bold mt-6 mb-3">Check Steam Input Settings</h3>

          <p className="mb-8">
            If you're launching games through Steam, Steam Input can apply its own trigger dead zones and curves on top of whatever the game already sets, sometimes creating a mismatch. Go to <strong>Settings &gt; Controller &gt; General Controller Settings</strong>, and for a specific game, try toggling Steam Input on or off (right-click the game &gt; Properties &gt; Controller) to see which setting produces cleaner trigger response.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Fixing Trigger Issues Caused by Dirt and Debris</h2>

          <p className="mb-4">
            If your raw input test showed a jumpy, uneven, or drifting signal, cleaning is the next logical step, and it solves this category of problem more often than people expect.
          </p>

          <ol className="list-decimal pl-6 mb-6 space-y-3">
            <li><strong>Power off and disconnect the controller</strong> completely before cleaning anything.</li>
            <li><strong>Use compressed air</strong> around the base of the trigger, where it meets the controller body. Spray in short bursts while moving the trigger back and forth to help dislodge particles from inside the housing.</li>
            <li><strong>Work the trigger through its full range</strong> several times after each burst of air. This helps loosen debris that's settled deeper in the mechanism.</li>
            <li><strong>For stubborn residue</strong>, dampen a cotton swab with a small amount of isopropyl alcohol (90% or higher) and gently clean around the visible edges of the trigger, avoiding excess liquid anywhere near openings.</li>
            <li><strong>Let it dry fully</strong> for at least 15–20 minutes before reconnecting and testing.</li>
          </ol>

          <p className="mb-8">
            Repeat the raw input test afterward. If the drift or unevenness is gone, you've fixed it without opening the controller. If it persists, the internal sensor itself is likely worn, which cleaning can't reverse.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Fixing a Trigger That Feels Stuck or Won't Spring Back</h2>

          <p className="mb-4">
            This is a mechanical symptom, and it usually isn't the same root cause as drift or partial range.
          </p>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Clean around the pivot point</strong> first, using the compressed air method above — debris buildup at the hinge is a common cause of a sluggish return.</li>
            <li><strong>Check for physical obstruction.</strong> Small phone grips, thick controller skins, or debris caught between the trigger and the housing can physically block the spring's movement.</li>
            <li><strong>Test trigger stop settings</strong>, if your controller has them. Some models, particularly Xbox Elite controllers, include adjustable trigger stops that shorten the pull distance — if this is set incorrectly, it can feel like the trigger is sticking when it's actually just following a shortened, intentional range.</li>
            <li><strong>If the spring itself has failed</strong>, this typically requires opening the controller and replacing the internal spring or trigger module, which is a repair best left to someone comfortable with small electronics work, or a repair service.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Xbox Controller Trigger Fixes</h2>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Trigger stops (Elite controllers only).</strong> The small switches on the back let you shorten LT/RT travel distance for faster response. If your trigger "feels" broken but tests fine, check whether this switch got bumped into a shorter setting.</li>
            <li><strong>Wireless adapter interference.</strong> If you're on PC using the official Xbox Wireless Adapter, occasional trigger inconsistency can come from the adapter itself rather than the controller — trying a different USB port is a quick way to rule this out.</li>
            <li><strong>Firmware updates.</strong> Open the Xbox Accessories app and check for a pending update. Several past firmware releases specifically addressed trigger response bugs.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">PlayStation DualSense and DualShock Trigger Fixes</h2>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Adaptive trigger reset (DualSense only).</strong> If the resistance feature feels stuck or inconsistent, fully disconnecting the controller (holding the reset button on the back with a pin) and reconnecting can clear a hung adaptive trigger state.</li>
            <li><strong>Clean the adaptive mechanism carefully.</strong> The added motor and gear system in DualSense triggers makes them more sensitive to dust than a standard trigger — light, careful compressed air use is especially worthwhile here.</li>
            <li><strong>Firmware updates via console.</strong> Go to Settings &gt; System &gt; System Software to check for updates, since adaptive trigger bugs are one of the more frequently patched issues on this controller.</li>
            <li><strong>DualShock 4 potentiometer wear.</strong> Older DualShock 4 controllers use a standard analog trigger design, which is more prone to long-term wear-based drift than DualSense's newer mechanism.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Nintendo Switch Controller Trigger Fixes</h2>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>ZL/ZR on Joy-Cons</strong> are digital, not analog, on the standard Joy-Con — meaning they're either fully pressed or not pressed at all, so "partial range" issues don't apply to them the way they do on Xbox or PlayStation triggers.</li>
            <li><strong>Pro Controller ZL/ZR</strong> are also digital buttons rather than analog triggers, so an inconsistent response here is almost always a contact or debris issue rather than a sensor wear issue.</li>
            <li><strong>Cleaning approach is the same</strong> as above — compressed air around the button edge, followed by careful use of isopropyl alcohol on a cotton swab if needed.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">When Cleaning and Software Fixes Don't Work</h2>

          <p className="mb-4">
            If you've tested with a raw input tool, tried recalibration, and cleaned the trigger thoroughly, and the problem is still there, you're likely dealing with genuine hardware wear — a worn potentiometer, a failed spring, or a damaged internal connector.
          </p>

          <p className="mb-2 font-semibold">At this point, you have three realistic paths:</p>

          <ol className="list-decimal pl-6 mb-6 space-y-3">
            <li><strong>DIY replacement.</strong> Replacement trigger modules and springs are inexpensive and widely available, but the repair involves opening the controller and handling small internal connectors, so it suits people already comfortable with basic electronics work.</li>
            <li><strong>Professional repair.</strong> A local electronics repair shop can usually replace a worn trigger module for a reasonable fee, and it's a common enough repair that most shops handle it quickly.</li>
            <li><strong>Replacement controller.</strong> If the controller is old, has multiple issues beyond just the trigger, or the repair cost approaches the price of a new one, replacing it is often the more practical choice.</li>
          </ol>

          <p className="mb-8">
            If you're shopping for a replacement and want to avoid this exact problem down the road, controllers using Hall-effect trigger sensors (which detect position with a magnet instead of a physical sliding contact) are far more resistant to wear-based drift, since there's no physical contact to degrade over time.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">How to Prevent Trigger Issues Going Forward</h2>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Keep hands clean before gaming.</strong> Oils and residue from food or lotion are a steady contributor to buildup inside the trigger housing over time.</li>
            <li><strong>Store controllers upright, not face-down.</strong> Resting a controller face-down puts constant pressure on the triggers and thumbsticks, which can accelerate wear.</li>
            <li><strong>Do a light compressed-air cleaning every month or two</strong>, especially if you game frequently — this is a genuinely effective habit, not just a suggestion.</li>
            <li><strong>Keep firmware updated.</strong> Manufacturers do patch trigger-related bugs, and skipping updates means missing fixes that are already available.</li>
            <li><strong>Avoid excessive force.</strong> Slamming triggers in intense moments (common in racing and shooting games) adds unnecessary mechanical stress over thousands of repetitions.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>

          <div className="space-y-6 mb-8">
            <div>
              <p className="font-bold text-lg mb-1">Why does only one trigger have a problem, not both?</p>
              <p>This almost always points to something specific to that one part — dust in that particular housing, wear on that one sensor, or a spring issue isolated to that side — rather than a controller-wide fault, which usually affects both triggers evenly.</p>
            </div>

            <div>
              <p className="font-bold text-lg mb-1">Can a firmware update actually fix a trigger problem?</p>
              <p>Yes, in cases where the cause is a software bug rather than physical wear or dirt. It won't help with a worn-out sensor or a jammed spring, which is why it's worth testing with a raw input tool first to understand which type of problem you're facing.</p>
            </div>

            <div>
              <p className="font-bold text-lg mb-1">Is trigger drift the same thing as stick drift?</p>
              <p>They're closely related in cause — both usually come from a worn or dirty potentiometer — but they affect different parts of the controller. The fixes overlap heavily (cleaning, calibration, dead zone adjustment), but you have to check and fix each one separately.</p>
            </div>

            <div>
              <p className="font-bold text-lg mb-1">Will increasing the dead zone permanently fix drift?</p>
              <p>No. It hides small amounts of drift by ignoring low-level input near the rest position, which is a genuinely useful short-term workaround, but it doesn't repair the underlying wear or dirt causing the signal in the first place.</p>
            </div>

            <div>
              <p className="font-bold text-lg mb-1">How do I know if it's worth repairing versus replacing the controller?</p>
              <p>If the controller is otherwise in good shape and the trigger is the only issue, repair is usually the better value, especially with inexpensive replacement parts. If you're seeing multiple unrelated problems (worn sticks, connection issues, battery problems) alongside the trigger fault, replacement is usually more practical.</p>
            </div>

            <div>
              <p className="font-bold text-lg mb-1">Do adaptive triggers wear out faster than regular triggers?</p>
              <p>Not inherently, but they have more moving parts (a motor and gear assembly) than a standard trigger, which gives dust and debris more places to cause a problem. Regular cleaning matters more for adaptive triggers than for standard ones.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Quick Checklist: Fixing Trigger Issues</h2>

          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>[ ] Test raw trigger input using a <Link to="/gamepad-tester" className="text-primary hover:underline font-medium">controller tester</Link> before changing any settings</li>
            <li>[ ] Compare both triggers side by side to see if the issue is isolated</li>
            <li>[ ] Check and adjust in-game or platform dead zone settings</li>
            <li>[ ] Run calibration through Windows, Xbox Accessories, or your console's settings</li>
            <li>[ ] Check for and install any pending firmware update</li>
            <li>[ ] Clean around the trigger with compressed air, then isopropyl alcohol if needed</li>
            <li>[ ] Check for physical obstructions (grips, skins, debris) if the trigger feels stuck</li>
            <li>[ ] Retest after each step before moving to the next one</li>
            <li>[ ] Consider DIY repair, professional repair, or replacement if hardware wear is confirmed</li>
          </ul>

          <p className="mb-8">
            Trigger problems feel dramatic in the moment, especially mid-match, but they're rarely as complicated to diagnose as they seem once you separate software causes from dirt and dirt from genuine hardware wear. Test first, fix the easiest cause first, and work your way up from there.
          </p>
        </article>

        {/* Related Tools */}
        <Card className="mt-12 animate-fade-in-up animate-stagger-4">
          <CardHeader>
            <CardTitle>Related Testing Tools</CardTitle>
            <CardDescription>Comprehensive hardware testing for all your devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/gamepad-tester" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="font-medium">Gamepad Tester</div>
                <div className="text-sm text-muted-foreground">Test controller buttons & drift</div>
              </Link>
              <Link to="/stick-drift-test" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="font-medium">Stick Drift Test</div>
                <div className="text-sm text-muted-foreground">Diagnose thumbstick accuracy</div>
              </Link>
              <Link to="/touch-screen-test" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="font-medium">Touch Screen Tester</div>
                <div className="text-sm text-muted-foreground">Test touchscreen multi-touch</div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
