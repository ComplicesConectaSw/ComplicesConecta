import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
          // Create separate chunks for better loading
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            return 'vendor';
          }
          // Critical pages - bundle together
          if (id.includes('src/pages/Index') || 
              id.includes('src/pages/Auth') || 
              id.includes('src/pages/Discover') ||
              id.includes('src/pages/Events')) {
            return 'critical-pages';
          }
          // Core features
          if (id.includes('src/pages/Profiles') || 
              id.includes('src/pages/Matches') || 
              id.includes('src/pages/Chat')) {
            return 'core-features';
          }
          // Admin pages
          if (id.includes('src/pages/Admin') || 
              id.includes('src/pages/Moderator')) {
            return 'admin-pages';
          }
          // Other pages
          if (id.includes('src/pages')) {
            return 'pages';
          }
          // Components
          if (id.includes('src/components')) {
            return 'components';
          }
        },
        // Ensure consistent chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    // Ensure proper module resolution
    modulePreload: {
      polyfill: true
    }
  },
  define: {
    global: 'globalThis',
    // Prevent wallet extension conflicts
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
