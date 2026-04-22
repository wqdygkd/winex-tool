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

const visible = ref(false)
const isDragging = ref(false)
const isHovered = ref(false)
const buttonRef = ref<HTMLElement | null>(null)
const position = ref<Position>({ ...props.initialPosition })
const dragStartPos = ref<Position>({ x: 0, y: 0 })
const buttonStartPos = ref<Position>({ x: 0, y: 0 })

const { width: windowWidth, height: windowHeight } = useWindowSize()

// 直接用 computed 生成 transform 样式
const transformStyle = computed(() => `translate(${position.value.x}px, ${position.value.y}px)`)

watch(
  [windowWidth, windowHeight],
  ([newWidth, newHeight]) => {
    if (!newWidth || !newHeight) return
    const buttonSize = 56
    position.value = {
      x: Math.min(position.value.x, newWidth - buttonSize - padding.value),
      y: Math.min(position.value.y, newHeight - buttonSize - padding.value),
    }
  },
  { immediate: true },
)

function startDrag(event: MouseEvent) {
  isDragging.value = true
  dragStartPos.value = { x: event.clientX, y: event.clientY }
  buttonStartPos.value = { ...position.value }

  emit('dragStart')

  document.body.style.userSelect = 'none'

  const cleanupMove = useEventListener(document, 'mousemove', handleDrag)
  const cleanupUp = useEventListener(document, 'mouseup', () => {
    stopDrag()
    cleanupMove()
    cleanupUp()
    document.body.style.userSelect = ''
  })

  event.preventDefault()
}

function handleDrag(event: MouseEvent) {
  if (!isDragging.value) return

  const deltaX = event.clientX - dragStartPos.value.x
  const deltaY = event.clientY - dragStartPos.value.y

  const buttonSize = 56

  position.value = {
    x: Math.max(0, Math.min(buttonStartPos.value.x + deltaX, windowWidth.value - buttonSize)),
    y: Math.max(0, Math.min(buttonStartPos.value.y + deltaY, windowHeight.value - buttonSize)),
  }
}

function stopDrag() {
  if (!isDragging.value) return

  isDragging.value = false
  emit('dragEnd', position.value)
}

function handleClick(event: MouseEvent) {
  const dragDistance = Math.sqrt((event.clientX - dragStartPos.value.x) ** 2 + (event.clientY - dragStartPos.value.y) ** 2)

  if (dragDistance < props.minDistance) {
    emit('update:modelValue', !props.modelValue)
  }
}

onMounted(() => {
  // 延迟显示，确保位置已正确
  requestAnimationFrame(() => {
    visible.value = true
  })
})
</script>

<template>
  <Teleport to="body">
    <Transition name="float-button">
      <div
        v-show="visible"
        ref="buttonRef"
        class="floating-button"
        :class="{ 'is-dragging': isDragging, 'is-active': modelValue }"
        :style="{ transform: transformStyle }"
        @mousedown="startDrag"
        @click="handleClick"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <div class="floating-button__glow" />
        <slot>
          <span class="floating-button__icon">
            <slot name="icon">+</slot>
          </span>
        </slot>
      </div>
    </Transition>
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
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%);
  color: #fff;
  border-radius: 16px;
  cursor: grab;
  user-select: none;
  z-index: 20000;
  overflow: hidden;

  // Glassmorphism effect
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 32px rgba(99, 102, 241, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;

  // 只对非 transform 属性使用 transition
  transition:
    box-shadow 0.3s ease,
    background 0.3s ease,
    opacity 0.2s ease;

  // 拖动时无 transition，其他状态有 transition
  &:not(.is-dragging) {
    transition:
      box-shadow 0.3s ease,
      background 0.3s ease,
      opacity 0.2s ease,
      transform 0.3s ease;
  }

  &__glow {
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%);
    border-radius: 18px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
    filter: blur(8px);
    pointer-events: none;
  }

  &__icon {
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    line-height: 1.3;
    letter-spacing: 0.5px;
    pointer-events: none;
  }

  &:hover:not(.is-dragging) {
    cursor: grab;

    .floating-button__glow {
      opacity: 1;
    }

    box-shadow:
      0 12px 40px rgba(99, 102, 241, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  }

  &.is-active {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(52, 211, 153, 0.95) 100%);
    box-shadow:
      0 8px 32px rgba(16, 185, 129, 0.35),
      0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  }

  &.is-dragging {
    cursor: grabbing;
    opacity: 0.9;
    transition: none !important;

    .floating-button__glow {
      opacity: 0;
    }
  }
}

// Animations - 只动画 opacity，位置由 inline style 控制
.float-button-enter-active {
  transition: opacity 0.3s ease;
}

.float-button-leave-active {
  transition: opacity 0.2s ease;
}

.float-button-enter-from {
  opacity: 0;
}

.float-button-leave-to {
  opacity: 0;
}
</style>
