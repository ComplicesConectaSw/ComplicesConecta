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
      external: ['prop-types'],
      output: {
        manualChunks: {
          // Vendor libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-toast'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-utils': ['date-fns', 'uuid', 'framer-motion'],
          'vendor-icons': ['lucide-react'],
          // App chunks
          'auth': ['src/hooks/useAuth.ts', 'src/pages/Auth.tsx', 'src/components/auth/EmailValidation.tsx', 'src/components/auth/WorldIDButton.tsx'],
          'chat': ['src/pages/Chat.tsx', 'src/components/chat/ChatBubble.tsx', 'src/components/chat/ChatContainer.tsx', 'src/components/chat/ChatInput.tsx', 'src/components/chat/ChatList.tsx', 'src/components/chat/ChatWindow.tsx', 'src/components/chat/ChatWindowEnhanced.tsx', 'src/components/chat/ChatWithLocation.tsx', 'src/components/chat/ModernChatInterface.tsx', 'src/components/chat/RealtimeChatIntegration.tsx', 'src/components/chat/RealtimeChatWindow.tsx', 'src/components/chat/TypingIndicator.tsx', 'src/lib/chat.ts'],
          'matching': ['src/pages/Matches.tsx', 'src/pages/Discover.tsx', 'src/lib/MatchingService.ts'],
          'profile': ['src/pages/ProfileSingle.tsx', 'src/pages/ProfileCouple.tsx', 'src/components/profile/CoupleCard.tsx', 'src/components/profile/CoupleProfileCard.tsx', 'src/components/profile/CoupleProfileHeader.tsx', 'src/components/profile/Gallery.tsx', 'src/components/profile/ImageUpload.tsx', 'src/components/profile/MainProfileCard.tsx', 'src/components/profile/ProfileStats.tsx', 'src/components/profile/SingleCard.tsx'],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
  },
  define: {
    global: 'globalThis',
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
