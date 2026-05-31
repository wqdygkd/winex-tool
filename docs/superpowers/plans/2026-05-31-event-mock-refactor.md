# Event-Mock 模块重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构 event-mock 模块，采用响应式 Context 模式实现分层解耦，零侵入设计。

**Architecture:** 响应式 Context 模式 - 单一 Context 管理配置和执行，Vue reactive/computed 自动同步，存储层独立，Dispatcher 内联。

**Tech Stack:** Vue 3 + TypeScript + Tampermonkey GM API + Element Plus

---

## Task 1: 类型定义

**Files:**
- Create: `src/tools/event-mock1/types.ts`

- [ ] **Step 1: 创建 types.ts 文件**

```typescript
/**
 * Event-Mock 模块类型定义
 */

export interface EventItem {
  id: string        // eventId
  title: string     // 显示名称
  data: any         // 返回的静态数据
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

- [ ] **Step 2: 提交类型定义**

```bash
git add src/tools/event-mock1/types.ts
git commit -m "feat(event-mock1): add type definitions"
```

---

## Task 2: 核心上下文

**Files:**
- Create: `src/tools/event-mock1/core/context.ts`

- [ ] **Step 1: 创建 context.ts 文件结构**

```typescript
import { computed, reactive } from 'vue'
import type { ConfigData, WinningSDK } from '../types'

/**
 * 事件模拟核心上下文
 * - 响应式配置管理
 * - 事件执行
 * - winning 挂载/卸载（零侵入）
 */
class EventMockContext {
  private config = reactive<ConfigData>({
    enable: false,
    events: []
  })

  private eventMap = computed(() => {
    const map = new Map<string, any>()
    this.config.events.forEach(event => {
      map.set(event.id, event.data)
    })
    return map
  })

  private originalWinning: WinningSDK | null = null
  private mounted = false

  // 后续步骤添加方法
}

export const context = new EventMockContext()
```

- [ ] **Step 2: 添加 getConfig 和 updateConfig 方法**

```typescript
// 在 EventMockContext 类中添加

getConfig(): ConfigData {
  return this.config
}

updateConfig(newConfig: ConfigData) {
  const wasEnabled = this.config.enable
  this.config.enable = newConfig.enable
  this.config.events = [...newConfig.events]

  // 动态挂载/卸载（零侵入）
  if (newConfig.enable && !wasEnabled) {
    this.mount()
  } else if (!newConfig.enable && wasEnabled) {
    this.unmount()
  }
}
```

- [ ] **Step 3: 添加 mount 和 unmount 方法**

```typescript
// 在 EventMockContext 类中添加

mount() {
  if (this.mounted) return
  this.originalWinning = unsafeWindow.winning
  unsafeWindow.winning = {
    ...unsafeWindow.winning,
    dispatchEvent: (eventId: string, params: string, cb: (result: string) => void) => {
      return this.execute(eventId, params, cb)
    },
    getMacadress: () => '00:00:00:00:00:00',
    getPcName: () => '-',
    getIP: () => '0.0.0.0',
    deltaResult: () => true,
    showMsg: () => {},
    postMessage: () => {},
  }
  this.mounted = true
}

unmount() {
  if (!this.mounted) return
  if (this.originalWinning) {
    unsafeWindow.winning = this.originalWinning
  }
  this.mounted = false
}

isMounted(): boolean {
  return this.mounted
}
```

- [ ] **Step 4: 添加 execute 方法**

```typescript
// 在 EventMockContext 类中添加

execute(eventId: string, params: string, cb: (result: string) => void): string {
  const data = this.eventMap.value.get(eventId)
  try {
    const result = data ? JSON.stringify(data) : '{}'
    cb(result)
    return result
  } catch (e) {
    console.error('EventMock execute error:', e)
    cb('{}')
    return '{}'
  }
}
```

- [ ] **Step 5: 完整 context.ts 文件**

最终文件内容：

```typescript
import { computed, reactive } from 'vue'
import type { ConfigData, WinningSDK } from '../types'

/**
 * 事件模拟核心上下文
 * - 响应式配置管理
 * - 事件执行
 * - winning 挂载/卸载（零侵入）
 */
class EventMockContext {
  private config = reactive<ConfigData>({
    enable: false,
    events: []
  })

  private eventMap = computed(() => {
    const map = new Map<string, any>()
    this.config.events.forEach(event => {
      map.set(event.id, event.data)
    })
    return map
  })

