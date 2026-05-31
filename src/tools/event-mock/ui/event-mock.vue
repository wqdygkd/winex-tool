<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { context } from '../core/context'
import { ConfigStorage } from '../storage/config'
import { TemplateStorage } from '../storage/template'
import { eventIdPresets } from '../presets'
import type { TemplateItem } from '../types'
import JsonEditor from '~/components/jsonEditor.vue'

// Get reactive config from context (already reactive, no ref() needed)
const config = context.getConfig()
const templates = ref<TemplateItem[]>([])
const activeNames = ref<number[]>([])
const saving = ref(false)

// Storage instances created in setup
const configStorage = new ConfigStorage()
const templateStorage = new TemplateStorage()

onMounted(() => {
  configStorage.load()
  templates.value = templateStorage.getAll()
})

function save() {
  saving.value = true
  try {
    configStorage.save({
      enable: config.enable,
      events: config.events.map(e => ({
        id: e.id,
        title: e.title,
        data: e.data,
        paramsConditions: e.paramsConditions
      }))
    })
  } finally {
    saving.value = false
  }
}

function addEvent() {
  config.events.push({
    id: '',
    title: '新事件',
    data: {}
  })
  // 自动展开新增的事件
  activeNames.value.push(config.events.length - 1)
}

function removeEvent(index: number) {
  config.events.splice(index, 1)
  // 更新展开状态
  activeNames.value = activeNames.value.filter(n => n !== index)
}

function addCondition(eventIndex: number) {
  if (!config.events[eventIndex].paramsConditions) {
    config.events[eventIndex].paramsConditions = []
  }
  config.events[eventIndex].paramsConditions!.push({ path: '', value: '' })
}

function removeCondition(eventIndex: number, condIndex: number) {
  config.events[eventIndex].paramsConditions?.splice(condIndex, 1)
}

function applyTemplate(eventIndex: number, templateId: string) {
  const template = templates.value.find(t => t.id === templateId)
  if (template) {
    config.events[eventIndex].data = JSON.parse(JSON.stringify(template.data))
  }
}

function saveAsTemplate(eventIndex: number) {
  const event = config.events[eventIndex]
  if (!event.id) return

  templateStorage.add({
    id: `tpl_${Date.now()}`,
    eventId: event.id,
    name: `${event.title}_模板`,
    data: JSON.parse(JSON.stringify(event.data))
  })
  templates.value = templateStorage.getAll()
}

function getEventIdOptions(eventId: string) {
  return templates.value.filter(t => t.eventId === eventId)
}
</script>

<template>
  <div class="event-mock">
    <div class="header">
      <el-switch v-model="config.enable" active-text="启用" inactive-text="禁用" />
      <el-button type="primary" size="small" :loading="saving" @click="save">保存配置</el-button>
      <el-button size="small" @click="addEvent">+ 添加事件</el-button>
    </div>

    <el-collapse v-model="activeNames" class="events-collapse">
      <el-collapse-item
        v-for="(event, index) in config.events"
        :key="index"
        :name="index"
      >
        <template #title>
          <div class="collapse-title">
            <span class="event-id">{{ event.id || '未设置' }}</span>
            <span class="event-title">{{ event.title }}</span>
            <el-button type="danger" size="small" @click.stop="removeEvent(index)">删除</el-button>
          </div>
        </template>

        <div class="event-config">
          <div class="config-row">
            <label>eventId:</label>
            <el-select
              v-model="event.id"
              placeholder="选择或输入 eventId"
              size="small"
              filterable
              allow-create
              clearable
            >
              <el-option
                v-for="preset in eventIdPresets"
                :key="preset.id"
                :label="`${preset.id} - ${preset.name}`"
                :value="preset.id"
              />
            </el-select>
          </div>

          <div class="config-row">
            <label>标题:</label>
            <el-input v-model="event.title" placeholder="事件标题" size="small" />
          </div>

          <div class="config-section">
            <div class="section-header">
              <span>params 匹配条件（可选）</span>
              <el-button size="small" @click="addCondition(index)">+ 添加条件</el-button>
            </div>
            <div
              v-for="(cond, condIndex) in event.paramsConditions"
              :key="condIndex"
              class="condition-row"
            >
              <el-input v-model="cond.path" placeholder="JSON路径 (如 body.identityEntryId)" size="small" />
              <el-input v-model="cond.value" placeholder="匹配值" size="small" />
              <el-button size="small" @click="removeCondition(index, condIndex)">删除</el-button>
            </div>
            <div v-if="!event.paramsConditions?.length" class="condition-empty">
              无 params 条件时，该事件作为默认返回
            </div>
          </div>

          <div class="config-row">
            <label>模板:</label>
            <el-select
              placeholder="选择模板"
              size="small"
              clearable
              @change="(val: string) => applyTemplate(index, val)"
            >
              <el-option
                v-for="t in getEventIdOptions(event.id)"
                :key="t.id"
                :label="t.name"
                :value="t.id"
              />
            </el-select>
            <el-button size="small" @click="saveAsTemplate(index)">保存模板</el-button>
          </div>

          <div class="config-section">
            <div class="section-header">返回数据</div>
            <JsonEditor v-model="event.data" />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <div v-if="config.events.length === 0" class="empty-tip">
      点击 "+ 添加事件" 开始配置
    </div>
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

.events-collapse {
  border: none;
}

.events-collapse :deep(.el-collapse-item__header) {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 8px 16px;
  height: auto;
  line-height: 1.5;
}

.events-collapse :deep(.el-collapse-item__wrap) {
  border: none;
}

.events-collapse :deep(.el-collapse-item__content) {
  padding: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-top: 8px;
}

.collapse-title {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.event-id {
  font-weight: 600;
  color: #409eff;
  min-width: 100px;
}

.event-title {
  color: #606266;
}

.event-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.config-row label {
  width: 60px;
  font-size: 14px;
  color: #606266;
}

.config-row .el-select,
.config-row .el-input {
  flex: 1;
}

.config-section {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.condition-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.condition-row .el-input {
  flex: 1;
}

.condition-empty {
  color: #909399;
  font-size: 12px;
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 32px;
}
</style>