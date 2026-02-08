import { storageKey } from './event-mock'

interface EventHandler {
  (params: string, cb: (result: string) => void): string
}

interface EventData {
  id: string
  title: string
  data: any
  isBuiltIn?: boolean
  template?: string
}

interface StorageData {
  enable: boolean
  events?: EventData[]
}

function getCondition(eventId: string, params: string): string {
  return eventId
}

class EventMock {
  private handlers: Map<string, EventHandler>

  constructor() {
    this.handlers = new Map()
    this.loadHandlers()
  }

  // 加载处理器
  loadHandlers(): void {
    try {
      const storage: StorageData = GM_getValue(storageKey, { enable: false })
      if (storage.events) {
        storage.events.forEach(event => {
          if (event.id && event.data) {
            this.register(event.id, (params: string, cb: (result: string) => void): string => {
              if (cb) {
                cb(JSON.stringify(event.data))
              }
              return JSON.stringify(event.data)
            })
          }
        })
      }
    } catch (error) {
      console.error('Failed to load event handlers:', error)
    }
  }

  // 保存处理器
  saveHandlers(events: EventData[]): void {
    try {
      const storage: StorageData = GM_getValue(storageKey, { enable: false })
      storage.events = events
      GM_setValue(storageKey, storage)
    } catch (error) {
      console.error('Failed to save event handlers:', error)
    }
  }

  // 注册新分支
  register(condition: string, handler: EventHandler): EventMock {
    this.handlers.set(condition, handler)
    return this // 支持链式调用
  }

  // 移除分支
  unregister(condition: string): void {
    this.handlers.delete(condition)
  }

  // 执行对应分支
  execute(condition: string, ...args: any[]): string {
    const handler = this.handlers.get(condition)
    if (handler) {
      return handler(...args)
    } else {
      // 如果没有找到处理器，调用原始的dispatchEvent方法
      console.warn(`未找到事件 ${condition} 的处理器，使用原始方法`)
      if (args.length > 2 && typeof args[2] === 'function') {
        args[2]('{}')
      }
      return '{}'
    }
  }
}

export default new EventMock()
