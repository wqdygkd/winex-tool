declare const __namespace: string

declare function GM_getValue<T>(key: string, defaultValue: T): T
declare function GM_setValue(key: string, value: any): void
declare function GM_registerMenuCommand(name: string, callback: () => void): void

declare const unsafeWindow: Window & typeof globalThis & {
  winning?: any
  __realConsole?: Console
  [key: string]: any
}

interface Window {
  __realConsole: any
  [key: string]: any
}
