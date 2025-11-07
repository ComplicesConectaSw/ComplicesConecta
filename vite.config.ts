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
      // CRÍTICO: host: true es más simple y funciona mejor (basado en respaldo)
      host: true, // Permitir conexiones desde cualquier IP (equivalente a '0.0.0.0' pero más simple)
      // HMR: Deshabilitado cuando se accede a través de túneles para evitar errores de WebSocket
      hmr: false, // Deshabilitar HMR para evitar errores de WebSocket con túneles
      cors: true, // Habilitar CORS para recursos estáticos
      // CRÍTICO: Headers simples basados en respaldo que funcionaba
      headers: isDev ? {
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Access-Control-Allow-Origin': '*', // Permitir acceso desde cualquier origen en desarrollo
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      } : {},
    },
    // Configuración de CSS para asegurar carga correcta (basado en respaldo)
    css: {
      devSourcemap: isDev, // Sourcemaps en desarrollo
      // Asegurar que los CSS se sirvan correctamente en desarrollo
      modules: {
        localsConvention: 'camelCase',
      },
      // CRÍTICO: PostCSS configurado si existe (basado en respaldo)
      postcss: './postcss.config.js', // Usar PostCSS si existe el archivo
    },
    // CRÍTICO: Optimización de dependencias para desarrollo
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'framer-motion',
        'lucide-react',
      ],
      exclude: [
        '@capacitor/core',
        '@capacitor/android',
      ],
      // CRÍTICO: Forzar re-optimización si hay problemas
      force: false,
    },
    build: {
      // Asegurar que los assets se sirvan correctamente
      assetsDir: 'assets',
      // Inline assets pequeños para reducir requests
      assetsInlineLimit: 4096, // 4KB
      rollupOptions: {
        output: {
          // TEMPORAL: Chunks desactivados - todo en un solo archivo
          // TODO: Reactivar chunks cuando se resuelvan problemas de carga
          manualChunks: undefined, // Desactivar chunks - todo en un solo archivo
          // Nombres de archivos simples sin chunks
          chunkFileNames: isDev ? 'assets/js/[name].js' : 'assets/js/[name]-[hash].js',
          entryFileNames: isDev ? 'assets/js/[name].js' : 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(png|jpe?g|svg|gif|webp)$/i.test(name ?? '')) {
              return isDev ? 'assets/images/[name].[ext]' : 'assets/images/[name]-[hash].[ext]'
            }
            if (/\.(css)$/.test(name ?? '')) {
              return isDev ? 'assets/css/[name].[ext]' : 'assets/css/[name]-[hash].[ext]'
            }
            return isDev ? 'assets/[name].[ext]' : 'assets/[name]-[hash].[ext]'
          },
        },
      },
      // Aumentar límite de warning pero mantener splitting
      chunkSizeWarningLimit: 500,
      // CRÍTICO: Deshabilitar CSS code splitting para evitar problemas de carga
      // Esto asegura que todos los CSS se carguen en un solo archivo
      cssCodeSplit: false,
      // Asegurar que los assets se sirvan con rutas absolutas
      assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.gif', '**/*.webp'],
      // Optimizaciones adicionales
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    base: '/', // CRÍTICO PARA VERCEL
  };
})