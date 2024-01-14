// ==UserScript==
// @name         Your Script (dev mode)
// @namespace    https://your.site/
// @version      0.1.0
// @description  What does your script do
// @author       You
// @include *
// @match        ://*/*
// @grant        GM_addElement
// @noframes
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/npm/vue@3.2.6/dist/vue.global.min.js
// ==/UserScript==

(function () {
  'use strict'
  // source: https://cn.vitejs.dev/guide/backend-integration.html
  GM_addElement('script', {
    src: 'http://localhost:5173/@vite/client',
    type: 'module'
  }),
  GM_addElement('script', {
    src: 'http://localhost:5173/src/main.ts',
    type: 'module'
  })
})()
