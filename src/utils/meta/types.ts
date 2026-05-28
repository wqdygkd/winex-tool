/**
 * UserScript 元数据类型定义
 * 支持 Tampermonkey / Greasemonkey / Violentmonkey 标准
 */

export interface UserScriptMetadata {
  /** 脚本名称 */
  name: string
  /** 脚本命名空间 */
  namespace?: string
  /** 版本号 */
  version?: string
  /** 脚本描述 */
  description?: string
  /** 作者 */
  author?: string
  /** 主页 URL */
  homepage?: string
  homepageURL?: string
  website?: string
  source?: string
  /** 许可证 */
  license?: string
  /** 图标 */
  icon?: string
  iconURL?: string
  defaulticon?: string
  icon64?: string
  icon64URL?: string
  /** 更新 URL */
  updateURL?: string
  downloadURL?: string
  installURL?: string
  /** 支持页面 */
  supportURL?: string
  /** 捐赠链接 */
  contributionURL?: string
  /** 匹配 URL（数组） */
  match?: string[]
  /** 排除 URL（数组） */
  exclude?: string[]
  include?: string[]
  /** 外部依赖（数组） */
  require?: string[]
  /** 资源 */
  resource?: Record<string, string>
  /** 允许连接的域名 */
  connect?: string[]
  /** GM API 权限（数组） */
  grant?: string[]
  /** 运行时机: document-start | document-body | document-end | document-idle */
  'run-at'?: 'document-start' | 'document-body' | 'document-end' | 'document-idle'
  /** 不在 iframe 中运行 */
  noframes?: boolean
  /** 不包裹脚本 */
  unwrap?: boolean
  /** 其他自定义字段 */
  [key: string]: unknown
}