import type { TemplateItem } from '../types'

const STORAGE_KEY = `${__namespace}event-mock-templates`

/**
 * 模板存储
 * - 管理 GM 存储
 * - 提供 CRUD 操作
 * - 按 eventId 筛选
 */
export class TemplateStorage {
  getAll(): TemplateItem[] {
    return GM_getValue(STORAGE_KEY, [])
  }

  getByEventId(eventId: string): TemplateItem[] {
    return this.getAll().filter(t => t.eventId === eventId)
  }

  add(template: TemplateItem) {
    const templates = this.getAll()
    templates.push(template)
    GM_setValue(STORAGE_KEY, templates)
  }

  remove(templateId: string) {
    const templates = this.getAll().filter(t => t.id !== templateId)
    GM_setValue(STORAGE_KEY, templates)
  }

  update(templateId: string, data: Partial<TemplateItem>) {
    const templates = this.getAll()
    const index = templates.findIndex(t => t.id === templateId)
    if (index > -1) {
      templates[index] = { ...templates[index], ...data }
      GM_setValue(STORAGE_KEY, templates)
    }
  }
}