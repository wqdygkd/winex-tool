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
  /** 父级功能名称（用于子功能分组） */
  parent?: string
}

export const FEATURES: FeatureConfig[] = [
  {
    name: 'event-mock',
    userscript: false,
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
  // others 子功能
  {
    name: 'devops-dashboard',
    userscript: true,
    plain: true,
    description: '运维平台仪表盘',
    parent: 'others',
  },
  {
    name: 'devops-login',
    userscript: true,
    plain: false,
    description: '运维平台登录',
    parent: 'others',
  },
  {
    name: 'disable-traceid',
    userscript: true,
    plain: false,
    description: '禁用 traceid',
    parent: 'others',
  },
  {
    name: 'show-identity-label',
    userscript: true,
    plain: false,
    description: '显示 Identity 标签 - TFS 页面',
    parent: 'others',
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
  return FEATURES.find(f => f.name === featureName)?.[mode] ?? false
}
