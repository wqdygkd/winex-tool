<script setup lang="ts">
import { ref } from 'vue'

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

const storageList = ref<StorageItem[]>(GM_getValue(storageKey, []) || [])

function persist() {
  GM_setValue(storageKey, storageList.value)
}

function copy() {
  const host = location.host
  const index = storageList.value.findIndex(item => item.key === host)
  if (index !== -1) storageList.value.splice(index, 1)
  const value = {
    cookie: getCookie(),
    local: getStorage(localStorage),
    session: getStorage(sessionStorage, ignoreSessionKey),
  }
  storageList.value.unshift({ key: host, value })
  persist()
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
  val.forEach((item) => {
    unsafeWindow.document.cookie = `${item}; path=/`
  })
}

function getStorage(
  storage: Storage,
  ignoreKey?: string,
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
    if (value !== null)
      storage.setItem(key, value)
  })
}

function deleteItem(item: StorageItem) {
  const index = storageList.value.findIndex(({ key }) => key === item.key)
  if (index === -1) return
  storageList.value.splice(index, 1)
  persist()
}

function deleteAll() {
  if (!storageList.value.length) return
  storageList.value.splice(0, storageList.value.length)
  persist()
}
</script>

<template>
  <div class="storage-copy">
    <p class="tip">
      用于不同页面间克隆 Storage。
      在 A 页面点击「复制」，到 B 页面点击「粘贴」即可同步 Cookie / LocalStorage / SessionStorage。
    </p>

    <div class="actions">
      <el-button type="primary" @click="copy">
        复制
      </el-button>
      <el-button type="danger" plain @click="deleteAll">
        清空全部
      </el-button>
    </div>

    <el-empty v-if="!storageList.length" description="暂无已保存的存储" />

    <el-card
      v-for="item in storageList"
      :key="item.key"
      class="card"
      shadow="never"
    >
      <div class="card__row">
        <div class="card__info">
          <span class="host">{{ item.key }}</span>
          <div class="counts">
            <span class="count">Cookie {{ item.value.cookie.length }}</span>
            <span class="count">Local {{ Object.keys(item.value.local).length }}</span>
            <span class="count">Session {{ Object.keys(item.value.session).length }}</span>
          </div>
        </div>
        <div class="card__buttons">
          <el-button size="small" @click="paste(item)">
            粘贴
          </el-button>
          <el-button size="small" type="danger" plain @click="deleteItem(item)">
            删除
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.storage-copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tip {
  color: #666;
  line-height: 1.6;
  margin: 0;
}
.actions {
  display: flex;
  gap: 8px;
}
::v-deep .card {
  border-radius: 8px;
  .wqdy-card__body {
    padding: 3px 10px;
  }
}
.card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.card__info {
  display: flex;
  gap: 6px;
}
.host {
  flex: 1;
  word-break: break-all;
}
.counts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  color: #666;
  font-size: 12px;
}
.count {
  padding: 2px 6px;
  border-radius: 10px;
  background: #f5f7fa;
}
.card__buttons {
  display: flex;
  gap: 6px;
}
</style>
