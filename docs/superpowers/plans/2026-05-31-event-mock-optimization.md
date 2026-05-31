# Event-Mock 模块优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 扩展 event-mock1 模块，增加折叠卡片 UI、预制数据导入、params 参数匹配、eventId 预设选择。

**Architecture:** 扩展现有响应式 Context 架构：types.ts 增加 ParamsCondition、context.ts 增加 params 匹配逻辑、新增 presets 模块、UI 改为折叠卡片。

**Tech Stack:** Vue 3 + TypeScript + Element Plus (el-collapse) + Vite 动态导入

---

## Task 1: 类型定义扩展

**Files:**
- Modify: `src/tools/event-mock1/types.ts`

- [ ] **Step 1: 修改 types.ts，新增 ParamsCondition 和 EventIdPreset**

```typescript
/**
 * Event-Mock 模块类型定义
 */

// 新增：params 条件定义
export interface ParamsCondition {
  path: string       // JSON Path，如 "body.identityEntryId"
  value: any         // 匹配值，如 3
}

export interface EventItem {
  id: string        // eventId
  title: string     // 显示名称
  data: any         // 返回的静态数据
  paramsConditions?: ParamsCondition[]  // 新增：可选 params 匹配条件
}

export interface TemplateItem {
  id: string        // 模板唯一 ID
  eventId: string   // 关联的事件 ID
  name: string      // 模板名称
  data: any         // 预设数据
}

export interface ConfigData {
  enable: boolean
  events: EventItem[]
}

// 新增：eventId 预设
export interface EventIdPreset {
  id: string        // eventId
  name: string      // 中文名称，如 "读卡事件"
  description?: string  // 可选描述
}

export interface WinningSDK {
  dispatchEvent?: (eventId: string, params: string, cb: (result: string) => void) => void
  getMacadress?: () => string
  getPcName?: () => string
  getIP?: () => string
  deltaResult?: () => boolean
  showMsg?: () => void
  postMessage?: () => void
}
```

- [ ] **Step 2: 提交类型扩展**

```bash
git add src/tools/event-mock1/types.ts
git commit -m "feat(event-mock1): add ParamsCondition and EventIdPreset types"
```

---

## Task 2: Context params 匹配逻辑

**Files:**
- Modify: `src/tools/event-mock1/core/context.ts`

- [ ] **Step 1: 修改 execute 方法，增加 params 匹配**

修改 `src/tools/event-mock1/core/context.ts`，将 execute 方法改为：

```typescript
execute(eventId: string, params: string, cb: (result: string) => void): string {
  // 1. 按 eventId 筛选候选事件
  const candidates = this.config.events.filter(e => e.id === eventId)
  if (candidates.length === 0) {
    try {
      cb('{}')
    } catch (cbError) {
      console.error('EventMock callback error:', cbError)
    }
    return '{}'
  }

  // 2. 解析 params JSON
  let paramsObj: any = {}
  try {
    paramsObj = JSON.parse(params)
  } catch (e) {
    // params 解析失败，使用 fallback
  }

  // 3. 按 paramsConditions 匹配
  for (const event of candidates) {
    if (this.matchParams(paramsObj, event.paramsConditions)) {
      try {
        const result = JSON.stringify(event.data)
        try {
          cb(result)
        } catch (cbError) {
          console.error('EventMock callback error:', cbError)
        }
        return result
      } catch (e) {
        console.error('EventMock JSON.stringify error:', e)
        try {
          cb('{}')
        } catch (cbError) {
          console.error('EventMock callback error:', cbError)
        }
        return '{}'
      }
    }
  }

  // 4. 无匹配，返回 fallback（无 paramsConditions 的事件）
  const fallback = candidates.find(e => !e.paramsConditions) || candidates[0]
  try {
    const result = JSON.stringify(fallback?.data || {})
    try {
      cb(result)
    } catch (cbError) {
      console.error('EventMock callback error:', cbError)
    }
    return result
  } catch (e) {
    console.error('EventMock JSON.stringify error:', e)
    try {
      cb('{}')
    } catch (cbError) {
      console.error('EventMock callback error:', cbError)
    }
    return '{}'
  }
}
```

- [ ] **Step 2: 添加 matchParams 和 getValueByPath 方法**

在 EventMockContext 类中添加：

```typescript
// JSON Path 匹配：所有条件需满足
private matchParams(paramsObj: any, conditions?: ParamsCondition[]): boolean {
  if (!conditions || conditions.length === 0) return true
  return conditions.every(cond => {
    const actualValue = this.getValueByPath(paramsObj, cond.path)
    // 支持字符串和数字比较
    return String(actualValue) === String(cond.value) || actualValue === cond.value
  })
}

// 按 JSON Path 获取值
private getValueByPath(obj: any, path: string): any {
  if (!path) return undefined
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current == null) return undefined
    current = current[key]
  }
  return current
}
```

- [ ] **Step 3: 提交 params 匹配逻辑**

```bash
git add src/tools/event-mock1/core/context.ts
git commit -m "feat(event-mock1): add params matching logic with JSON Path"
```

---

## Task 3: Presets 模块 - eventId 预设

**Files:**
- Create: `src/tools/event-mock1/presets/eventIds.ts`

- [ ] **Step 1: 创建 eventIds.ts 文件**

