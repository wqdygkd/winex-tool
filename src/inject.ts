const iframe = document.createElement('iframe')
iframe.style.width = '0'
iframe.style.height = '0'
iframe.style.border = 'none'
iframe.style.display = 'block'
document.body.append(iframe)
unsafeWindow.__realConsole = (iframe.contentWindow as Window & typeof globalThis).console

for (const item of ['log', 'info']) {
  Object.defineProperty(unsafeWindow.console, item, {
    get() {
      let real = unsafeWindow.__realConsole[item]
      let fake = unsafeWindow[`__fake${item}`]
      return GM_getValue('winex.console', false) ? real : fake || real
    },
    set(v) {
      unsafeWindow[`__fake${item}`] = v
    }
  })
}
