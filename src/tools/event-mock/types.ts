export interface ParamsCondition {
  path: string
  value: any
}

export interface EventItem {
  id: string
  title: string
  data: any
  paramsConditions?: ParamsCondition[]
  isPreset?: boolean
}

export interface TemplateItem {
  id: string
  eventId: string
  name: string
  data: any
}

export interface ConfigData {
  enable: boolean
  events: EventItem[]
}

export interface EventIdPreset {
  id: string
  name: string
  description?: string
}
