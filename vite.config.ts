import { resolve } from 'node:path'
import process from 'node:process'

import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { getMeta } from './src/utils/meta'
import userscriptPlugin from './src/utils/vite-plugin-userscript'

const pathSrc = resolve(__dirname, 'src')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isPlainScript = env.PLAIN_SCRIPT === 'true'
  const isProduction = mode === 'production' || mode === 'plain'

  // 获取元数据配置
  const meta = getMeta(isProduction ? 'production' : 'development')

  return {
    define: {
      '__APP_ENV__': JSON.stringify(env.APP_ENV),
      '__namespace': '"GM_wqdy_"',
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
      '__PLAIN_SCRIPT__': JSON.stringify(isPlainScript),
      '__SCRIPT_VERSION__': JSON.stringify(meta.version),
    },
    resolve: {
      alias: {
        '~/': `${pathSrc}/`,
      },
    },
    plugins: [
      vue(),
      AutoImport({
        imports: [
          'vue',
          '@vueuse/core',
        ],
      }),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
          }),
        ],
      }),
      cssInjectedByJsPlugin(),
      // 油猴脚本插件（仅非 plain 模式）
      !isPlainScript && userscriptPlugin({
        meta,
        outputFile: 'index.user.js',
        autoInstall: isProduction,
        hashFile: '.userscript-meta.hash',
      }),
    ].filter(Boolean),
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/main.ts'),
        name: 'userscript',
        formats: ['iife'],
        fileName: () => isPlainScript ? 'index.js' : 'index.user.js',
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
      minify: false,
      outDir: 'dist',
      emptyOutDir: true,
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
