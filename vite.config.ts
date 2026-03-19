import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { VitePWA } from 'vite-plugin-pwa'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'emoji-picker',
        },
      },
    }),
    Components({
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/],
      dts: 'src/components.d.ts',
    }),
    Pages(),
    Layouts(),
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core'],
      dirs: ['src/api', 'src/event', 'src/types'],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
