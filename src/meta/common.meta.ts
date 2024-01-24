export default {
  name: 'Winex助手',
  namespace: 'Winex',
  version: '0.0.0',
  description: 'Winex助手',
  author: 'zhang333',
  match: ['://*/*'],
  'run-at': 'document-start',
  grant: ['unsafeWindow', 'GM_getValue', 'GM_setValue', 'GM_addElement', 'GM_registerMenuCommand'],
  require: ['https://cdn.jsdelivr.net/npm/vue@3.4.13/dist/vue.global.js'],
  icon: 'https://www.google.com/s2/favicons?domain=douyu.com'
}
