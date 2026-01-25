<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { storageKey, url } from './devops-dashboard'

const storage: any = reactive(
  GM_getValue(storageKey, {
    enable: false,
  }),
)

const enable = ref(storage.enable)

watch(enable, (val) => {
  storage.enable = val
  GM_setValue(storageKey, storage)
  if (location.href.includes(url)) {
    location.reload()
  }
})
</script>

<template>
  <el-checkbox v-model="enable" label="运维平台首页解锁权限" />
</template>
