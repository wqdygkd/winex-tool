<template>
  <div
    v-if="isShowWinexToolBtn"
    class="winex-tool-btn"
    draggable="true"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    :style="winexToolBtnStyle"
  >
    winex
    <br />
    Tool
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { throttle } from 'lodash-es'
import useWindowResize from '../hooks/useWindowResize'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const isShowWinexToolBtn = ref(false)

onMounted(() => {
  if (unsafeWindow.parent === unsafeWindow || !unsafeWindow.parent.winexToolInited) {
    console.log(222)
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
mask.style.cssText = 'position: absolute;top: 0;left: 0;width: 100vw;height: 100vh;z-index: 99999999;'
mask.setAttribute('id', 'mousemoveMask')

function handleMouseDown(e: MouseEvent) {
  const pad = padding.value
  const btn: HTMLDivElement = document.querySelector('.winex-tool-btn')
  const oH = btn.offsetHeight
  const oW = btn.offsetWidth

  const iH = height.value
  const iW = width.value

  const { top, right } = winexToolBtnPosition
  const startY = e.clientY
  const startX = e.clientX

  const _dragHandler = throttle((ev) => {
    console.log(ev)
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
  console.log(12)
  if (!isMouseMove.value) {
    console.log(13)
    emit('update:modelValue', true)
  }
  // mask.remove()
}
</script>

<style scoped lang="scss">
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
