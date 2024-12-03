import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env': {}
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "src/styles/_variables" as *;`
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
