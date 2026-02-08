import { createApp } from 'vue'
// import './inject.ts'

import App from './App.vue'
import { EventMockInit } from './tools/eventMock'
// import produceBuild from './hooks/winex-devops/produceBuild'
// import products from './hooks/winex-devops/products'
// import productManager from './hooks/winex-devops/productManager'
// import 运营平台登录, { url as 运营平台登录url } from './hooks/winex-devops/运营平台登录'
import { OthersInit } from './tools/others'

import './utils/GM'

EventMockInit()
OthersInit()

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
