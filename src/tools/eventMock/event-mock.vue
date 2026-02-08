<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import JsonEditor from '../../components/jsonEditor.vue'
import { storageKey } from './event-mock'
import EventMock from './handle'

interface AccordionItem {
  id: string
  title: string
  data: object | undefined
  isBuiltIn?: boolean
  template?: string
}

const eventTemplates = [
  { label: '点击事件', value: 'click', data: { type: 'click', target: '#button', timestamp: Date.now() } },
  { label: '提交事件', value: 'submit', data: { type: 'submit', form: '#login-form', timestamp: Date.now() } },
  { label: '自定义事件', value: 'custom', data: { type: 'custom', payload: {}, timestamp: Date.now() } },
  { label: '鼠标悬停事件', value: 'mouseover', data: { type: 'mouseover', target: '.element', timestamp: Date.now() } },
  { label: '键盘按下事件', value: 'keydown', data: { type: 'keydown', key: 'Enter', timestamp: Date.now() } },
]

const accordionItems = ref<AccordionItem[]>([
  {
    id: '1',
    title: '医保卡读卡',
    data: { type: 'click', target: '#button' },
    isBuiltIn: true,
    template: '',
  },
  {
    id: '2',
    title: 'Submit Event',
    data: { type: 'submit', form: '#login-form' },
    isBuiltIn: true,
    template: '',
  },
  {
    id: '3',
    title: 'Custom Event',
    data: { type: 'custom', payload: {} },
    isBuiltIn: true,
    template: '',
  },
])

const activeNames = ref<string[]>(['1'])
const saveTemplateDialogVisible = ref(false)
const newTemplateName = ref('')
const newTemplateValue = ref('')
const currentEventIdForTemplate = ref('')
const enableMock = ref(false)
const saving = ref(false)

function addAccordionItem() {
  const maxId = Math.max(...accordionItems.value.map(item => Number.parseInt(item.id) || 0))
  const newId = (maxId + 1).toString()
  accordionItems.value.push({
    id: newId,
    title: `Event ${newId}`,
    data: {},
    template: '',
  })
  activeNames.value = [newId]
}

function saveAsTemplate(eventId: string) {
  const item = accordionItems.value.find(item => item.id === eventId)
  if (!item || !item.data) return

  currentEventIdForTemplate.value = eventId
  newTemplateName.value = item.title || '自定义模板'
  newTemplateValue.value = `template_${Date.now()}`
  saveTemplateDialogVisible.value = true
}

function getAvailableTemplates(eventId: string) {
  return eventTemplates.filter(template => !template.eventId || template.eventId === eventId)
}

function confirmSaveTemplate() {
  if (!newTemplateName.value || !newTemplateValue.value) return

  const existingTemplate = eventTemplates.find(t => t.value === newTemplateValue.value)
  if (existingTemplate) {
    ElMessage.warning('模板值已存在，请使用其他值')
    return
  }

  const item = accordionItems.value.find(item => item.id === currentEventIdForTemplate.value)
  if (item && item.data) {
    eventTemplates.push({
      label: newTemplateName.value,
      value: newTemplateValue.value,
      data: JSON.parse(JSON.stringify(item.data)),
      eventId: currentEventIdForTemplate.value,
    })
    ElMessage.success('模板保存成功')
  }

  saveTemplateDialogVisible.value = false
  newTemplateName.value = ''
  newTemplateValue.value = ''
  currentEventIdForTemplate.value = ''
}

function removeAccordionItem(id: string) {
  const item = accordionItems.value.find(item => item.id === id)
  if (item && !item.isBuiltIn) {
    const index = accordionItems.value.findIndex(item => item.id === id)
    if (index > -1) {
      accordionItems.value.splice(index, 1)
      if (activeNames.value.includes(id)) {
        activeNames.value = accordionItems.value.length > 0 ? [accordionItems.value[0].id] : []
      }
    }
  }
}

function updateAccordionItemTitle(id: string, title: string) {
  const item = accordionItems.value.find(item => item.id === id)
  if (item && !item.isBuiltIn) {
    item.title = title
  }
}

function updateAccordionItemId(oldId: string, newId: string) {
  const item = accordionItems.value.find(item => item.id === oldId)
  if (item && !item.isBuiltIn) {
    const existingItem = accordionItems.value.find(item => item.id === newId && item.id !== oldId)
    if (existingItem) {
      item.id = oldId
      return
    }
    item.id = newId
    if (activeNames.value.includes(oldId)) {
      activeNames.value = activeNames.value.map(id => id === oldId ? newId : id)
    }
  }
}

