<template>
  <el-button @click="copy">复制</el-button>
  <div v-for="item in storageList" :key="item.key">
    {{ item.key }}
    <el-button @click="paste(item)">粘贴</el-button>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const storageKey = 'winex.storageCopy'
const ignoreSessionKey = 'GM_hook_winex.storageCopy'

interface StorageItem {
  key: string
  value: {
    cookie: string[]
    local: Record<string, string | null>
    session: Record<string, string | null>
  }
}

const storageList = reactive<StorageItem[]>(GM_getValue(storageKey, []) || [])

function copy() {
  const host = location.host
  const index = storageList.findIndex(item => item.key === host)
  if (index !== -1) storageList.splice(index, 1)
  const value = {
    cookie: getCookie(),
    local: getStorage(localStorage),
    session: getStorage(sessionStorage, ignoreSessionKey)
  }
  storageList.unshift({ key: host, value })
  GM_setValue(storageKey, storageList)
}

function paste(item: StorageItem) {
  const { cookie, local, session } = item.value || {}
  setCookie(cookie)
  setStorage(localStorage, local)
  setStorage(sessionStorage, session)
}

function getCookie(): string[] {
  return document.cookie.split(';').map(item => item.trim())
}

function setCookie(val: string[] = []) {
  val.forEach(item => {
    unsafeWindow.document.cookie = item + '; path=/'
  })
}

function getStorage(
  storage: Storage,
  ignoreKey?: string
): Record<string, string | null> {
  const items: Record<string, string | null> = {}
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (!key || key === ignoreKey) continue
    items[key] = storage.getItem(key)
  }
  return items
}
function setStorage(storage: Storage, val: Record<string, string | null> = {}) {
  storage.clear()
  Object.entries(val).forEach(([key, value]) => {
    if (value !== null) storage.setItem(key, value)
  })
}
</script>
