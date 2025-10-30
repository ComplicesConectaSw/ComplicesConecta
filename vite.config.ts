import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Sentry plugin para source maps (solo en producción)
    process.env.NODE_ENV === 'production' && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
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
            // React core (small, critical)
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-core';
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
            // Charts and visualization (large)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
            // Supabase and database (medium)
            if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
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
            // Rest of vendor code
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
          // All other pages
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
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false, // Remover comentarios
      },
    },
    chunkSizeWarningLimit: 800, // Reducir límite para mejor splitting
    // Ensure proper module resolution
    modulePreload: {
      polyfill: true
    },
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true,
  },
  define: {
    global: 'globalThis',
    // Prevent wallet extension conflicts
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
