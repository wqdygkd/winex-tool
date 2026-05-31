import { context } from '../core/context'
import type { ConfigData, EventItem } from '../types'

const STORAGE_KEY = `${__namespace}event-mock-config`

function mapEvents(events: EventItem[]) {
  return events.map(e => ({
    id: e.id,
    title: e.title,
    data: e.data,
    paramsConditions: e.paramsConditions,
  }))
}

export class ConfigStorage {
  load(): ConfigData {
    const config = GM_getValue(STORAGE_KEY, { enable: false, events: [] })
    context.updateConfig(config)
    return config
  }

  save(config: ConfigData): void {
    GM_setValue(STORAGE_KEY, {
      enable: config.enable,
      events: mapEvents(config.events),
    })
    context.updateConfig(config)
  }

  get(): ConfigData {
    const config = context.getConfig()
    return {
      enable: config.enable,
      events: [...config.events],
    }
  }
}
