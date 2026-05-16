import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Base path: when deployed to GitHub Pages at https://<user>.github.io/<repo>/
// the assets need a relative prefix. In dev (`npm run dev`) we want '/'.
// `BASE_PATH` env override is supported for forks / custom deployments.
const repoBase = process.env.BASE_PATH ?? '/SnowTelco-Live-Customer-Intelligence/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? repoBase : '/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5173, host: true },
}));