```typescript
import type { EventIdPreset } from '../types'

/**
 * eventId 预设列表
 * 常用 eventId 及其描述
 */
export const eventIdPresets: EventIdPreset[] = [
  { id: '399297247', name: '读卡事件', description: '医保卡/身份证读卡' },
  { id: '399563027', name: '打印机列表', description: '获取打印机列表' },
  // 可按需扩展
]
```

- [ ] **Step 2: 提交 eventId 预设**

```bash
git add src/tools/event-mock1/presets/eventIds.ts
git commit -m "feat(event-mock1): add eventId presets list"
```

---

## Task 4: Presets 模块 - 预制数据导入

**Files:**
- Create: `src/tools/event-mock1/presets/index.ts`
- Create: `src/tools/event-mock1/presets/data/` 目录
- Copy: 从 `src/tools/event-mock/data/*.json` 复制预制数据

- [ ] **Step 1: 创建 presets/index.ts 文件**

```typescript
import type { TemplateItem, ParamsCondition } from '../types'
import { eventIdPresets } from './eventIds'

export { eventIdPresets }

/**
 * 预制数据文件配置
 */
interface PresetDataFile {
  filename: string
  eventId: string
}

const presetDataFiles: PresetDataFile[] = [
  { filename: '丽水市中心医院测试.json', eventId: '399297247' },
  { filename: 'gcp成功.json', eventId: '399297247' },
  { filename: 'gcp失败.json', eventId: '399297247' },
]

/**
 * 导入预制数据到 TemplateStorage
 */
export function importPresetData(templateStorage: {
  getAll(): TemplateItem[]
  add(template: TemplateItem): void
}): void {
  for (const file of presetDataFiles) {
    try {
      // 使用 Vite 的 ?raw 导入 JSON 文件
      const rawData = import.meta.glob('./data/*.json', { eager: true })
      const dataKey = `./data/${file.filename}`
      const loaded = rawData[dataKey]
      
      if (loaded) {
        const jsonContent = loaded.default || loaded
        const template: TemplateItem = {
          id: `preset_${file.filename}`,
          eventId: file.eventId,
          name: file.filename.replace('.json', ''),
          data: typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent
        }
        
        const existing = templateStorage.getAll()
        if (!existing.find(t => t.id === template.id)) {
          templateStorage.add(template)
        }
      }
    } catch (e) {
      console.warn(`Failed to import preset data: ${file.filename}`, e)
    }
  }
}
```

- [ ] **Step 2: 创建 presets/data 目录并复制预制数据**

```bash
mkdir -p src/tools/event-mock1/presets/data
cp src/tools/event-mock/data/*.json src/tools/event-mock1/presets/data/
```

- [ ] **Step 3: 提交预制数据导入模块**

```bash
git add src/tools/event-mock1/presets/
git commit -m "feat(event-mock1): add preset data import module"
```

---

## Task 5: UI 折叠卡片改造

**Files:**
- Modify: `src/tools/event-mock1/ui/event-mock.vue`

- [ ] **Step 1: 重写 event-mock.vue 为折叠卡片形式**

完整文件内容：

```vue
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
```

- [ ] **Step 2: 提交 UI 改造**

```bash
git add src/tools/event-mock1/ui/event-mock.vue
git commit -m "feat(event-mock1): redesign UI with collapse cards and params conditions"
```

---

## Task 6: 模块初始化修改

**Files:**
- Modify: `src/tools/event-mock1/index.ts`

- [ ] **Step 1: 修改 index.ts，添加预制数据导入**

修改 `src/tools/event-mock1/index.ts`：

```typescript
import type { ToolModule } from '../registry'
import { context } from './core/context'
import { ConfigStorage } from './storage/config'
import { TemplateStorage } from './storage/template'
import { importPresetData } from './presets'
import EventMockUI from './ui/event-mock.vue'

const name = '事件模拟(New)'
const storageKey = `${__namespace}event-mock1`

function init() {
  const configStorage = new ConfigStorage()
  const templateStorage = new TemplateStorage()
  
  configStorage.load()
  
  // 自动导入预制数据
  importPresetData(templateStorage)
}

EventMockUI.name = name

export const EventMockModule1: ToolModule = {
  name,
  storageKey,
  init,
  component: EventMockUI,
  icon: '⚡',
}
```

- [ ] **Step 2: 提交初始化修改**

```bash
git add src/tools/event-mock1/index.ts
git commit -m "feat(event-mock1): add preset data import on init"
```

---

## Task 7: 构建验证

**Files:**
- 无新增文件

- [ ] **Step 1: 运行开发服务器验证**

```bash
pnpm dev
```

Expected: 开发服务器启动成功，无 TypeScript 错误

- [ ] **Step 2: 验证 UI 渲染**

在浏览器中打开，检查：
- 折叠卡片正常显示
- eventId 预设下拉正常
- params 条件添加/删除正常
- 预制模板在模板下拉中可见

- [ ] **Step 3: 运行构建**

```bash
pnpm build
```

Expected: 构建成功，输出 `dist/index.user.js`

- [ ] **Step 4: 提交验证**

```bash
git add -A
git commit -m "chore: verify event-mock1 optimization build"
```

---

## Self-Review Checklist

- [x] **Spec coverage**: 所有优化需求都有对应任务
- [x] **Placeholder scan**: 无 TBD/TODO，所有步骤有完整代码
- [x] **Type consistency**: ParamsCondition、EventIdPreset 类型定义一致
- [x] **File paths**: 所有文件路径准确
- [x] **Commands**: 所有命令可执行