/**
 * 事件模拟工具模块
 */

import { registerTool } from '../registry'
import { init, storageKey } from './event-mock'
import EventMock from './event-mock.vue'

const name = '事件模拟'

registerTool({
  name,
  storageKey,
  init,
  component: EventMock,
})

EventMock.name = name

export { init as EventMockInit }
export default EventMock
