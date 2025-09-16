import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Configurar NODE_ENV para producción
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

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
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'vendor-animation': ['framer-motion'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-utils': ['date-fns', 'clsx', 'class-variance-authority'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers'],
          'vendor-icons': ['lucide-react']
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
