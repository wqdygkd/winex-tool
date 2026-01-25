import { resolve } from 'node:path'
import process from 'node:process'

import vue from '@vitejs/plugin-vue'
// 自动加载 element 组件
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import Components from 'unplugin-vue-components/vite'

import { defineConfig, loadEnv } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

import getMetaString from './src/utils/meta/'
import prodMeta from './src/utils/meta/prod.meta'
import injectMeta from './src/utils/vite-plugin-inject-meta'

const pathSrc = resolve(__dirname, 'src')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      '__APP_ENV__': JSON.stringify(env.APP_ENV),
      '__namespace': '"GM_wqdy_"',
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    },
    resolve: {
      alias: {
        '~/': `${pathSrc}/`,
      },
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
          }),
        ],
      }),
      cssInjectedByJsPlugin(),
      injectMeta(getMetaString(prodMeta)),
    ],
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/main.ts'),
        name: 'userscript',
        formats: ['iife'],
        fileName: () => `index.user.js`,
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue',
            // GM_addStyle: 'GM_addStyle', // 油猴脚本API，用于添加样式到页面
          },
          inlineDynamicImports: true, // 库构建模式下不能进行代码分割，开启此功能可将本应分割的代码整合在一起避免报错（代码分割可能由其他插件引起）
        },
      },
      minify: false,
      terserOptions: {
        // mangle: false, // 关闭名称混淆，遵守Greasefork规则
        // format: {
        //   beautify: true // 美化代码开启缩进，遵守Greasefork规则
        // }
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/styles/element/index.scss" as *;`,
        },
      },
    },
    server: {
      port: 5173,
      cors: true,
    },
  }
})
