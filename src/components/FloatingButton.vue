<script setup lang="ts">
interface Position {
  x: number
  y: number
}
const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    initialPosition?: Position
    minDistance?: number
  }>(),
  {
    modelValue: false,
    initialPosition: () => ({ x: 20, y: 20 }),
    minDistance: 10,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'dragStart'): void
  (e: 'dragEnd', position: Position): void
}>()

const padding = ref(10)

// 状态管理
const visible = ref(false)
const isDragging = ref(false)
const buttonRef = ref<HTMLElement | null>(null)
const position = ref<Position>({ ...props.initialPosition })
const dragStartPos = ref<Position>({ x: 0, y: 0 })
const buttonStartPos = ref<Position>({ x: 0, y: 0 })

// 窗口尺寸
const { width: windowWidth, height: windowHeight } = useWindowSize()

// 监听窗口大小变化
watch(
  [windowWidth, windowHeight],
  ([newWidth, newHeight]) => {
    if (!newWidth || !newHeight) return
    // 确保按钮在窗口范围内
    if (buttonRef.value) {
      const buttonRect = buttonRef.value.getBoundingClientRect()
      position.value = {
        x: Math.min(position.value.x, newWidth - buttonRect.width - padding.value),
        y: Math.min(position.value.y, newHeight - buttonRect.height - padding.value),
      }
    }
  },
  { immediate: true },
)

// 计算按钮样式
const buttonStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px)`,
}))

// 开始拖动
function startDrag(event: MouseEvent) {
  if (!buttonRef.value) return

  isDragging.value = true
  dragStartPos.value = { x: event.clientX, y: event.clientY }
  buttonStartPos.value = { ...position.value }

  emit('dragStart')

  // 添加全局事件监听
  const cleanupMove = useEventListener(document, 'mousemove', handleDrag)
  const cleanupUp = useEventListener(document, 'mouseup', () => {
    stopDrag()
    cleanupMove()
    cleanupUp()
  })

  event.preventDefault()
}

// 处理拖动
function handleDrag(event: MouseEvent) {
  if (!isDragging.value) return
  if (!buttonRef.value) return

  const deltaX = event.clientX - dragStartPos.value.x
  const deltaY = event.clientY - dragStartPos.value.y

  // 计算新位置
  let newX = buttonStartPos.value.x + deltaX
  let newY = buttonStartPos.value.y + deltaY

  // 获取按钮尺寸
  const buttonRect = buttonRef.value.getBoundingClientRect()

  // 限制在窗口范围内
  newX = Math.max(0, Math.min(newX, windowWidth.value - buttonRect.width))
  newY = Math.max(0, Math.min(newY, windowHeight.value - buttonRect.height))

  position.value = { x: newX, y: newY }
}

// 停止拖动
function stopDrag() {
  if (!isDragging.value) return

  isDragging.value = false
  emit('dragEnd', position.value)
}

// 处理点击
function handleClick(event: MouseEvent) {
  // 如果拖动距离小于最小距离，则视为点击
  const dragDistance = Math.sqrt((event.clientX - dragStartPos.value.x) ** 2 + (event.clientY - dragStartPos.value.y) ** 2)

  if (dragDistance < props.minDistance) {
    emit('update:modelValue', !props.modelValue)
  }
}

// 生命周期钩子
onMounted(() => {
  visible.value = true
})

onUnmounted(() => {
  // 不需要在这里清理事件监听，因为 useEventListener 会自动处理
})
</script>

<template>
  <Teleport to="body">
    <div
      v-show="visible"
      ref="buttonRef"
      class="floating-button"
      :class="{ 'is-dragging': isDragging }"
      :style="buttonStyle"
      @mousedown="startDrag"
      @click="handleClick"
    >
      <slot>
        <span class="floating-button__icon">
          <slot name="icon">+</slot>
        </span>
      </slot>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.floating-button {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--COLOR-NORMAL, #409eff);
  color: #fff;
  border-radius: 50%;
  cursor: move;
  user-select: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 20000;

  &:hover {
    transform: scale(1.05) translate(var(--x), var(--y));
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95) translate(var(--x), var(--y));
  }

  &.is-dragging {
    cursor: grabbing;
    opacity: 0.8;
    transition: none;
  }

  &__icon {
    font-size: 24px;
    line-height: 1;
  }
}
</style>
