/**
 * 请求修改工具模块
 */

import type { ToolModule } from '../registry'
import { init, storageKey } from './request-modify'
import RequestModify from './request-modify.vue'

const name = '请求修改'

RequestModify.name = name

export const RequestModifyModule: ToolModule = {
  name,
  storageKey,
  init,
  component: RequestModify,
}