# Quick Start: Vercel + Builder.io Deployment

This is a quick reference guide. For detailed information, see:
- `VERCEL_DEPLOYMENT_GUIDE.md` - Full deployment setup
- `ENV_SETUP_CHECKLIST.md` - Environment variables
- `BUILDER_INTEGRATION_GUIDE.md` - Builder.io testing

---

## What Was Fixed

### ❌ Before
- Express server only ran locally
- API routes didn't exist on Vercel
- Builder previews/PRs failed
- Blog assets weren't served properly

### ✅ After
- API routes are now Vercel Serverless Functions
- All API endpoints work in production
- Builder can validate all routes
- Blog assets properly cached and served

---

## Files Created/Modified

### New Files
```
api/                          # Vercel serverless functions
├── ping.ts                   # GET /api/ping
├── demo.ts                   # GET /api/demo
├── image-proxy.ts            # GET /api/image-proxy
├── blogs/
│   ├── index.ts              # GET /api/blogs
│   └── [slug].ts             # GET /api/blogs/:slug
└── admin/
    ├── blogs.ts              # GET/POST /api/admin/blogs
    └── blogs/[id].ts         # PUT/DELETE /api/admin/blogs/:id

.vercelignore                 # Exclude unnecessary files from build
prerender-routes.json         # Documentation of priority routes

VERCEL_DEPLOYMENT_GUIDE.md    # Detailed deployment setup
ENV_SETUP_CHECKLIST.md        # Environment variables guide
BUILDER_INTEGRATION_GUIDE.md   # Builder.io testing guide
QUICK_START_VERCEL.md         # This file
```

### Modified Files
```
vercel.json                   # Updated for serverless functions
package.json                  # Added @vercel/node dependency
```

---

## Deployment in 5 Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Gather Credentials
Go to [Supabase Dashboard](https://app.supabase.com) > Settings > API
- Copy **Project URL**
- Copy **Anon Public Key**

### 3. Configure Vercel Environment Variables

Go to [Vercel Dashboard](https://vercel.com) > Your Project > Settings > Environment Variables

Add:
| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key |

Make sure **Production** and **Preview** are checked.

### 4. Deploy
```bash
git add .
git commit -m "Set up Vercel serverless API routes"
git push origin zen-den
```

Vercel automatically builds and deploys.

### 5. Test
```bash
# Test API endpoint
curl https://your-domain.vercel.app/api/blogs

# Test SPA route
curl https://your-domain.vercel.app/blog
```

---

## Route Mapping

### API Routes (Serverless Functions)
```
GET    /api/ping                           → api/ping.ts
GET    /api/demo                           → api/demo.ts
GET    /api/image-proxy?url=...            → api/image-proxy.ts
GET    /api/blogs                          → api/blogs/index.ts
GET    /api/blogs/:slug                    → api/blogs/[slug].ts
GET    /api/admin/blogs                    → api/admin/blogs.ts
POST   /api/admin/blogs                    → api/admin/blogs.ts
PUT    /api/admin/blogs/:id                → api/admin/blogs/[id].ts
DELETE /api/admin/blogs/:id                → api/admin/blogs/[id].ts
```

### SPA Routes (Client-Side)
```
GET    /                                   → Index.tsx
GET    /blog                               → BlogList.tsx (fetches /api/blogs)
GET    /blog/:slug                         → BlogDetail.tsx (fetches /api/blogs/:slug)
GET    /blog/gamepad-tester-guide          → GamepadTesterGuide.tsx (static)
GET    /gamepad-tester                     → GamepadTester.tsx
GET    /gpu-tester                         → GpuTester.tsx
GET    /mic-tester                         → MicTester.tsx
GET    /midi-tester                        → MidiTester.tsx
GET    /admin/login                        → AdminLogin.tsx
GET    /admin/dashboard                    → AdminDashboard.tsx (fetches /api/admin/blogs)
```

---

## Vercel Configuration Summary

### vercel.json
```json
{
  "buildCommand": "pnpm run build:client",
  "outputDirectory": "dist/spa",
  "functions": {
    "api/**/*.ts": { "runtime": "nodejs20.x" }
  },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/:path((?!.*\\.).*)", "destination": "/index.html" }
  ]
}
```

**Key points:**
- ✅ Only builds client (SPA), not Express server
- ✅ API functions are NodeJS 20
- ✅ `/api/*` routes go to serverless functions
- ✅ Everything else goes to `index.html` (SPA)

---

## Builder.io Integration

### Connect Builder to Vercel

1. Go to [Builder.io](https://builder.io) > Your Project
2. Go to Settings > Integrations/Hosting
3. Connect Vercel account
4. Select your Vercel project

### Test Integration

```bash
# Test an API endpoint
curl https://your-domain.vercel.app/api/blogs

# Create a test PR to trigger Builder validation
git checkout -b test/builder
echo "test" >> README.md
git push origin test/builder
# Go to GitHub, create PR, watch Builder validate it
```

---

## Common Issues

### API Returns 500 Error
- ✅ Check env vars are set in Vercel dashboard
- ✅ Check Vercel logs: `vercel logs --prod`
- ✅ Verify Supabase credentials are correct

### Builder Shows Validation Errors
- ✅ Ensure env vars are set for Preview environment
- ✅ Run `vercel redeploy` to rebuild
- ✅ Clear Builder cache in project settings

### Blog Images Don't Load
- ✅ Use `/blog-images/image.jpg` for public folder
- ✅ Use full URL for external CDN
- ✅ Use `/api/image-proxy?url=...` for CORS-blocked images

---

## Quick Commands

```bash
# Local development (with local API)
pnpm run dev

# Build client only (for Vercel)
pnpm run build:client

# Test with Vercel serverless emulation
vercel dev

# View Vercel production logs
vercel logs --prod --follow

# Redeploy to Vercel
vercel redeploy --prod

# Check Vercel functions deployed
vercel ls
```

---

## File Sizes & Performance

Static assets are cached for **1 year**:
- `.js`, `.css`, `.woff2` files
- Hashed with content hash

Blog data is cached for **1 hour**:
- `/api/blogs`
- `/api/blogs/:slug`

Admin endpoints have **no cache**:
- `/api/admin/*` routes (private)

---

## Next: Implement Real Authentication

The current admin authentication is a **placeholder**. For production:

1. Set up Supabase Auth or similar
2. Verify JWT tokens in `api/admin/blogs.ts` and `api/admin/blogs/[id].ts`
3. Replace the `isAdmin()` function with real validation

See `VERCEL_DEPLOYMENT_GUIDE.md` Troubleshooting section for details.

---

## Resources

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Builder.io Docs](https://www.builder.io/c/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Router Docs](https://reactrouter.com/)

---

## Need Help?

1. Read the detailed guides:
   - `VERCEL_DEPLOYMENT_GUIDE.md`
   - `ENV_SETUP_CHECKLIST.md`
   - `BUILDER_INTEGRATION_GUIDE.md`

2. Check logs:
   - Vercel: `vercel logs --prod`
   - Supabase: Check your Supabase dashboard

3. Test locally first:
   - `pnpm run dev`
   - Verify API endpoints work locally before deploying
