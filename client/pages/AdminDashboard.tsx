import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const { isLoggedIn, isLoading, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/admin/login");
    }
  }, [isLoggedIn, isLoading, navigate]);

  // Fetch blogs
  useEffect(() => {
    if (isLoggedIn) {
      fetchBlogs();
    }
  }, [isLoggedIn]);

  const fetchBlogs = async () => {
    try {
      setBlogsLoading(true);
      const response = await fetch("/api/admin/blogs");
      if (!response.ok) throw new Error("Failed to fetch blogs");
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch blogs");
    } finally {
      setBlogsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      setError("Title and content are required");
      return;
    }

    try {
      setError("");
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/blogs/${editingId}`
        : "/api/admin/blogs";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save blog");

      await fetchBlogs();
      setFormData({ title: "", excerpt: "", content: "" });
      setEditingId(null);
      setShowNewForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save blog");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      setError("");
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete blog");
      await fetchBlogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete blog");
    }
  };

  const handleEdit = (blog: Blog) => {
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: "", // Content would need to be fetched separately
    });
    setEditingId(blog.id);
    setShowNewForm(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* New Blog Form */}
        {(showNewForm || editingId) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingId ? "Edit Blog" : "Create New Blog"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Blog title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Excerpt</label>
                <Input
                  placeholder="Short description"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Blog content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={10}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Blog
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewForm(false);
                    setEditingId(null);
                    setFormData({ title: "", excerpt: "", content: "" });
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blog List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Your Blogs</h2>
            {!showNewForm && !editingId && (
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Blog
              </Button>
            )}
          </div>

          {blogsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : blogs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No blogs yet. Create your first blog to get started!
              </CardContent>
            </Card>
          ) : (
            blogs.map((blog) => (
              <Card key={blog.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{blog.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {blog.excerpt}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${blog.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {blog.published ? "Published" : "Draft"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(blog)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
