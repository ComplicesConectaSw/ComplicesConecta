import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name].js',  // Nombres estables (sin hash)
          entryFileNames: 'assets/js/[name].js',
          assetFileNames: ({ name }) => {
            if (/\.(png|jpe?g|svg|gif|webp)$/i.test(name ?? '')) {
              return 'assets/images/[name].[ext]';
            }
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/[name].css';
            }
            return 'assets/[name].[ext]';
          },
        },
      },
      cssCodeSplit: false,  // No split CSS (evita 404s)
    },
    define: {
      // Exponer TODAS VITE_* en bundles
      ...Object.fromEntries(
        Object.entries(env).filter(([k]) => k.startsWith('VITE_'))
          .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])
      ),
    },
    base: '/',  // Para Vercel
  };
});