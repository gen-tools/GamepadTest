import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/Layout";

// Pages
import Index from "./pages/Index";
import GamepadTester from "./pages/GamepadTester";
import GpuTester from "./pages/GpuTester";
import MicTester from "./pages/MicTester";
import MidiTester from "./pages/MidiTester";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Privacy from "./pages/Privacy";
import GamepadTesterGuide from "./pages/GamepadTesterGuide";
import GpuTesterGuide from "./pages/GpuTesterGuide";
import MicTesterGuide from "./pages/MicTesterGuide";
import MidiTesterGuide from "./pages/MidiTesterGuide";
import NotFound from "./pages/NotFound";

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
