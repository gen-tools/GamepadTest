import { RequestHandler } from 'express';
import { supabase } from '../lib/supabase.js';

// Get all published blogs
export const getBlogs: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

// Get single blog by slug
export const getBlogBySlug: RequestHandler = async (req, res) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Blog not found' });
    res.json(data);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

// Create a new blog (admin only)
export const createBlog: RequestHandler = async (req, res) => {
  try {
    const { title, content, excerpt, featured_image, published } = req.body;
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('blogs')
      .insert({
        title,
        slug,
        content,
        excerpt: excerpt || '',
        featured_image: featured_image || null,
        published: published || false,
        author_id: req.user?.id || 'system',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

// Update a blog (admin only)
export const updateBlog: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, featured_image, published } = req.body;

    const { data, error } = await supabase
      .from('blogs')
      .update({
        title,
        content,
        excerpt,
        featured_image,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
};

// Delete a blog (admin only)
export const deleteBlog: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};

// Get all blogs for admin (including unpublished)
export const getAdminBlogs: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};
