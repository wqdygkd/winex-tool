import type { ConfigData, ParamsCondition, WinningSDK } from '../types'
import { computed, reactive } from 'vue'

/**
 * 事件模拟核心上下文
 * - 响应式配置管理
 * - 事件执行
 * - winning 挂载/卸载（零侵入）
 */
class EventMockContext {
  private config = reactive<ConfigData>({
    enable: false,
    events: [],
  })

  private eventMap = computed(() => {
    const map = new Map<string, any>()
    this.config.events.forEach((event) => {
      map.set(event.id, event.data)
    })
    return map
  })

  private originalWinning: WinningSDK | null = null
  private mounted = false

  getConfig(): ConfigData {
    return this.config
  }

  updateConfig(newConfig: ConfigData) {
    const wasEnabled = this.config.enable
    this.config.enable = newConfig.enable
    this.config.events = [...newConfig.events]

    if (newConfig.enable && !wasEnabled) {
      this.mount()
    } else if (!newConfig.enable && wasEnabled) {
      this.unmount()
    }
  }

  mount() {
    if (this.mounted) return
    this.originalWinning = unsafeWindow.winning
    unsafeWindow.winning = {
      ...(unsafeWindow.winning || {}),
      dispatchEvent: (eventId: string, params: string, cb: (result: string) => void) => {
        return this.execute(eventId, params, cb)
      },
      getMacadress: () => '00:00:00:00:00:00',
      getPcName: () => '-',
      getIP: () => '0.0.0.0',
      deltaResult: () => true,
      showMsg: () => {},
      postMessage: () => {},
    }
    this.mounted = true
  }

  unmount() {
    if (!this.mounted) return
    if (this.originalWinning) {
      unsafeWindow.winning = this.originalWinning
    } else {
      // SDK didn't exist before, delete the properties we added
      delete unsafeWindow.winning
    }
    this.mounted = false
  }

  isMounted(): boolean {
    return this.mounted
  }

  execute(eventId: string, params: string, cb: (result: string) => void): string {
    const logStyle = 'color: #409eff; font-weight: bold;'
    const logPrefix = '%c[Winex Tool]%c [EventMock]'

    // 1. 按 eventId 筛选候选事件
    const candidates = this.config.events.filter(e => e.id === eventId)
    if (candidates.length === 0) {
      console.log(logPrefix + ' 未匹配到 eventId: ' + eventId, logStyle, '')
      try {
        cb('{}')
      } catch (cbError) {
        console.error('EventMock callback error:', cbError)
      }
      return '{}'
    }

    // 2. 解析 params JSON
    let paramsObj: any = {}
    try {
      paramsObj = JSON.parse(params)
    } catch (e) {
      console.warn(logPrefix + ' params 解析失败:', logStyle, '', params)
    }

    // 3. 按 paramsConditions 匹配
    for (const event of candidates) {
      if (this.matchParams(paramsObj, event.paramsConditions)) {
        console.log(
          logPrefix + ' 匹配成功',
          logStyle, '',
          `\neventId: ${eventId}`,
          `\ntitle: ${event.title}`,
          `\nparams:`, paramsObj,
          `\nconditions:`, event.paramsConditions || [],
          `\ndata:`, event.data
        )
        try {
          const result = JSON.stringify(event.data)
          try {
            cb(result)
          } catch (cbError) {
            console.error('EventMock callback error:', cbError)
          }
          return result
        } catch (e) {
          console.error('EventMock JSON.stringify error:', e)
          try {
            cb('{}')
          } catch (cbError) {
            console.error('EventMock callback error:', cbError)
          }
          return '{}'
        }
      }
    }

    // 4. 无匹配，返回 fallback（无 paramsConditions 的事件）
    const fallback = candidates.find(e => !e.paramsConditions) || candidates[0]
    console.log(
      logPrefix + ' 使用 fallback',
      logStyle, '',
      `\neventId: ${eventId}`,
      `\ntitle: ${fallback?.title}`,
      `\nparams:`, paramsObj,
      `\ndata:`, fallback?.data
    )
    try {
      const result = JSON.stringify(fallback?.data || {})
      try {
        cb(result)
      } catch (cbError) {
        console.error('EventMock callback error:', cbError)
      }
      return result
    } catch (e) {
      console.error('EventMock JSON.stringify error:', e)
      try {
        cb('{}')
      } catch (cbError) {
        console.error('EventMock callback error:', cbError)
      }
      return '{}'
    }
  }

  // JSON Path 匹配：所有条件需满足
  private matchParams(paramsObj: any, conditions?: ParamsCondition[]): boolean {
    if (!conditions || conditions.length === 0) return true
    return conditions.every(cond => {
      const actualValue = this.getValueByPath(paramsObj, cond.path)
      // 支持字符串和数字比较
      return String(actualValue) === String(cond.value) || actualValue === cond.value
    })
  }

  // 按 JSON Path 获取值
  private getValueByPath(obj: any, path: string): any {
    if (!path) return undefined
    const keys = path.split('.')
    let current = obj
    for (const key of keys) {
      if (current == null) return undefined
      current = current[key]
    }
    return current
  }
}

export const context = new EventMockContext()
