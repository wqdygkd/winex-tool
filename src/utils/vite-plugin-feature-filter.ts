/**
 * Vite 功能过滤插件
 * 根据构建模式动态生成导入代码，实现真正的 tree-shaking
 */

import type { Plugin } from 'vite'
import { FEATURES } from '../config/features'

interface FeatureFilterOptions {
  /** 构建模式 */
  mode: 'userscript' | 'plain'
}

// 模块名映射（目录名 → 导出名称）
const MODULE_EXPORT_NAMES: Record<string, string> = {
  'event-mock': 'EventMockModule',
  'storage-copy': 'StorageCopyModule',
  'others': 'OthersModule',
  'param-mock': 'ParamMockModule',
  'request-modify': 'RequestModifyModule',
}

export default function featureFilterPlugin(options: FeatureFilterOptions): Plugin {
  const { mode } = options
  const enabledFeatures = FEATURES.filter(f => f[mode]).map(f => f.name)

  return {
    name: 'vite-plugin-feature-filter',
    apply: 'build',
    enforce: 'pre',

    configResolved(config) {
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
      const exports: string[] = []

      enabledFeatures.forEach((featureName) => {
        const exportName = MODULE_EXPORT_NAMES[featureName]
        if (!exportName) return

        imports.push(`import { ${exportName} } from './${featureName}'`)
        registers.push(`registerTool(${exportName})`)
        exports.push(`export const ${exportName.replace('Module', '')} = ${exportName}.component!`)
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

// 导出 Vue 组件
${exports.join('\n')}

export { getTools, initAllTools } from './registry'
`

      return {
        code: newCode,
        map: null,
      }
    },
  }
}