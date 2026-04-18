<template>
  <el-checkbox v-model="status" label="恢复默认console" />
</template>

<script setup lang="ts">
import { useGMStorage } from '~/composables/useGMStorage'

const status = useGMStorage('winex.console', false)
</script>
