import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from "path"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    nodePolyfills({
      include: ['buffer', 'process', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],

  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'emoji-picker': ['emoji-picker-react'],
          'peer': ['simple-peer'],
        },
      },
    },
  },

  define: {
    global: 'globalThis',
  },

  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: ['buffer', 'process', 'util'],
  },
});
