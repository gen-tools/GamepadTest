# Blog System Setup Guide

This guide walks you through setting up the blog publishing system with admin access control.

## Step 1: Create Database Tables in Supabase

Go to your Supabase dashboard (https://supabase.com), open the **SQL Editor**, and run the following SQL commands to create the necessary tables:

### Create Blogs Table

```sql
-- Create blogs table
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index on slug for faster queries
CREATE INDEX blogs_slug_idx ON blogs(slug);

-- Create index on published for faster filtering
CREATE INDEX blogs_published_idx ON blogs(published);
```

## Step 2: Set Up Row Level Security (RLS)

Copy and run these commands to set up Row Level Security:

```sql
-- Enable RLS on blogs table
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published blogs
CREATE POLICY "Anyone can read published blogs"
  ON blogs FOR SELECT
  USING (published = true);

-- Allow authenticated users (admins) to read all blogs
CREATE POLICY "Authenticated users can read all blogs"
  ON blogs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to create blogs
CREATE POLICY "Authenticated users can create blogs"
  ON blogs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own blogs
CREATE POLICY "Users can update their own blogs"
  ON blogs FOR UPDATE
  USING (auth.uid() = author_id);

-- Allow users to delete their own blogs
CREATE POLICY "Users can delete their own blogs"
  ON blogs FOR DELETE
  USING (auth.uid() = author_id);
```

## Step 3: Access the Admin Panel

1. **First Admin Registration**: Go to `http://localhost:5000/admin/login`
2. Click "Don't have an account? Sign up" to create your first admin account
3. Enter your email and password
4. You'll be redirected to the admin dashboard

## Step 4: Create Your First Blog

1. In the admin dashboard, click the "New Blog" button
2. Fill in:
   - **Title**: The blog title (slug is auto-generated)
   - **Excerpt**: A short description
   - **Content**: The full blog content
3. Click "Save Blog" to create the blog
4. The blog will be created as a draft (unpublished)

## Step 5: Publish Your Blog

To make a blog visible to public:

1. In the admin dashboard, find the blog you want to publish
2. Click the edit button (pencil icon)
3. Change the published status to "Published"
4. Save the changes

## Step 6: View Your Blog

Public blogs are visible at `http://localhost:5000/blog`

## Features

- **Admin Authentication**: Email/password authentication with Supabase Auth
- **Draft & Publish**: Create drafts and publish when ready
- **Public Blog Listing**: All published blogs are visible at `/blog`
- **Blog Detail Pages**: Each blog has its own page at `/blog/{slug}`
- **Admin Dashboard**: Full CRUD (Create, Read, Update, Delete) operations for blogs
- **Row Level Security**: Automatic permission enforcement at the database level

## Environment Variables

Your Supabase credentials are already set in your environment:

```
VITE_SUPABASE_URL=https://untkyktnvnfylhuuyvto.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Troubleshooting

### "Failed to create blog" error

- Make sure you've created the `blogs` table in Supabase
- Check that RLS policies are correctly configured
- Verify your Supabase credentials in the environment variables

### Blogs not showing on public page

- Make sure the blog is marked as "Published" (not Draft)
- Check that the blog has a title and content filled in

### Can't login to admin panel

- Make sure you've created an account using the signup form first
- Check that Supabase auth is properly configured

## Next Steps

1. Customize the blog styling in `client/pages/AdminDashboard.tsx` and `client/pages/BlogDetail.tsx`
2. Add featured image support by uploading to Supabase Storage
3. Add blog categories or tags
4. Implement blog search and filtering
5. Add comments functionality

For more help, check the Supabase documentation: https://supabase.com/docs
