# Builder.io Integration and Testing Guide

This guide helps you verify and test your Vercel deployment with Builder.io.

---

## Pre-Integration Checklist

Before testing with Builder.io, ensure:

- ✅ Vercel deployment is complete
- ✅ Environment variables are configured (see `ENV_SETUP_CHECKLIST.md`)
- ✅ All API endpoints are returning responses
- ✅ Static assets are loading correctly
- ✅ Your domain is accessible from the internet

---

## Step 1: Test API Endpoints Manually

Test each API endpoint to verify they work before connecting to Builder:

### Test Public Blog API

```bash
# List all published blogs
curl https://your-domain.vercel.app/api/blogs

# Should return JSON array like:
# [{"id":"...","title":"...","slug":"...","published":true}]
```

### Test Specific Blog Route

```bash
# Get a specific blog by slug
curl https://your-domain.vercel.app/api/blogs/gamepad-tester-guide

# Should return JSON object like:
# {"id":"...","title":"...","slug":"gamepad-tester-guide","content":"..."}
```

### Test Demo Endpoint

```bash
curl https://your-domain.vercel.app/api/demo

# Should return:
# {"message":"This is a demo endpoint","timestamp":"2024-01-27T..."}
```

### Test Health/Ping Endpoint

```bash
curl https://your-domain.vercel.app/api/ping

# Should return:
# {"message":"pong"}
```

---

## Step 2: Verify SPA Routes Load

Test that all main routes return HTML content:

```bash
# Home page
curl https://your-domain.vercel.app/ | head -20
# Should show HTML with React app

# Blog list page
curl https://your-domain.vercel.app/blog | head -20
# Should show HTML with React app

# Blog detail page
curl https://your-domain.vercel.app/blog/some-slug | head -20
# Should show HTML with React app
```

---

## Step 3: Test in Vercel Preview Deployment

### Manual Preview Test

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Find the latest deployment
4. Click the preview link
5. Test these routes:
   - `/` - Should load home page
   - `/blog` - Should load blog list
   - `/api/blogs` - Should return JSON
   - `/api/blogs/some-slug` - Should return JSON or 404

### Check Deployment Logs

```bash
# View logs for any errors
vercel logs --prod

# Look for:
# - "Serverless Function ..." entries (functions deployed)
# - Any errors related to missing env vars
# - Any database connection errors
```

---

## Step 4: Connect Vercel to Builder.io

### Option A: Via Builder.io Dashboard

