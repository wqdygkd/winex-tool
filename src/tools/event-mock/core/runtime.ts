import type { WinningSDK } from '../../../types'
import type { DispatchCallback, DispatchParams, EventMockConfig } from '../types'
import { createDispatchResult, selectRule } from './matcher.ts'
import { normalizeConditions } from './rules.ts'

export interface EventMockRuntime {
  update: (config: EventMockConfig) => void
  mount: () => void
  unmount: () => void
  dispatchEvent: (eventId: string, params?: DispatchParams, cb?: DispatchCallback) => string
  isMounted: () => boolean
  getConfig: () => EventMockConfig
}

interface WinningTarget {
  winning?: WinningSDK
}

class Runtime implements EventMockRuntime {
  private config: EventMockConfig = {
    enabled: false,
    rules: [],
  }

  private originalWinning: WinningSDK | undefined
  private mounted = false

  constructor(private readonly target: WinningTarget) {}

  update(config: EventMockConfig): void {
    this.config = {
      enabled: config.enabled,
      rules: config.rules.map(rule => ({
        ...rule,
        conditions: normalizeConditions(rule.conditions),
      })),
    }

    if (this.config.enabled) {
      this.mount()
    } else {
      this.unmount()
    }
  }

  mount(): void {
    if (this.mounted) return

    this.originalWinning = this.target.winning
    this.target.winning = {
      getMacadress: () => '00:00:00:00:00:00',
      getPcName: () => '-',
      getIP: () => '0.0.0.0',
      deltaResult: () => true,
      showMsg: () => {},
      postMessage: () => {},
      ...(this.target.winning || {}),
      dispatchEvent: (eventId, params, cb) =>
        this.dispatchEvent(eventId, params as DispatchParams, cb as DispatchCallback | undefined),
    }
    this.mounted = true
  }

  unmount(): void {
    if (!this.mounted) return

    if (this.originalWinning) {
      this.target.winning = this.originalWinning
    } else {
      delete this.target.winning
    }

    this.originalWinning = undefined
    this.mounted = false
  }

  dispatchEvent(eventId: string, params?: DispatchParams, cb?: DispatchCallback): string {
    const rule = selectRule(this.config.rules, eventId, params)
    const result = createDispatchResult(rule)

    if (cb) {
      try {
        cb(result)
      } catch (error) {
        console.error('EventMock callback error:', error)
      }
    }

    return result
  }

  isMounted(): boolean {
    return this.mounted
  }

  getConfig(): EventMockConfig {
    return {
      enabled: this.config.enabled,
      rules: this.config.rules.map(rule => ({
        ...rule,
        conditions: normalizeConditions(rule.conditions),
      })),
    }
  }
}

export function createEventMockRuntime(target: WinningTarget): EventMockRuntime {
  return new Runtime(target)
}
