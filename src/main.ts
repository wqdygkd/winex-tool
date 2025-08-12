import '@wqdy/tool-core/src/utils/GM'
// import './inject.ts'

import { createApp } from 'vue'
import App from './App.vue'
import produceBuild from './hooks/winex-devops/produceBuild'
import productManager from './hooks/winex-devops/productManager'

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
}
