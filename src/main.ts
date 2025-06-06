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
  if (unsafeWindow.top === unsafeWindow && unsafeWindow.document.body) {
    unsafeWindow.document.body.appendChild(appRoot)
    app.mount(`#${appRoot.id}`)
  }
}

if (location.host !== '172.16.0.197:8089') {
  winexToolMount()
} else {
  productManager()
  produceBuild()
}
