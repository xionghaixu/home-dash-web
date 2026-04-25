import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src')
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/test/**/*.{test,spec}.{js,ts}'],
    setupFiles: ['./src/test/setup.js']
  }
})
