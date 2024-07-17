import '@wqdy/tool-core/src/utils/GM'
// import './inject.ts'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

const appRoot = unsafeWindow.document.createElement('div')
appRoot.id = 'winex-tool-appRoot'

function winexToolMount() {
  if (unsafeWindow.document.body) {
    unsafeWindow.document.body.appendChild(appRoot)
    app.mount(`#${appRoot.id}`)
    unsafeWindow.winexToolInited = true
  }
}

winexToolMount()
unsafeWindow.addEventListener('load', () => {
  if (!unsafeWindow.document.querySelector(`#${appRoot.id}`)) {
    winexToolMount()
  }
})
