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
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('shadcn')) {
              return 'ui-vendor';
            }
            
            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            
            // Query libraries
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            
            // Crypto/Web3 libraries
            if (id.includes('web3') || id.includes('ethers') || id.includes('@metamask') || 
                id.includes('@solana') || id.includes('tronweb')) {
              return 'crypto-vendor';
            }
            
            // Icon libraries
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            
            // Other large vendors
            return 'vendor';
          }
          
          // Application code chunking
          if (id.includes('src/')) {
            // Admin pages
            if (id.includes('pages/Admin') || id.includes('pages/Moderator') || 
                id.includes('components/admin/')) {
              return 'admin-chunk';
            }
            
            // Token system
            if (id.includes('pages/Token') || id.includes('components/tokens/')) {
              return 'token-chunk';
            }
            
            // Profile system
            if (id.includes('pages/Profile') || id.includes('pages/EditProfile') || 
                id.includes('components/profile/')) {
              return 'profile-chunk';
            }
            
            // Chat system
            if (id.includes('pages/Chat') || id.includes('components/chat/')) {
              return 'chat-chunk';
            }
            
            // Stories and content
            if (id.includes('pages/Stories') || id.includes('pages/Feed') || 
                id.includes('pages/Blog') || id.includes('components/stories/')) {
              return 'content-chunk';
            }
            
            // Animation components
            if (id.includes('components/animations/')) {
              return 'animation-chunk';
            }
            
            // Info/Legal pages
            if (id.includes('pages/FAQ') || id.includes('pages/Terms') || 
                id.includes('pages/Privacy') || id.includes('pages/Support') || 
                id.includes('pages/Security') || id.includes('pages/Guidelines') || 
                id.includes('pages/Legal') || id.includes('pages/About') || 
                id.includes('pages/ProjectInfo')) {
              return 'info-chunk';
            }
            
            // Core components
            if (id.includes('components/ui/') || id.includes('components/layout/')) {
              return 'ui-chunk';
            }
          }
          
          // Default chunk for everything else
          return undefined;
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
  },
  define: {
    global: 'globalThis',
    // Prevent wallet extension conflicts
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
