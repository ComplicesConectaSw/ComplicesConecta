import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Configuración optimizada de Vite para performance
 * Parte de la auditoría técnica ComplicesConecta v2.9.0
 */
export default defineConfig({
  plugins: [
    react({
      // Optimizar React para producción
      babel: {
        plugins: [
          // Remover PropTypes en producción
          ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimizaciones de build
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    
    // Configuración de chunks optimizada
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks separados para mejor caching
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'animation-vendor': ['framer-motion'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'date-fns'],
          
          // Chunks por funcionalidad
          'auth-chunk': [
            'src/hooks/useAuth.ts',
            'src/components/auth/LoginForm.tsx',
            'src/components/auth/RegisterForm.tsx'
          ],
          'profile-chunk': [
            'src/components/profile/ProfileCard.tsx',
            'src/components/profile/ProfileEditor.tsx',
            'src/hooks/useProfile.ts'
          ],
          'chat-chunk': [
            'src/components/chat/ChatBubble.tsx',
            'src/components/chat/ChatInput.tsx',
            'src/pages/Chat.tsx'
          ],
          'matching-chunk': [
            'src/components/matches/MatchCard.tsx',
            'src/pages/Matches.tsx',
            'src/hooks/useMatching.ts'
          ]
        },
        
        // Nombres de archivos optimizados
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') 
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext || '')) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      },
      
      // Configuraciones de optimización
      treeshake: {
        moduleSideEffects: false
      }
    },
    
    // Configuraciones adicionales de optimización
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },
    
    // Límites de chunk optimizados
    chunkSizeWarningLimit: 1000,
    
    // Configuración de assets
    assetsInlineLimit: 4096, // 4KB
  },
  
  // Optimizaciones de desarrollo
  server: {
    hmr: {
      overlay: false
    }
  },
  
  // Optimizaciones de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'lucide-react'
    ],
    exclude: [
      '@capacitor/core',
      '@capacitor/android'
    ]
  },
  
  // Configuración de CSS
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // Configuración de preview
  preview: {
    port: 4173,
    strictPort: true
  }
});
