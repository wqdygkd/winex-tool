import type { MockTemplate } from '../types'

const presetDataFiles = [
  { filename: '丽水市中心医院测试.json', eventId: '399297247' },
  { filename: 'gcp成功.json', eventId: '399297247' },
  { filename: 'gcp失败.json', eventId: '399297247' },
]

export function getPresetTemplates(): MockTemplate[] {
  const rawData = (import.meta as ImportMeta & {
    glob: (pattern: string, options: { eager: boolean }) => Record<string, unknown>
  }).glob('./data/*.json', { eager: true })

  return presetDataFiles.flatMap((file) => {
    const loaded = rawData[`./data/${file.filename}`]
    if (!loaded) return []

    const jsonContent = getDefaultExport(loaded)
    return [{
      id: `preset_${file.filename}`,
      eventId: file.eventId,
      name: file.filename.replace('.json', ''),
      response: normalizePresetResponse(jsonContent),
      preset: true,
    }]
  })
}

function getDefaultExport(moduleValue: unknown): unknown {
  if (isRecord(moduleValue) && 'default' in moduleValue) {
    return moduleValue.default
  }
  return moduleValue
}

export function normalizePresetResponse(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    try {
      return normalizePresetResponse(JSON.parse(value))
    } catch {
      return {}
    }
  }

  return isRecord(value) ? value : {}
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
