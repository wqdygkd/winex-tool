<script setup lang="ts">
import type { EventMockConfig, MockRule, MockTemplate } from '../types'
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import JsonEditor from '~/components/jsonEditor.vue'
import { applyTemplateResponse, cloneJsonObject, normalizeConditions } from '../core/rules'
import { runtime } from '../core/singleton'
import { eventIdPresets, getPresetTemplates } from '../presets'
import { ConfigStorage, createDefaultConfig } from '../storage/config'
import { TemplateStorage } from '../storage/template'

const configStorage = new ConfigStorage()
const templateStorage = new TemplateStorage()

const config = ref<EventMockConfig>(createDefaultConfig())
const templates = ref<MockTemplate[]>([])
const activeRuleIds = ref<string[]>([])
const selectedTemplateByRule = reactive<Record<string, string>>({})
const templateNameByRule = reactive<Record<string, string>>({})
const saveState = ref<'idle' | 'saving' | 'saved'>('idle')
const loaded = ref(false)

let saveTimer: ReturnType<typeof setTimeout> | null = null

const enabledRulesCount = computed(() => config.value.rules.filter(rule => rule.enabled).length)

onMounted(() => {
  templateStorage.importPresets(getPresetTemplates())
  templates.value = templateStorage.getAll()
  config.value = configStorage.load()
  runtime.update(config.value)
  loaded.value = true
})

watch(
  config,
  () => {
    if (!loaded.value) return
    if (saveTimer) clearTimeout(saveTimer)
    saveState.value = 'saving'
    saveTimer = setTimeout(() => saveConfig(false), 500)
  },
  { deep: true },
)

function saveConfig(showMessage = true) {
  configStorage.save(config.value)
  runtime.update(config.value)
  saveState.value = 'saved'

  if (showMessage) {
    ElMessage.success('配置已保存')
  }
}

function addRule() {
  const rule = createRule()
  config.value.rules.unshift(rule)
  activeRuleIds.value = [rule.id, ...activeRuleIds.value]
}

function duplicateRule(rule: MockRule) {
  const copied = cloneRule(rule)
  copied.id = createId('rule')
  copied.title = `${rule.title || '规则'} 副本`
  config.value.rules.unshift(copied)
  activeRuleIds.value = [copied.id, ...activeRuleIds.value]
}

function removeRule(ruleId: string) {
  config.value.rules = config.value.rules.filter(rule => rule.id !== ruleId)
  activeRuleIds.value = activeRuleIds.value.filter(id => id !== ruleId)
  delete selectedTemplateByRule[ruleId]
  delete templateNameByRule[ruleId]
}

function addCondition(rule: MockRule) {
  rule.conditions.push({ path: '', value: '' })
}

function removeCondition(rule: MockRule, index: number) {
  rule.conditions.splice(index, 1)
}

function applyTemplate(rule: MockRule, templateId: string) {
  const template = templates.value.find(item => item.id === templateId)
  if (!template) return

  applyTemplateResponse(rule, template.response)
  ElMessage.success('模板已套用')
}

function saveTemplate(rule: MockRule) {
  if (!rule.eventId) {
    ElMessage.warning('请先设置 eventId')
    return
  }

  const name = templateNameByRule[rule.id]?.trim()
  if (!name) {
    ElMessage.warning('请输入模板名称')
    return
  }

  templateStorage.add({
    id: createId('tpl'),
    eventId: rule.eventId,
    name,
    response: cloneJsonObject(rule.response),
  })
  templateNameByRule[rule.id] = ''
  templates.value = templateStorage.getAll()
  ElMessage.success('模板已保存')
}

function deleteTemplate(template: MockTemplate) {
  if (!templateStorage.remove(template.id)) {
    ElMessage.warning('预置模板不可删除')
    return
  }

  Object.keys(selectedTemplateByRule).forEach((ruleId) => {
    if (selectedTemplateByRule[ruleId] === template.id) {
      delete selectedTemplateByRule[ruleId]
    }
  })
  templates.value = templateStorage.getAll()
  ElMessage.success('模板已删除')
}

function importPresets() {
  const count = templateStorage.importPresets(getPresetTemplates())
  templates.value = templateStorage.getAll()
  ElMessage.success(count > 0 ? `已导入 ${count} 个预置模板` : '预置模板已是最新')
}

function getTemplatesByEventId(eventId: string) {
  return templates.value.filter(template => template.eventId === eventId)
}

function getRuleSummary(rule: MockRule) {
  const eventId = rule.eventId || '未设置 eventId'
  const status = rule.enabled ? '启用' : '禁用'
  return `${eventId} / ${status} / ${normalizeConditions(rule.conditions).length} 条条件`
}

function createRule(): MockRule {
  return {
    id: createId('rule'),
    enabled: true,
    eventId: '',
    title: '新规则',
    conditions: [],
    response: {},
  }
}

