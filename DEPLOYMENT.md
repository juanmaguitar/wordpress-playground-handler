# Deployment Guide

This library contains large WebAssembly binaries (~600MB) that exceed Vercel's serverless function limits. Here are the solutions for Next.js deployments:

## Option 1: Edge Runtime (Recommended)

Add this to your Next.js API route:

```typescript
// app/api/users/route.ts
import { getPlaygroundHandler } from 'wordpress-playground-handler';
import path from 'path';

// This is the key - use Edge Runtime
export const runtime = 'edge';

export async function GET() {
  const handler = await getPlaygroundHandler({
    blueprintPath: path.resolve(process.cwd(), 'wordpress/blueprint.json'),
    mountPaths: {
      databasePath: path.resolve(process.cwd(), 'wordpress/database'),
      muPluginsPath: path.resolve(process.cwd(), 'wordpress/mu-plugins')
    }
  });

  const response = await handler.request({
    method: 'GET',
    url: '/wp-json/wp/v2/users'
  });

  return Response.json(response.json);
}
```

## Option 2: Use vercel.json

The included `vercel.json` forces Edge Runtime for all API routes:

```json
{
  "functions": {
    "pages/api/**/*.js": { "runtime": "edge" },
    "api/**/*.js": { "runtime": "edge" }
  }
}
```

## Option 3: External Hosting

Host the WordPress Playground on a VPS/cloud instance and call it from your Vercel functions:

```javascript
export default async function handler(req, res) {
  const response = await fetch('https://your-wordpress-instance.com/api', {
    method: 'POST',
    body: JSON.stringify(req.body)
  });
  return res.json(await response.json());
}
```

## Option 4: Serverless Module (Experimental)

Use the included serverless-optimized module:

```javascript
import ServerlessPlaygroundHandler from 'wordpress-playground-handler/dist/serverless.js';

export default async function handler(req, res) {
  try {
    const response = await ServerlessPlaygroundHandler.handleRequest(req.body);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

## Deployment Checklist

- [ ] Use Edge Runtime (`runtime: 'edge'`)
- [ ] Include `vercel.json` in your project
- [ ] Ensure `.vercelignore` excludes WASM files
- [ ] Test locally with `npm run deploy:check`
- [ ] Monitor bundle size in Vercel build logs

## Bundle Size Analysis

- **Full node_modules**: ~780MB
- **After exclusions**: ~180MB (under 250MB limit)
- **Optimized bundle**: 2.3kb (with externals)

The `.vercelignore` excludes:
- `node_modules/@php-wasm/**/*.wasm` (~300MB)
- `node_modules/@php-wasm/**/*.node` (~50MB)  
- Development dependencies (~200MB)
