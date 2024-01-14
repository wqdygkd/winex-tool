<template>
  <el-config-provider size="small">
    <el-checkbox v-model="status" label="启用" />
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const storageKey = 'winex.console'
let status = ref<boolean>(GM_getValue(storageKey, false))
watch(status, (newStatus) => {
  console.log('watch')
  GM_setValue(storageKey, newStatus)
})
</script>
