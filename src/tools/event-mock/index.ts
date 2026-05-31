import type { ToolModule } from '../registry'
import { context } from './core/context'
import { ConfigStorage } from './storage/config'
import EventMockUI from './ui/event-mock.vue'

const name = '事件模拟'
const storageKey = `${__namespace}event-mock1`

function init() {
  const configStorage = new ConfigStorage()
  configStorage.load()
}

EventMockUI.name = name

export const EventMockModule: ToolModule = {
  name,
  storageKey,
  init,
  component: EventMockUI,
  icon: '⚡',
}