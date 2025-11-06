// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { reactOrderPlugin } from "./vite-plugin-react-order";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      reactOrderPlugin(),
      ...(process.env.NODE_ENV === "production" &&
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT &&
      process.env.SENTRY_AUTH_TOKEN
        ? [
            sentryVitePlugin({
              org: process.env.SENTRY_ORG,
              project: process.env.SENTRY_PROJECT,
              authToken: process.env.SENTRY_AUTH_TOKEN,
              telemetry: false,
              sourcemaps: { assets: "./dist/**" },
              release: {
                name: `complicesconecta@${process.env.npm_package_version || "3.5.0"}`,
              },
              disable: !process.env.SENTRY_AUTH_TOKEN,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      exclude: ["web3", "ethers", "@metamask/detect-provider", "@solana/web3.js", "tronweb"],
      include: ["react", "react-dom", "react/jsx-runtime"],
      esbuildOptions: {
        define: { global: "globalThis" },
        sourcemap: false,
      },
    },
    css: { postcss: "./postcss.config.js" },
    server: {
      host: true,
      port: 8080,
      cors: true,
      hmr: { port: 8080, host: "localhost" },
      headers: {
        "Cross-Origin-Embedder-Policy": "unsafe-none",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Content-Security-Policy":
          process.env.NODE_ENV === "development"
            ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: ws: wss:; frame-src 'self' https://vercel.live;"
            : "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: ws: wss:; frame-src 'self' https://vercel.live;",
      },
      sourcemapIgnoreList: (source) =>
        /chrome-extension|moz-extension|installHook|<anonymous>|react_devtools_backend/.test(source),
      fs: { strict: false },
    },
    build: {
      sourcemap: process.env.NODE_ENV === "production" && process.env.SENTRY_AUTH_TOKEN ? true : false,
      rollupOptions: {
        preserveEntrySignatures: "strict",
        output: {
          format: "es",
          exports: "named",
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (/react|react-dom|react-router/.test(id)) return "vendor-react";
              if (/@radix-ui/.test(id)) return "ui-radix";
              if (/lucide-react/.test(id)) return "ui-icons";
              if (/framer-motion/.test(id)) return "ui-animations";
              if (/recharts|d3-/.test(id)) return "charts";
              if (/@tensorflow|onnxruntime/.test(id)) return "ml";
              if (/@capacitor/.test(id) && !/@capacitor\/core/.test(id)) return "mobile";
              if (/@supabase|@tanstack/.test(id)) return "data-layer";
              if (/@sentry|@datadog/.test(id)) return "monitoring";
              if (/react-hook-form|zod/.test(id)) return "forms";
              if (/date-fns|clsx/.test(id)) return "utils";
              return "vendor";
            }
            if (/src\/pages\/(Admin|Moderator)/.test(id)) return "admin";
            if (/Analytics|PerformanceMonitoring/.test(id)) return "analytics";
            if (/Chat/.test(id)) return "chat";
            if (/Profile/.test(id)) return "profiles";
            if (/Index|Auth|HeroSection|HeaderNav/.test(id)) return "entry";
            if (/Discover|Events/.test(id)) return "discover";
            if (/Tokens|Premium/.test(id)) return "premium";
            if (/src\/pages\//.test(id)) return "pages";
          },
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
      commonjsOptions: { transformMixedEsModules: true },
      target: "es2020",
      minify: "terser",
      terserOptions: {
        compress: { drop_console: false, drop_debugger: true, passes: 2 },
        format: { comments: false },
        mangle: { safari10: true },
      },
      chunkSizeWarningLimit: 400,
      reportCompressedSize: true,
      assetsInlineLimit: 4096,
    },
    define: {
      global: "globalThis",
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
      ...Object.fromEntries(
        Object.entries(env)
          .filter(([k]) => k.startsWith("VITE_"))
          .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])
      ),
    },
  };
});