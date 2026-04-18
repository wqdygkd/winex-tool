import type { EventData, EventMockStorage } from '~/types'
import { storageKey } from './event-mock'

interface EventHandler {
  (params: string, cb: (result: string) => void): string
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

  loadHandlers(): void {
    try {
      const storage: EventMockStorage = GM_getValue(storageKey, { enable: false })
      if (storage.events) {
        storage.events.forEach(event => {
          if (event.id && event.data) {
            this.register(event.id, () => JSON.stringify(event.data))
          }
        })
      }
    } catch (error) {
      console.error('Failed to load event handlers:', error)
    }
  }

  saveHandlers(events: EventData[]): void {
    try {
      const storage: EventMockStorage = GM_getValue(storageKey, { enable: false })
      storage.events = events
      GM_setValue(storageKey, storage)
    } catch (error) {
      console.error('Failed to save event handlers:', error)
    }
  }

  register(condition: string, handler: EventHandler): EventMock {
    this.handlers.set(condition, handler)
    return this
  }

  unregister(condition: string): void {
    this.handlers.delete(condition)
  }

  execute(condition: string, ...args: any[]): string {
    const handler = this.handlers.get(condition)
    if (handler) {
      return handler(...args)
    } else {
      console.warn(`未找到事件 ${condition} 的处理器，使用原始方法`)
      if (args.length > 2 && typeof args[2] === 'function') {
        args[2]('{}')
      }
      return '{}'
    }
  }
}

export default new EventMock()
