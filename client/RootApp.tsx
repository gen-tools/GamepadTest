import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ClientProviders } from "@/components/ClientProviders";
import { Layout } from "@/components/Layout";

// Pages - critical path (eager loaded for SSR and SEO)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";

// Heavy pages - lazy loaded for code splitting
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const GamepadTester = lazy(() => import("./pages/GamepadTester"));
const GpuTester = lazy(() => import("./pages/GpuTester"));
const MicTester = lazy(() => import("./pages/MicTester"));
const MidiTester = lazy(() => import("./pages/MidiTester"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// Guide pages - lazy loaded for code splitting
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
          <Route
            path="/gamepad-tester"
            element={
              <Suspense fallback={<PageLoader />}>
                <GamepadTester />
              </Suspense>
            }
          />
          <Route
            path="/gpu-tester"
            element={
              <Suspense fallback={<PageLoader />}>
                <GpuTester />
              </Suspense>
            }
          />
          <Route
            path="/mic-tester"
            element={
              <Suspense fallback={<PageLoader />}>
                <MicTester />
              </Suspense>
            }
          />
          <Route
            path="/midi-tester"
            element={
              <Suspense fallback={<PageLoader />}>
                <MidiTester />
              </Suspense>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense fallback={<PageLoader />}>
                <About />
              </Suspense>
            }
          />
          <Route
            path="/contact"
            element={
              <Suspense fallback={<PageLoader />}>
                <Contact />
              </Suspense>
            }
          />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route
            path="/privacy"
            element={
              <Suspense fallback={<PageLoader />}>
                <Privacy />
              </Suspense>
            }
          />
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminLogin />
              </Suspense>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            }
          />
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
