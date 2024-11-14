<template>
  <el-button @click="copy">复制</el-button>
  <div v-for="item in storageList">
    {{ item.key }}
    <el-button @click="paust(item)">粘贴</el-button>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const storageKey = 'winex.storageCopy'
let storageList = reactive<any[]>(GM_getValue(storageKey, []) || [])
// watch(status, (newStatus) => {
//   GM_setValue(storageKey, newStatus)
// })

function copy() {
  debugger
  let host = location.host
  let currentStorage = storageList.find((item) => item.key === host)
  let current = {
    cookie: getCookie(),
    local: getLocalstorage(),
    session: getSessonstorage()
  }
  if (currentStorage) {
    currentStorage.value = current
  } else {
    storageList.unshift({
      key: host,
      value: current
    })
  }
  GM_setValue(storageKey, storageList)
}

function paust(item) {
  let { cookie, local, session } = item.value || {}
  setCookie(cookie)
  setLocalstorage(local)
  setSessonstorage(session)
}

function getCookie() {
  return document.cookie.split(';').map((item) => item.trim())
}
function setCookie(val) {
  val.forEach((item) => {
    unsafeWindow.document.cookie = item + '; path=/'
  })
}

function getLocalstorage() {
  let items = {}
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i)

    items[key] = localStorage.getItem(key)
  }
  return items
}
function setLocalstorage(val) {
  localStorage.clear()
  val = val || {}
  for (let key in val) {
    localStorage.setItem(key, val[key])
  }
}
function getSessonstorage() {
  let items = {}
  for (let i = 0; i < sessionStorage.length; i++) {
    let key = sessionStorage.key(i)
    if (key === 'GM_hook_winex.storageCopy') return
    items[key] = sessionStorage.getItem(key)
  }
  return items
}
function setSessonstorage(val) {
  sessionStorage.clear()
  val = val || {}
  for (let key in val) {
    sessionStorage.setItem(key, val[key])
  }
}
</script>
