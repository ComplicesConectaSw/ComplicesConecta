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
          // MANUAL CHUNKS: Dividir código en chunks más pequeños y eficientes
          manualChunks: (id) => {
            // Vendor chunks - librerías externas (MÁS GRANULAR)
            if (id.includes('node_modules')) {
              // React core - separar React y React DOM
              if (id.includes('react/') && !id.includes('react-dom')) {
                return 'vendor-react-core';
              }
              // React DOM - separado
              if (id.includes('react-dom')) {
                return 'vendor-react-dom';
              }
              // React Router - separado
              if (id.includes('react-router')) {
                return 'vendor-react-router';
              }
              // Supabase - separado (puede ser grande)
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              // Charts (recharts, etc.) - separado (puede ser muy grande)
              if (id.includes('recharts') || id.includes('chart') || id.includes('d3-')) {
                return 'vendor-charts';
              }
              // UI libraries grandes
              if (id.includes('framer-motion')) {
                return 'vendor-framer-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              if (id.includes('radix-ui') || id.includes('@radix-ui')) {
                return 'vendor-radix';
              }
              // Query libraries
              if (id.includes('@tanstack/react-query')) {
                return 'vendor-query';
              }
              // Otros vendors grandes
              if (id.includes('@capacitor') || id.includes('@solana')) {
                return 'vendor-mobile';
              }
              // Resto de vendors pequeños - agrupar
              return 'vendor-other';
            }
            
            // Código de aplicación - dividir por funcionalidad
            // Charts y gráficos - separar (muy grandes)
            if (id.includes('AreaChart') || 
                id.includes('components/admin/HistoricalCharts') ||
                id.includes('components/admin/AnalyticsDashboard') ||
                id.includes('components/admin/AnalyticsPanel')) {
              return 'chunk-charts';
            }
            
            // Chat - separar (muy grande ~140KB)
            if (id.includes('pages/Chat') || 
                id.includes('pages/ChatInfo') ||
                id.includes('pages/ChatAuthenticated') ||
                id.includes('components/chat/') ||
                id.includes('features/chat/')) {
              return 'chunk-chat';
            }
            
            // Admin Analytics - separar (muy grande ~112KB)
            if (id.includes('app/(admin)/AdminAnalytics') ||
                id.includes('components/admin/Analytics')) {
              return 'chunk-admin-analytics';
            }
            
            // Admin pages - agrupar
            if (id.includes('app/(admin)/')) {
              return 'chunk-admin';
            }
            
            // Admin components - agrupar
            if (id.includes('components/admin/')) {
              return 'chunk-admin-components';
            }
            
            // Tokens - separar (puede ser grande)
            if (id.includes('pages/Tokens') || 
                id.includes('components/tokens/')) {
              return 'chunk-tokens';
            }
            
            // Profiles - separar
            if (id.includes('profiles/') || 
                id.includes('components/profile') ||
                id.includes('features/profile')) {
              return 'chunk-profiles';
            }
            
            // Pages grandes - separar individualmente
            if (id.includes('pages/Dashboard')) {
              return 'chunk-dashboard';
            }
            if (id.includes('pages/Settings')) {
              return 'chunk-settings';
            }
            if (id.includes('pages/TokensInfo')) {
              return 'chunk-tokens-info';
            }
            if (id.includes('pages/Investors')) {
              return 'chunk-investors';
            }
            if (id.includes('pages/ReportDialog')) {
              return 'chunk-report-dialog';
            }
            if (id.includes('pages/StoriesContainer')) {
              return 'chunk-stories';
            }
            if (id.includes('pages/TemplateDemo')) {
              return 'chunk-template-demo';
            }
            
            // Features grandes - separar
            if (id.includes('features/')) {
              return 'chunk-features';
            }
            
            // Services grandes - separar
            if (id.includes('services/')) {
              return 'chunk-services';
            }
            
            // Shared - agrupar
            if (id.includes('shared/')) {
              return 'chunk-shared';
            }
            
            // Utils - agrupar
            if (id.includes('utils/') && !id.includes('node_modules')) {
              return 'chunk-utils';
            }
          },
        },
      },
      // Límite de warning ajustado - chunks grandes se dividen automáticamente
      chunkSizeWarningLimit: 1000,
      // CRÍTICO: Deshabilitar CSS code splitting para evitar problemas de carga
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