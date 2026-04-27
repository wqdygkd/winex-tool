export const storageKey = `${__namespace}DisableTraceid`

export function init() {
  const storage = GM_getValue(storageKey, {
    enable: false,
  })

  if (!storage.enable) return

  const searchParamsSetHookedKey = Symbol.for('url-search-params-set-hooked')
  const urlToStringHookedKey = Symbol.for('url-to-string-hooked')
  const proto = unsafeWindow.URLSearchParams.prototype as URLSearchParams & Record<symbol, boolean>
  const urlProto = unsafeWindow.URL.prototype as URL & Record<symbol, boolean>

  if (!proto[searchParamsSetHookedKey]) {
    const originalSet = proto.set
    proto.set = function (key, value) {
      if (String(key).toLowerCase() === 'traceid') {
        return
      }
      return originalSet.call(this, key, value)
    }
    Object.defineProperty(proto, searchParamsSetHookedKey, {
      value: true,
    })
  }

  if (!urlProto[urlToStringHookedKey]) {
    const originalToString = urlProto.toString
    urlProto.toString = function () {
      const url = new unsafeWindow.URL(originalToString.call(this))
      Array.from(url.searchParams.keys()).forEach((key) => {
        if (key.toLowerCase() === 'traceid') {
          url.searchParams.delete(key)
        }
      })
      return originalToString.call(url)
    }
    Object.defineProperty(urlProto, urlToStringHookedKey, {
      value: true,
    })
  }
}
