/**
 * Vite 功能过滤插件
 * 根据构建模式动态生成导入代码，实现真正的 tree-shaking
 */

import type { Plugin } from 'vite'
import { FEATURES, getEnabledFeatures } from '../config/features'

interface FeatureFilterOptions {
  /** 构建模式 */
  mode: 'userscript' | 'plain'
}

export default function featureFilterPlugin(options: FeatureFilterOptions): Plugin {
  const { mode } = options
  const enabledFeatures = getEnabledFeatures(mode)
  const enabledToolFeatures = FEATURES.filter(f => f[mode] && f.exportName)

  return {
    name: 'vite-plugin-feature-filter',
    apply: 'build',
    enforce: 'pre',

    configResolved() {
      console.log('\n')
      console.log('╔════════════════════════════════════════════╗')
      console.log('║       功能过滤配置                          ║')
      console.log('╠════════════════════════════════════════════╣')
      console.log(`║ 构建模式: ${mode.padEnd(30)} ║`)
      console.log(`║ 启用功能: ${enabledFeatures.join(', ').padEnd(26)} ║`)
      FEATURES.forEach((f) => {
        const status = f[mode] ? '✓' : '✗'
        console.log(`║   ${status} ${f.name.padEnd(16)} ${f.description?.substring(0, 20) || ''} ║`)
      })
      console.log('╚════════════════════════════════════════════╝')
      console.log('\n')
    },

    transform(code, id) {
      // 只处理 tools/index.ts 文件
      if (!id.includes('tools/index.ts')) return null

      // 只生成启用功能的导入
      const imports: string[] = []
      const registers: string[] = []

      enabledToolFeatures.forEach((feature) => {
        imports.push(`import { ${feature.exportName} } from './${feature.name}'`)
        registers.push(`registerTool(${feature.exportName})`)
      })

      const newCode = `/**
 * 工具模块统一导出
 * 构建模式: ${mode}
 * 启用功能: ${enabledFeatures.join(', ')}
 */

${imports.join('\n')}
import { registerTool } from './registry'

// 注册启用的模块
${registers.join('\n')}

export { getTools, initAllTools } from './registry'
`

      return {
        code: newCode,
        map: null,
      }
    },
  }
}
