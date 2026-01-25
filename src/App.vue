<script setup lang="ts">
import FloatingButton from './components/FloatingButton.vue'
import ToolContent from './tools/ToolContent.vue'

const initialPositionX = ref(window.innerWidth - 60)

const dialogVisible = ref(false)
type CallbackFunction = (result: string) => void
unsafeWindow.winning = {
  ...unsafeWindow.winning,
  dispatchEvent(eventId: string, params: string, cb: CallbackFunction) {
    if (unsafeWindow.enablePrinter && eventId === '399563027') {
      return cb(`{"success":true,"data":["Microsoft Print to PDF"]}`)
    }
    if (eventId === '399696844') {
      return cb(`{"success":true}`)
    }
    if (eventId === '399696845') {
      return cb(`{"success":true}`)
    }
    const paramsObj = typeof params === 'string' ? JSON.parse(params) : params
    console.warn('dispatchEvent', `事件id${eventId}`, '入参:', paramsObj?.body)
    const identityTypeCode = paramsObj.body?.identityTypeCode?.[0]
    if (!identityTypeCode) cb('"{}"')
    const storageKey = `${__namespace}${identityTypeCode}`
    const data: any = GM_getValue(storageKey, {
      enable: false,
    })
    if (data.enable) {
      console.warn('dispatchEvent', `事件id${eventId}`, '出参:', data.current?.json)
      cb(JSON.stringify(data.current?.json || '请设置读卡出参'))
    }
    else {
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
  postMessage() {},
}

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
        <div style="font-size: 14px;">
          winex
          <br>
          Tool
        </div>
      </template>
    </FloatingButton>

    <!-- <WinSearchHistory></WinSearchHistory> -->
    <ToolContent v-model="dialogVisible" />
  </el-config-provider>
</template>

<style scoped lang="scss">
.container {
  height: 60vh !important;
}
</style>
