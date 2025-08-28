/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  __realConsole: any
  [key: string]: any
}

declare
{
  var __namespace: string
  var __APP_ENV__: string
}
