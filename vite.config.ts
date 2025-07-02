import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { ViteDevServer } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '/rest/v1': {
        target: process.env.VITE_SUPABASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rest\/v1/, ''),
      },
    },
    configureServer: (server: ViteDevServer) => {
      import('./src/middlewares/security').then(({ securityMiddleware }) => {
        server.middlewares.use(securityMiddleware);
      }).catch(err => {
        console.warn('Erro ao carregar middleware de segurança:', err);
      });
    }
  },
  preview: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
