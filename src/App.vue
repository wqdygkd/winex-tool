<template>
  <el-config-provider namespace="wqdy" size="small" :zIndex="20000">
    <el-dialog
      v-model="dialogVisible"
      title="设置"
      width="80%"
      draggable
      :modal="false"
      :close-on-click-modal="false"
      modal-class="wqdy-custom-dialog"
    >
      <!-- <Console /> -->
      <el-container style="height: 100%" class="container">
        <el-tabs :tab-position="tabPosition">
          <!-- <el-tab-pane label="winex"> -->
          <!-- <el-tabs> -->
          <el-tab-pane label="信息">
            <Info />
          </el-tab-pane>
          <el-tab-pane label="console">
            <Console />
          </el-tab-pane>
          <el-tab-pane label="医保卡">
            <Suspense>
              <Card identityTypeCode="152691"></Card>
            </Suspense>
          </el-tab-pane>
          <el-tab-pane label="身份证">
            <Suspense>
              <Card identityTypeCode="152695"></Card>
            </Suspense>
          </el-tab-pane>
          <el-tab-pane label="永居证">
            <Suspense>
              <Card identityTypeCode="399668724"></Card>
            </Suspense>
          </el-tab-pane>
          <!-- <el-tab-pane label="身份证">
                <Suspense>
                  <Card type="399626992"></Card>
                </Suspense>
              </el-tab-pane> -->
          <!-- <el-tab-pane label="身份证">
                <Card type="identityCard"></Card>
              </el-tab-pane> -->
          <!-- <el-tab-pane label="永居证">
                <Card type="identityCard"></Card>
              </el-tab-pane> -->
          <!-- </el-tabs> -->
          <!-- </el-tab-pane> -->
        </el-tabs>
      </el-container>
    </el-dialog>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Console from './components/console.vue'
import Info from './components/info.vue'
import Card from './components/card.vue'
const dialogVisible = ref(false)
const tabPosition = ref('left')

GM_registerMenuCommand('设置', function () {
  dialogVisible.value = true
})

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
  showMsg() {}
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

onMounted(async () => {
  document.querySelector('.main-tool.tool-btn')?.addEventListener('click', () => {
    dialogVisible.value = !dialogVisible.value
  })
})
</script>

<style scoped lang="scss">
.container {
  height: 60vh !important;
}

.wqdy-custom-dialog {
  pointer-events: none;
  .wqdy-overlay-dialog {
    pointer-events: none;
  }
  .wqdy-dialog {
    pointer-events: auto;
  }
}
</style>
<style lang="scss">
.wqdy-custom-dialog {
  pointer-events: none;
  .wqdy-overlay-dialog {
    pointer-events: none;
  }
  .wqdy-dialog {
    pointer-events: auto;
  }
}
</style>
