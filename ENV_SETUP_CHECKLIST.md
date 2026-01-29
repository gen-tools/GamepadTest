# Environment Variables Setup Checklist

This checklist guides you through configuring your Vercel deployment with proper environment variables.

## Step 1: Gather Your Credentials

Before configuring Vercel, collect these values:

### Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings > API**
4. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`

### Optional: Custom Settings

- **PING_MESSAGE**: Custom message for `/api/ping` endpoint (default: "ping")
- **NODE_ENV**: Should be "production" on Vercel (Vercel sets this automatically)

---

## Step 2: Configure Vercel Environment Variables

### Method A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Settings** (top nav)
4. Go to **Environment Variables** (left sidebar)
5. Add each variable:

| Variable | Value | Production | Preview | Development |
|----------|-------|------------|---------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase URL | ✅ | ✅ | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key | ✅ | ✅ | ✅ |
| `PING_MESSAGE` | "pong" (or your custom message) | ✅ | ✅ | ⏸️ |

**Important**: Make sure to check **Production**, **Preview**, and **Development** boxes for each variable.

6. Click "Save" for each variable

### Method B: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Add environment variables to your project
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase Anon Key when prompted

vercel env add PING_MESSAGE
# Type "pong" (or your custom message)
```

### Method C: Via Git Environment Files (Not Recommended)

If you need to commit environment variables to git (not recommended for secrets):

Create `.env.production`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
PING_MESSAGE=pong
```

**⚠️ Warning**: Never commit real credentials to git. Use Vercel dashboard instead.

---

## Step 3: Verify Environment Variables

### Check Vercel Dashboard

1. Go to your Vercel project
2. Click **Settings > Environment Variables**
3. Verify all variables are listed
4. Check that they're marked for Production/Preview/Development

### Test Environment Variables

After deploying with variables, test them:

```bash
# Test API endpoint (should work if Supabase config is correct)
curl https://your-domain.vercel.app/api/ping

# Response should be:
# {"message":"pong"}

# Test blogs API (should fetch from Supabase)
curl https://your-domain.vercel.app/api/blogs

# Response should be an array of blog posts
# [{"id":"...", "title":"...", ...}]
```

---

## Step 4: Verify in Vercel Logs

Check if environment variables loaded correctly:

```bash
# View Vercel deployment logs
vercel logs --prod

# Look for any errors about missing VITE_SUPABASE_* variables
# Should see successful database queries
```

---

## Step 5: Verify in Client Code

Your client app uses these variables (already configured in code):

```typescript
// client/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

And in serverless functions:

```typescript
// api/blogs/index.ts
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
```

---

## Troubleshooting

### Issue: API Returns 500 Error

**Check 1**: Verify environment variables are set
```bash
vercel env list
```

**Check 2**: Check Vercel logs for errors
```bash
vercel logs --prod --follow
```

**Check 3**: Manually verify Supabase credentials work locally
```bash
# Test locally first
VITE_SUPABASE_URL=your_url VITE_SUPABASE_ANON_KEY=your_key pnpm run dev
# Then test the blog API
curl http://localhost:5000/api/blogs
```

### Issue: Builder.io Shows API Route Errors

**Solution**: 
1. Ensure environment variables are set in Vercel
2. Rebuild and redeploy:
   ```bash
   vercel redeploy
   ```
3. Wait for deployment to complete (check Vercel dashboard)
4. Clear Builder cache: Project Settings > Clear Cache

### Issue: "Missing Supabase Environment Variables" Error

This error appears in `api/blogs/index.ts` and similar files when:
- Environment variables aren't set in Vercel
- Vercel build didn't inject them

**Solution**:
1. Double-check variables in Vercel dashboard
2. Ensure they're marked for Production environment
3. Redeploy: `vercel redeploy --prod`

### Issue: Client Can't Reach API Endpoints

**Check**:
1. Verify API endpoint URLs in client code (they should be `/api/*`, not full URLs)
   ```typescript
   // ✅ Correct
   fetch("/api/blogs")
   
   // ❌ Wrong (only works in dev)
   fetch("http://localhost:5000/api/blogs")
   ```

2. Check CORS headers are set (they are, in all api/* files)

---

## Security Checklist

- ✅ Never commit `VITE_SUPABASE_ANON_KEY` to git
- ✅ Use Vercel dashboard for environment variable management
- ✅ Use "Anon Key", not "Service Role Key" (the anon key is for client-side use)
- ✅ Implement real authentication for admin endpoints
  - Current implementation is a placeholder
  - See `api/admin/blogs.ts` function `isAdmin()`

---

## Local Development

### Run with Environment Variables Locally

```bash
# Create .env.local file (git-ignored)
echo "VITE_SUPABASE_URL=your_url" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your_key" >> .env.local

# Start development server
pnpm run dev

# The server will read .env.local automatically
```

### Test with Vercel CLI

```bash
# Run locally with Vercel environment variables
vercel dev

# This uses actual Vercel env variables for testing
```

---

## Next Steps

1. ✅ **Gather credentials** from Supabase
2. ✅ **Configure Vercel environment variables** using dashboard or CLI
3. ✅ **Test API endpoints** with curl or your browser
4. ✅ **Check Vercel logs** for any errors
5. ⏳ **Test Builder.io integration** (see Builder Integration Guide)
6. ⏳ **Verify all blog pages load** (both list and detail)
7. ⏳ **Implement real authentication** for admin endpoints (optional)

---

## Reference

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [Supabase Project Settings](https://supabase.com/docs/guides/api#api-url)
- [Vercel Serverless Functions with Environment Variables](https://vercel.com/docs/functions/serverless-functions/environment-variables)
