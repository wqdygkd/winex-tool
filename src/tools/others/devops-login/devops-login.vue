<script setup lang="ts">
import { useGMStorageWithEnable } from '~/composables/useGMStorage'
import FeatureCard from '~/components/FeatureCard.vue'
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
  <FeatureCard
    icon="🔐"
    title="运维平台/运营中心关闭SleepWell登录"
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