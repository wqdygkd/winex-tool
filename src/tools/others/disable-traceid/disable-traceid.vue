<script setup lang="ts">
import { storageKey } from './disable-traceid.ts'

const storage: any = reactive(
  GM_getValue(storageKey, {
    enable: false,
  }),
)

const enable = ref(storage.enable)

watch(enable, (val) => {
  storage.enable = val
  GM_setValue(storageKey, storage)
})
</script>

<template>
  <el-checkbox v-model="enable" label="禁用请求添加traceid" />
</template>
