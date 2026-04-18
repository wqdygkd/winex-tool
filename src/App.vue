<script setup lang="ts">
import FloatingButton from './components/FloatingButton.vue'
import ToolContent from './tools/ToolContent.vue'

const initialPositionX = ref(window.innerWidth - 60)

const dialogVisible = ref(false)

GM_registerMenuCommand('设置', () => {
  dialogVisible.value = true
})
</script>

<template>
  <el-config-provider namespace="wqdy" size="small" :z-index="20000">
    <FloatingButton
      v-model="dialogVisible"
      :initial-position="{ x: initialPositionX, y: 200 }"
    >
      <template #icon>
        <div class="floating-icon">
          winex
          <br>
          Tool
        </div>
      </template>
    </FloatingButton>

    <ToolContent v-model="dialogVisible" />
  </el-config-provider>
</template>

<style scoped lang="scss">
.floating-icon {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1.4;
  text-align: center;
}
</style>
