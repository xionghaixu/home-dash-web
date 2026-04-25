import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const elementPlusMock = resolve(__dirname, 'src/test/__mocks__/element-plus.js')

export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'element-plus': elementPlusMock
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/test/**/*.{test,spec}.{js,ts}'],
    setupFiles: ['./src/test/setup.js']
  }
})
