import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const src = String(req.query.url || "");

    if (!src) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    const parsed = new URL(src);
    if (!/^https?:$/.test(parsed.protocol)) {
      return res.status(400).json({ error: "Invalid protocol" });
    }

    // Whitelist to reduce SSRF risk; extend as needed
    const allowedHosts = [
      "m.media-amazon.com",
      "images-na.ssl-images-amazon.com",
      "images-eu.ssl-images-amazon.com",
      "cdn.example.com", // Add your CDN here if needed
    ];

    if (!allowedHosts.some((h) => parsed.hostname.endsWith(h))) {
      return res.status(403).json({ error: "Host not allowed" });
    }

    const resp = await fetch(src, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        referer: "https://www.amazon.com/",
      },
    });

    if (!resp.ok) {
      return res
        .status(resp.status)
        .json({ error: `Upstream returned ${resp.status}` });
    }

    const contentType = resp.headers.get("content-type") || "image/jpeg";
    const buf = Buffer.from(await resp.arrayBuffer());

    // Cache image proxies for 7 days
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Cache-Control",
      "public, max-age=604800, s-maxage=604800, immutable",
    );
    res.status(200).send(buf);
  } catch (e) {
    console.error("Image proxy error:", e);
    res.status(500).json({ error: "Proxy error" });
  }
}
