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
  <div class="feature-card" :class="{ active: enable }">
    <div class="feature-header">
      <span class="feature-icon">🔐</span>
      <span class="feature-title">运维平台/运营中心关闭SleepWell登录</span>
    </div>
    <el-switch
      v-model="enable"
      inline-prompt
      active-text="启用"
      inactive-text="禁用"
      size="small"
    />
  </div>
</template>

<style scoped lang="scss">
.feature-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }

  &.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border-color: #667eea;
  }
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feature-icon {
  font-size: 20px;
}

.feature-title {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}
</style>
