import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Permissions-Policy", "midi=(self), microphone=(self)");
    
    // Security headers for production
    if (process.env.NODE_ENV === "production") {
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://static.cloudflareinsights.com; frame-ancestors 'self';"
      );
    }

    // Cache control for static assets
    if (req.path.startsWith("/assets/")) {
      // Immutable assets with content hash - cache for 1 year
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else if (req.path.match(/\.(js|css|woff2|woff|ttf|eot|svg)$/i)) {
      // Other static files - cache for 1 hour
      res.setHeader("Cache-Control", "public, max-age=3600");
    } else {
      // HTML and other files - cache for 5 minutes
      res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
    }

    next();
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Simple image proxy for allowed hosts (fixes hotlink/CORS blocks)
  app.get("/api/image-proxy", async (req, res) => {
    try {
      const src = String(req.query.url || "");
      const parsed = new URL(src);
      if (!/^https?:$/.test(parsed.protocol)) {
        return res.status(400).json({ error: "Invalid protocol" });
      }
      // Whitelist to reduce SSRF risk; extend as needed
      const allowedHosts = [
        "m.media-amazon.com",
        "images-na.ssl-images-amazon.com",
      ];
      if (!allowedHosts.some((h) => parsed.hostname.endsWith(h))) {
        return res.status(403).json({ error: "Host not allowed" });
      }

      const resp = await fetch(src, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
          accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          referer: "https://www.amazon.com/",
        },
      });
      if (!resp.ok) {
        return res
          .status(resp.status)
          .json({ error: `Upstream ${resp.status}` });
      }
      const contentType = resp.headers.get("content-type") || "image/jpeg";
      const buf = Buffer.from(await resp.arrayBuffer());
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.status(200).send(buf);
    } catch (e) {
      res.status(500).json({ error: "Proxy error" });
    }
  });

  return app;
}
