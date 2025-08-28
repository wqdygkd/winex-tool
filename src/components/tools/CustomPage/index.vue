<template>
  <div style="margin-bottom: 20px">
    <el-button size="small" @click="addTab(editableTabsValue)">
      add tab
    </el-button>
  </div>
  <el-tabs
    v-model="editableTabsValue"
    type="card"
    style="width: 100%;"
    closable
    @tab-remove="removeTab"
  >
    <el-tab-pane
      v-for="item in editableTabs"
      :key="item.name"
      :label="item.title"
      :name="item.name"
    >
      <Iframe :src="item.content"/>
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import type { TabPaneName } from 'element-plus'
import Iframe from './Iframe.vue'

let tabIndex = 2
const editableTabsValue = ref('2')
const editableTabs = ref([
  {
    title: '参数配置',
    name: '1',
    content: '/webui-admin-mdm/#/queryconfig',
  },
  {
    title: '术语',
    name: '2',
    content: 'http://172.16.7.60/webui-admin-mdm/#/termCorpus',
  },
])

const addTab = (targetName: string) => {
  const newTabName = `${++tabIndex}`
  editableTabs.value.push({
    title: 'New Tab',
    name: newTabName,
    content: 'New Tab content',
  })
  editableTabsValue.value = newTabName
}
const removeTab = (targetName: TabPaneName) => {
  const tabs = editableTabs.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }

  editableTabsValue.value = activeName
  editableTabs.value = tabs.filter((tab) => tab.name !== targetName)
}
</script>

<style>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>
