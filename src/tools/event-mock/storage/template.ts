import type { TemplateItem } from '../types'

const STORAGE_KEY = `${__namespace}event-mock-templates`

export class TemplateStorage {
  getAll(): TemplateItem[] {
    return GM_getValue(STORAGE_KEY, [])
  }

  getByEventId(eventId: string): TemplateItem[] {
    return this.getAll().filter(t => t.eventId === eventId)
  }

  add(template: TemplateItem): void {
    const templates = this.getAll()
    templates.push(template)
    GM_setValue(STORAGE_KEY, templates)
  }

  remove(templateId: string): void {
    GM_setValue(STORAGE_KEY, this.getAll().filter(t => t.id !== templateId))
  }

  update(templateId: string, data: Partial<TemplateItem>): void {
    const templates = this.getAll()
    const index = templates.findIndex(t => t.id === templateId)
    if (index > -1) {
      templates[index] = { ...templates[index], ...data }
      GM_setValue(STORAGE_KEY, templates)
    }
  }
}