function applyTemplate(eventId: string, templateValue: string) {
  const item = accordionItems.value.find(item => item.id === eventId)
  if (item) {
    const template = eventTemplates.find(t => t.value === templateValue)
    if (template) {
      item.data = JSON.parse(JSON.stringify(template.data))
    }
  }
}

function updateAccordionItemData(id: string, data: object | undefined) {
  const item = accordionItems.value.find(item => item.id === id)
  if (item) {
    item.data = data
  }
}

function expandAll() {
  activeNames.value = accordionItems.value.map(item => item.id)
}

function collapseAll() {
  activeNames.value = []
}

// 加载存储的数据
function loadData() {
  try {
    const storage = GM_getValue(storageKey, {})
    enableMock.value = storage.enable || false
    if (storage.events) {
      accordionItems.value = storage.events.map(event => ({
        id: event.id,
        title: event.title,
        data: event.data,
        isBuiltIn: event.isBuiltIn || false,
        template: event.template || '',
      }))
    }
  } catch (error) {
    console.error('Failed to load event mock data:', error)
  }
}

// 保存数据
function saveData() {
  saving.value = true
  try {
    const data = {
      enable: enableMock.value,
      events: accordionItems.value.map(item => ({
        id: item.id,
        title: item.title,
        data: item.data,
        isBuiltIn: item.isBuiltIn,
        template: item.template,
      })),
    }
    GM_setValue(storageKey, data)
    // 更新EventMock的处理器
    EventMock.saveHandlers(data.events)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('Failed to save event mock data:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 初始化加载数据
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="event-mock-container">
    <div class="header-buttons">
      <el-switch
        v-model="enableMock"
        inline-prompt
        active-text="启用"
        inactive-text="禁用"
        size="small"
      />
      <el-button size="small" @click="expandAll">
        全部展开
      </el-button>
      <el-button size="small" @click="collapseAll">
        全部折叠
      </el-button>
      <el-button type="primary" size="small" @click="addAccordionItem">
        <el-icon><Plus /></el-icon>
        添加事件
      </el-button>
      <el-button type="success" size="small" :loading="saving" @click="saveData">
        保存配置
      </el-button>
    </div>

    <el-collapse v-model="activeNames" class="event-accordion">
      <el-collapse-item
        v-for="item in accordionItems"
        :key="item.id"
        :title="item.title"
        :name="item.id"
      >
        <template #title>
          <div class="collapse-item-title">
            <div class="input-group">
              <div class="input-row">
                <label>事件标题:</label>
                <el-input
                  v-model="item.title"
                  size="small"
                  placeholder="输入事件标题"
                  :readonly="item.isBuiltIn"
                  @blur="updateAccordionItemTitle(item.id, item.title)"
                />
              </div>
              <div class="input-row">
                <label>事件ID:</label>
                <el-input
                  v-model="item.id"
                  size="small"
                  placeholder="输入事件ID"
                  :readonly="item.isBuiltIn"
                  @blur="updateAccordionItemId(item.id, item.id)"
                />
              </div>
            </div>
            <el-button
              v-if="!item.isBuiltIn"
              type="danger"
              size="small"
              @click.stop="removeAccordionItem(item.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </template>

        <div class="event-template-section">
          <el-select
            v-model="item.template"
            size="small"
            placeholder="选择事件模板"
            filterable
            @change="applyTemplate(item.id, item.template)"
          >
            <el-option
              v-for="template in getAvailableTemplates(item.id)"
              :key="template.value"
              :label="template.label"
              :value="template.value"
            />
          </el-select>
          <el-button
            size="small"
            @click="saveAsTemplate(item.id)"
          >
            保存为模板
          </el-button>
        </div>
        <JsonEditor
          v-model="item.data"
        />
      </el-collapse-item>
    </el-collapse>

    <el-dialog
      v-model="saveTemplateDialogVisible"
      title="保存为模板"
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="模板名称">
          <el-input v-model="newTemplateName" placeholder="输入模板名称" />
        </el-form-item>
        <el-form-item label="模板值">
          <el-input v-model="newTemplateValue" placeholder="输入模板值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="saveTemplateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSaveTemplate">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.event-mock-container {
  padding: 20px;
  overflow-y: auto;
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.event-accordion {
  margin-top: 20px;
}

.collapse-item-title {
  display: flex;
  align-items: center;
  width: 100%;
}

.collapse-item-title {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  cursor: pointer;
}

.input-group {
  display: flex;
  gap: 20px;
  flex: 1;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-row label {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.input-row .el-input {
  width: 180px;
}

.collapse-item-title:hover {
  background-color: #f5f7fa;
}

.event-template-section {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.event-template-section .el-select {
  flex: 1;
  min-width: 200px;
}
</style>
