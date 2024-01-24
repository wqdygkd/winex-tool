import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'node:path'

// 自动加载 element 组件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import injectMeta from './vite-plugin-inject-meta'

import devMeta from './src/meta/dev.meta'
import getMetaString from './src/meta/'
import prodMeta from './src/meta/prod.meta'

import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
const pathSrc = resolve(__dirname, 'src')

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      __namespace: '"GM_wqdy_"',
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
    },
    resolve: {
      alias: {
        '~/': `${pathSrc}/`
      }
    },
    // server: {port: 3000,}
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          })
        ]
      }),
      cssInjectedByJsPlugin(),
      injectMeta(getMetaString(prodMeta))
    ],
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/main.ts'),
        name: 'userscript',
        formats: ['iife'], // 自运行打包格式，与默认模版一致
        fileName: (format) => `index.user.js`
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue'
            // GM_addStyle: 'GM_addStyle', // 油猴脚本API，用于添加样式到页面
          },
          inlineDynamicImports: true // 库构建模式下不能进行代码分割，开启此功能可将本应分割的代码整合在一起避免报错（代码分割可能由其他插件引起）
        }
      },
      minify: 'terser',
      terserOptions: {
        // mangle: false, // 关闭名称混淆，遵守Greasefork规则
        // format: {
        //   beautify: true // 美化代码开启缩进，遵守Greasefork规则
        // }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/styles/element/index.scss" as *;`
        }
      }
    }
  }
})
