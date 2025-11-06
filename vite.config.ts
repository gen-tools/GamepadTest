import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    // Optimize middleware performance
    middlewareMode: false,
    preTransformRequests: ["/index.html"],
  },
  build: {
    outDir: "dist/spa",
    target: "ES2020",
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
          "vendor-charts": ["recharts"],
          "vendor-3d": ["three", "@react-three/fiber", "@react-three/drei"],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          "vendor-other": [
            "framer-motion",
            "embla-carousel-react",
            "sonner",
            "react-helmet-async",
            "@tanstack/react-query",
            "next-themes",
            "date-fns",
          ],
        },
      },
    },
    cssCodeSplit: true,
    minify: "esbuild",
    sourcemap: false,
    reportCompressedSize: false,
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
