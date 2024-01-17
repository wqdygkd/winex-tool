<template>
  <div style="width: 800px; height: 400px" ref="editorBox"></div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch, defineEmits, ref } from 'vue'
import JSONEditor from 'jsoneditor'
import type { JSONEditorOptions } from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.css'

const props = defineProps<{
  modelValue: [String, Boolean, Object, Array]
  mode: {
    type: String
    default: 'tree'
  }
}>()
const emit = defineEmits(['change', 'error'])
const editorBox = ref<any>(null)
let jsoneditor: JSONEditor

const state = reactive({
  editor: null as any,
  error: false,
  json: {},
  internalChange: false
})

watch(
  () => props.modelValue as unknown as any,
  async (val) => {
    if (!state.internalChange) {
      state.json = val
      state.error = false
    }
  },
  { immediate: true }
)

onMounted(() => {
  const options: JSONEditorOptions = {
    mode: props.mode || 'code',
    // modes: ['text', 'code', 'tree'],
    search: true,
    mainMenuBar: false,
    statusBar: false,
    onChange() {
      try {
        const json = state.editor.get()
        state.json = json
        state.error = false
        // eslint-disable-next-line vue/custom-event-name-casing
        emit('change', json)
        state.internalChange = true
        // emit('input', json)
        // root.$nextTick(function () {
        //   state.internalChange = false
        // })
      } catch (e) {
        state.error = true
        // eslint-disable-next-line vue/custom-event-name-casing
        emit('error', e)
      }
    }
  }
  jsoneditor = new JSONEditor(editorBox.value, options)
  const initialJson = storage.current || undefined
  jsoneditor.set(initialJson)
})
</script>
