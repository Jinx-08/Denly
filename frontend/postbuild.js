import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, 'dist');
const indexHtml = path.resolve(distDir, 'index.html');

if (!fs.existsSync(indexHtml)) {
  console.error('dist/index.html not found! Run vite build first.');
  process.exit(1);
}

const htmlContent = fs.readFileSync(indexHtml, 'utf8');

// 1. Create 404.html for Vercel SPA fallback on any unknown route
fs.writeFileSync(path.resolve(distDir, '404.html'), htmlContent);
console.log('✓ Created dist/404.html for SPA fallback');

// 2. Create subdirectories with index.html and html files for all client-side routes
const routes = [
  'guides',
  'care',
  'care-and-guides',
  'login',
  'register',
  'dashboard'
];

for (const route of routes) {
  const routeDir = path.resolve(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.resolve(routeDir, 'index.html'), htmlContent);
  fs.writeFileSync(path.resolve(distDir, `${route}.html`), htmlContent);
  console.log(`✓ Created dist/${route}/index.html & dist/${route}.html`);
}

console.log('✓ All SPA static routes and fallback generated successfully!');
