import type { MockTemplate } from '../types'

const STORAGE_KEY = 'GM_wqdy_event-mock-templates'

export class TemplateStorage {
  getAll(): MockTemplate[] {
    const storedTemplates = GM_getValue<unknown>(STORAGE_KEY, [])
    if (!isTemplateList(storedTemplates)) {
      return []
    }

    return cloneTemplates(storedTemplates)
  }

  getByEventId(eventId: string): MockTemplate[] {
    return this.getAll().filter(template => template.eventId === eventId)
  }

  add(template: MockTemplate): void {
    this.write([...this.getAll(), cloneTemplate(template)])
  }

  remove(templateId: string): boolean {
    const templates = this.getAll()
    const template = templates.find(item => item.id === templateId)
    if (!template || template.preset) return false

    this.write(templates.filter(item => item.id !== templateId))
    return true
  }

  update(templateId: string, data: Partial<MockTemplate>): boolean {
    const templates = this.getAll()
    const index = templates.findIndex(template => template.id === templateId)
    if (index === -1 || templates[index].preset) return false

    templates[index] = cloneTemplate({ ...templates[index], ...data, id: templates[index].id })
    this.write(templates)
    return true
  }

  importPresets(presets: MockTemplate[]): number {
    const templates = this.getAll()
    let changedCount = 0

    presets.forEach((preset) => {
      const presetTemplate = cloneTemplate({ ...preset, preset: true })
      const existingIndex = templates.findIndex(template => template.id === preset.id)

      if (existingIndex === -1) {
        templates.push(presetTemplate)
        changedCount += 1
        return
      }

      if (templates[existingIndex].preset && !isSameTemplate(templates[existingIndex], presetTemplate)) {
        templates[existingIndex] = presetTemplate
        changedCount += 1
      }
    })

    if (changedCount > 0) {
      this.write(templates)
    }

    return changedCount
  }

  private write(templates: MockTemplate[]): void {
    GM_setValue(STORAGE_KEY, cloneTemplates(templates))
  }
}

function cloneTemplates(templates: MockTemplate[]): MockTemplate[] {
  return templates.map(cloneTemplate)
}

function cloneTemplate(template: MockTemplate): MockTemplate {
  return {
    ...template,
    response: cloneJsonValue(template.response),
  }
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? {}))
}

function isSameTemplate(left: MockTemplate, right: MockTemplate): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function isTemplateList(value: unknown): value is MockTemplate[] {
  return Array.isArray(value) && value.every(isTemplate)
}

function isTemplate(value: unknown): value is MockTemplate {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.eventId === 'string'
    && typeof value.name === 'string'
    && isRecord(value.response)
    && (value.preset === undefined || typeof value.preset === 'boolean')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
