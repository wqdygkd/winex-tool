function GM_getValue(key: string, defaultValue: any) {
  const stored = localStorage.getItem(`GM_hook_${key}`)
  if (stored === null) return defaultValue
  try {
    return JSON.parse(stored)
  } catch {
    return defaultValue
  }
}

function GM_setValue(key: string, value: any) {
  localStorage.setItem(`GM_hook_${key}`, JSON.stringify(value))
}

// 开发环境 或 普通脚本模式 下模拟 GM API
if (import.meta.env.MODE !== 'production' || __PLAIN_SCRIPT__) {
  window.unsafeWindow = window as typeof unsafeWindow
  window.GM_getValue = GM_getValue
  window.GM_setValue = GM_setValue
  window.GM_registerMenuCommand = (() => {}) as any
}
