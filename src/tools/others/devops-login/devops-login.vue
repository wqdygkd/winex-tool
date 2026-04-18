<script setup lang="ts">
import { useGMStorageWithEnable } from '~/composables/useGMStorage'
import { urls } from '~/constants'
import { storageKey } from './devops-login'

const allUrls = [urls.devopsLogin, ...urls.devopsLoginAlternatives]
const { enable } = useGMStorageWithEnable(storageKey, { enable: false })

watch(enable, (val) => {
  if (val && allUrls.some(url => location.href.includes(url))) {
    location.reload()
  }
})
</script>

<template>
  <el-checkbox v-model="enable" label="运维平台/运营中心关闭SleepWell登录" />
</template>
