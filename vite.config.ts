import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name].js', // Sin hash dinámico
          entryFileNames: 'assets/js/[name].js',
          assetFileNames: 'assets/[ext]/[name].[ext]',
        },
      },
      cssCodeSplit: false, // No split CSS
    },
    define: {
      // Exponer TODAS VITE_* explícitamente
      ...Object.fromEntries(
        Object.entries(env).filter(([k]) => k.startsWith('VITE_'))
          .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])
      ),
    },
    base: '/',
  };
});