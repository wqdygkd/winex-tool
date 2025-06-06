<template>
  <el-config-provider namespace="wqdy" size="small" :zIndex="20000">
    <FloatingButton
      v-model="dialogVisible"
      :initial-position="{ x: initialPositionX, y: 200 }"
    >
      <template #icon>
        <div style="font-size: 14px;">
          winex
          <br />
          Tool
        </div>
      </template>
    </FloatingButton>

    <!-- <WinSearchHistory></WinSearchHistory> -->
    <ToolContent v-model="dialogVisible"></ToolContent>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import FloatingButton from './components/FloatingButton.vue'
import ToolContent from './components/ToolContent.vue'

const initialPositionX = ref( window.innerWidth - 60)

const dialogVisible = ref(false)

unsafeWindow.winning = {
  ...unsafeWindow.winning,
  dispatchEvent(_: string, params: string, cb: Function) {
    console.log('读卡入参', JSON.parse(params).body)
    let identityTypeCode = JSON.parse(params).body?.identityTypeCode?.[0]
    if (!identityTypeCode) return
    let storageKey = `${__namespace}${identityTypeCode}`
    let data: any = GM_getValue(storageKey, {
      enable: false
    })
    if (data.enable) {
      console.log('读卡出参', data.current?.json)
      cb(JSON.stringify(data.current?.json || '请设置读卡出参'))
    } else {
      cb('"读卡模拟未启用"')
    }
  },
  getMacadress() {
    return '00:00:00:00:00:00'
  },
  getPcName() {
    return '-'
  },
  getIP() {
    return '0.0.0.0'
  },
  deltaResult() {
    return true
  },
  showMsg() {},
  postMessage() {}
}

GM_registerMenuCommand('设置', function () {
  dialogVisible.value = true
})
</script>

<style scoped lang="scss">
.container {
  height: 60vh !important;
}
</style>
