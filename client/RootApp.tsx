import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/Layout";

// Pages - critical path
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

// Pages - lazy loaded for code splitting
const GamepadTester = lazy(() => import("./pages/GamepadTester"));
const GpuTester = lazy(() => import("./pages/GpuTester"));
const MicTester = lazy(() => import("./pages/MicTester"));
const MidiTester = lazy(() => import("./pages/MidiTester"));
const GamepadTesterGuide = lazy(() => import("./pages/GamepadTesterGuide"));
const GpuTesterGuide = lazy(() => import("./pages/GpuTesterGuide"));
const MicTesterGuide = lazy(() => import("./pages/MicTesterGuide"));
const MidiTesterGuide = lazy(() => import("./pages/MidiTesterGuide"));

// Loading fallback
const PageLoader = () => <div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></div>;

const queryClient = new QueryClient();

export default function RootApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="gamepad-tester-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/gamepad-tester" element={<GamepadTester />} />
              <Route path="/gpu-tester" element={<GpuTester />} />
              <Route path="/mic-tester" element={<MicTester />} />
              <Route path="/midi-tester" element={<MidiTester />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/blog/gamepad-tester-guide" element={<GamepadTesterGuide />} />
              <Route path="/blog/gpu-performance-testing" element={<GpuTesterGuide />} />
              <Route path="/blog/microphone-testing-guide" element={<MicTesterGuide />} />
              <Route path="/blog/midi-device-testing" element={<MidiTesterGuide />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
