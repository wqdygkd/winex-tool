import type { ConfigData } from '../types'
import { context } from '../core/context'

const STORAGE_KEY = `${__namespace}event-mock-config`

/**
 * 配置存储
 * - 管理 GM 存储
 * - 加载/保存配置
 * - 同步到 Context（触发 mount/unmount）
 */
export class ConfigStorage {
  load(): ConfigData {
    const config = GM_getValue(STORAGE_KEY, { enable: false, events: [] })
    context.updateConfig(config)
    return config
  }

  save(config: ConfigData) {
    GM_setValue(STORAGE_KEY, {
      enable: config.enable,
      events: config.events.map(e => ({
        id: e.id,
        title: e.title,
        data: e.data,
      })),
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
