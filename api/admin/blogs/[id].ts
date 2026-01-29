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

  if (req.method === "PUT") {
    try {
      // Check admin status
      if (!isAdmin(req)) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Admin access required" });
      }

      const { id } = req.query;
      const { title, content, excerpt, featured_image, published } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Missing or invalid blog ID" });
      }

      const { data, error } = await supabase
        .from("blogs")
        .update({
          title,
          content,
          excerpt,
          featured_image,
          published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      res.setHeader("Cache-Control", "private, no-cache, no-store");
      res.status(200).json(data);
    } catch (error) {
      console.error("Error updating blog:", error);
      res.status(500).json({ error: "Failed to update blog" });
    }
  } else if (req.method === "DELETE") {
    try {
      // Check admin status
      if (!isAdmin(req)) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Admin access required" });
      }

      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Missing or invalid blog ID" });
      }

      const { error } = await supabase.from("blogs").delete().eq("id", id);

      if (error) throw error;

      res.setHeader("Cache-Control", "private, no-cache, no-store");
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ error: "Failed to delete blog" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
