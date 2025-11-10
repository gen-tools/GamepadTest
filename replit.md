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

## Recent Changes

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