1. Go to [Builder.io](https://builder.io)
2. Select your project (or create a new one)
3. Go to **Settings** (top right)
4. Go to **Hosting Integrations** or **Connected Services**
5. Click **Connect Vercel**
6. Authorize Builder to access your Vercel account
7. Select your Vercel project
8. Verify the preview URL is correct

### Option B: Via Builder.io MCP Integration (Recommended for Builder.io Team)

1. In your workspace, [Open MCP popover](#open-mcp-popover)
2. Look for Vercel integration
3. Click to connect
4. Follow authorization flow

### Option C: Manual Configuration

1. Copy your Vercel production URL: `https://your-domain.vercel.app`
2. Go to Builder.io project settings
3. Set **Preview URL** to your Vercel URL
4. Save

---

## Step 5: Test Route Detection in Builder

After connecting, Builder should automatically detect your routes.

### Check Route Recognition

1. Go to **Builder.io > Project Settings > Routes** (if available)
2. Verify these routes are detected:
   - `/api/*` - Should show as API routes
   - `/` - Should show as SPA route
   - `/blog` - Should show as SPA route
   - `/blog/:slug` - Should show as dynamic SPA route

### If Routes Not Detected

1. Clear Builder cache:
   - Go to project settings
   - Look for "Clear Cache" button
   - Click to clear

2. Rebuild and redeploy on Vercel:
   ```bash
   git push  # Triggers Vercel rebuild
   ```

3. Wait 2-3 minutes for Vercel to finish deploying

4. Refresh Builder dashboard

---

## Step 6: Create a Test PR to Builder

Test that Builder can validate your routes in a PR preview.

### Create a Test Git Branch

```bash
git checkout -b test/builder-integration
echo "# Test PR for Builder" >> README.md
git add README.md
git commit -m "Test Builder PR integration"
git push origin test/builder-integration
```

### Create PR

Create a Pull Request on GitHub (or your git provider).

### Monitor Vercel Preview

1. Go to your PR on GitHub
2. Look for Vercel preview deployment comment
3. Click preview URL
4. Test the preview deployment:
   - Load some routes
   - Check `/api/blogs` endpoint
   - Verify content loads

### Check Builder Validation

1. In your Builder project, go to **Integrations** or **PR Status**
2. Look for validation status for your PR
3. Verify:
   - ✅ All routes validate successfully
   - ✅ No 404 errors
   - ✅ API endpoints return data
   - ✅ HTML content loads

### If Builder Validation Fails

**Issue**: API routes show errors
- **Solution**: Check that env vars are set in Vercel for Preview environment
  - Go to Vercel > Settings > Environment Variables
  - Ensure variables are checked for "Preview" environment
  - Redeploy: `vercel redeploy`

**Issue**: SPA routes show 404s
- **Solution**: Check `vercel.json` rewrites are correct
  - Rewrite pattern should send non-API routes to `/index.html`
  - See `vercel.json` → `rewrites` section

**Issue**: Builder can't find routes
- **Solution**: Clear Builder cache and rebuild
  - Clear cache in Builder settings
  - Run `vercel redeploy` to rebuild

---

## Step 7: Test Builder Content Editing

### Create a Simple Test Content

1. Go to Builder.io
2. Create a new page or content piece
3. Target it to a route, e.g., `/test-page`
4. Add some content (text, image, etc.)
5. Publish

### Verify Content Loads

```bash
# Test the page on your Vercel deployment
curl https://your-domain.vercel.app/test-page

# Should return HTML that includes your Builder content
```

---

## Step 8: Verify Blog Routes with Builder

### Test Dynamic Blog Routes

Builder should recognize `/blog/:slug` as a dynamic route.

**Option A: Use Builder's Dynamic Routes**

1. In Builder.io, create a template for `/blog/:slug`
2. Add content that pulls the blog post from your API
3. Publish

**Option B: Let Client-Side React Handle It**

Your current setup uses React Router to handle `/blog/:slug`:
- BlogDetail component fetches data from `/api/blogs/:slug`
- This works fine with Builder as long as the route returns HTML

---

## Common Integration Issues and Fixes

### Issue: Builder Shows "Could Not Connect" Error

**Cause**: Vercel URL not accessible or misconfigured

**Fix**:
```bash
# Test Vercel URL is accessible
curl https://your-domain.vercel.app/

# Should return HTML, not error page
# If not accessible, check:
# 1. Vercel project is deployed
# 2. URL is public (not behind auth)
# 3. No CORS/security restrictions
```

### Issue: API Routes Don't Work in Builder Preview

**Cause**: Environment variables not set for Preview environment

**Fix**:
1. Go to Vercel dashboard > Your Project
2. Go to Settings > Environment Variables
3. For each variable (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY):
   - Check the "Preview" checkbox
   - Save
4. Redeploy: `vercel redeploy`

### Issue: Builder Validation Fails for `/api/blogs` Route

**Cause**: Supabase not accessible or no blog posts in database

**Fix**:
```bash
# 1. Test Supabase connection locally
VITE_SUPABASE_URL=your_url VITE_SUPABASE_ANON_KEY=your_key pnpm run dev

# 2. Test the API endpoint
curl http://localhost:5000/api/blogs

# 3. Check Supabase:
#    - Are there any published blogs in the database?
#    - Is RLS policy allowing anon access?
#    - Is the table created? (See BLOG_SETUP_GUIDE.md)
```

### Issue: Static Assets (Images) Don't Load in Builder

**Cause**: Assets are relative paths or external URLs that aren't accessible

**Fix**:
```typescript
// For images in public folder (recommended)
featured_image: "/blog-images/image.jpg"

// For external CDN
featured_image: "https://cdn.example.com/image.jpg"

// For CORS-blocked images (use proxy)
featured_image: "/api/image-proxy?url=https://example.com/image.jpg"
```

---

## Monitoring and Maintenance

### Regular Checks

After going live with Builder, periodically check:

1. **API Endpoint Health**
   ```bash
   curl https://your-domain.vercel.app/api/blogs
   ```

2. **Vercel Logs**
   ```bash
   vercel logs --prod --follow
   ```

3. **Builder Content Publishing**
   - Test that new content published in Builder appears on live site

4. **Blog Post Updates**
   - Test that new blog posts from admin dashboard appear

### Cache Management

If you update blog content and it doesn't appear immediately:

1. **Clear Vercel Cache**
   - Go to Vercel > Deployments
   - Click the deployment
   - Click "Clear Cache"

2. **Clear Builder Cache**
   - Go to Builder.io Settings
   - Click "Clear Cache"

---

## Testing Checklist

Before considering integration complete:

- ✅ All API endpoints return correct data
- ✅ All SPA routes load and return HTML
- ✅ Vercel Preview deployment works
- ✅ Builder connects successfully
- ✅ Builder can detect routes
- ✅ PR preview validation passes
- ✅ Blog routes work in Builder
- ✅ Static assets load correctly
- ✅ Environment variables are set
- ✅ Logs show no errors

---

## Next Steps

1. ✅ **Follow the Vercel deployment guide** (`VERCEL_DEPLOYMENT_GUIDE.md`)
2. ✅ **Configure environment variables** (`ENV_SETUP_CHECKLIST.md`)
3. ✅ **Test API endpoints** manually
4. ✅ **Connect to Builder.io**
5. ✅ **Create test PR to Builder**
6. ✅ **Verify all routes validate**
7. ⏳ **Go live with Builder content**
8. ⏳ **Monitor and maintain**

---

## Support

If issues persist:

1. Check the troubleshooting sections above
2. Review **Vercel logs**: `vercel logs --prod`
3. Check **Builder.io project logs** (if available)
4. Verify **Supabase connectivity**: test locally with `pnpm run dev`
5. Contact [Builder.io Support](https://www.builder.io/c/docs/support) or [Vercel Support](https://vercel.com/support)

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Builder.io Integration Docs](https://www.builder.io/c/docs/integrations)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/)