function cloneRule(rule: MockRule): MockRule {
  return {
    ...rule,
    conditions: normalizeConditions(rule.conditions),
    response: cloneJsonObject(rule.response),
  }
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
</script>

<template>
  <div class="event-mock">
    <div class="toolbar">
      <div class="toolbar-main">
        <el-switch v-model="config.enabled" active-text="启用" inactive-text="禁用" />
        <span class="summary">{{ enabledRulesCount }} / {{ config.rules.length }} 条规则启用</span>
        <span v-if="saveState === 'saving'" class="save-state">保存中</span>
        <span v-else-if="saveState === 'saved'" class="save-state">已保存</span>
      </div>
      <div class="toolbar-actions">
        <el-button size="small" @click="importPresets">
          导入预置模板
        </el-button>
        <el-button size="small" @click="saveConfig(true)">
          保存配置
        </el-button>
        <el-button type="primary" size="small" @click="addRule">
          添加规则
        </el-button>
      </div>
    </div>

    <el-collapse v-model="activeRuleIds" class="rules">
      <el-collapse-item
        v-for="rule in config.rules"
        :key="rule.id"
        :name="rule.id"
      >
        <template #title>
          <div class="rule-title">
            <el-switch
              v-model="rule.enabled"
              size="small"
              @click.stop
            />
            <div class="rule-title-text">
              <span class="rule-name">{{ rule.title || '未命名规则' }}</span>
              <span class="rule-summary">{{ getRuleSummary(rule) }}</span>
            </div>
            <div class="rule-actions">
              <el-button size="small" @click.stop="duplicateRule(rule)">
                复制
              </el-button>
              <el-button type="danger" size="small" @click.stop="removeRule(rule.id)">
                删除
              </el-button>
            </div>
          </div>
        </template>

        <div class="rule-editor">
          <div class="form-row">
            <label>标题</label>
            <el-input v-model="rule.title" size="small" placeholder="规则标题" />
            <label>eventId</label>
            <el-select
              v-model="rule.eventId"
              size="small"
              filterable
              allow-create
              clearable
              placeholder="选择或输入 eventId"
            >
              <el-option
                v-for="preset in eventIdPresets"
                :key="preset.id"
                :label="`${preset.id} - ${preset.name}`"
                :value="preset.id"
              />
            </el-select>
          </div>

          <div class="section">
            <div class="section-header">
              <span>params 匹配条件</span>
              <el-button size="small" @click="addCondition(rule)">
                添加条件
              </el-button>
            </div>
            <div v-if="rule.conditions.length === 0" class="empty-text">
              无条件规则会作为该 eventId 的默认返回。
            </div>
            <div
              v-for="(condition, conditionIndex) in rule.conditions"
              :key="conditionIndex"
              class="condition-row"
            >
              <el-input v-model="condition.path" size="small" placeholder="路径，如 body.cardType" />
              <el-input v-model="condition.value" size="small" placeholder="匹配值" />
              <el-button size="small" @click="removeCondition(rule, conditionIndex)">
                删除
              </el-button>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <span>模板</span>
            </div>
            <div class="template-row">
              <el-select
                v-model="selectedTemplateByRule[rule.id]"
                size="small"
                clearable
                placeholder="选择模板"
                @change="(templateId: string) => applyTemplate(rule, templateId)"
              >
                <el-option
                  v-for="template in getTemplatesByEventId(rule.eventId)"
                  :key="template.id"
                  :label="template.preset ? `${template.name}（预置）` : template.name"
                  :value="template.id"
                >
                  <div class="template-option">
                    <span>{{ template.name }}{{ template.preset ? '（预置）' : '' }}</span>
                    <el-button
                      type="danger"
                      size="small"
                      link
                      :disabled="template.preset"
                      @click.stop="deleteTemplate(template)"
                    >
                      删除
                    </el-button>
                  </div>
                </el-option>
              </el-select>
              <el-input
                v-model="templateNameByRule[rule.id]"
                size="small"
                placeholder="模板名称"
              />
              <el-button size="small" @click="saveTemplate(rule)">
                保存为模板
              </el-button>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <span>返回数据</span>
            </div>
            <JsonEditor v-model="rule.response" class="response-editor" />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-empty v-if="config.rules.length === 0" description="暂无规则" />
  </div>
</template>

<style scoped>
.event-mock {
  padding: 16px;
  background: #fff;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.toolbar-main,
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.summary,
.save-state,
.rule-summary,
.empty-text {
  color: #606266;
  font-size: 13px;
}

.rules {
  border: 0;
}

.rules :deep(.el-collapse-item__header) {
  min-height: 56px;
  height: auto;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #f7f8fa;
}

.rules :deep(.el-collapse-item__wrap) {
  border: 0;
}

.rules :deep(.el-collapse-item__content) {
  padding: 12px 0 18px;
}

.rule-title {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.rule-title-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  line-height: 1.4;
}

.rule-name {
  color: #303133;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rule-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.rule-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.form-row,
.template-row,
.condition-row {
  display: grid;
  grid-template-columns: auto minmax(160px, 1fr) auto minmax(180px, 1fr);
  gap: 8px;
  align-items: center;
}

.template-row {
  grid-template-columns: minmax(180px, 1fr) minmax(160px, 1fr) auto;
}

.condition-row {
  grid-template-columns: minmax(180px, 1fr) minmax(160px, 1fr) auto;
}

.form-row label {
  color: #606266;
  font-size: 13px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.template-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.response-editor :deep(.code-editor),
.response-editor :deep(.cm-editor) {
  height: 200px;
  max-height: 200px;
}

.response-editor :deep(.cm-scroller) {
  max-height: 200px;
  overflow: auto;
}

@media (max-width: 720px) {
  .form-row,
  .template-row,
  .condition-row {
    grid-template-columns: 1fr;
  }

  .rule-title {
    align-items: flex-start;
  }

  .rule-actions {
    flex-direction: column;
  }
}
</style>
