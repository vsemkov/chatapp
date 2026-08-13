import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: import.meta.env.VITE_API_PROXY_URL,
        changeOrigin: true
      },
      '/socket.io': {
        target: import.meta.env.VITE_IO_PROXY_URL,
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/socket.io/, '/socket.io'),
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
