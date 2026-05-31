<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { context } from '../core/context'
import { ConfigStorage } from '../storage/config'
import { TemplateStorage } from '../storage/template'
import type { TemplateItem } from '../types'
import JsonEditor from '~/components/jsonEditor.vue'

// Get reactive config from context (already reactive, no ref() needed)
const config = context.getConfig()

// Storage instances created during component setup
const configStorage = new ConfigStorage()
const templateStorage = new TemplateStorage()

// Template data
const templates = ref<TemplateItem[]>([])

onMounted(() => {
  configStorage.load()
  templates.value = templateStorage.getAll()
})

function save() {
  configStorage.save({
    enable: config.enable,
    events: config.events.map(e => ({ id: e.id, title: e.title, data: e.data }))
  })
}

function addEvent() {
  config.events.push({
    id: `${Date.now()}`,
    title: '新事件',
    data: {}
  })
}

function removeEvent(index: number) {
  config.events.splice(index, 1)
}

function applyTemplate(eventIndex: number, templateId: string) {
  const template = templates.value.find(t => t.id === templateId)
  if (template) {
    config.events[eventIndex].data = JSON.parse(JSON.stringify(template.data))
  }
}

function saveAsTemplate(eventId: string, title: string, data: any) {
  templateStorage.add({
    id: `tpl_${Date.now()}`,
    eventId,
    name: `${title}_模板`,
    data: JSON.parse(JSON.stringify(data))
  })
  templates.value = templateStorage.getAll()
}
</script>

<template>
  <div class="event-mock">
    <div class="header">
      <el-switch v-model="config.enable" active-text="启用" inactive-text="禁用" />
      <el-button type="primary" size="small" @click="save">保存配置</el-button>
    </div>

    <div class="events-list">
      <div v-for="(event, index) in config.events" :key="event.id" class="event-card">
        <div class="event-header">
          <el-input v-model="event.id" placeholder="eventId" size="small" />
          <el-input v-model="event.title" placeholder="标题" size="small" />
          <el-select
            placeholder="模板"
            size="small"
            clearable
            @change="(val: string) => applyTemplate(index, val)"
          >
            <el-option
              v-for="t in templates.filter(t => t.eventId === event.id)"
              :key="t.id"
              :label="t.name"
              :value="t.id"
            />
          </el-select>
          <el-button
            size="small"
            @click="saveAsTemplate(event.id, event.title, event.data)"
          >
            保存模板
          </el-button>
          <el-button type="danger" size="small" @click="removeEvent(index)">删除</el-button>
        </div>
        <JsonEditor v-model="event.data" />
      </div>
    </div>

    <el-button size="small" @click="addEvent">+ 添加事件</el-button>
  </div>
</template>

<style scoped>
.event-mock {
  padding: 16px;
}

.header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.event-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.event-header {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.event-header .el-input {
  width: 120px;
}
</style>