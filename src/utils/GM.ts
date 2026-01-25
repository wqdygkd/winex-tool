function GM_getValue(key: string, defaultValue: any) {
  return JSON.parse(sessionStorage.getItem(`GM_hook_${key}`) as string) || defaultValue
}
function GM_setValue(key: string, value: any) {
  sessionStorage.setItem(`GM_hook_${key}`, JSON.stringify(value))
}

if (import.meta.env.MODE !== 'production') {
  window.unsafeWindow = window as typeof unsafeWindow
  window.GM_getValue = GM_getValue
  window.GM_setValue = GM_setValue
  window.GM_registerMenuCommand = (() => {}) as any
}
