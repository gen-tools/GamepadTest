import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createServer as createViteServer, ViteDevServer } from "vite";
import { createServer } from "./index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startDevServer() {
  const app = createServer();
  const port = Number(process.env.PORT) || 3000;

  let vite: ViteDevServer;

  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    if (url.startsWith("/api/") || url.startsWith("/health")) {
      return next();
    }

    if (url.match(/\.[a-zA-Z0-9]+$/) && !url.endsWith(".html")) {
      return next();
    }

    try {
      let template = fs.readFileSync(
        path.resolve(__dirname, "../index.html"),
        "utf-8"
      );

      template = await vite.transformIndexHtml(url, template);

      const { render } = await vite.ssrLoadModule("/client/entry-server.tsx");

      const helmetContext: any = {};
      const appHtml = render(url, helmetContext);

      let html = template.replace(
        `<div id="root"><!--app-html--></div>`,
        `<div id="root">${appHtml}</div>`
      );

      if (helmetContext.helmet) {
        const {
          title,
          meta,
          link,
          script,
          style,
          noscript,
          base,
          htmlAttributes,
          bodyAttributes,
        } = helmetContext.helmet;

        if (htmlAttributes && htmlAttributes.toString()) {
          const attrStr = htmlAttributes.toString();
          if (attrStr) {
            html = html.replace(/<html([^>]*)>/, (match, p1) => `<html ${p1 ? p1.trim() + " " : ""}${attrStr}>`);
          }
        }

        const helmetHead = [
          title?.toString(),
          base?.toString(),
          meta?.toString(),
          link?.toString(),
          style?.toString(),
          script?.toString(),
          noscript?.toString(),
        ]
          .filter(Boolean)
          .join("\n    ");

        if (helmetHead) {
          html = html.replace("</head>", `    ${helmetHead}\n  </head>`);
        }

        if (bodyAttributes && bodyAttributes.toString()) {
          const attrStr = bodyAttributes.toString();
          if (attrStr) {
            html = html.replace(/<body([^>]*)>/, (match, p1) => `<body ${p1 ? p1.trim() + " " : ""}${attrStr}>`);
          }
        }
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 SSR Dev Server running on http://localhost:${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔧 API: http://localhost:${port}/api`);
  });
}

startDevServer();
