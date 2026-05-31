/**
 * Event-Mock 模块类型定义
 */

// 新增：params 条件定义
export interface ParamsCondition {
  path: string       // JSON Path，如 "body.identityEntryId"
  value: any         // 匹配值，如 3
}

export interface EventItem {
  id: string        // eventId
  title: string     // 显示名称
  data: any         // 返回的静态数据
  paramsConditions?: ParamsCondition[]  // 可选：params 匹配条件
  isPreset?: boolean  // 可选：是否为预制规则（预制规则不可删除）
}

export interface TemplateItem {
  id: string        // 模板唯一 ID
  eventId: string   // 关联的事件 ID
  name: string      // 模板名称
  data: any         // 预设数据
}

export interface ConfigData {
  enable: boolean
  events: EventItem[]
}

// 新增：eventId 预设
export interface EventIdPreset {
  id: string        // eventId
  name: string      // 中文名称，如 "读卡事件"
  description?: string  // 可选描述
}

export interface WinningSDK {
  dispatchEvent?: (eventId: string, params: string, cb: (result: string) => void) => void
  getMacadress?: () => string
  getPcName?: () => string
  getIP?: () => string
  deltaResult?: () => boolean
  showMsg?: () => void
  postMessage?: () => void
}