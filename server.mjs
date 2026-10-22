import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: '.env.local' });
const root = resolve(fileURLToPath(new URL('./dist/', import.meta.url)));
if (!existsSync(root)) throw new Error('Falta dist/. Ejecuta npm run build primero.');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json; charset=utf-8' };

createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const route = pathname === '/mx/solo-alimentos' || pathname === '/mx/solo-alimentos/'
    ? '/alimentos.html'
    : pathname;
  const requested = resolve(root, `.${route}`);
  if (requested !== root && !requested.startsWith(root + sep)) {
    res.writeHead(400).end('Bad request');
    return;
  }
  let file = requested;
  if (!existsSync(file) || statSync(file).isDirectory()) file = resolve(root, 'index.html');
  res.writeHead(200, {
    'Content-Type': mime[extname(file)] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': extname(file) === '.html' ? 'no-cache' : 'public, max-age=3600',
  });
  createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
  console.log(`Demo de cine disponible en http://127.0.0.1:${process.env.PORT || 3000}`);
});
