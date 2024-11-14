<template>
  <el-config-provider namespace="wqdy" size="small" :zIndex="20000">
    <ToolBar v-model="dialogVisible"></ToolBar>

    <!-- <WinSearchHistory></WinSearchHistory> -->
    <ToolContent v-model="dialogVisible"></ToolContent>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import ToolBar from './components/ToolBar.vue'
import ToolContent from './components/ToolContent.vue'

const dialogVisible = ref(false)

unsafeWindow.winning = {
  ...unsafeWindow.winning,
  dispatchEvent(_: string, params: string, cb: Function) {
    let identityTypeCode = JSON.parse(params).body.identityTypeCode[0]
    console.log('读卡入参', JSON.parse(params).body)
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
    return randomMac()
  },
  getPcName() {
    return '0'
  },
  getIP() {
    return randomIp()
  },
  deltaResult() {
    return true
  },
  showMsg() {},
  postMessage() {}
}
function randomMac() {
  const mac = [
    Math.floor(Math.random() * 0xff).toString(16),
    Math.floor(Math.random() * 0xff).toString(16),
    Math.floor(Math.random() * 0xff).toString(16),
    Math.floor(Math.random() * 0xff).toString(16),
    Math.floor(Math.random() * 0xff).toString(16),
    Math.floor(Math.random() * 0xff).toString(16)
  ]
  return mac.join(':').toUpperCase()
}
function randomIp() {
  const ip = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
  return ip.join('.')
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
