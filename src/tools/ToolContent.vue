<script setup lang="ts">
import EventMock from './eventMock'
import HeaderModify from './header-modify'
import HotkeyPatch from './hotkey-patch'
import Others from './others'
import ParamMock from './param-mock'
import StorageCopy from './storage-copy'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

const tabs = [
  { name: EventMock.name, component: EventMock, icon: '⚡' },
  { name: StorageCopy.name, component: StorageCopy, icon: '📦' },
  { name: ParamMock.name, component: ParamMock, icon: '🔧' },
  { name: HeaderModify.name, component: HeaderModify, icon: '📝' },
  { name: Others.name, component: Others, icon: '🎨' },
  { name: HotkeyPatch.name, component: HotkeyPatch, icon: '⌨️' },
]

const activeTab = ref(0)

// 自定义拖拽逻辑 - 允许拖拽到屏幕外
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

function getDialogEl(): HTMLElement | null {
  return document.querySelector('.wqdy-custom-dialog .wqdy-dialog') as HTMLElement | null
}

function startDrag(event: MouseEvent) {
  const dialogEl = getDialogEl()
  if (!dialogEl) return
  if (event.target instanceof Element && event.target.closest('.wqdy-dialog__headerbtn')) return
  if (event.target instanceof Element && event.target.closest('.reset-btn')) return

  isDragging.value = true

  const rect = dialogEl.getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }

  document.body.style.userSelect = 'none'

  const cleanupMove = useEventListener(document, 'mousemove', handleDrag)
  const cleanupUp = useEventListener(document, 'mouseup', () => {
    isDragging.value = false
    document.body.style.userSelect = ''
    cleanupMove()
    cleanupUp()
  })

  event.preventDefault()
}

function handleDrag(event: MouseEvent) {
  if (!isDragging.value) return

  const dialogEl = getDialogEl()
  if (!dialogEl) return

  const x = event.clientX - dragOffset.value.x
  const y = event.clientY - dragOffset.value.y

  dialogEl.style.position = 'fixed'
  dialogEl.style.left = `${x}px`
  dialogEl.style.top = `${y}px`
  dialogEl.style.margin = '0'
  dialogEl.style.transform = 'none'
}

// 重置位置
function resetPosition() {
  const dialogEl = getDialogEl()
  if (!dialogEl) return
  dialogEl.style.position = ''
  dialogEl.style.left = ''
  dialogEl.style.top = ''
  dialogEl.style.margin = ''
  dialogEl.style.transform = ''
}

// 处理双击事件 - 直接绑定到dialog元素
function setupDoubleClick() {
  const dialogEl = getDialogEl()
  if (!dialogEl) return

  dialogEl.addEventListener('dblclick', resetPosition)
}

function removeDoubleClick() {
  const dialogEl = getDialogEl()
  if (!dialogEl) return

  dialogEl.removeEventListener('dblclick', resetPosition)
}

// 打开时重置位置并添加双击监听
watch(dialogVisible, (val) => {
  if (val) {
    setTimeout(() => {
      resetPosition()
      setupDoubleClick()
    }, 100)
  } else {
    removeDoubleClick()
  }
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    width="80%"
    :modal="false"
    :close-on-click-modal="false"
    modal-class="wqdy-custom-dialog"
    class="modern-dialog"
  >
    <template #header>
      <div
        class="dialog-header"
        :class="{ isDragging }"
        @mousedown="startDrag"
      >
        <div class="header-content">
          <h2 class="dialog-title">
            <span class="title-icon">⚙️</span>
            Winex Tool 设置
          </h2>
          <p class="dialog-subtitle">
            开发辅助工具集
          </p>
        </div>
        <button
          class="reset-btn"
          title="重置位置"
          @click="resetPosition"
        >
          ↺
        </button>
      </div>
    </template>

    <div class="dialog-body">
      <div class="tabs-nav">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.name"
          class="tab-item"
          :class="{ active: activeTab === index }"
          @click="activeTab = index"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.name }}</span>
        </button>
      </div>

      <div class="tab-content">
        <Transition name="tab-fade" mode="out-in">
          <component :is="tabs[activeTab].component" :key="activeTab" />
        </Transition>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: grab;
  padding-right: 60px;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  cursor: grab;
}

.title-icon {
  font-size: 22px;
  cursor: grab;
}

.dialog-subtitle {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  cursor: grab;
}

.reset-btn {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 28px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.dialog-body {
  display: flex;
  min-height: 480px;
  background: #f8fafc;
}

.tabs-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 12px;
  background: #fff;
  border-right: 1px solid #e2e8f0;
  min-width: 140px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #64748b;
  text-align: left;

  &:hover {
    background: #f1f5f9;
    color: #334155;
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
  }
}

.tab-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.tab-label {
  flex: 1;
  font-weight: 500;
}

.tab-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: 480px;
}

// Tab transition
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
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
    border-radius: 12px;
    overflow: hidden;
    border: none;
    padding: 0;
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(0, 0, 0, 0.05);
  }

  .wqdy-dialog__header {
    padding: 20px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px 12px 0 0;
    margin: 0;
  }

  .wqdy-dialog__headerbtn {
    top: 20px;
    right: 20px;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .wqdy-dialog__close {
      color: #fff;
      font-size: 16px;
    }
  }
}
</style>
