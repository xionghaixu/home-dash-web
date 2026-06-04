import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: false
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8180,
    host: true,
    open: false,
    cors: true,
    proxy: {
      '/v1': {
        target: 'http://localhost:8190',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 混淆压缩器: 'esbuild' (极速、轻量，推荐) 或 'terser' (慢、吃内存，易OOM)
    minify: 'esbuild',
    chunkSizeWarningLimit: 1500,
    // 是否生成 Gzip 压缩大小报告 (开发辅助): true (开启) 或 false (关闭，省内存)
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            if (id.includes('axios')) {
              return 'axios'
            }
            return 'vendor'
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger']
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios', 'element-plus']
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.js']
  }
})
