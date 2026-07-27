import type { DispatchParams, MockCondition, MockRule } from '../types'
import { normalizeConditions } from './rules.ts'

const unmatchedRuleResponse = {
  message: '未匹配到规则，请在设置页面配置',
}

export function parseParams(params: DispatchParams): Record<string, unknown> {
  if (!params) return {}
  if (typeof params === 'string') {
    try {
      const parsed = JSON.parse(params)
      return isRecord(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }
  return isRecord(params) ? params : {}
}

export function getValueByPath(source: unknown, path: string): unknown {
  if (!path) return undefined

  return path.split('.').reduce<unknown>((current, key) => {
    if (!isRecord(current)) return undefined
    return current[key]
  }, source)
}

export function matchesConditions(params: unknown, conditions: MockCondition[]): boolean {
  const normalizedConditions = normalizeConditions(conditions)
  if (normalizedConditions.length === 0) return true

  return normalizedConditions.every((condition) => {
    const actualValue = getValueByPath(params, condition.path)
    return actualValue === condition.value || String(actualValue) === String(condition.value)
  })
}

export function selectRule(
  rules: MockRule[],
  eventId: string,
  params: DispatchParams,
): MockRule | null {
  const paramsObject = parseParams(params)
  const candidates = rules.filter(rule => rule.enabled && rule.eventId === eventId)
  const conditionedRule = candidates.find((rule) => {
    const conditions = normalizeConditions(rule.conditions)
    return conditions.length > 0 && matchesConditions(paramsObject, conditions)
  })

  if (conditionedRule) return conditionedRule

  return candidates.find(rule => normalizeConditions(rule.conditions).length === 0) ?? null
}

export function serializeResponse(response: unknown): string {
  try {
    return JSON.stringify(response ?? {})
  } catch {
    return '{}'
  }
}

export function createDispatchResult(rule: MockRule | null): string {
  return serializeResponse(rule ? rule.response : unmatchedRuleResponse)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
