export const storageKey = `${__namespace}DisableTraceid`

export function init() {
  const storage = GM_getValue(storageKey, {
    enable: false,
  })

  if (storage.enable) {
    const iframe = document.createElement('iframe')
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    iframe.style.display = 'block'

    const timer = setInterval(() => {
      if (document.body) {
        document.body.append(iframe)
        unsafeWindow.XMLHttpRequest.prototype.open = (iframe.contentWindow as Window & typeof globalThis).XMLHttpRequest.prototype.open
        clearInterval(timer)
      }
    }, 50)
  }
}
