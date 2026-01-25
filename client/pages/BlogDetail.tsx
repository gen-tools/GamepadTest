import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Helmet } from 'react-helmet-async';

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  created_at: string;
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/blogs/${slug}`);
      if (!response.ok) throw new Error('Blog not found');
      const data = await response.json();
      setBlog(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Link to="/blog">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Blog not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.title} - GamepadTest Blog</title>
        <meta name="description" content={blog.excerpt} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Link to="/blog">
            <Button variant="outline" className="mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <article className="prose prose-slate max-w-none">
            <header className="mb-8 not-prose">
              <h1 className="text-4xl font-bold mb-2">{blog.title}</h1>
              <time className="text-muted-foreground">
                {new Date(blog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </header>

            <div className="mt-8 prose prose-slate max-w-none">
              {blog.content.split('\n').map((paragraph, i) => 
                paragraph.trim() && <p key={i}>{paragraph}</p>
              )}
            </div>
          </article>

          <div className="mt-12 pt-8 border-t">
            <Link to="/blog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
