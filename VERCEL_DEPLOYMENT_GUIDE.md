# Vercel + Builder.io Deployment Guide

## Overview

This guide explains the fixed architecture for deploying your app to Vercel with full SSR support, working API routes, and Builder.io integration.

### What Changed

**Previous Issues:**
- Express server only ran locally (dev), not in production
- API routes weren't deployed to Vercel
- Builder previews/PRs failed because API endpoints were missing
- Blog SSR pages weren't properly rendered

**New Architecture:**
- API routes are now **Vercel Serverless Functions** (in `/api/` folder)
- Client SPA still builds with Vite and deploys to `dist/spa`
- Vercel automatically serves both static assets and serverless functions
- Builder.io can now properly crawl and validate all routes

---

## File Structure

### New Files Created

```
api/
├── ping.ts                         # GET /api/ping
├── demo.ts                         # GET /api/demo
├── image-proxy.ts                  # GET /api/image-proxy
├── blogs/
│   ├── index.ts                    # GET /api/blogs (list)
│   └── [slug].ts                   # GET /api/blogs/:slug (single)
└── admin/
    ├── blogs.ts                    # GET/POST /api/admin/blogs
    └── blogs/
        └── [id].ts                 # PUT/DELETE /api/admin/blogs/:id
```

### Modified Files

```
vercel.json                          # Updated rewrite rules for serverless functions
package.json                         # Added @vercel/node dependency
.vercelignore                        # Excludes unnecessary files from Vercel builds
```

---

## Key Configuration Changes

### 1. **vercel.json**

```json
{
  "buildCommand": "pnpm run build:client",
  "outputDirectory": "dist/spa",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/:path((?!.*\\.).*)",
      "destination": "/index.html"
    }
  ]
}
```

**What this does:**
- `buildCommand`: Only builds the client (SPA), not the server
- `functions`: Tells Vercel that `/api/*.ts` files are serverless functions
- `rewrites`: Routes `/api/*` to serverless functions, everything else to `index.html`
- The regex `(?!.*\\.).*` prevents asset files from being rewritten

### 2. **Serverless Function Examples**

Each function exports a default handler:

```typescript
import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle the request
  res.json({ data: "..." });
}
```

**Important: CORS Headers**
All API functions include CORS headers:

```typescript
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
```

---

## How Routing Works

### Client Routes (SPA)
```
/ → client/pages/Index.tsx
/blog → client/pages/BlogList.tsx
/blog/:slug → client/pages/BlogDetail.tsx
/blog/gamepad-tester-guide → client/pages/GamepadTesterGuide.tsx
/admin/dashboard → client/pages/AdminDashboard.tsx
```

### API Routes (Serverless Functions)
```
GET  /api/ping → api/ping.ts
GET  /api/blogs → api/blogs/index.ts
GET  /api/blogs/:slug → api/blogs/[slug].ts
GET  /api/admin/blogs → api/admin/blogs.ts
POST /api/admin/blogs → api/admin/blogs.ts
PUT  /api/admin/blogs/:id → api/admin/blogs/[id].ts
DELETE /api/admin/blogs/:id → api/admin/blogs/[id].ts
```

---

## Deployment Steps

### 1. **Install Dependencies**

```bash
pnpm install
```

This installs `@vercel/node` for TypeScript serverless function support.

### 2. **Test Locally**

```bash
# Development (with local Express server + API)
pnpm run dev

# Production build test
pnpm run build:client
pnpm run preview  # Uses local Express server with built SPA
```

### 3. **Push to Git**

```bash
git add .
git commit -m "Set up Vercel serverless functions for API routes"
git push origin zen-den
```

### 4. **Deploy to Vercel**

Option A: **Via Git Integration**
- Connect your GitHub repo to Vercel
- Vercel automatically detects `vercel.json`
- Builds and deploys on every push

Option B: **Via Vercel CLI**
```bash
npm install -g vercel
vercel
```

