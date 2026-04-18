<script setup lang="ts">
import { useGMStorageWithEnable } from '~/composables/useGMStorage'
import { storageKey } from './disable-traceid.ts'

const { enable } = useGMStorageWithEnable(storageKey, { enable: false })
</script>

<template>
  <el-checkbox v-model="enable" label="禁用请求添加traceid" />
</template>
