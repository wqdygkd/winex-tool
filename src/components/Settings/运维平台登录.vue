<template>
  <el-checkbox v-model="enable" label="运维平台关闭SleepWell登录" />
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { storageKey } from '../../hooks/winex-devops/运维平台登录'

let storage: any = reactive(
  GM_getValue(storageKey, {
    enable: false
  })
)

const enable = ref(storage.enable)

watch(enable, (val) => {
  storage.enable = val
  GM_setValue(storageKey, storage)
  location.reload()
})
</script>
