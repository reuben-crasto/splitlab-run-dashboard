/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For local dev, run `vercel dev` (port 3000) alongside `npm run dev:client`.
// All /api calls are proxied to vercel dev which serves the serverless functions.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// The Storybook/Vitest plugins are heavy (they pull in Playwright) and importing
// them at the top level stalled `vite` dev/build. They are only needed when
// Vitest is running, so load them lazily.
// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
async function storybookTestConfig() {
  const { storybookTest } = await import('@storybook/addon-vitest/vitest-plugin');
  const { playwright } = await import('@vitest/browser-playwright');
  return {
    test: {
      projects: [{
        extends: true,
        plugins: [
        // The plugin will run tests for the stories defined in your Storybook config
        // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
        storybookTest({
          configDir: path.join(dirname, '.storybook')
        })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{
              browser: 'chromium'
            }]
          }
        }
      }]
    }
  };
}

export default defineConfig(async () => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  ...(process.env.VITEST ? await storybookTestConfig() : {}),
}));