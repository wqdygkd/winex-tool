<template>
  <el-config-provider namespace="wqdy" size="small">
    <el-dialog v-model="dialogVisible" title="设置" width="800px" draggable :modal="false" :close-on-click-modal="false">
      <!-- <Console /> -->
      <el-container style="height: 100%">
        <el-tabs :tab-position="tabPosition">
          <el-tab-pane label="winex">
            <el-tabs>
              <el-tab-pane label="console">
                <Console />
              </el-tab-pane>
              <el-tab-pane label="医保卡">
                <Suspense>
                  <Card type="399297247"></Card>
                </Suspense>
              </el-tab-pane>
              <el-tab-pane label="身份证">
                <Suspense>
                  <Card type="399626992"></Card>
                </Suspense>
              </el-tab-pane>
              <!-- <el-tab-pane label="身份证">
                <Card type="identityCard"></Card>
              </el-tab-pane> -->
              <!-- <el-tab-pane label="永居证">
                <Card type="identityCard"></Card>
              </el-tab-pane> -->
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-container>
    </el-dialog>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Console from './components/console.vue'
import Card from './components/card.vue'
const dialogVisible = ref(true)
const tabPosition = ref('left')

GM_registerMenuCommand('设置', function () {
  dialogVisible.value = true
})

unsafeWindow.winning = {
  ...unsafeWindow.winning,
  dispatchEvent(id: string, params: string, cb: Function) {
    console.log('读卡方式id', id)
    console.log('读卡入参', JSON.parse(params).body)
    let storageKey = `${__namespace}${id}`
    let data: any = GM_getValue(storageKey, {
      enable: false
    })
    if (data.enable) {
      console.log('读卡出参', data.current.json)
      cb(JSON.stringify(data.current.json))
    } else {
      ElMessage({
        message: '请在WINEX环境中使用',
        type: 'warning'
      })
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
</script>

<style scoped></style>
