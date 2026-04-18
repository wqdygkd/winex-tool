<script setup lang="ts">
import { useGMStorage } from '~/composables/useGMStorage'

const ignoreSessionKey = 'GM_hook_winex.storageCopy'

interface StorageItem {
  key: string
  value: {
    cookie: string[]
    local: Record<string, string | null>
    session: Record<string, string | null>
  }
}

const { data: storageList, save } = useGMStorage<StorageItem[]>('winex.storageCopy', [], { autoSave: false })

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
  save()
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
  save()
}

function deleteAll() {
  if (!storageList.value.length) return
  storageList.value.splice(0, storageList.value.length)
  save()
}
</script>

<template>
  <div class="storage-copy">
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

<style scoped lang="scss">
.storage-copy {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
}

.actions {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }

  :deep(.wqdy-card__body) {
    padding: 16px 20px;
  }
}

.card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.card__info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.host {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  word-break: break-all;
}

.counts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.count {
  padding: 4px 10px;
  border-radius: 6px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

.card__buttons {
  display: flex;
  gap: 8px;
}

:deep(.wqdy-empty) {
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
</style>
