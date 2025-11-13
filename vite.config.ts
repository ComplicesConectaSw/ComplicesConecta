// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 8080,
      host: true,
      strictPort: true
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          // 🔥 SOLUCIÓN: NO separar React - mantenerlo en bundle principal
          manualChunks: undefined, // Deshabilitar chunking manual
        },
      },
      cssCodeSplit: true, // Habilitar CSS code splitting para mejor performance
      chunkSizeWarningLimit: 1000, // Ajustar el límite de advertencia de tamaño de chunk
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true
        }
      }
    },
    base: '/',
  };
});