import type { ToolModule } from '../registry'
import { context } from './core/context'
import { ConfigStorage } from './storage/config'
import { TemplateStorage } from './storage/template'
import { importPresetData } from './presets'
import EventMockUI from './ui/event-mock.vue'

const name = '事件模拟(New)'
const storageKey = `${__namespace}event-mock1`

function init() {
  const configStorage = new ConfigStorage()
  const templateStorage = new TemplateStorage()

  configStorage.load()

  // 自动导入预制数据
  importPresetData(templateStorage)
}

EventMockUI.name = name

export const EventMockModule: ToolModule = {
  name,
  storageKey,
  init,
  component: EventMockUI,
  icon: '⚡',
}
