declare const __namespace: string
declare const __PLAIN_SCRIPT__: boolean
declare const __BUILD_MODE__: 'userscript' | 'plain'
declare const __SCRIPT_VERSION__: string

// 功能启用标志（用于 tree-shaking）
declare const __FEATURE_EVENT_MOCK__: boolean
declare const __FEATURE_OTHERS__: boolean
declare const __FEATURE_PARAM_MOCK__: boolean
declare const __FEATURE_REQUEST_MODIFY__: boolean
declare const __FEATURE_STORAGE_COPY__: boolean

// others 子功能启用标志
declare const __FEATURE_DEVOPS_DASHBOARD__: boolean
declare const __FEATURE_DEVOPS_LOGIN__: boolean
declare const __FEATURE_DISABLE_TRACEID__: boolean
declare const __FEATURE_SHOW_IDENTITY_LABEL__: boolean

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