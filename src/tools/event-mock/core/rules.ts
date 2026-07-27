import type { MockCondition, MockRule } from '../types'

export function applyTemplateResponse(rule: MockRule, templateResponse: Record<string, unknown>): void {
  rule.response = cloneJsonObject(templateResponse)
}

export function normalizeConditions(conditions: MockCondition[]): MockCondition[] {
  return conditions
    .filter(isFilledCondition)
    .map(condition => ({
      path: condition.path.trim(),
      value: typeof condition.value === 'string' ? condition.value.trim() : condition.value,
    }))
}

export function cloneJsonObject(value: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value ?? {}))
}

function isFilledCondition(condition: MockCondition): boolean {
  return Boolean(condition.path.trim())
}
