<script setup lang="ts">
import FeatureCard from '~/components/FeatureCard.vue'
import { useGMStorageWithEnable } from '~/composables/useGMStorage'
import { storageKey } from './show-identity-label'

const { enable } = useGMStorageWithEnable(storageKey, { enable: false })
</script>

<template>
  <FeatureCard
    icon="🏷️"
    title="显示 Identity 标签"
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