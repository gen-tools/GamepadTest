import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/Layout";
import StickyAdsterraAd from "@/components/StickyAdsterraAd";

// Synchronous imports for Node.js SSR rendering
import IndexSync from "./pages/Index";
import GamepadTesterSync from "./pages/GamepadTester";
import GpuTesterSync from "./pages/GpuTester";
import MicTesterSync from "./pages/MicTester";
import MidiTesterSync from "./pages/MidiTester";
import TouchTesterSync from "./pages/TouchTester";
import StickDriftTesterSync from "./pages/StickDriftTester";
import AboutSync from "./pages/About";
import ContactSync from "./pages/Contact";
import BlogSync from "./pages/Blog";
import PrivacySync from "./pages/Privacy";
import NotFoundSync from "./pages/NotFound";

import GamepadTesterGuideSync from "./pages/GamepadTesterGuide";
import GpuTesterGuideSync from "./pages/GpuTesterGuide";
import MicTesterGuideSync from "./pages/MicTesterGuide";
import MidiTesterGuideSync from "./pages/MidiTesterGuide";
import TouchTesterGuideSync from "./pages/TouchTesterGuide";
import StickDriftGuideSync from "./pages/StickDriftGuide";
import TouchScreenOnlineGuideSync from "./pages/TouchScreenOnlineGuide";
import ControllerButtonsFixGuideSync from "./pages/ControllerButtonsFixGuide";
import ControllerConnectedNotWorkingGuideSync from "./pages/ControllerConnectedNotWorkingGuide";
import TouchScreenDeadZonesGuideSync from "./pages/TouchScreenDeadZonesGuide";
import ControllerTriggerFixGuideSync from "./pages/ControllerTriggerFixGuide";

function universal<T extends React.ComponentType<any>>(
  syncComponent: T,
  asyncImport: () => Promise<{ default: T }>
) {
  if (typeof window === "undefined") {
    return syncComponent;
  }
  return lazy(asyncImport);
}

const Index = universal(IndexSync, () => import("./pages/Index"));
const GamepadTester = universal(GamepadTesterSync, () => import("./pages/GamepadTester"));
const GpuTester = universal(GpuTesterSync, () => import("./pages/GpuTester"));
const MicTester = universal(MicTesterSync, () => import("./pages/MicTester"));
const MidiTester = universal(MidiTesterSync, () => import("./pages/MidiTester"));
const TouchTester = universal(TouchTesterSync, () => import("./pages/TouchTester"));
const StickDriftTester = universal(StickDriftTesterSync, () => import("./pages/StickDriftTester"));
const About = universal(AboutSync, () => import("./pages/About"));
const Contact = universal(ContactSync, () => import("./pages/Contact"));
const Blog = universal(BlogSync, () => import("./pages/Blog"));
const Privacy = universal(PrivacySync, () => import("./pages/Privacy"));
const NotFound = universal(NotFoundSync, () => import("./pages/NotFound"));

const GamepadTesterGuide = universal(GamepadTesterGuideSync, () => import("./pages/GamepadTesterGuide"));
const GpuTesterGuide = universal(GpuTesterGuideSync, () => import("./pages/GpuTesterGuide"));
const MicTesterGuide = universal(MicTesterGuideSync, () => import("./pages/MicTesterGuide"));
const MidiTesterGuide = universal(MidiTesterGuideSync, () => import("./pages/MidiTesterGuide"));
const TouchTesterGuide = universal(TouchTesterGuideSync, () => import("./pages/TouchTesterGuide"));
const StickDriftGuide = universal(StickDriftGuideSync, () => import("./pages/StickDriftGuide"));
const TouchScreenOnlineGuide = universal(TouchScreenOnlineGuideSync, () => import("./pages/TouchScreenOnlineGuide"));
const ControllerButtonsFixGuide = universal(ControllerButtonsFixGuideSync, () => import("./pages/ControllerButtonsFixGuide"));
const ControllerConnectedNotWorkingGuide = universal(ControllerConnectedNotWorkingGuideSync, () => import("./pages/ControllerConnectedNotWorkingGuide"));
const TouchScreenDeadZonesGuide = universal(TouchScreenDeadZonesGuideSync, () => import("./pages/TouchScreenDeadZonesGuide"));
const ControllerTriggerFixGuide = universal(ControllerTriggerFixGuideSync, () => import("./pages/ControllerTriggerFixGuide"));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  </div>
);

const queryClient = new QueryClient();

export default function RootApp() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Background idle prefetching for instantaneous mobile & desktop page navigation
  useEffect(() => {
    const prefetchPages = () => {
      import("./pages/GamepadTester");
      import("./pages/GpuTester");
      import("./pages/MicTester");
      import("./pages/MidiTester");
      import("./pages/About");
      import("./pages/Blog");
      import("./pages/Privacy");
    };

    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(prefetchPages, { timeout: 2000 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const timer = setTimeout(prefetchPages, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="gamepad-tester-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/gamepad-tester" element={<GamepadTester />} />
                <Route path="/gpu-tester" element={<GpuTester />} />
                <Route path="/mic-tester" element={<MicTester />} />
                <Route path="/midi-tester" element={<MidiTester />} />
                <Route path="/touch-tester" element={<TouchTester />} />
                <Route path="/touch-screen-test" element={<TouchTester />} />
                <Route path="/stick-drift-test" element={<StickDriftTester />} />
                <Route path="/stick-drift-tester" element={<StickDriftTester />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route
                  path="/blog/gamepad-tester-guide"
                  element={<GamepadTesterGuide />}
                />
                <Route
                  path="/blog/gpu-performance-testing"
                  element={<GpuTesterGuide />}
                />
                <Route
                  path="/blog/microphone-testing-guide"
                  element={<MicTesterGuide />}
                />
                <Route
                  path="/blog/midi-device-testing"
                  element={<MidiTesterGuide />}
                />
                <Route
                  path="/blog/touch-screen-testing"
                  element={<TouchTesterGuide />}
                />
                <Route
                  path="/blog/controller-connected-but-not-working-on-pc-heres-how-to-actually-fix-it"
                  element={<ControllerConnectedNotWorkingGuide />}
                />
                <Route
                  path="/blog/controller-buttons-not-working-heres-how-to-actually-fix-it"
                  element={<ControllerButtonsFixGuide />}
                />
                <Route
                  path="/blog/how-to-test-a-touch-screen-online-without-downloading-anything"
                  element={<TouchScreenOnlineGuide />}
                />
                <Route
                  path="/blog/how-to-fix-stick-drift-a-complete-repair-guide-for-xbox-playstation-and-switch-controllers"
                  element={<StickDriftGuide />}
                />
                <Route
                  path="/blog/how-to-fix-stick-drift"
                  element={<StickDriftGuide />}
                />
                <Route
                  path="/blog/how-to-test-a-touch-screen-for-dead-zones"
                  element={<TouchScreenDeadZonesGuide />}
                />
                <Route
                  path="/blog/how-to-fix-trigger-issues-on-a-controller"
                  element={<ControllerTriggerFixGuide />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
          <StickyAdsterraAd />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
