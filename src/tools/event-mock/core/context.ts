import { computed, reactive } from 'vue'
import type { ConfigData, ParamsCondition, WinningSDK } from '../types'

class EventMockContext {
  private config = reactive<ConfigData>({
    enable: false,
    events: [],
  })

  private eventMap = computed(() => {
    const map = new Map<string, any>()
    this.config.events.forEach(event => map.set(event.id, event.data))
    return map
  })

  private originalWinning: WinningSDK | null = null
  private mounted = false

  private logStyle = 'color: #409eff; font-weight: bold;'
  private logPrefix = '%c[Winex Tool]%c [EventMock]'

  getConfig(): ConfigData {
    return this.config
  }

  updateConfig(newConfig: ConfigData): void {
    const wasEnabled = this.config.enable
    this.config.enable = newConfig.enable
    this.config.events = [...newConfig.events]

    if (newConfig.enable && !wasEnabled) {
      this.mount()
    } else if (!newConfig.enable && wasEnabled) {
      this.unmount()
    }
  }

  mount(): void {
    if (this.mounted) return
    this.originalWinning = unsafeWindow.winning
    unsafeWindow.winning = {
      ...(unsafeWindow.winning || {}),
      dispatchEvent: (eventId, params, cb) => this.execute(eventId, params, cb),
      getMacadress: () => '00:00:00:00:00:00',
      getPcName: () => '-',
      getIP: () => '0.0.0.0',
      deltaResult: () => true,
      showMsg: () => {},
      postMessage: () => {},
    }
    this.mounted = true
  }

  unmount(): void {
    if (!this.mounted) return
    if (this.originalWinning) {
      unsafeWindow.winning = this.originalWinning
    } else {
      delete unsafeWindow.winning
    }
    this.mounted = false
  }

  isMounted(): boolean {
    return this.mounted
  }

  execute(eventId: string, params: string, cb: (result: string) => void): string {
    const candidates = this.config.events.filter(e => e.id === eventId)

    if (candidates.length === 0) {
      this.log('未匹配到 eventId: ' + eventId)
      this.safeCallback(cb, '{}')
      return '{}'
    }

    const paramsObj = this.parseParams(params)

    for (const event of candidates) {
      if (this.matchParams(paramsObj, event.paramsConditions)) {
        this.logMatch(eventId, event, paramsObj)
        return this.executeAndCallback(event.data, cb)
      }
    }

    const fallback = candidates.find(e => !e.paramsConditions) || candidates[0]
    this.logFallback(eventId, fallback, paramsObj)
    return this.executeAndCallback(fallback?.data, cb)
  }

  private parseParams(params: string): any {
    try {
      return JSON.parse(params)
    } catch {
      console.warn(this.logPrefix + ' params 解析失败:', this.logStyle, '', params)
      return {}
    }
  }

  private matchParams(paramsObj: any, conditions?: ParamsCondition[]): boolean {
    if (!conditions || conditions.length === 0) return true
    return conditions.every(cond => {
      const actualValue = this.getValueByPath(paramsObj, cond.path)
      return String(actualValue) === String(cond.value) || actualValue === cond.value
    })
  }

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

  private executeAndCallback(data: any, cb: (result: string) => void): string {
    try {
      const result = JSON.stringify(data)
      this.safeCallback(cb, result)
      return result
    } catch (e) {
      console.error('EventMock JSON.stringify error:', e)
      this.safeCallback(cb, '{}')
      return '{}'
    }
  }

  private safeCallback(cb: (result: string) => void, result: string): void {
    try {
      cb(result)
    } catch (e) {
      console.error('EventMock callback error:', e)
    }
  }

  private log(message: string): void {
    console.log(this.logPrefix + ' ' + message, this.logStyle, '')
  }

  private logMatch(eventId: string, event: any, paramsObj: any): void {
    console.log(
      this.logPrefix + ' 匹配成功',
      this.logStyle, '',
      `\neventId: ${eventId}`,
      `\ntitle: ${event.title}`,
      `\nparams:`, paramsObj,
      `\nconditions:`, event.paramsConditions || [],
      `\ndata:`, event.data
    )
  }

  private logFallback(eventId: string, fallback: any, paramsObj: any): void {
    console.log(
      this.logPrefix + ' 使用 fallback',
      this.logStyle, '',
      `\neventId: ${eventId}`,
      `\ntitle: ${fallback?.title}`,
      `\nparams:`, paramsObj,
      `\ndata:`, fallback?.data
    )
  }
}

export const context = new EventMockContext()
