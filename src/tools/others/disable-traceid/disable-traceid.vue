<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { storageKey } from './disable-traceid.ts'

const storage: any = reactive(
  GM_getValue(storageKey, {
    DisableTraceid: false,
  }),
)

const DisableTraceid = ref(storage.DisableTraceid)

watch(DisableTraceid, (val) => {
  storage.DisableTraceid = val
  GM_setValue(storageKey, storage)
})
</script>

<template>
  <el-checkbox v-model="DisableTraceid" label="禁用请求添加traceid" />
</template>
