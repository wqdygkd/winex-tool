export type DispatchParams = string | Record<string, unknown> | null | undefined
export type DispatchCallback = (result: string) => void

export interface MockCondition {
  path: string
  value: unknown
}

export interface MockRule {
  id: string
  enabled: boolean
  eventId: string
  title: string
  conditions: MockCondition[]
  response: Record<string, unknown>
}

export interface EventMockConfig {
  enabled: boolean
  rules: MockRule[]
}

export interface MockTemplate {
  id: string
  eventId: string
  name: string
  response: Record<string, unknown>
  preset?: boolean
}

export interface EventIdPreset {
  id: string
  name: string
  description?: string
}
