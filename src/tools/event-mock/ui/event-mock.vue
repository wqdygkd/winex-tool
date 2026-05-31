<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { context } from '../core/context'
import { ConfigStorage } from '../storage/config'
import { TemplateStorage } from '../storage/template'
import { eventIdPresets, getPresetEvents } from '../presets'
import type { TemplateItem, EventItem } from '../types'
import JsonEditor from '~/components/jsonEditor.vue'

const config = context.getConfig()
const templates = ref<TemplateItem[]>([])
const activeNames = ref<number[]>([])
const saving = ref(false)
const savingTemplateIndex = ref<number | null>(null)
const templateName = ref('')
const selectedTemplateId = ref<string | null>(null)

const configStorage = new ConfigStorage()
const templateStorage = new TemplateStorage()

let saveTimer: ReturnType<typeof setTimeout> | null = null

// 提取事件映射逻辑
function getEventsData(): EventItem[] {
  return config.events.map(e => ({
    id: e.id,
    title: e.title,
    data: e.data,
    paramsConditions: e.paramsConditions
  }))
}

// 提取 deep clone
function cloneData(data: any): any {
  return JSON.parse(JSON.stringify(data))
}

onMounted(() => {
  configStorage.load()
  templates.value = templateStorage.getAll()

  const presetEvents = getPresetEvents()
  const existingPresetKeys = config.events
    .filter(e => e.isPreset)
    .map(e => `${e.id}_${e.title}`)

  presetEvents.forEach(preset => {
    const key = `${preset.id}_${preset.title}`
    if (!existingPresetKeys.includes(key)) {
      config.events.unshift({ ...preset, isPreset: true })
    }
  })
})

watch(
  () => ({ enable: config.enable, events: getEventsData() }),
  () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(autoSave, 500)
  },
  { deep: true }
)

function autoSave() {
  configStorage.save({ enable: config.enable, events: getEventsData() })
}

function save() {
  saving.value = true
  configStorage.save({ enable: config.enable, events: getEventsData() })
  ElMessage.success('配置已保存')
  saving.value = false
}

function addEvent() {
  config.events.push({ id: '', title: '新事件', data: {} })
  activeNames.value.push(config.events.length - 1)
}

function removeEvent(index: number) {
  if (config.events[index].isPreset) {
    ElMessage.warning('预制规则不可删除')
    return
  }
  config.events.splice(index, 1)
  activeNames.value = activeNames.value.filter(n => n !== index)
}

function addCondition(eventIndex: number) {
  const conditions = config.events[eventIndex].paramsConditions
  if (!conditions) {
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
    config.events[eventIndex].data = cloneData(template.data)
  }
}

function startSaveTemplate(eventIndex: number) {
  if (!config.events[eventIndex].id) {
    ElMessage.warning('请先设置 eventId')
    return
  }
  savingTemplateIndex.value = eventIndex
  templateName.value = `${config.events[eventIndex].title}_模板`
}

function cancelSaveTemplate() {
  savingTemplateIndex.value = null
  templateName.value = ''
}

function confirmSaveTemplate(eventIndex: number) {
  if (!templateName.value.trim()) {
    ElMessage.warning('请输入模板名称')
    return
  }

  const event = config.events[eventIndex]
  templateStorage.add({
    id: `tpl_${Date.now()}`,
    eventId: event.id,
    name: templateName.value.trim(),
    data: cloneData(event.data)
  })
  templates.value = templateStorage.getAll()
  savingTemplateIndex.value = null
  templateName.value = ''
  ElMessage.success('模板保存成功')
}

function deleteTemplate(templateId: string) {
  templateStorage.remove(templateId)
  templates.value = templateStorage.getAll()
  selectedTemplateId.value = null
  ElMessage.success('模板删除成功')
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
            <span class="event-title">{{ event.title }}</span>
            <span class="event-id">{{ event.id || '未设置' }}</span>
            <span v-if="event.isPreset" class="preset-tag">预制</span>
            <el-button
              v-if="!event.isPreset"
              type="danger"
              size="small"
              @click.stop="removeEvent(index)"
            >
              删除
            </el-button>
          </div>
        </template>

        <div class="event-config">
          <div class="config-row">
            <label>标题:</label>
            <el-input v-model="event.title" placeholder="事件标题" size="small" class="title-input" />
            <label>eventId:</label>
            <el-select
              v-model="event.id"
              placeholder="选择或输入"
              size="small"
              filterable
              allow-create
              clearable
              class="event-id-select"
            >
              <el-option
                v-for="preset in eventIdPresets"
                :key="preset.id"
                :label="`${preset.id} - ${preset.name}`"
                :value="preset.id"
              />
            </el-select>
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
              v-model="selectedTemplateId"
              placeholder="选择模板"
              size="small"
              clearable
              class="template-select"
              @change="(val: string) => applyTemplate(index, val)"
              @clear="selectedTemplateId = null"
            >
              <el-option
                v-for="t in getEventIdOptions(event.id)"
                :key="t.id"
                :label="t.name"
                :value="t.id"
              >
                <span>{{ t.name }}</span>
                <el-button
                  type="danger"
                  size="small"
                  link
                  class="template-delete-btn"
                  @click.stop="deleteTemplate(t.id)"
                >
                  删除
                </el-button>
              </el-option>
            </el-select>
            <!-- 保存模板：点击后显示输入框 -->
            <template v-if="savingTemplateIndex === index">
              <el-input
                v-model="templateName"
                placeholder="模板名称"
                size="small"
                class="template-name-input"
              />
              <el-button size="small" @click="cancelSaveTemplate">取消</el-button>
              <el-button type="primary" size="small" @click="confirmSaveTemplate(index)">保存</el-button>
            </template>
            <template v-else>
              <el-button size="small" @click="startSaveTemplate(index)">保存模板</el-button>
            </template>
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
  background-color: #fff;
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

.preset-tag {
  background: #e6a23c;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
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
  flex-wrap: nowrap;
}

.config-row label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.config-row .title-input {
  width: 120px;
}

.config-row .event-id-select {
  width: 200px;
}

.config-row .template-select {
  width: 300px;
}

.config-row .template-name-input {
  width: 150px;
}

.config-section {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
}

/* 返回数据区域的 JsonEditor 固定高度 */
.config-section:last-child :deep(.json-editor-container) {
  height: 300px;
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

.template-delete-btn {
  float: right;
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