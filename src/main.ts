import '@wqdy/tool-core/src/utils/GM'
// import './inject.ts'

import { createApp } from 'vue'
import App from './App.vue'
import produceBuild from './hooks/winex-devops/produceBuild'
import products from './hooks/winex-devops/products'
import productManager from './hooks/winex-devops/productManager'
import 运维平台登录 from './hooks/winex-devops/运维平台登录'

const app = createApp(App)

const appRoot = unsafeWindow.document.createElement('div')
appRoot.id = 'winex-tool-appRoot'

function winexToolMount() {
  if (unsafeWindow.top === unsafeWindow.self) {
    let timer = setInterval(() => {
      if (unsafeWindow.document.documentElement) {
        unsafeWindow.document.documentElement.appendChild(appRoot)
        app.mount(`#${appRoot.id}`)
        clearInterval(timer)
      }
    }, 1000)
  }
}

if (location.host !== '172.16.0.197:8089') {
  winexToolMount()
} else {
  productManager()
  produceBuild()
  products()
}

if (location.host === '172.16.7.77:8089') {
  运维平台登录()
}
