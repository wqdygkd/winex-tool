import process from 'node:process'

const version = process.env.VITE_APP_VERSION || process.env.npm_package_version || '0.0.0'

export default {
  'name': 'Winex助手',
  'namespace': 'Winex',
  version,
  'description': 'Winex助手：读卡模拟',
  'author': 'zhang333',
  'match': ['://*/*'],
  'run-at': 'document-start',
  'grant': ['unsafeWindow', 'GM_getValue', 'GM_setValue', 'GM_registerMenuCommand'],
  'icon': 'https://weberp.winning.com.cn/favicon.ico',
}
