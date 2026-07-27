import { createEventMockRuntime } from './runtime.ts'
import type { WinningSDK } from '../../../types'

interface RuntimeTarget {
  winning?: WinningSDK
}

export const runtime = createEventMockRuntime(resolveRuntimeTarget())

export function resolveRuntimeTarget(): RuntimeTarget {
  if (typeof unsafeWindow !== 'undefined') {
    return unsafeWindow as unknown as RuntimeTarget
  }

  if (typeof window !== 'undefined') {
    return window as unknown as RuntimeTarget
  }

  return globalThis as RuntimeTarget
}
