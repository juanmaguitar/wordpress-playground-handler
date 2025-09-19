import { build } from 'esbuild';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

// Get all dependencies to mark as external (for Node.js libraries)
const external = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
  // Node.js built-ins
  'fs', 'path', 'crypto', 'stream', 'util', 'os', 'tls', 'url', 'buffer',
  // Native modules and patterns
  '*.node',
  '*.wasm',
  'fs-ext',
  // Exclude large PHP WASM packages
  '@php-wasm/node',
  '@php-wasm/web',
  '@php-wasm/universal'
];

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'esm',
  target: 'node18',
  platform: 'node',
  external,
  sourcemap: !isProduction, // Disable source maps in production
  minify: isProduction,      // Minify in production
  treeShaking: true,         // Enable tree shaking
  keepNames: true,           // Keep function names for better debugging
  logLevel: 'info',
  packages: 'external',      // Mark all packages as external for Node.js libraries
  // Skip type declarations for now due to version conflicts
  plugins: [],
};

try {
  await build(config);
  console.log(`✓ Build completed successfully ${isProduction ? '(production)' : '(development)'}`);
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
