import process from 'node:process'
import type { UserScriptMetadata } from './types'

const version = process.env.npm_package_version || '0.0.0'

const commonMeta: UserScriptMetadata = {
  name: 'Winex助手',
  namespace: 'Winex',
  version,
  description: 'Winex助手：读卡模拟、参数模拟、请求修改等开发辅助工具集',
  author: 'zhang333',
  homepage: 'https://github.com/wqdygkd/winex-tool',
  license: 'MIT',
  icon: 'https://weberp.winning.com.cn/favicon.ico',
  'run-at': 'document-start',
  noframes: true,
  grant: [
    'unsafeWindow',
    'GM_getValue',
    'GM_setValue',
    'GM_registerMenuCommand',
    'GM_addStyle',
    'GM_addElement',
    'GM_info',
  ],
}

export default commonMeta