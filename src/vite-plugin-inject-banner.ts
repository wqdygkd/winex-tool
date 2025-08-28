// @ts-ignore
import type { Plugin } from 'vite'
export function meta(meta: string): Plugin {
  return {
    name: 'inject-meta',
    apply: 'build', // 仅在构建模式下启用
    enforce: 'post', // 在最后处理
    // @ts-ignore
    generateBundle(_, bundle) {
      const keyword = 'user.js'
      const [, target] =
        Object.entries(bundle).find(([name]) => {
          return name.includes(keyword)
        }) ?? []
      // @ts-ignore
      if (!target || target.type !== 'chunk') return
      // @ts-ignore
      target.code = `${meta}\n${target.code}`
    }
  }
}
