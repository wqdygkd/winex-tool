import { createApp } from 'vue'

import App from './App.vue'
import { initAllTools } from './tools'
import './utils/GM'

initAllTools()

const app = createApp(App)

const appRoot = unsafeWindow.document.createElement('div')
appRoot.id = 'winex-tool-appRoot'

function winexToolMount() {
  if (unsafeWindow.top !== unsafeWindow.self) return

  const doc = unsafeWindow.document
  if (doc.documentElement) {
    doc.documentElement.appendChild(appRoot)
    app.mount(`#${appRoot.id}`)
    return
  }

  // DOM 未就绪时使用 MutationObserver 等待
  const observer = new MutationObserver(() => {
    if (doc.documentElement) {
      observer.disconnect()
      doc.documentElement.appendChild(appRoot)
      app.mount(`#${appRoot.id}`)
    }
  })
  observer.observe(doc, { childList: true })
}

winexToolMount()
