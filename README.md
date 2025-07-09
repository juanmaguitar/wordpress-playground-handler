# WordPress Playground Handler

A Node.js library for building serverless Headless WordPress applications without PHP server dependencies. By leveraging WordPress Playground's PHP runtime directly in Node.js, this package enables you to create Headless WordPress apps that can be deployed to platforms like Vercel - no PHP server or WordPress installation required. Simply make direct requests to WordPress's APIs and runtime from your Node.js code.

## Features

- 🚀 **Singleton Pattern**: Efficiently manages Playground instances with automatic caching
- 🔧 **Blueprint Support**: Configure WordPress setup, plugins, and constants via blueprints
- 📁 **Directory Mounting**: Mount local directories (database, plugins, themes, etc.)
- 🌐 **Direct API Access**: Make requests directly to WordPress REST API and PHP runtime
- 📦 **TypeScript Ready**: Full TypeScript support with comprehensive type definitions
- ⚡ **Dynamic WordPress**: Automatically fetches latest WordPress releases and plugins
- 🧪 **Testing Friendly**: Perfect for headless testing and automation

## Installation

```bash
npm install wordpress-playground-handler
```

## Quick Start

```typescript
import { getPlaygroundHandler, PHPRequest } from 'wordpress-playground-handler';

// Initialize WordPress Playground (singleton - only initializes once)
const handler = await getPlaygroundHandler();

// Make requests to WordPress
const response = await handler.request({
  method: 'GET',
  url: '/wp-json/wp/v2/posts'
} as PHPRequest);

console.log(JSON.parse(response.text));
```

## API Reference

### `getPlaygroundHandler(options?: PlaygroundOptions)`

Returns a Promise that resolves to a PHPRequestHandler. Uses singleton pattern for efficient resource management.

#### Options

```typescript
interface PlaygroundOptions {
  blueprintPath?: string;    // Path to blueprint.json file
  blueprint?: Blueprint;     // Blueprint object (takes precedence over blueprintPath)
  mountPaths?: MountPaths;   // Local directories to mount
}

interface MountPaths {
  databasePath?: string;     // Mount database directory
  muPluginsPath?: string;    // Mount mu-plugins directory
}
```

If no options are provided, defaults to `./wordpress/blueprint.json`.

### Exported Types

- `PHPRequestHandler` - Main handler for making requests
- `PHPRequest` - Request interface
- `PHPResponse` - Response interface  
- `Blueprint` - Blueprint configuration interface

## Usage Examples

### Basic Setup with Blueprint

```typescript
import { getPlaygroundHandler, Blueprint } from 'wordpress-playground-handler';

const blueprint: Blueprint = {
  steps: [
    { step: "runWpInstallationWizard", options: {} },
    {
      step: "installPlugin",
      pluginData: {
        resource: "wordpress.org/plugins",
        slug: "akismet"
      }
    },
    {
      step: "defineWpConfigConsts",
      consts: {
        "JWT_AUTH_SECRET_KEY": "your-secret-key",
        "JWT_AUTH_CORS_ENABLE": true
      }
    }
  ]
};

const handler = await getPlaygroundHandler({ blueprint });
```

### Mounting Local Directories

```typescript
import { getPlaygroundHandler } from 'wordpress-playground-handler';
import { resolve } from 'path';

const handler = await getPlaygroundHandler({
  blueprintPath: './wordpress/blueprint.json',
  mountPaths: {
    databasePath: resolve('./database'),
    muPluginsPath: resolve('./mu-plugins')
  }
});
```

### JWT Authentication Flow

```typescript
import { getPlaygroundHandler, PHPRequest } from 'wordpress-playground-handler';

const handler = await getPlaygroundHandler();

// Get JWT token
const tokenResponse = await handler.request({
  method: "POST",
  url: "/wp-json/jwt-auth/v1/token",
  headers: { "Content-Type": "application/json" },
  body: {
    username: "admin",
    password: "password"
  }
} as PHPRequest);

const { token } = JSON.parse(tokenResponse.text);

// Use token for authenticated requests
const userResponse = await handler.request({
  method: "GET",
  url: "/wp-json/wp/v2/users/me",
  headers: { "Authorization": `Bearer ${token}` }
} as PHPRequest);

console.log('User info:', JSON.parse(userResponse.text));
```

### Custom REST API Endpoints

```typescript
// Create a post
const createPost = await handler.request({
  method: "POST",
  url: "/wp-json/wp/v2/posts",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: {
    title: "My New Post",
    content: "This is the post content",
    status: "publish"
  }
} as PHPRequest);

// Get all posts
const getPosts = await handler.request({
  method: "GET",
  url: "/wp-json/wp/v2/posts"
} as PHPRequest);
```

## Development

To work on this package locally:

```bash
git clone <repository-url>
cd wordpress-playground-handler
npm install
npm run build
npm test
```

### Running the Example

```bash
npm run example
```

This runs the example in the `example/` directory which demonstrates typical usage patterns.

## Requirements

- Node.js v18+
- NPM or Yarn

## License

MIT

## References

- [WordPress Playground Repository](https://github.com/WordPress/wordpress-playground)
- [WordPress Playground Documentation](https://wordpress.github.io/wordpress-playground/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/) 