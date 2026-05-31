<script setup lang="ts">
import FeatureCard from '~/components/FeatureCard.vue'
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
  <FeatureCard
    icon="📊"
    title="运维平台首页解锁权限"
    :active="enable"
  >
    <el-switch
      v-model="enable"
      inline-prompt
      active-text="启用"
      inactive-text="禁用"
      size="small"
    />
  </FeatureCard>
</template>
