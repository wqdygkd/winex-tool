<template>
  <el-alert title="混合框架 - Logs - 读卡接口代理 - *.log - 读卡接口代理A-2出参" type="success" :closable="false" />
  <el-button type="primary" @click="test">测试</el-button>
  <el-checkbox v-model="status" label="启用" />
  <el-button type="primary" @click="importFile">
    <el-icon>
      <Upload />
    </el-icon>
  </el-button>

  <el-select style="width: 200px" @change="selectChange" filterable value-key="id">
    <el-option v-for="(item, index) in storage.data" :key="index" :label="item.date + item.name" :value="item" />
  </el-select>

  <el-select style="width: 200px" @change="selectChange" filterable value-key="id">
    <el-option v-for="item in contentArray" :key="item.raw" :label="item.date + item.name" :value="item.json" />
  </el-select>

  <div style="width: 800px; height: 400px" ref="editorBox"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, toRaw, watch } from 'vue'
import JSONEditor from 'jsoneditor'
import type { JSONEditorOptions } from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.css'
import { Upload } from '@element-plus/icons-vue'

import defaultData from './default'
const props = defineProps<{
  identityTypeCode: string
}>()

const storageKey = `${__namespace}${props.identityTypeCode}`

let storage: any = reactive(
  GM_getValue(storageKey, {
    enable: false,
    data: [],
    current: undefined
  })
)

let data = defaultData[props.identityTypeCode as keyof typeof defaultData] || []

if (!storage.data.length) {
  storage.data = data
  GM_setValue(storageKey, storage)
}

const status = ref(storage.enable)

watch(status, (newStatus) => {
  storage.enable = newStatus
  GM_setValue(storageKey, storage)
})

const editorBox = ref<any>(null)
let jsoneditor: JSONEditor
let contentArray: any[] = reactive([])

function importFile() {
  let fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.style.cssText = 'position:absolute;top:-100px;left:-100px'

  fileInput.addEventListener(
    'change',
    (event) => {
      let file = (<HTMLInputElement>event.target).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const content = event.target?.result as string
          contentArray.push(
            ...content
              .split('-------------------------------------INFO-------------------------------------')
              .filter((item) => item.includes('读卡接口代理A-2出参'))
              .map((item) => {
                return { raw: item, json: extractJSON(item) }
              })
              .filter((item) => item.json && item.json.success)
              .map((item) => {
                let { personInfomation, identityCertificateInfomationList } = item.json?.data || {}
                let idCard = (identityCertificateInfomationList || []).find(
                  (info: any) => info.identityCertificateTypeConceptId === '391004456' && info.identityCertificateTypeCode === '152626'
                )?.identityCertificateNo
                let mCard = (identityCertificateInfomationList || []).find(
                  (info: any) => info.identityCertificateTypeConceptId === '399202505' && info.identityCertificateTypeCode === '152691'
                )?.identityCertificateNo
                let date = item.raw.split('读卡接口代理')[0]?.trim()
                return {
                  ...item,
                  date,
                  name: personInfomation.name,
                  idCard,
                  mCard,
                  id: date + idCard
                }
              })
          )

          if (contentArray.length === 1) {
            jsoneditor.set(toRaw(contentArray[0]))
          }
          console.log(toRaw(contentArray))
          // this.saveContentToLocal(toolName, file.name, evt.target.result);
        }
        reader.readAsText(file)
      }
    },
    false
  )

  document.body.appendChild(fileInput)
  fileInput.click()
  window.setTimeout(() => fileInput.remove(), 3000)
}

function extractJSON(content: string) {
  let firstOpen
  let firstClose = content.length - 1
  let candidate
  firstClose = content.lastIndexOf('}')
  do {
    firstOpen = content.indexOf('{')
    if (firstClose <= firstOpen) return null
    do {
      candidate = content.substring(firstOpen, firstClose + 1)
      try {
        const res = JSON.parse(candidate)
        return res
      } catch {
        // console.log('...failed');
      }
      firstOpen = content.indexOf('{', firstOpen + 1)
    } while (firstClose > firstOpen && firstOpen !== -1)
    firstClose = content.lastIndexOf('}', firstClose - 1)
  } while (firstClose != -1)
  return null
}

onMounted(async () => {
  const options: JSONEditorOptions = {
    mode: 'code',
    // modes: ['text', 'code', 'tree'],
    search: true,
    mainMenuBar: false,
    statusBar: false
  }
  jsoneditor = new JSONEditor(editorBox.value, options)
  const initialJson = storage.current.json || undefined
  jsoneditor.set(initialJson)
})

function selectChange(val: any) {
  jsoneditor.set(toRaw(val.json))
  storage.current = val
  GM_setValue(storageKey, storage)
}

// const fileInput = ref(null)
// onMounted(() => {
//   console.log(fileInput)
// })
// fileInput.addEventListener('change', (event) => {
//   console.log(666)
//   chrome.runtime.sendMessage({ type: 'COUNT', count: 1 })
//   const file = event.target.files[0];
//   const reader = new FileReader();
//   reader.onload = (event) => {
//     const content = event.target.result;
//     console.log(content);
//   };
//   reader.readAsText(file);
// });

function test() {
  window.winning.dispatchEvent('399297247', '{}', () => {})
}
</script>
<style scoped lang="scss"></style>