  private originalWinning: WinningSDK | null = null
  private mounted = false

  getConfig(): ConfigData {
    return this.config
  }

  updateConfig(newConfig: ConfigData) {
    const wasEnabled = this.config.enable
    this.config.enable = newConfig.enable
    this.config.events = [...newConfig.events]

    if (newConfig.enable && !wasEnabled) {
      this.mount()
    } else if (!newConfig.enable && wasEnabled) {
      this.unmount()
    }
  }

  mount() {
    if (this.mounted) return
    this.originalWinning = unsafeWindow.winning
    unsafeWindow.winning = {
      ...unsafeWindow.winning,
      dispatchEvent: (eventId: string, params: string, cb: (result: string) => void) => {
        return this.execute(eventId, params, cb)
      },
      getMacadress: () => '00:00:00:00:00:00',
      getPcName: () => '-',
      getIP: () => '0.0.0.0',
      deltaResult: () => true,
      showMsg: () => {},
      postMessage: () => {},
    }
    this.mounted = true
  }

  unmount() {
    if (!this.mounted) return
    if (this.originalWinning) {
      unsafeWindow.winning = this.originalWinning
    }
    this.mounted = false
  }

  isMounted(): boolean {
    return this.mounted
  }

  execute(eventId: string, params: string, cb: (result: string) => void): string {
    const data = this.eventMap.value.get(eventId)
    try {
      const result = data ? JSON.stringify(data) : '{}'
      cb(result)
      return result
    } catch (e) {
      console.error('EventMock execute error:', e)
      cb('{}')
      return '{}'
    }
  }
}

export const context = new EventMockContext()
```

- [ ] **Step 6: 提交核心上下文**

```bash
git add src/tools/event-mock1/core/context.ts
git commit -m "feat(event-mock1): add core context with mount/unmount"
```

---

## Task 3: 模板存储

**Files:**
- Create: `src/tools/event-mock1/storage/template.ts`

- [ ] **Step 1: 创建 template.ts 文件**

```typescript
import type { TemplateItem } from '../types'

const STORAGE_KEY = `${__namespace}event-mock-templates`

/**
 * 模板存储
 * - 管理 GM 存储
 * - 提供 CRUD 操作
 * - 按 eventId 筛选
 */
export class TemplateStorage {
  getAll(): TemplateItem[] {
    return GM_getValue(STORAGE_KEY, [])
  }

  getByEventId(eventId: string): TemplateItem[] {
    return this.getAll().filter(t => t.eventId === eventId)
  }

  add(template: TemplateItem) {
    const templates = this.getAll()
    templates.push(template)
    GM_setValue(STORAGE_KEY, templates)
  }

  remove(templateId: string) {
    const templates = this.getAll().filter(t => t.id !== templateId)
    GM_setValue(STORAGE_KEY, templates)
  }

  update(templateId: string, data: Partial<TemplateItem>) {
    const templates = this.getAll()
    const index = templates.findIndex(t => t.id === templateId)
    if (index > -1) {
      templates[index] = { ...templates[index], ...data }
      GM_setValue(STORAGE_KEY, templates)
    }
  }
}
```

- [ ] **Step 2: 提交模板存储**

```bash
git add src/tools/event-mock1/storage/template.ts
git commit -m "feat(event-mock1): add template storage"
```

---

## Task 4: 配置存储

**Files:**
- Create: `src/tools/event-mock1/storage/config.ts`

- [ ] **Step 1: 创建 config.ts 文件**

```typescript
import { context } from '../core/context'
import type { ConfigData } from '../types'

const STORAGE_KEY = `${__namespace}event-mock-config`

/**
 * 配置存储
 * - 管理 GM 存储
 * - 加载/保存配置
 * - 同步到 Context（触发 mount/unmount）
 */
export class ConfigStorage {
  load(): ConfigData {
    const config = GM_getValue(STORAGE_KEY, { enable: false, events: [] })
    context.updateConfig(config)
    return config
  }

  save(config: ConfigData) {
    GM_setValue(STORAGE_KEY, {
      enable: config.enable,
      events: config.events.map(e => ({
        id: e.id,
        title: e.title,
        data: e.data
      }))
    })
    context.updateConfig(config)
  }

