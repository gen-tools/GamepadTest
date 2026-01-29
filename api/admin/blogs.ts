import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to validate admin (you can enhance this with real auth)
const isAdmin = (req: VercelRequest): boolean => {
  // TODO: Implement proper auth validation
  // For now, this is a basic check - enhance with JWT verification
  const authHeader = req.headers.authorization;
  return !!authHeader; // Placeholder
};

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
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Content-Type",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    try {
      // Check admin status
      if (!isAdmin(req)) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Admin access required" });
      }

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Don't cache admin endpoints
      res.setHeader("Cache-Control", "private, no-cache, no-store");
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching admin blogs:", error);
      res.status(500).json({ error: "Failed to fetch blogs" });
    }
  } else if (req.method === "POST") {
    try {
      // Check admin status
      if (!isAdmin(req)) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Admin access required" });
      }

      const { title, content, excerpt, featured_image, published } = req.body;

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data, error } = await supabase
        .from("blogs")
        .insert({
          title,
          slug,
          content,
          excerpt: excerpt || "",
          featured_image: featured_image || null,
          published: published || false,
          author_id: "admin",
        })
        .select()
        .single();

      if (error) throw error;

      res.setHeader("Cache-Control", "private, no-cache, no-store");
      res.status(201).json(data);
    } catch (error) {
      console.error("Error creating blog:", error);
      res.status(500).json({ error: "Failed to create blog" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
