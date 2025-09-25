import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// NODE_ENV configuration removed - Vite handles this automatically

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
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@huggingface/transformers')) {
              return 'vendor-ai'; // Separate chunk for AI features
            }
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'vendor-utils';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform/resolvers')) {
              return 'vendor-forms';
            }
            return 'vendor-misc';
          }
          
          // App chunks by feature - more granular splitting
          if (id.includes('/pages/Admin') || id.includes('/components/admin/')) {
            return 'admin';
          }
          if (id.includes('/pages/Tokens') || id.includes('/components/tokens/')) {
            return 'tokens';
          }
          if (id.includes('/pages/Chat') || id.includes('/components/chat/')) {
            return 'chat';
          }
          if (id.includes('/pages/Profile') || id.includes('/components/profile/') || 
              id.includes('/pages/EditProfile') || id.includes('/pages/ProfileSingle') || 
              id.includes('/pages/ProfileCouple')) {
            return 'profiles';
          }
          if (id.includes('/pages/Discover') || id.includes('/components/discover/')) {
            return 'discover';
          }
          if (id.includes('/pages/Stories') || id.includes('/pages/Feed')) {
            return 'social';
          }
          if (id.includes('/pages/Terms') || id.includes('/pages/Privacy') || 
              id.includes('/pages/Legal') || id.includes('/pages/Guidelines')) {
            return 'legal';
          }
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'es2020',
    minify: 'terser', // Better compression than esbuild
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    chunkSizeWarningLimit: 500, // Increase limit temporarily
    sourcemap: false, // Disable sourcemaps in production for smaller builds
  },
  define: {
    global: 'globalThis',
  },
  esbuild: {
    drop: ['debugger'], // Always drop debugger statements in builds
  },
});
