import type { ConfigData, WinningSDK } from '../types'
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
        debugger
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
    const data = this.eventMap.value.get(eventId)
    try {
      const result = data ? JSON.stringify(data) : '{}'
      try {
        cb(result)
      } catch (cbError) {
        console.error('EventMock callback error:', cbError)
      }
      return result
    } catch (e) {
      console.error('EventMock execute error:', e)
      cb('{}')
      return '{}'
    }
  }
}

export const context = new EventMockContext()
