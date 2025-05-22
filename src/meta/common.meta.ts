import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageJson = fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')
console.log()
export default {
  name: 'Winex助手',
  namespace: 'Winex',
  version: JSON.parse(packageJson).version,
  description: 'Winex助手：读卡模拟，共享浏览器存储，密码同步',
  author: 'zhang333',
  match: ['://*/*'],
  'run-at': 'document-start',
  grant: ['unsafeWindow', 'GM_getValue', 'GM_setValue', 'GM_registerMenuCommand'],
  require: [
    'https://cdn.jsdelivr.net/npm/vue@3.4.31/dist/vue.global.js'
    // 'https://cdn.bootcss.com/jquery/3.1.0/jquery.min.js',
    // 'https://unpkg.com/ajax-hook@3.0.3/dist/ajaxhook.min.js'
  ],
  icon: 'https://weberp.winning.com.cn/favicon.ico'
}
