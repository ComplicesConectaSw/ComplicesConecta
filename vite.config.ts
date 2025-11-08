// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  return {
    plugins: [
      react(),
      // Middleware para asegurar headers Content-Type correctos
      {
        name: 'fix-mime-types',
        configureServer(server) {
          // CRÍTICO: Usar transformIndexHtml para establecer headers antes de que Vite procese
          // Pero también necesitamos middleware para archivos estáticos
          server.middlewares.use((req, res, next) => {
            const url = req.url || '';
            const urlWithoutQuery = url.split('?')[0];
            
            // CRÍTICO: Establecer Content-Type ANTES de que Vite procese la respuesta
            // Esto es especialmente importante para archivos de dependencias optimizadas
            if (url.includes('/node_modules/.vite/deps/') || 
                url.includes('/deps/') ||
                urlWithoutQuery.endsWith('.js') || 
                urlWithoutQuery.endsWith('.mjs') || 
                urlWithoutQuery.endsWith('.jsx') || 
                urlWithoutQuery.endsWith('.ts') || 
                urlWithoutQuery.endsWith('.tsx')) {
              // Forzar Content-Type para archivos JavaScript (incluyendo dependencias optimizadas)
              res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            } else if (urlWithoutQuery.endsWith('.css') || 
                       url.includes('/src/index.css') || 
                       url.includes('/styles/index.css') ||
                       url.includes('/src/styles/')) {
              // Forzar Content-Type para archivos CSS
              res.setHeader('Content-Type', 'text/css; charset=utf-8');
            } else if (urlWithoutQuery.endsWith('.json')) {
              // Forzar Content-Type para archivos JSON
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
            } else if (urlWithoutQuery.endsWith('.html') || url === '/' || url === '') {
              // Forzar Content-Type para archivos HTML
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
            } else if (urlWithoutQuery.endsWith('.wasm')) {
              // Forzar Content-Type para archivos WebAssembly
              res.setHeader('Content-Type', 'application/wasm');
            }
            
            next();
          });
        },
      },
    ],
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
      // HMR: Habilitado para desarrollo local (deshabilitar solo para túneles si es necesario)
      hmr: isDev ? {
        protocol: 'ws',
        host: 'localhost',
        port: 8080,
      } : false,
      cors: true, // Habilitar CORS para recursos estáticos
      // CRÍTICO: Headers simples basados en respaldo que funcionaba
      // IMPORTANTE: No enviar X-Content-Type-Options: nosniff sin asegurar Content-Type correctos
      headers: isDev ? {
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Access-Control-Allow-Origin': '*', // Permitir acceso desde cualquier origen en desarrollo
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        // NO incluir X-Content-Type-Options: nosniff aquí - Vite maneja los Content-Type automáticamente
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
      // CRÍTICO: Asegurar que los CSS se procesen correctamente durante el build
      // Esto resuelve el warning sobre /src/index.css
      cssMinify: true,
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