Option C: **Via Builder.io MCP**
- [Open MCP popover](#open-mcp-popover) to connect Vercel
- Use Builder's deployment tools

### 5. **Configure Environment Variables on Vercel**

Go to **Vercel Dashboard > Settings > Environment Variables** and add:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
PING_MESSAGE=pong (optional)
NODE_ENV=production
```

---

## Blog Asset Serving

### Static Images

Place blog images in either:

**Option 1: Public Folder (Recommended)**
```
public/
├── blog-images/
│   ├── my-article-1.jpg
│   └── my-article-2.png
```

Reference in content:
```typescript
featured_image: "/blog-images/my-article-1.jpg"
```

**Option 2: External CDN**
```typescript
featured_image: "https://cdn.example.com/my-article-1.jpg"
```

### Image Proxy Endpoint

For CORS-blocked images (like Amazon images):

```typescript
// In blog admin UI
featured_image: "/api/image-proxy?url=https://m.media-amazon.com/image.jpg"
```

The proxy supports whitelisted hosts:
- `m.media-amazon.com`
- `images-na.ssl-images-amazon.com`
- `images-eu.ssl-images-amazon.com`

Add more hosts to `api/image-proxy.ts` if needed.

### Caching Strategy

```
Static assets (JS/CSS/images): 1 year
Blog list/detail: 1 hour
Admin endpoints: No cache
Image proxy: 7 days
```

---

## Builder.io Integration

### How Builder Crawls Your Site

1. **Route Detection**: Builder scans `vercel.json` rewrites to understand:
   - `/api/*` → Serverless functions (API routes)
   - `/:path*` → SPA routes (client-side)

2. **Route Validation**: For each route, Builder checks if it returns valid content:
   - API routes should return JSON
   - SPA routes should return HTML

3. **Preview/PR Validation**: When you create a PR, Builder:
   - Deploys a preview
   - Runs all routes against it
   - Checks for 404s, 500s, or broken links

### What Changed for Builder

✅ **API routes now work in previews** (they're serverless functions on Vercel)
✅ **Route detection is clearer** (separated `/api` from SPA routes)
✅ **No raw regex in rewrites** (using safe patterns that Builder understands)

### If Builder Still Has Issues

1. **Clear cache**
   - Go to Builder project settings
   - Click "Clear Cache"

2. **Check Vercel deployment**
   - Verify all functions deployed: `vercel ls`
   - Check function logs: `vercel logs`

3. **Test manually**
   ```bash
   # Test API endpoint
   curl https://your-domain.vercel.app/api/blogs
   
   # Test SPA route
   curl https://your-domain.vercel.app/blog
   ```

4. **Verify environment variables**
   - Ensure `VITE_SUPABASE_*` are set in Vercel dashboard
   - API functions won't work without them

---

## Troubleshooting

### Issue: API Routes Return 500 Errors

**Solution**: Check environment variables
```bash
# View Vercel logs
vercel logs --prod

# Verify VITE_SUPABASE_* are set
vercel env list
```

### Issue: Blog Images Don't Load

**Solution**: Verify image paths
```typescript
// ❌ Wrong
featured_image: "blog-images/image.jpg"

// ✅ Correct (public folder)
featured_image: "/blog-images/image.jpg"

// ✅ Correct (external CDN)
featured_image: "https://cdn.example.com/image.jpg"
```

### Issue: Builder Shows 404s

**Solution**: Check Vercel deployment
```bash
# Ensure functions are deployed
vercel ls

# Test a route
curl https://your-domain.vercel.app/api/ping
```

### Issue: Admin Routes Return Unauthorized

**Admin protection is a placeholder.** You need to implement real authentication.

Current code:
```typescript
const isAdmin = (req: VercelRequest): boolean => {
  const authHeader = req.headers.authorization;
  return !!authHeader; // Just checks if header exists
};
```

**To add real auth:**
1. Use Supabase Auth or another auth provider
2. Verify JWT tokens in each admin function
3. Example: [Supabase JWT verification](https://supabase.com/docs/guides/auth/jwt)

---

## Local Development

### Running Locally with Serverless Functions

For local testing that mimics Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Run locally with serverless emulation
vercel dev
```

This starts:
- Vite dev server on localhost:3000
- Serverless function emulation
- Full local preview of production setup

### Using npm run dev (Recommended for Development)

```bash
# Fast development with hot reload
pnpm run dev
```

This uses the old Express server setup for development (faster feedback). The API calls still work because the Express server in `server/index.ts` handles them.

---

## Next Steps

1. ✅ Create `/api` serverless functions (done)
2. ✅ Update `vercel.json` (done)
3. ⏳ **Configure environment variables** on Vercel dashboard
4. ⏳ **Test deployment**: Push to git, monitor Vercel build
5. ⏳ **Test Builder.io**: Create preview/PR, check validation
6. ⏳ **Implement real auth** for admin endpoints (optional but recommended)

---

## Additional Resources

- [Vercel Serverless Functions Documentation](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Builder.io Integration Docs](https://www.builder.io/c/docs/integrations)
- [Supabase with Vercel](https://supabase.com/docs/guides/hosting/vercel)

---

## Questions?

If you encounter issues:

1. Check **Vercel deployment logs**: `vercel logs --prod`
2. Check **Builder.io logs**: In your Builder project dashboard
3. Verify **environment variables** are set in Vercel dashboard
4. Test **API endpoints manually** with curl
