import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
// import Inspector from "vite-plugin-vue-inspector"

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir)
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true
  },
  resolve: {
    alias: [
      // /@/xxxx => src/xxxx
      {
        find: /\/@\//,
        replacement: pathResolve('src') + '/',
      }
    ]
  }
})
