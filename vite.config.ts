import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `test` is Vitest's config block. `globals: true` is required so the jest-cucumber
// acceptance suites can call the global `describe`/`test`/`expect`/`vi` — do not turn it
// off. Your own unit tests may rely on the same globals.
const config = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/base/test/setup.ts'],
    clearMocks: true,
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.steps.{ts,tsx}'],
    exclude: ['**/node_modules/**'],
    coverage: {
      provider: 'v8',
      // Coverage is measured against the code you write in the auth module. Acceptance
      // step definitions and provided base/interface files are excluded.
      include: ['src/components/auth/**'],
      exclude: ['src/components/auth/components/GoogleIcon.tsx'],
      thresholds: { branches: 100, functions: 100, lines: 100, statements: 100 },
    },
  },
}

export default defineConfig(config)
