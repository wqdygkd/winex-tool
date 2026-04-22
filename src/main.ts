import { createApp } from 'vue'

import App from './App.vue'
import { initAllTools } from './tools'
import './utils/GM'

// 初始化所有工具
initAllTools()

const app = createApp(App)

const appRoot = unsafeWindow.document.createElement('div')
appRoot.id = 'winex-tool-appRoot'

function winexToolMount() {
  if (unsafeWindow.top === unsafeWindow.self) {
    const timer = setInterval(() => {
      if (unsafeWindow.document.documentElement) {
        unsafeWindow.document.documentElement.appendChild(appRoot)
        app.mount(`#${appRoot.id}`)
        clearInterval(timer)
      }
    }, 1000)
  }
}

winexToolMount()
