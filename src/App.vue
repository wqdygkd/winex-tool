<template>
  <el-config-provider namespace="wqdy" size="small" :zIndex="20000">
    <div v-if="isShowWinexToolBtn" class="winex-tool-btn" draggable="true" @mousedown="handleMouseDown" @mouseup="handleMouseUp" :style="winexToolBtnStyle">
      winex
      <br />
      Tool
    </div>

    <WinSearchHistory></WinSearchHistory>

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
        <el-tabs tab-position="left">
          <!-- <el-tab-pane label="winex"> -->
          <!-- <el-tabs> -->
          <el-tab-pane label="信息">
            <Info />
          </el-tab-pane>
          <!-- <el-tab-pane label="console">
            <Console />
          </el-tab-pane> -->
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
          <el-tab-pane label="存储storage">
            <Suspense>
              <StorageCopy></StorageCopy>
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
import { ref, onMounted, computed, reactive } from 'vue'
import { throttle } from 'lodash-es'

import useWindowResize from './useWindowResize'
import Console from './components/console.vue'
import Info from './components/info.vue'
import Card from './components/card.vue'
import WinSearchHistory from './components/WinSearchHistory.vue'
import StorageCopy from './components/StorageCopy.vue'

const dialogVisible = ref(false)

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

const isShowWinexToolBtn = ref(false)

onMounted(async () => {
  document.querySelector('.main-tool.tool-btn')?.addEventListener('click', () => {
    dialogVisible.value = !dialogVisible.value
  })
  if (!unsafeWindow.parent.winexToolInited) {
    isShowWinexToolBtn.value = true
  }
})

let padding = ref(10)
const winexToolBtnPosition = reactive({
  top: 200,
  right: 0 + padding.value
})

const isMouseMove = ref(false)
const winexToolBtnStyle = computed(() => {
  const { top, right } = winexToolBtnPosition
  const style = {
    top: `${top}px`,
    right: `${right}px`
  }
  return style
})

const { width, height } = useWindowResize()

// 创建顶层mask
const mask = document.createElement('div')
mask.style.cssText = 'position: absolute;top: 0;left: 0;width: 100vw;height: 100vh;z-index: 9999;'
mask.setAttribute('id', 'mousemoveMask')

function handleMouseDown(e: MouseEvent) {
  const pad = padding.value
  const btn: HTMLDivElement = document.querySelector('.winex-tool-btn')!
  const oH = btn.offsetHeight
  const oW = btn.offsetWidth

  const iH = height.value
  const iW = width.value

  const { top, right } = winexToolBtnPosition
  const startY = e.clientY
  const startX = e.clientX

  const _dragHandler = throttle((ev) => {
    isMouseMove.value = true
    const nTop = top + ev.clientY - startY
    const nRight = right - ev.clientX + startX
    winexToolBtnPosition.top = nTop < pad ? pad : nTop > iH - oH - pad ? iH - oH - pad : nTop
    winexToolBtnPosition.right = nRight < pad ? pad : nRight > iW - oW - pad ? iW - oW - pad : nRight
  })

  document.body.append(mask)

  mask.addEventListener('mousemove', _dragHandler)
  mask.addEventListener('mouseup', () => {
    mask.removeEventListener('mousemove', _dragHandler)
    setTimeout(() => {
      isMouseMove.value = false
      mask.remove()
    }, 300)
  })
  e.preventDefault()
}
function handleMouseUp() {
  if (!isMouseMove.value) {
    dialogVisible.value = true
  }
  mask.remove()
}
</script>

<style scoped lang="scss">
.container {
  height: 60vh !important;
}

.winex-tool-btn {
  position: absolute;
  text-align: center;
  background: var(--COLOR-NORMAL, #2d5afa);
  color: #fff;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  z-index: 20000;
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
