<script setup lang="ts">
import { onMounted, reactive, ref, toRaw, watch } from 'vue'
import defaultData from './default'

import JsonEditor from './jsonEditor.vue'

const props = defineProps<{
  identityTypeCode: string
}>()

const storageKey = `${__namespace}${props.identityTypeCode}`

let storage: any = reactive(
  GM_getValue(storageKey, {
    enable: false,
    data: [],
    current: undefined,
  }),
)

let data = defaultData[props.identityTypeCode as keyof typeof defaultData] || []
if (!storage.data || !storage.data.length) {
  storage.data = data
  GM_setValue(storageKey, storage)
}

let current: any = reactive(
  Object.assign(
    {
      name: '',
      date: '',
      json: undefined,
    },
    storage.current,
  ),
)

watch(current, (val) => {
  console.log('watch current', val)
  storage.current = val
  GM_setValue(storageKey, storage)
})

const status = ref(storage.enable)

watch(status, (val) => {
  storage.enable = val
  GM_setValue(storageKey, storage)
})

let contentArray: any[] = reactive([])

onMounted(async () => {})

function selectChange(val: any) {
  current.json = val.json
  current.date = val.date
  current.name = val.name
}
</script>

<template>
  <el-alert title="混合框架 - Logs - 读卡接口代理 - *.log - 读卡接口代理A-2出参" type="success" :closable="false" />
  <el-checkbox v-model="status" label="启用" />

  <el-select style="width: 200px" filterable value-key="id" @change="selectChange">
    <el-option v-for="(item, index) in storage.data" :key="index" :label="item.date + item.name" :value="item" />
  </el-select>

  <el-select style="width: 200px" filterable value-key="id" @change="selectChange">
    <el-option v-for="item in contentArray" :key="item.raw" :label="item.date + item.name" :value="item.json" />
  </el-select>

  <JsonEditor v-model="current.json" mode="code" />
</template>

<style scoped lang="scss"></style>
