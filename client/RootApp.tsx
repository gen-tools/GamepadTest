import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ClientProviders } from "@/components/ClientProviders";
import { Layout } from "@/components/Layout";

// Pages - critical path (eager loaded for SSR and SEO)
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import GamepadTester from "./pages/GamepadTester";
import GpuTester from "./pages/GpuTester";
import MicTester from "./pages/MicTester";
import MidiTester from "./pages/MidiTester";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// Guide pages - lazy loaded for code splitting (less critical for SEO)
const GamepadTesterGuide = lazy(() => import("./pages/GamepadTesterGuide"));
const GpuTesterGuide = lazy(() => import("./pages/GpuTesterGuide"));
const MicTesterGuide = lazy(() => import("./pages/MicTesterGuide"));
const MidiTesterGuide = lazy(() => import("./pages/MidiTesterGuide"));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  </div>
);

const queryClient = new QueryClient();

export default function RootApp() {
  return (
    <ClientProviders queryClient={queryClient}>
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
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/blog/gamepad-tester-guide"
            element={
              <Suspense fallback={<PageLoader />}>
                <GamepadTesterGuide />
              </Suspense>
            }
          />
          <Route
            path="/blog/gpu-performance-testing"
            element={
              <Suspense fallback={<PageLoader />}>
                <GpuTesterGuide />
              </Suspense>
            }
          />
          <Route
            path="/blog/microphone-testing-guide"
            element={
              <Suspense fallback={<PageLoader />}>
                <MicTesterGuide />
              </Suspense>
            }
          />
          <Route
            path="/blog/midi-device-testing"
            element={
              <Suspense fallback={<PageLoader />}>
                <MidiTesterGuide />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ClientProviders>
  );
}
