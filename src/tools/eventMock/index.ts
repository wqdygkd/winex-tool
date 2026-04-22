/**
 * 事件模拟工具模块
 */

import type { ToolModule } from '../registry'
import { init, storageKey } from './event-mock'
import EventMock from './event-mock.vue'

const name = '事件模拟'

EventMock.name = name

export const EventMockModule: ToolModule = {
  name,
  storageKey,
  init,
  component: EventMock,
}