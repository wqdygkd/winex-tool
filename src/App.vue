<template>
  <el-config-provider namespace="wqdy">

    <el-dialog v-model="dialogVisible" title="Tips" width="30%" draggable :modal="false" :close-on-click-modal="false">
      <Console />

    <span>It's a draggable Dialog</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
  </el-config-provider>


</template>

<script setup lang="ts">
import { ref } from 'vue'
import Console from './components/console.vue'
const dialogVisible = ref(true)

</script>

<style scoped>

</style>
