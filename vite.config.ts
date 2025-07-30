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
  build: {
    target: 'es2015', // Compatibilidade com navegadores modernos
    cssCodeSplit: true, // Divide CSS em múltiplos arquivos
    reportCompressedSize: false, // Melhora a velocidade de build
    chunkSizeWarningLimit: 1000, // Aumenta o limite de aviso para 1000kB
    rollupOptions: {
      output: {
        // Garantir que o React seja carregado antes de outros pacotes
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'lucide-react'],
          'data-vendor': ['@tanstack/react-query', 'zustand'],
        }
      }
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/types/',
      ],
    },
  },
}));
