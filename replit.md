# Fusion Starter - Replit Project

## Overview
A modern full-stack web application built with Vite, React, and Express, featuring server-side rendering (SSR) and a clean component architecture. This project was migrated from Vercel to Replit on November 10, 2025.

## Project Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **Server**: Express 5 with SSR support
- **Styling**: TailwindCSS with Radix UI components
- **Routing**: React Router v6
- **State Management**: TanStack Query
- **3D Graphics**: Three.js with React Three Fiber

### Project Structure
```
├── client/          # React frontend application
│   ├── components/  # Reusable UI components
│   ├── pages/       # Application pages/routes
│   ├── hooks/       # Custom React hooks
│   └── lib/         # Utility functions
├── server/          # Express backend
│   ├── routes/      # API route handlers
│   ├── index.ts     # Server setup & middleware
│   └── node-build.ts # Production SSR server
├── shared/          # Shared types and utilities
├── public/          # Static assets
└── dist/            # Build output (generated)
    ├── spa/         # Client-side build
    └── server/      # Server-side build
```

### Build Process
1. **Client Build**: Vite builds the React app into `dist/spa/`
2. **Server Build**: Vite builds the Express server into `dist/server/`
3. **Production**: Node.js runs the SSR server which serves the built client app

## Development

### Running Locally
The development server runs on port 5000 and includes hot module replacement (HMR):
```bash
npm run dev
```
Access at: `http://localhost:5000`

### Building for Production
```bash
npm run build
```

### Running Production Build
```bash
npm start
```

## Environment Variables

### Optional Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (default: development)
- `PING_MESSAGE` - Custom message for /api/ping endpoint (default: "ping")

All environment variables have sensible defaults and are optional for basic functionality.

## API Endpoints

- `GET /api/ping` - Health check endpoint
- `GET /api/demo` - Demo endpoint
- `GET /api/image-proxy?url=<image_url>` - Image proxy for allowed hosts

## Server-Side Rendering (SSR)

The application implements full server-side rendering in production mode for improved SEO and initial load performance.

### SSR Architecture

- **Entry Point**: `client/entry-server.tsx` - Exports a `render()` function that wraps the app with `StaticRouter` and `HelmetProvider`
- **Server Handler**: `server/node-build.ts` - Production server that renders React components to HTML strings
- **Build Process**: Separate client and server builds ensure proper SSR bundling

### How SSR Works

1. **Development Mode**: Uses client-side rendering with Vite's dev server for fast HMR
2. **Production Mode**: 
   - Server reads the built `index.html` template from `dist/spa/`
   - Renders React components to HTML using `ReactDOMServer.renderToString()`
   - Injects rendered HTML into the template's `<div id="root">`
   - Injects Helmet-managed meta tags, titles, and other head elements
   - Sends fully-rendered HTML to the client
3. **Client Hydration**: React hydrates the server-rendered HTML on the client side

### SSR-Safe Components

All components that use browser APIs (localStorage, window, navigator, etc.) must check for their existence:

```typescript
if (typeof window !== 'undefined' && window.localStorage) {
  // Safe to use localStorage
}

if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
  // Safe to use Media Devices API
}
```

SSR-safe components:
- `ThemeContext` - Handles localStorage safely
- `GamepadTester` - Guards navigator.getGamepads() and window APIs
- `GpuTester` - Guards window sizing and display APIs
- `MicTester` - Guards navigator.mediaDevices and AudioContext
- `MidiTester` - Guards navigator.requestMIDIAccess and Web Audio API

### Testing SSR

To test server-side rendering locally:

```bash
npm run build
npm start
curl http://localhost:5000/ | grep -A 10 '<div id="root">'
```

You should see rendered React components inside the root div, not an empty div.

## Recent Changes

### November 19, 2025 - Mobile-Friendly Improvements
- Enhanced viewport meta tags with maximum-scale, user-scalable, and viewport-fit for better mobile support
- Added PWA meta tags: mobile-web-app-capable, apple-mobile-web-app-capable, and HandheldFriendly
- Implemented touch-friendly button sizes (minimum 44x44px) across all interactive elements
- Added mobile-specific typography scaling for improved readability on small screens
- Implemented touch device optimizations with active states instead of hover effects
- Prevented iOS zoom on input focus with 16px minimum font size
- Fixed SSR compatibility in use-mobile hook
- Added webkit-tap-highlight-color and text-size-adjust for better mobile UX
- Prevented horizontal scrolling on mobile devices
- Improved scrolling performance with webkit-overflow-scrolling

### November 19, 2025 - SSR Fixes for Tester Pages
- Fixed SSR compatibility issues in all hardware tester pages
- Added SSR-safe guards for browser APIs in GamepadTester, GpuTester, MicTester, and MidiTester
- Wrapped navigator, window, and Web API calls with `typeof` checks to prevent SSR errors
- Fixed TypeScript error in MidiTester (added baseFreq to oscillator type)
- Verified all tester pages render correctly without SSR crashes
- Production build completes successfully with both client and server bundles

### November 17, 2025 - Full SSR Implementation
- Created `client/entry-server.tsx` as dedicated SSR entry point
- Updated `server/node-build.ts` to use the new render function
- Fixed `ThemeContext` to be SSR-safe (checks for localStorage availability)
- Verified SSR renders ~47KB of HTML with proper Helmet meta tags
- Production builds now serve fully server-rendered pages for better SEO

### November 10, 2025 - Replit Migration
- Migrated from Vercel to Replit
- Updated Vite dev server to bind to 0.0.0.0:5000 (Replit requirement)
- Updated production server to bind to 0.0.0.0:5000
- Switched from pnpm to npm for package management
- Configured Replit workflow for development server
- Set up deployment configuration

## Deployment

The project is configured for Replit deployment with:
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Port: 5000 (automatically exposed)
- Type: Autoscale deployment

## Security Features

- CORS enabled for API endpoints
- Environment-aware security headers:
  - **Development**: Relaxed CSP and frame options for Replit webview compatibility
  - **Production**: Full CSP enforcement, X-Frame-Options, and frame-ancestors protection
- Security headers managed server-side via Express middleware
- Image proxy with host whitelisting (SSRF protection)
- Static asset caching with proper Cache-Control headers
- .env files excluded from git and build processes
- Vite file system restrictions relaxed for development only (fs.strict = false)

### Security Notes for Production

When deploying to production, ensure `NODE_ENV=production` is set. This enables:
- X-Frame-Options: SAMEORIGIN (clickjacking protection)
- Content-Security-Policy with frame-ancestors (additional frame protection)
- Strict script, style, and resource loading policies

Development mode intentionally relaxes these restrictions to allow the Replit webview to function properly.
