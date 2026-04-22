import { createApp } from 'vue'

import App from './App.vue'
import { initAllTools } from './tools/registry'

import './utils/GM'
// 导入并注册所有工具模块
import './tools/eventMock'
import './tools/others'
import './tools/param-mock'
import './tools/storage-copy'

import './tools/hotkey-patch'
import './tools/request-modify'

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
