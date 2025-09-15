import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    host: true,
    port: 8080,
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  build: {
    rollupOptions: {
      external: ['prop-types'],
      output: {
        manualChunks: (id) => {
          // Vendor chunks optimizados por tamaño
          if (id.includes('node_modules')) {
            // React ecosystem - chunk principal
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // UI libraries - separar por tamaño
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            
            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            
            // Data fetching
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            
            // Icons - chunk separado por ser grande
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            
            // Utilities - chunk pequeño
            if (id.includes('date-fns') || id.includes('uuid') || id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'vendor-utils';
            }
            
            // Resto de vendors en chunk general
            return 'vendor-misc';
          }
          
          // App chunks por funcionalidad
          if (id.includes('/pages/Auth') || id.includes('/hooks/useAuth') || id.includes('/components/auth/')) {
            return 'app-auth';
          }
          
          if (id.includes('/pages/Chat') || id.includes('/components/chat/') || id.includes('/hooks/useRealtimeChat')) {
            return 'app-chat';
          }
          
          if (id.includes('/pages/Discover') || id.includes('/pages/Matches') || id.includes('/lib/MatchingService')) {
            return 'app-matching';
          }
          
          if (id.includes('/pages/Profile') || id.includes('/components/profile/') || id.includes('/hooks/useProfile')) {
            return 'app-profile';
          }
          
          if (id.includes('/pages/Admin') || id.includes('/components/admin/')) {
            return 'app-admin';
          }
          
          if (id.includes('/pages/Tokens') || id.includes('/components/tokens/') || id.includes('/hooks/useTokens')) {
            return 'app-tokens';
          }
          
          if (id.includes('/components/animations/') || id.includes('/components/ui/')) {
            return 'app-ui';
          }
          
          // Chunk principal para el resto
          return undefined;
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 400, // Reducido para mejor optimización
  },
  define: {
    global: 'globalThis',
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
  },
});
