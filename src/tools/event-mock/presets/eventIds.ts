import type { EventIdPreset } from '../types'

/**
 * eventId 预设列表
 * 常用 eventId 及其描述
 */
export const eventIdPresets: EventIdPreset[] = [
  { id: '399297247', name: '读卡事件', description: '医保卡/身份证读卡' },
  { id: '399563027', name: '打印机列表', description: '获取打印机列表' },
  // 可按需扩展
]