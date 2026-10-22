import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{
    name: 'local-food-page-route',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname;
        if (pathname === '/mx/solo-alimentos' || pathname === '/mx/solo-alimentos/') {
          request.url = request.url.replace(pathname, '/alimentos.html');
        }
        next();
      });
    },
  }],
  build: {
    rollupOptions: {
      input: {
        cartelera: resolve(process.cwd(), 'index.html'),
        alimentos: resolve(process.cwd(), 'alimentos.html'),
        cuenta: resolve(process.cwd(), 'cuenta.html'),
      },
    },
  },
});
