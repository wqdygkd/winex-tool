/**
 * Event-Mock 模块类型定义
 */

export interface EventItem {
  id: string        // eventId
  title: string     // 显示名称
  data: any         // 返回的静态数据
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

export interface WinningSDK {
  dispatchEvent?: (eventId: string, params: string, cb: (result: string) => void) => void
  getMacadress?: () => string
  getPcName?: () => string
  getIP?: () => string
  deltaResult?: () => boolean
  showMsg?: () => void
  postMessage?: () => void
}