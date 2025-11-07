// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 8080,
      strictPort: false,
      host: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 8080,
      },
      allowedHosts: [
        '.loca.lt',
        '.ngrok-free.app',
        '.trycloudflare.com',
        'localhost',
      ],
      headers: isDev ? {
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob: https:;",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:;",
          "style-src 'self' 'unsafe-inline' https:;",
          "img-src 'self' data: blob: https:;",
          "font-src 'self' data: https:;",
          "connect-src 'self' 'unsafe-eval' ws: wss: https:;",
          "worker-src 'self' 'unsafe-eval' blob:;",
          "frame-src 'self' https:;",
        ].join(' '),
      } : {},
    },
    build: {
      rollupOptions: {
        output: {
          // FUERZA CHUNKS ESTABLES + SIN HASH LOCO
          chunkFileNames: 'assets/js/[name].js',
          entryFileNames: 'assets/js/[name].js',
          assetFileNames: ({ name }) => {
            if (/\.(png|jpe?g|svg|gif|webp)$/i.test(name ?? '')) {
              return 'assets/images/[name].[ext]'
            }
            if (/\.(css)$/.test(name ?? '')) {
              return 'assets/css/[name].[ext]'
            }
            return 'assets/[name].[ext]'
          },
        },
      },
      // DESACTIVA SPLITTING (esto es lo que rompe Vercel)
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: false,
    },
    base: '/', // CRÍTICO PARA VERCEL
  };
})