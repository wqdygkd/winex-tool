<script setup lang="ts">
import FeatureCard from '~/components/FeatureCard.vue'
import { useGMStorageWithEnable } from '~/composables/useGMStorage'
import { storageKey } from './disable-traceid'

const { enable } = useGMStorageWithEnable(storageKey, { enable: false })
</script>

<template>
  <FeatureCard
    icon="🔒"
    title="禁用请求添加 traceid"
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
