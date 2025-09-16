import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Bundle único para APK nativo con todos los assets incluidos
    rollupOptions: {
      output: {
        manualChunks: undefined, // Un solo bundle
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'js/[name].js',
        entryFileNames: 'js/[name].js',
      },
    },
    // Configuración optimizada para APK
    chunkSizeWarningLimit: 5000, // Permitir bundles grandes
    minify: 'terser',
    sourcemap: false,
    target: 'es2020',
    assetsInlineLimit: 0, // No inline assets, mantenerlos como archivos
    copyPublicDir: true, // Copiar directorio public completo
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      '@tanstack/react-query',
      'lucide-react'
    ],
  },
});
