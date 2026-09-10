export default async function handler(req: any, res: any) {
  try {
    const src = String((req.query?.url as string) || "");
    if (!src) {
      res.status(400).json({ error: "Missing url" });
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(src);
    } catch {
      res.status(400).json({ error: "Invalid URL" });
      return;
    }

    if (!/^https?:$/.test(parsed.protocol)) {
      res.status(400).json({ error: "Invalid protocol" });
      return;
    }

    const allowedHosts = [
      "m.media-amazon.com",
      "images-na.ssl-images-amazon.com",
    ];
    if (!allowedHosts.some((h) => parsed.hostname.endsWith(h))) {
      res.status(403).json({ error: "Host not allowed" });
      return;
    }

    const upstream = await fetch(src, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
        accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        referer: "https://www.amazon.com/",
      },
    });

    if (!upstream.ok) {
      res
        .status(upstream.status)
        .json({ error: `Upstream ${upstream.status}` });
      return;
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).send(buf);
  } catch {
    res.status(500).json({ error: "Proxy error" });
  }
}
