import path from "path";
import fs from "fs";
import { createServer } from "./index";
import * as express from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import RootApp from "@/RootApp";

const app = createServer();
const port = Number(process.env.PORT) || 8080;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router with SSR - render HTML for all non-API routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  const indexFile = path.join(distPath, "index.html");
  let template: string;
  try {
    template = fs.readFileSync(indexFile, "utf-8");
  } catch (e) {
    return res.status(500).send("Index HTML not found");
  }

  const helmetContext: any = {};
  const appHtml = ReactDOMServer.renderToString(
    React.createElement(
      HelmetProvider as any,
      { context: helmetContext },
      React.createElement(StaticRouter as any, { location: req.url }, React.createElement(RootApp))
    )
  );

  // Inject SSR content
  let html = template.replace(
    '<div id="root"></div>',
    `<div id=\"root\">${appHtml}</div>`
  );

  // Inject Helmet head tags
  if (helmetContext.helmet) {
    const { title, meta, link } = helmetContext.helmet;
    const helmetTags = `${title.toString()}${meta.toString()}${link.toString()}`;
    html = html.replace("</head>", `${helmetTags}</head>`);
  }

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
});

app.listen(port, () => {
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
