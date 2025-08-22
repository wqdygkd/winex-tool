<!-- 封装irame组件，用来展示iframe页面 -->
<template>
  <div class="iframe-container">
    <iframe
      v-if="src"
      :src="src"
      frameborder="0"
      class="iframe"
      :style="{ width, height }"
      ref="iframeRef"
    ></iframe>
    <div v-else class="iframe-empty">未设置iframe地址</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  src: string
  width?: string
  height?: string
}>()

const iframeRef = ref<HTMLIFrameElement | null>(null)

const width = props.width || '100%'
const height = props.height || '600px'

// 可根据需要添加事件监听等
onMounted(() => {
  // 这里可以做一些iframe加载完成的处理
  // 例如：iframeRef.value?.addEventListener('load', () => { ... })
})
</script>

<style scoped>
.iframe-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.iframe {
  width: 100%;
  height: 100%;
  min-height: 300px;
  border: none;
}
.iframe-empty {
  color: #999;
  text-align: center;
  padding: 40px 0;
}
</style>
