import path from "path";
import fs from "fs";
import { createServer } from "./index";
import * as express from "express";
import { render } from "../client/entry-server";

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

  // Helper function to merge HTML attributes (Helmet overrides template)
  const mergeAttributes = (existing: string, helmet: string): string => {
    if (!helmet) return existing;
    if (!existing) return helmet;
    
    const attrs = new Map<string, string>();
    
    // Parse attributes (handles key="value", key='value', and standalone key)
    const parseAttrs = (str: string) => {
      const attrRegex = /(\w+(?:-\w+)*)(?:=["']([^"']*)["']|=([^\s>]*))?/g;
      let match;
      while ((match = attrRegex.exec(str)) !== null) {
        const key = match[1];
        const value = match[2] || match[3] || '';
        attrs.set(key, value);
      }
    };
    
    parseAttrs(existing);  // First parse existing attributes
    parseAttrs(helmet);    // Then parse Helmet (overwrites duplicates)
    
    // Reconstruct attribute string
    return Array.from(attrs.entries())
      .map(([k, v]) => v ? `${k}="${v}"` : k)
      .join(' ');
  };

  const helmetContext: any = {};
  const appHtml = render(req.url, helmetContext);
  
  console.log('📊 SSR Render:', {
    path: req.url,
    appHtmlLength: appHtml?.length || 0,
    hasHelmetContext: !!helmetContext,
    hasHelmet: !!helmetContext.helmet,
    helmetKeys: helmetContext.helmet ? Object.keys(helmetContext.helmet) : []
  });

  // Inject SSR content (handles both placeholder formats)
  let html = template
    .replace('<div id="root"><!--app-html--></div>', `<div id="root">${appHtml}</div>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

  // Inject Helmet head tags and attributes
  if (helmetContext.helmet) {
    const { title, meta, link, script, style, noscript, base, htmlAttributes, bodyAttributes } = helmetContext.helmet;
    
    console.log('🔍 SSR Debug:', {
      path: req.url,
      hasHelmet: !!helmetContext.helmet,
      titleLength: title?.toString()?.length || 0,
      metaLength: meta?.toString()?.length || 0
    });

    // Merge HTML attributes (Helmet overrides existing)
    if (htmlAttributes.toString()) {
      const htmlMatch = html.match(/<html([^>]*)>/);
      if (htmlMatch) {
        const existingAttrs = htmlMatch[1].trim();
        const mergedAttrs = mergeAttributes(existingAttrs, htmlAttributes.toString());
        html = html.replace(/<html[^>]*>/, `<html ${mergedAttrs}>`);
      }
    }

    // Replace title
    if (title.toString()) {
      html = html.replace(/<title>.*?<\/title>/, title.toString());
    }

    // Remove empty placeholders
    html = html.replace(/<meta\s+name="description"\s+content=""\s*\/?>/g, "");
    html = html.replace(/<meta\s+property="og:title"\s+content=""\s*\/?>/g, "");
    html = html.replace(/<meta\s+property="og:description"\s+content=""\s*\/?>/g, "");
    html = html.replace(/<meta\s+property="twitter:title"\s+content=""\s*\/?>/g, "");
    html = html.replace(/<meta\s+property="twitter:description"\s+content=""\s*\/?>/g, "");

    // Inject all Helmet head tags before closing head
    const helmetTags = `${base.toString()}${meta.toString()}${link.toString()}${style.toString()}${script.toString()}${noscript.toString()}`;
    html = html.replace("</head>", `${helmetTags}</head>`);

    // Merge body attributes (Helmet overrides existing)
    if (bodyAttributes.toString()) {
      const bodyMatch = html.match(/<body([^>]*)>/);
      if (bodyMatch) {
        const existingAttrs = bodyMatch[1].trim();
        const mergedAttrs = mergeAttributes(existingAttrs, bodyAttributes.toString());
        html = html.replace(/<body[^>]*>/, `<body ${mergedAttrs}>`);
      }
    }
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
