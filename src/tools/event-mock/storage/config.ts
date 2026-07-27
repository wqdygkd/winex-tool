import type { EventMockConfig } from '../types'
import { normalizeConditions } from '../core/rules.ts'

const STORAGE_KEY = 'GM_wqdy_event-mock-config'

export function createDefaultConfig(): EventMockConfig {
  return {
    enabled: false,
    rules: [],
  }
}

export class ConfigStorage {
  load(): EventMockConfig {
    const storedConfig = GM_getValue<unknown>(STORAGE_KEY, createDefaultConfig())
    if (!isEventMockConfig(storedConfig)) {
      return createDefaultConfig()
    }

    return cloneConfig(storedConfig)
  }

  save(config: EventMockConfig): void {
    GM_setValue(STORAGE_KEY, cloneConfig(config))
  }
}

function cloneConfig(config: EventMockConfig): EventMockConfig {
  return {
    enabled: config.enabled,
    rules: config.rules.map(rule => ({
      ...rule,
      conditions: normalizeConditions(rule.conditions),
    })),
  }
}

function isEventMockConfig(value: unknown): value is EventMockConfig {
  if (!isRecord(value)) return false
  if (typeof value.enabled !== 'boolean') return false
  if (!Array.isArray(value.rules)) return false

  return value.rules.every(rule =>
    isRecord(rule)
    && typeof rule.id === 'string'
    && typeof rule.enabled === 'boolean'
    && typeof rule.eventId === 'string'
    && typeof rule.title === 'string'
    && Array.isArray(rule.conditions)
    && isRecord(rule.response),
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
