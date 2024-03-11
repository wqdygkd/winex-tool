export default {
  name: 'Winex助手',
  namespace: 'Winex',
  version: '0.0.0',
  description: 'Winex助手',
  author: 'zhang333',
  match: ['://*/*'],
  'run-at': 'document-start',
  grant: ['unsafeWindow', 'GM_getValue', 'GM_setValue', 'GM_registerMenuCommand'],
  require: ['https://cdn.jsdelivr.net/npm/vue@3.4.20/dist/vue.global.js'],
  icon: 'https://weberp.winning.com.cn/favicon.ico'
}
