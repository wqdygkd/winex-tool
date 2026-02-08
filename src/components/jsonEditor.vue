<script setup lang="ts">
import { json } from '@codemirror/lang-json'
import { Compartment, StateEffect } from '@codemirror/state'
import { basicSetup, EditorView } from 'codemirror'

const props = defineProps<{
  modelValue: object | undefined
  mode?: string
}>()

const emit = defineEmits(['change', 'error', 'update:modelValue', 'validationError'])

const editorRef = ref<HTMLElement>()
let editorView: EditorView
let internalChange = false

const languageConf = new Compartment()

onMounted(() => {
  if (!editorRef.value) return

  const jsonString = props.modelValue ? JSON.stringify(props.modelValue, null, 2) : ''

  editorView = new EditorView({
    doc: jsonString,
    extensions: [
      basicSetup,
      languageConf.of(json()),
      EditorView.theme({
        '&': {
          height: '400px',
        },
        '.cm-content': {
          fontFamily: 'Monaco, Menlo, \'Ubuntu Mono\', Consolas, \'Source Code Pro\', source-code-pro, monospace',
        },
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const content = update.state.doc.toString()

          try {
            if (content.trim()) {
              // 尝试解析JSON以验证语法
              const parsed = JSON.parse(content)
              internalChange = true

              emit('update:modelValue', parsed)
              emit('change', parsed)

              setTimeout(() => {
                internalChange = false
              }, 0)
            }
          } catch (e) {
            emit('error', e)
          }
        }
      }),
    ],
    parent: editorRef.value,
  })
})

// 监听 modelValue 的变化并更新编辑器内容
watch(
  () => props.modelValue,
  async (newValue) => {
    if (!internalChange && editorView) {
      const jsonString = newValue ? JSON.stringify(newValue, null, 2) : ''
      const currentValue = editorView.state.doc.toString()

      if (jsonString !== currentValue) {
        editorView.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: jsonString,
          },
        })
      }
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (editorView) {
    editorView.destroy()
  }
})

function formatJson() {
  if (!editorView) return

  const content = editorView.state.doc.toString()
  try {
    if (content.trim()) {
      const parsed = JSON.parse(content)
      const formatted = JSON.stringify(parsed, null, 2)

      editorView.dispatch({
        changes: {
          from: 0,
          to: content.length,
          insert: formatted,
        },
      })

      internalChange = true
      emit('update:modelValue', parsed)
      emit('change', parsed)

      setTimeout(() => {
        internalChange = false
      }, 0)
    }
  } catch (e) {
    emit('error', e)
  }
}

defineExpose({
  expandAll: () => {
  },
  focus: () => {
    if (editorView) {
      editorView.focus()
    }
  },
  formatJson,
})
</script>

<template>
  <div class="json-editor-container">
    <div class="editor-toolbar">
      <el-button size="small" @click="formatJson">
        格式化
      </el-button>
    </div>
    <div ref="editorRef" class="code-editor" />
  </div>
</template>

<style scoped>
.json-editor-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  gap: 8px;
}

.code-editor {
  flex: 1;
}

:deep(.cm-editor) {
  height: 100%;
  outline: none;
}

:deep(.cm-scroller) {
  font-family: inherit;
}

:deep(.cm-focused) {
  outline: none;
  border: 1px solid #409eff;
}
</style>
