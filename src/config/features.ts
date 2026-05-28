/**
 * 功能模块配置
 * 定义每个功能在不同打包模式下的启用状态
 */

export interface FeatureConfig {
  /** 功能名称 */
  name: string
  /** 油猴脚本模式下是否启用 */
  userscript: boolean
  /** plain (普通脚本) 模式下是否启用 */
  plain: boolean
  /** 功能描述 */
  description?: string
}

export const FEATURES: FeatureConfig[] = [
  {
    name: 'event-mock',
    userscript: true,
    plain: false,
    description: '事件模拟 - 需要 GM API 支持',
  },
  {
    name: 'storage-copy',
    userscript: true,
    plain: true,
    description: 'Storage 克隆 - 使用 localStorage',
  },
  {
    name: 'others',
    userscript: true,
    plain: true,
    description: '其他辅助功能 - 运维平台相关',
  },
  {
    name: 'param-mock',
    userscript: true,
    plain: false,
    description: '参数模拟 - 需要 ajax-hook 和 GM API',
  },
  {
    name: 'request-modify',
    userscript: true,
    plain: false,
    description: '请求修改 - 需要 ajax-hook 和 GM API',
  },
]

/** 根据模式获取启用的功能列表 */
export function getEnabledFeatures(mode: 'userscript' | 'plain'): string[] {
  return FEATURES.filter(f => f[mode]).map(f => f.name)
}

/** 检查功能在指定模式下是否启用 */
export function isFeatureEnabled(featureName: string, mode: 'userscript' | 'plain'): boolean {
  const feature = FEATURES.find(f => f.name === featureName)
  return feature ? feature[mode] : false
}