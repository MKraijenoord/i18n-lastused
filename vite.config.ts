import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['{src,test}/**/*.spec.ts'],
    setupFiles: ['./test/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'json-summary', 'json'],
      include: ['src/**/*.ts'],
    },
  }
});
