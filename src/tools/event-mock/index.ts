import type { ToolModule } from '../registry'
import { importPresetData } from './presets'
import { ConfigStorage } from './storage/config'
import { TemplateStorage } from './storage/template'
import EventMockUI from './ui/event-mock.vue'

const name = '事件模拟(New)'
const storageKey = `${__namespace}event-mock`

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