  get(): ConfigData {
    const config = context.getConfig()
    return {
      enable: config.enable,
      events: [...config.events]
    }
  }
}
```

- [ ] **Step 2: 提交配置存储**

```bash
git add src/tools/event-mock1/storage/config.ts
git commit -m "feat(event-mock1): add config storage"
```

---

## Task 5: UI 组件

**Files:**
- Create: `src/tools/event-mock1/ui/event-mock.vue`

- [ ] **Step 1: 创建 event-mock.vue 文件**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { context } from '../core/context'
import { ConfigStorage } from '../storage/config'
import { TemplateStorage } from '../storage/template'
import type { TemplateItem } from '../types'
import JsonEditor from '~/components/jsonEditor.vue'

const configStorage = new ConfigStorage()
const templateStorage = new TemplateStorage()

const config = context.getConfig()
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
```

- [ ] **Step 2: 提交 UI 组件**

```bash
git add src/tools/event-mock1/ui/event-mock.vue
git commit -m "feat(event-mock1): add UI component"
```

---

## Task 6: 模块入口

**Files:**
- Create: `src/tools/event-mock1/index.ts`

- [ ] **Step 1: 创建 index.ts 文件**

```typescript
import type { ToolModule } from '../registry'
import { context } from './core/context'
import { ConfigStorage } from './storage/config'
import EventMockUI from './ui/event-mock.vue'

const name = '事件模拟'
const storageKey = `${__namespace}event-mock1`

function init() {
  const configStorage = new ConfigStorage()
  configStorage.load()
}

EventMockUI.name = name

export const EventMockModule: ToolModule = {
  name,
  storageKey,
  init,
  component: EventMockUI,
  icon: '⚡',
}
```

- [ ] **Step 2: 在 main.ts 中导入模块**

修改 `src/main.ts`，添加导入：

```typescript
// 在其他模块导入后添加
import { EventMockModule } from './tools/event-mock1'
```

然后在 registerTools 调用前添加注册：

```typescript
// 找到类似这样的代码，添加 EventMockModule
registerTools([
  // ...其他模块
  EventMockModule,
])
```

- [ ] **Step 3: 提交模块入口**

```bash
git add src/tools/event-mock1/index.ts src/main.ts
git commit -m "feat(event-mock1): add module entry and register"
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

- [ ] **Step 2: 在浏览器中打开设置面板**

打开 http://localhost:5173（或开发服务器地址），找到"事件模拟"功能，验证：
- UI 正常显示
- 启用开关可切换
- 添加/删除事件按钮正常
- JSON 编辑器正常渲染

- [ ] **Step 3: 运行构建**

```bash
pnpm build
```

Expected: 构建成功，输出 `dist/index.user.js`

- [ ] **Step 4: 提交验证**

```bash
git add -A
git commit -m "chore: verify event-mock1 module build"
```

---

## Task 8: 功能测试

**Files:**
- 无新增文件

- [ ] **Step 1: 测试启用功能**

1. 打开设置面板，启用"事件模拟"
2. 添加一个事件：eventId = `399563027`, data = `{ "success": true, "data": ["test"] }`
3. 保存配置
4. 在页面中调用 `unsafeWindow.winning.dispatchEvent('399563027', '', (result) => console.log(result))`
5. Expected: 输出 `{"success":true,"data":["test"]}`

- [ ] **Step 2: 测试禁用功能（零侵入）**

1. 禁用"事件模拟"
2. 保存配置
3. 检查 `unsafeWindow.winning.dispatchEvent` 是否恢复原始状态
4. Expected: winning 对象恢复原始状态，dispatchEvent 不返回模拟数据

- [ ] **Step 3: 测试模板功能**

1. 添加事件，编辑数据
2. 点击"保存模板"
3. 删除事件，重新添加相同 eventId
4. 从模板下拉选择刚保存的模板
5. Expected: 数据自动填充为模板内容

- [ ] **Step 4: 提交测试完成**

```bash
git add -A
git commit -m "test: event-mock1 functional tests passed"
```

---

## Self-Review Checklist

- [x] **Spec coverage**: 所有设计文档中的组件都有对应任务
- [x] **Placeholder scan**: 无 TBD/TODO，所有步骤有完整代码
- [x] **Type consistency**: types.ts 中定义的类型在各文件中一致使用
- [x] **File paths**: 所有文件路径准确
- [x] **Commands**: 所有命令可执行且有预期输出