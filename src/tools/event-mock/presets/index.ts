import type { EventItem, TemplateItem } from '../types'
import { eventIdPresets } from './eventIds'

export { eventIdPresets }

export const presetEvents: EventItem[] = []

const presetDataFiles = [
  { filename: '丽水市中心医院测试.json', eventId: '399297247' },
  { filename: 'gcp成功.json', eventId: '399297247' },
  { filename: 'gcp失败.json', eventId: '399297247' },
]

export function getPresetEvents(): EventItem[] {
  return presetEvents
}

export function importPresetData(templateStorage: {
  getAll(): TemplateItem[]
  add(template: TemplateItem): void
}): void {
  const rawData = import.meta.glob('./data/*.json', { eager: true })
  const existing = templateStorage.getAll()

  presetDataFiles.forEach(file => {
    const dataKey = `./data/${file.filename}`
    const loaded = rawData[dataKey]

    if (!loaded) return

    try {
      const jsonContent = loaded.default || loaded
      const template: TemplateItem = {
        id: `preset_${file.filename}`,
        eventId: file.eventId,
        name: file.filename.replace('.json', ''),
        data: typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent,
      }

      if (!existing.find(t => t.id === template.id)) {
        templateStorage.add(template)
      }
    } catch (e) {
      console.warn(`Failed to import preset data: ${file.filename}`, e)
    }
  })
}