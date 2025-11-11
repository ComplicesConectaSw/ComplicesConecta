// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // FIJA EL ALIAS @
      },
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name].js',
          entryFileNames: 'assets/js/[name].js',
          assetFileNames: 'assets/[ext]/[name].[ext]',
          manualChunks: (id) => {
            // Vendor libraries
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-react';
              }
              if (id.includes('@radix-ui')) {
                return 'vendor-ui';
              }
              if (id.includes('lucide-react') || id.includes('date-fns') || id.includes('clsx')) {
                return 'vendor-utils';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('@tanstack/react-query')) {
                return 'vendor-query';
              }
              return 'vendor-other';
            }
            
            // Large components by path
            if (id.includes('src/app/(admin)')) {
              return 'admin-components';
            }
            if (id.includes('src/components/chat') || id.includes('Chat.tsx')) {
              return 'chat-components';
            }
            if (id.includes('src/components/profiles') || id.includes('Profile')) {
              return 'profile-components';
            }
            if (id.includes('src/services/Analytics') || id.includes('analytics')) {
              return 'analytics';
            }
            if (id.includes('src/components/tokens') || id.includes('Tokens')) {
              return 'tokens';
            }
            if (id.includes('src/components/stories') || id.includes('Stories')) {
              return 'stories';
            }
          }
        },
      },
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    define: {
      ...Object.fromEntries(
        Object.entries(env)
          .filter(([k]) => k.startsWith('VITE_'))
          .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])
      ),
    },
    base: '/',
  };
});