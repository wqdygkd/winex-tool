// ==UserScript==
// @name         Winex助手(dev)
// @namespace    Winex
// @version      0.0.0
// @description  Winex助手
// @author       zhang333
// @match        ://*/*
// @grant        GM_addElement
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  'use strict'
  // source: https://cn.vitejs.dev/guide/backend-integration.html
  GM_addElement('script', {
    src: 'http://localhost:5173/@vite/client',
    type: 'module',
  })

  GM_addElement('script', {
    src: 'http://localhost:5173/src/main.ts',
    type: 'module',
  })

  // GM_registerMenuCommand('设置', function () {
  //   document.querySelector("#us-appRoot div").style.display = 'block'
  // })
})()
