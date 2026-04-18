<script setup lang="ts">
import DevopsDashboard from './devops-dashboard'
import DevopsLogin from './devops-login'
import DisableTraceid from './disable-traceid'
</script>

<template>
  <div class="others-container">
    <div class="others-grid">
      <DevopsLogin />
      <DevopsDashboard />
      <DisableTraceid />
    </div>
  </div>
</template>

<style scoped lang="scss">
.others-container {
  padding: 0;
}

.others-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
