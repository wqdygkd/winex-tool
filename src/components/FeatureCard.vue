<script setup lang="ts">
const props = defineProps<{
  icon?: string
  title: string
  active?: boolean
}>()
</script>

<template>
  <div class="feature-card" :class="{ active }">
    <div class="feature-header">
      <span v-if="icon" class="feature-icon">{{ icon }}</span>
      <span class="feature-title">{{ title }}</span>
    </div>
    <slot />
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