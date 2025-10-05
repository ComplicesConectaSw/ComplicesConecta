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
          // Vendor libraries - más granular para reducir tamaño
          if (id.includes('node_modules')) {
            // React ecosystem - separar React core de React Router
            if (id.includes('react-router') || id.includes('react-router-dom')) {
              return 'react-router-vendor';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            
            // Supabase - separar por ser muy pesado
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'supabase-vendor';
            }
            
            // UI libraries - separar Radix UI
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            
            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            
            // Query libraries
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            
            // Capacitor - separar por ser pesado en móvil
            if (id.includes('@capacitor')) {
              return 'capacitor-vendor';
            }
            
            // Crypto/Web3 libraries - carga dinámica
            if (id.includes('web3') || id.includes('ethers') || id.includes('@metamask') || 
                id.includes('@solana') || id.includes('tronweb')) {
              return 'crypto-vendor';
            }
            
            // Icon libraries
            if (id.includes('lucide-react') || id.includes('@heroicons')) {
              return 'icons-vendor';
            }
            
            // Sentry - separar por ser opcional
            if (id.includes('@sentry')) {
              return 'sentry-vendor';
            }
            
            // Hugging Face - muy pesado, separar
            if (id.includes('@huggingface')) {
              return 'ai-vendor';
            }
            
            // Charts y visualización
            if (id.includes('recharts') || id.includes('embla-carousel')) {
              return 'charts-vendor';
            }
            
            // Utilidades pequeñas
            if (id.includes('clsx') || id.includes('class-variance-authority') || 
                id.includes('tailwind-merge') || id.includes('date-fns') || 
                id.includes('uuid') || id.includes('zod')) {
              return 'utils-vendor';
            }
            
            // Other large vendors
            return 'vendor';
          }
          
          // Application code chunking - más específico
          if (id.includes('src/')) {
            // Admin y moderación - carga bajo demanda
            if (id.includes('pages/Admin') || id.includes('pages/Moderator') || 
                id.includes('components/admin/') || id.includes('components/moderation/')) {
              return 'admin-chunk';
            }
            
            // Token system - funcionalidad específica
            if (id.includes('pages/Token') || id.includes('components/tokens/') ||
                id.includes('pages/Donations') || id.includes('pages/Premium')) {
              return 'token-chunk';
            }
            
            // Profile system
            if (id.includes('pages/Profile') || id.includes('pages/EditProfile') || 
                id.includes('components/profile/') || id.includes('pages/Settings')) {
              return 'profile-chunk';
            }
            
            // Chat system
            if (id.includes('pages/Chat') || id.includes('components/chat/')) {
              return 'chat-chunk';
            }
            
            // Stories y contenido
            if (id.includes('pages/Stories') || id.includes('pages/Feed') || 
                id.includes('pages/Blog') || id.includes('components/stories/') ||
                id.includes('pages/Events')) {
              return 'content-chunk';
            }
            
            // Componentes de animación
            if (id.includes('components/animations/')) {
              return 'animation-chunk';
            }
            
            // Páginas informativas - carga bajo demanda
            if (id.includes('pages/FAQ') || id.includes('pages/Terms') || 
                id.includes('pages/Privacy') || id.includes('pages/Support') || 
                id.includes('pages/Security') || id.includes('pages/Guidelines') || 
                id.includes('pages/Legal') || id.includes('pages/About') || 
                id.includes('pages/ProjectInfo') || id.includes('pages/Careers')) {
              return 'info-chunk';
            }
            
            // Servicios y utilidades
            if (id.includes('services/') || id.includes('lib/') || id.includes('utils/')) {
              return 'services-chunk';
            }
            
            // Core components UI
            if (id.includes('components/ui/') || id.includes('components/layout/')) {
              return 'ui-chunk';
            }
          }
          
          // Default chunk para todo lo demás
          return undefined;
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 500, // Reducido para detectar chunks grandes
    assetsInlineLimit: 4096, // Inline assets pequeños
  },
  define: {
    global: 'globalThis',
    // Prevent wallet extension conflicts
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
