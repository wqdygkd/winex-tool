import type { ToolModule } from '../registry'
import { runtime } from './core/singleton'
import { getPresetTemplates } from './presets'
import { ConfigStorage } from './storage/config'
import { TemplateStorage } from './storage/template'
import EventMockUI from './ui/event-mock.vue'

const name = '事件模拟'
const storageKey = `${__namespace}event-mock`

function init() {
  const configStorage = new ConfigStorage()
  const templateStorage = new TemplateStorage()

  runtime.update(configStorage.load())
  templateStorage.importPresets(getPresetTemplates())
}

EventMockUI.name = name

export const EventMockModule: ToolModule = {
  name,
  storageKey,
  init,
  component: EventMockUI,
  icon: '⚡',
}
