import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // 'modules' removed — plugin automatically polyfills standard Node modules
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
  },

  define: {
    global: 'globalThis',
  },

  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },

  optimizeDeps: {
    include: ['buffer', 'process'],
  },
});
