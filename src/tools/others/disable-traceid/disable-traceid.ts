export const storageKey = `${__namespace}DisableTraceid`

export function init() {
  const storage = GM_getValue(storageKey, {
    enable: false,
  })

  if (!storage.enable) return

  const hookedKey = Symbol.for('url-search-params-set-hooked')
  const proto = unsafeWindow.URLSearchParams.prototype as URLSearchParams & Record<symbol, boolean>

  if (!proto[hookedKey]) {
    const originalSet = proto.set
    proto.set = function (key, value) {
      if (String(key).toLowerCase() === 'traceid') {
        return
      }
      return originalSet.call(this, key, value)
    }
    Object.defineProperty(proto, hookedKey, {
      value: true,
    })
  }
}
