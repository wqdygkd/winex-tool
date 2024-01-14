<template>
  <el-checkbox v-model="status" label="恢复默认console" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const storageKey = 'winex.console'
let status = ref<boolean>(GM_getValue(storageKey, false))
watch(status, (newStatus) => {
  GM_setValue(storageKey, newStatus)
})
</script>
