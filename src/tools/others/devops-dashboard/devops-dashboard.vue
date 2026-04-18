<script setup lang="ts">
import { useGMStorageWithEnable } from '~/composables/useGMStorage'
import { urls } from '~/constants'
import { storageKey } from './devops-dashboard'

const { enable } = useGMStorageWithEnable(storageKey, { enable: false })

watch(enable, (val) => {
  if (val && location.href.includes(urls.devopsDashboard)) {
    location.reload()
  }
})
</script>

<template>
  <el-checkbox v-model="enable" label="运维平台首页解锁权限" />
</template>
