import process from 'node:process'

const version = process.env.VITE_APP_VERSION || process.env.npm_package_version || '0.0.0'

export default {
  'name': 'Winex助手',
  'namespace': 'Winex',
  version,
  'description': 'Winex助手：读卡模拟，共享浏览器存储，密码同步',
  'author': 'zhang333',
  'match': ['://*/*'],
  'run-at': 'document-start',
  'grant': ['unsafeWindow', 'GM_getValue', 'GM_setValue', 'GM_registerMenuCommand'],
  'require': [
    'https://unpkg.com/vue@3.5.20/dist/vue.global.js',
    // 'https://cdn.bootcss.com/jquery/3.1.0/jquery.min.js',
    // 'https://unpkg.com/ajax-hook@3.0.3/dist/ajaxhook.min.js'
  ],
  'icon': 'https://weberp.winning.com.cn/favicon.ico',
}
