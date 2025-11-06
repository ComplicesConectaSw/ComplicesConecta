import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Sentry plugin para source maps (solo en producción y con configuración completa)
    process.env.NODE_ENV === 'production' && 
    process.env.SENTRY_ORG && 
    process.env.SENTRY_PROJECT && 
    process.env.SENTRY_AUTH_TOKEN && 
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false, // Deshabilitar telemetría para evitar warnings
      sourcemaps: {
        assets: './dist/**',
      },
      release: {
        name: `complicesconecta@${process.env.npm_package_version || '3.4.1'}`,
        uploadLegacySourcemaps: './dist',
      },
      // Solo subir source maps si hay credenciales
      disable: !process.env.SENTRY_AUTH_TOKEN
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: [
      'web3',
      'ethers', 
      '@metamask/detect-provider',
      '@solana/web3.js',
      'tronweb'
    ],
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime'
    ]
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    host: true,
    port: 8080,
    cors: true,
    hmr: {
      port: 8080,
      host: 'localhost'
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries - split by size and usage
          if (id.includes('node_modules')) {
            // CRÍTICO: React core DEBE estar en chunk separado y cargarse PRIMERO
            // Esto asegura que React esté disponible antes que cualquier otro chunk
            // IMPORTANTE: Verificar tanto 'react/' como 'react' para capturar todos los módulos
            if (id.includes('node_modules/react/') || 
                id.includes('node_modules/react-dom/') ||
                (id.includes('node_modules/react') && !id.includes('react-router') && !id.includes('react-query') && !id.includes('react-hook-form'))) {
              return 'vendor-react';
            }
            // React Router después de React
            if (id.includes('react-router')) {
              return 'vendor';
            }
            // UI libraries (medium)
            if (id.includes('@radix-ui')) {
              return 'ui-radix';
            }
            if (id.includes('lucide-react')) {
              return 'ui-icons';
            }
            if (id.includes('framer-motion')) {
              return 'ui-animations';
            }
            // Charts and visualization (large) - lazy load para reducir bundle inicial
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
            // TensorFlow y ML (large) - lazy load
            if (id.includes('@tensorflow') || id.includes('onnxruntime') || id.includes('@huggingface')) {
              return 'ml';
            }
            // Capacitor (mobile) - lazy load si no es necesario en web
            if (id.includes('@capacitor') && !id.includes('@capacitor/core')) {
              return 'mobile';
            }
            // Supabase and database (medium) - DESPUÉS de vendor-react
            // CRÍTICO: Este chunk depende de React, debe cargarse después
            // IMPORTANTE: Asegurar que React esté disponible antes de cargar data-layer
            if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
              // NO separar en data-layer si React no está en vendor-react
              // Esto asegura que data-layer se carga después de vendor
              return 'data-layer';
            }
            // Monitoring tools (medium)
            if (id.includes('@sentry') || id.includes('@datadog')) {
              return 'monitoring';
            }
            // Form handling (medium)
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'forms';
            }
            // Utilities (small)
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }
            // Rest of vendor code - INCLUYE REACT AQUÍ
            return 'vendor';
          }
          
          // Application code splitting
          // Admin pages (lazy loaded)
          if (id.includes('src/pages/Admin') || id.includes('src/pages/Moderator')) {
            return 'admin';
          }
          // Analytics dashboard (lazy loaded)
          if (id.includes('src/components/admin/Analytics') || 
              id.includes('src/services/PerformanceMonitoring') ||
              id.includes('src/services/ErrorAlert')) {
            return 'analytics';
          }
          // Chat features (lazy loaded)
          if (id.includes('src/pages/Chat') || id.includes('src/components/chat')) {
            return 'chat';
          }
          // Profile pages (medium priority)
          if (id.includes('src/pages/Profile') || id.includes('src/components/profile')) {
            return 'profiles';
          }
          // Critical entry pages (bundle together, small)
          if (id.includes('src/pages/Index') || 
              id.includes('src/pages/Auth') || 
              id.includes('src/components/HeroSection') ||
              id.includes('src/components/HeaderNav')) {
            return 'entry';
          }
          // Discover and Events (medium priority)
          if (id.includes('src/pages/Discover') || id.includes('src/pages/Events')) {
            return 'discover';
          }
          // Large pages - split individualmente para mejor lazy loading
          if (id.includes('src/pages/Admin') || id.includes('src/pages/Moderator')) {
            // Ya manejado arriba como 'admin'
            return 'admin';
          }
          if (id.includes('src/pages/Chat')) {
            // Ya manejado arriba como 'chat'
            return 'chat';
          }
          // Split por tamaño: páginas grandes separadas
          if (id.includes('src/pages/Tokens') || id.includes('src/pages/Premium')) {
            return 'premium';
          }
          if (id.includes('src/pages/Profile') && !id.includes('Edit')) {
            return 'profiles';
          }
          // All other pages - agrupar páginas pequeñas
          if (id.includes('src/pages/')) {
            return 'pages';
          }
        },
        // Ensure consistent chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'es2020',
    minify: 'terser', // Usar terser para mejor compresión
    terserOptions: {
      compress: {
        drop_console: false, // Conservar console para debugging (especialmente console.error y console.warn)
        drop_debugger: true,
        pure_funcs: [], // No eliminar funciones console para mantener capacidad de debugging
        passes: 2, // Múltiples passes para mejor compresión
        ecma: 2020,
        unsafe: false,
        unsafe_comps: false,
        unsafe_math: false,
        unsafe_proto: false,
        collapse_vars: true,
        reduce_vars: true,
        dead_code: true,
        unused: true,
      },
      format: {
        comments: false, // Remover comentarios
        ecma: 2020,
      },
      mangle: {
        safari10: true,
      },
    },
    chunkSizeWarningLimit: 500, // Reducir límite para forzar mejor splitting (de 800 a 500)
    // Ensure proper module resolution
    modulePreload: {
      polyfill: true,
      // CRÍTICO: Preload de chunks críticos para asegurar orden de carga
      // Vite maneja automáticamente las dependencias, pero esto ayuda a asegurar orden
    },
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true,
    // Optimización adicional: compresión más agresiva
    reportCompressedSize: true,
    // Optimizar assets
    assetsInlineLimit: 4096, // Inline assets menores a 4KB
  },
  define: {
    global: 'globalThis',
    // Prevent wallet extension conflicts
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
