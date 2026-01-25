<script setup lang="ts">
import { storageKey, urls } from './devops-login'

const storage: any = reactive(
  GM_getValue(storageKey, {
    enable: false,
  }),
)

const enable = ref(storage.enable)

watch(enable, (val) => {
  storage.enable = val
  GM_setValue(storageKey, storage)
  if (urls.some(url => location.href.includes(url))) {
    location.reload()
  }
})
</script>

<template>
  <el-checkbox v-model="enable" label="运维平台/运营中心关闭SleepWell登录" />
</template>
