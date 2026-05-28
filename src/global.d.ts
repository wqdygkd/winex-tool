declare const __namespace: string
declare const __PLAIN_SCRIPT__: boolean

declare function GM_getValue<T>(key: string, defaultValue: T): T
declare function GM_setValue(key: string, value: unknown): void
declare function GM_registerMenuCommand(name: string, callback: () => void): void

import type { WinningSDK } from '~/types'

declare const unsafeWindow: Window & typeof globalThis & {
  winning?: WinningSDK
  __realConsole?: Console
  [key: string]: unknown
}

interface Window {
  __realConsole?: Console
  winning?: WinningSDK
  [key: string]: unknown
}