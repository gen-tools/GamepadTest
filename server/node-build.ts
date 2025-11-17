import path from "path";
import fs from "fs";
import { createServer } from "./index";
import * as express from "express";
import ReactDOMServer from "react-dom/server";
import { render } from "@/entry-server";

const app = createServer();
const port = Number(process.env.PORT) || 5000;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files (excluding index.html which is handled by SSR)
app.use(express.static(distPath, { index: false }));

// Handle React Router with SSR - render HTML for all non-API routes
app.use((req, res, next) => {
  // Skip API routes and static asset files
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return next();
  }
  
  // Skip if it's a static asset file (has extension)
  if (req.path.match(/\.[a-zA-Z0-9]+$/)) {
    return next();
  }

  const indexFile = path.join(distPath, "index.html");
  let template: string;
  try {
    template = fs.readFileSync(indexFile, "utf-8");
  } catch (e) {
    return res.status(500).send("Index HTML not found");
  }

  const helmetContext: any = {};
  const reactApp = render(req.url, helmetContext);
  const appHtml = ReactDOMServer.renderToString(reactApp);
  
  console.log('📊 SSR Render:', {
    path: req.url,
    appHtmlLength: appHtml?.length || 0,
    hasHelmetContext: !!helmetContext,
    hasHelmet: !!helmetContext.helmet,
    helmetKeys: helmetContext.helmet ? Object.keys(helmetContext.helmet) : []
  });

  // Inject SSR content
  let html = template.replace(
    '<div id="root"></div>',
    `<div id=\"root\">${appHtml}</div>`,
  );

  // Inject Helmet head tags
  if (helmetContext.helmet) {
    const { title, meta, link, script } = helmetContext.helmet;
    
    console.log('🔍 SSR Debug:', {
      path: req.url,
      hasHelmet: !!helmetContext.helmet,
      titleLength: title?.toString()?.length || 0,
      metaLength: meta?.toString()?.length || 0
    });

    // Replace title
    if (title.toString()) {
      html = html.replace(/<title>.*?<\/title>/, title.toString());
    }

    // Replace or inject meta tags - remove empty placeholders first
    html = html.replace(/<meta\s+name="description"\s+content=""\s*\/?>/g, "");
    html = html.replace(/<meta\s+property="og:title"\s+content=""\s*\/?>/g, "");
    html = html.replace(
      /<meta\s+property="og:description"\s+content=""\s*\/?>/g,
      "",
    );
    html = html.replace(
      /<meta\s+property="twitter:title"\s+content=""\s*\/?>/g,
      "",
    );
    html = html.replace(
      /<meta\s+property="twitter:description"\s+content=""\s*\/?>/g,
      "",
    );

    // Inject Helmet tags before closing head
    const helmetTags = `${meta.toString()}${link.toString()}${script.toString()}`;
    html = html.replace("</head>", `${helmetTags}</head>`);
  }

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
