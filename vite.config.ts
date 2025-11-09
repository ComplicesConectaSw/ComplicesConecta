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
      target: 'es2020',
      minify: 'terser',
      sourcemap: false,
      cssCodeSplit: false,
      chunkSizeWarningLimit: 1000, // 1MB warning limit
      rollupOptions: {
        output: {
          // Manual chunks para dividir el código y reducir tamaño
          manualChunks: (id) => {
            // Vendor chunks separados para mejor caching
            if (id.includes('node_modules')) {
              // React core
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react-core';
              }
              // React Router
              if (id.includes('react-router')) {
                return 'vendor-react-router';
              }
              // Supabase
              if (id.includes('@supabase') || id.includes('supabase')) {
                return 'vendor-supabase';
              }
              // Radix UI
              if (id.includes('@radix-ui')) {
                return 'vendor-radix';
              }
              // Framer Motion
              if (id.includes('framer-motion')) {
                return 'vendor-framer-motion';
              }
              // Charts
              if (id.includes('recharts') || id.includes('chart')) {
                return 'vendor-charts';
              }
              // Form libraries
              if (id.includes('react-hook-form') || id.includes('@hookform')) {
                return 'vendor-forms';
              }
              // Otros vendors grandes
              if (id.includes('lucide-react') || id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
                return 'vendor-utils';
              }
              // Neo4j y drivers grandes
              if (id.includes('neo4j') || id.includes('driver')) {
                return 'vendor-neo4j';
              }
              // Web3 y blockchain
              if (id.includes('web3') || id.includes('ethers') || id.includes('tronweb')) {
                return 'vendor-web3';
              }
              // OpenAI y AI
              if (id.includes('openai') || id.includes('@anthropic')) {
                return 'vendor-ai';
              }
              // PostHog y analytics
              if (id.includes('posthog') || id.includes('analytics')) {
                return 'vendor-analytics';
              }
              // Capacitor
              if (id.includes('@capacitor')) {
                return 'vendor-capacitor';
              }
              // Todo lo demás de node_modules
              return 'vendor-other';
            }
            
            // Chunks por funcionalidad
            if (id.includes('/src/pages/')) {
              const pageName = id.split('/src/pages/')[1]?.split('.')[0];
              if (pageName) {
                // Páginas grandes en chunks separados
                if (['Chat', 'Dashboard', 'AdminAnalytics', 'AreaChart'].includes(pageName)) {
                  return `chunk-${pageName.toLowerCase()}`;
                }
                // Páginas medianas agrupadas
                if (['Profiles', 'Matches', 'Feed', 'Settings'].includes(pageName)) {
                  return 'chunk-pages-main';
                }
                // Páginas pequeñas agrupadas
                return 'chunk-pages-other';
              }
            }
            
            // Chunks por directorio
            if (id.includes('/src/services/')) {
              return 'chunk-services';
            }
            if (id.includes('/src/components/')) {
              return 'chunk-components';
            }
            if (id.includes('/src/hooks/')) {
              return 'chunk-hooks';
            }
            if (id.includes('/src/utils/')) {
              return 'chunk-utils';
            }
            if (id.includes('/src/app/')) {
              return 'chunk-app';
            }
            if (id.includes('/src/profiles/')) {
              return 'chunk-profiles';
            }
            if (id.includes('/src/features/')) {
              return 'chunk-features';
            }
            if (id.includes('/src/admin/')) {
              return 'chunk-admin';
            }
            if (id.includes('/src/tokens/')) {
              return 'chunk-tokens';
            }
            if (id.includes('/src/template-demo/')) {
              return 'chunk-template-demo';
            }
            if (id.includes('/src/investors/')) {
              return 'chunk-investors';
            }
            if (id.includes('/src/settings/')) {
              return 'chunk-settings';
            }
            if (id.includes('/src/dashboard/')) {
              return 'chunk-dashboard';
            }
            if (id.includes('/src/chat/')) {
              return 'chunk-chat';
            }
            if (id.includes('/src/admin-components/')) {
              return 'chunk-admin-components';
            }
          },
          chunkFileNames: 'assets/js/[name].js',
          entryFileNames: 'assets/js/[name].js',
          assetFileNames: 'assets/[ext]/[name].[ext]',
        },
        treeshake: {
          moduleSideEffects: false,
        },
      },
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
        },
      },
      assetsInlineLimit: 4096, // 4KB - inline assets pequeños
      reportCompressedSize: true,
    },
    define: {
      ...Object.fromEntries(
        Object.entries(env)
          .filter(([k]) => k.startsWith('VITE_'))
          .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])
      ),
    },
    base: '/',
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
      ],
      exclude: [
        '@capacitor/core',
        '@capacitor/android',
      ],
    },
  };
});