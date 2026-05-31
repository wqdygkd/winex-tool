import type { TemplateItem } from '../types'
import { eventIdPresets } from './eventIds'

export { eventIdPresets }

/**
 * 预制数据文件配置
 */
interface PresetDataFile {
  filename: string
  eventId: string
}

const presetDataFiles: PresetDataFile[] = [
  { filename: '丽水市中心医院测试.json', eventId: '399297247' },
  { filename: 'gcp成功.json', eventId: '399297247' },
  { filename: 'gcp失败.json', eventId: '399297247' },
]

/**
 * 导入预制数据到 TemplateStorage
 */
export function importPresetData(templateStorage: {
  getAll(): TemplateItem[]
  add(template: TemplateItem): void
}): void {
  for (const file of presetDataFiles) {
    try {
      // 使用 Vite 的 eager 导入
      const rawData = import.meta.glob('./data/*.json', { eager: true })
      const dataKey = `./data/${file.filename}`
      const loaded = rawData[dataKey]

      if (loaded) {
        const jsonContent = loaded.default || loaded
        const template: TemplateItem = {
          id: `preset_${file.filename}`,
          eventId: file.eventId,
          name: file.filename.replace('.json', ''),
          data: typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent,
        }

        const existing = templateStorage.getAll()
        if (!existing.find(t => t.id === template.id)) {
          templateStorage.add(template)
        }
      }
    }
    catch (e) {
      console.warn(`Failed to import preset data: ${file.filename}`, e)
    }
  }
}