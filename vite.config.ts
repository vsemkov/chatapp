import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_URL || 'http://localhost:3000',
          changeOrigin: true,
        }
      },
      '/socket.io': {
        target: env.VITE_IO_PROXY_URL || 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/socket.io/, '/socket.io'),
        configure: (proxy: any) => {
          proxy.on('error', (err: any) => {
            console.log('WebSocket proxy error', err);
          });
          proxy.on('proxyReqWs', (_: any, req: any) => {
            console.log('WebSocket connection established', req.url);
          });
        }
      }
    }
  }
});