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
          server.middlewares.use((req, res, next) => {
            const url = req.url || '';
            const urlWithoutQuery = url.split('?')[0];
            
            if (url.includes('/node_modules/.vite/deps/') || 
                url.includes('/deps/') ||
                urlWithoutQuery.endsWith('.js') || 
                urlWithoutQuery.endsWith('.mjs') || 
                urlWithoutQuery.endsWith('.jsx') || 
                urlWithoutQuery.endsWith('.ts') || 
                urlWithoutQuery.endsWith('.tsx')) {
              res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            } else if (urlWithoutQuery.endsWith('.css') || 
                       url.includes('/src/index.css') || 
                       url.includes('/styles/index.css') ||
                       url.includes('/src/styles/')) {
              res.setHeader('Content-Type', 'text/css; charset=utf-8');
            } else if (urlWithoutQuery.endsWith('.json')) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
            } else if (urlWithoutQuery.endsWith('.html') || url === '/' || url === '') {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
            } else if (urlWithoutQuery.endsWith('.wasm')) {
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
      host: true,
      hmr: isDev ? {
        protocol: 'ws',
        host: 'localhost',
        port: 8080,
      } : false,
      cors: true,
      headers: isDev ? {
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      } : {},
    },
    css: {
      devSourcemap: isDev,
      modules: {
        localsConvention: 'camelCase',
      },
      postcss: './postcss.config.js',
    },
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
      force: false,
    },
    build: {
      // CRÍTICO: Assets directory
      assetsDir: 'assets',
      // Inline assets pequeños para reducir requests
      assetsInlineLimit: 4096, // 4KB
      rollupOptions: {
        output: {
          // CRÍTICO: Chunks estables con hash para caché pero nombres predecibles
          chunkFileNames: (chunkInfo) => {
            // Chunks de vendor con hash estable
            if (chunkInfo.name?.startsWith('vendor-')) {
              return `assets/js/${chunkInfo.name}-[hash].js`;
            }
            // Chunks de aplicación con hash estable
            if (chunkInfo.name?.startsWith('chunk-')) {
              return `assets/js/${chunkInfo.name}-[hash].js`;
            }
            // Entry point con hash estable
            return `assets/js/[name]-[hash].js`;
          },
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(png|jpe?g|svg|gif|webp)$/i.test(name ?? '')) {
              return 'assets/images/[name]-[hash].[ext]';
            }
            if (/\.(css)$/.test(name ?? '')) {
              // CRÍTICO: CSS sin split - un solo archivo
              return 'assets/css/[name]-[hash].[ext]';
            }
            return 'assets/[name]-[hash].[ext]';
          },
          // CRÍTICO: Manual chunks optimizados para <60MB
          manualChunks: (id) => {
            // Vendor chunks - librerías externas
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
              // Otros vendors pequeños - agrupar
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
      // Límite de warning ajustado
      chunkSizeWarningLimit: 1000,
      // CRÍTICO: Deshabilitar CSS code splitting para evitar problemas de carga
      cssCodeSplit: false,
      // Asegurar que los assets se sirvan con rutas absolutas
      assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.gif', '**/*.webp'],
      // CRÍTICO: Asegurar que los CSS se procesen correctamente durante el build
      cssMinify: true,
      // Optimizaciones adicionales
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      // CRÍTICO: Sourcemaps solo en desarrollo
      sourcemap: isDev,
      // CRÍTICO: Reporte de tamaño de chunks
      reportCompressedSize: true,
      // CRÍTICO: Target moderno para mejor optimización
      target: 'esnext',
    },
    // CRÍTICO: Base path para Vercel
    base: '/',
  };
});
