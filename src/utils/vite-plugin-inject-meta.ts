// @ts-expect-error

import type { Plugin } from 'vite'

export default function (meta: string): Plugin {
  return {
    name: 'inject-meta',
    apply: 'build', // 仅在构建模式下启用
    enforce: 'post', // 在最后处理
    generateBundle(_, bundle) {
      const keyword = 'user.js'
      const [, target]
        = Object.entries(bundle).find(([name]) => {
          return name.includes(keyword)
        }) ?? []
      if (!target || target.type !== 'chunk')
        return
      target.code = `${meta}\n${target.code}`
    },
  }
}
