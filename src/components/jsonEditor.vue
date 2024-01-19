<template>
  <div style="width: 800px; height: 400px" ref="editorBox"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, nextTick } from 'vue'
import JSONEditor from 'jsoneditor'
import type { JSONEditorOptions, JSONEditorMode, SchemaValidationError, ParseError } from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.min.css'

const props = defineProps<{
  modelValue: Object | undefined
  mode: JSONEditorMode
}>()

const emit = defineEmits(['change', 'error', 'update:modelValue', 'validationError'])

const editorBox = ref<any>(null)
let jsoneditor: JSONEditor
let internalChange = ref(false)
let error = ref(false)

// const state = reactive({
//   editor: null as any,
//   error: false,
//   json: {},
//   internalChange: false
// })

function expandAll() {
  nextTick(() => {
    // jsoneditor.expandAll()
  })
}
function onChange() {
  console.log('jsoneditor onChange')
  try {
    const data = jsoneditor.get()
    console.log('jsoneditor onChange data', data)
    error.value = false
    emit('update:modelValue', data)
    emit('change', data)
    internalChange.value = true
    nextTick(() => {
      internalChange.value = false
    })
  } catch (e) {
    error.value = true
    emit('error', e)
  }
}

function onValidationError(errors: readonly (SchemaValidationError | ParseError)[]) {
  console.log('jsoneditor onValidationError', errors)
  emit('validationError', jsoneditor, errors)
}

watch(
  () => props.modelValue as unknown as any,
  async (val) => {
    console.log('watch props.modelValue', val)
    if (!internalChange.value) {
      jsoneditor.set(val)
      error.value = false
      expandAll()
    }
  }
  // { immediate: true, deep: true }
)

onMounted(() => {
  const options: JSONEditorOptions = {
    mode: props.mode || 'code',
    // modes: ['text', 'code', 'tree'],
    search: true,
    // mainMenuBar: false,
    // statusBar: false,
    language: 'zh-CN',
    indentation: 2,
    // theme: 'foundation5',
    onChange,
    onValidationError
    // onModeChange,
    // onTextSelectionChange,
    // onSelectionChange,
    // onColorPicker,
    // onFocus,
    // onBlur,
    // onValidationError,
  }
  jsoneditor = new JSONEditor(editorBox.value, options)
  jsoneditor.set(props.modelValue)
  expandAll()
})
</script>
<style scoped lang="scss">
:deep(.ace_editor) {
  div,
  dl,
  label,
  li,
  p,
  span,
  td {
    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, 'Source Code Pro', source-code-pro, monospace;
  }
}
</style>
