# Event-Mock 模块优化设计

## 概述

在现有响应式 Context 架构基础上，扩展以下功能：
1. UI 折叠卡片展示事件列表
2. 预制数据自动导入
3. params 参数匹配（eventId + params 双重匹配）
4. eventId 预设选择

## 需求

### 核心需求
- 事件列表改为折叠卡片展示，解决平铺不好查看的问题
- 启动时自动导入 `data/` 文件夹中的预制 JSON 数据作为模板
- 支持 params 参数匹配：同一 eventId 根据 params 不同返回不同内容
- eventId 支持预设下拉选择

### params 匹配场景
- eventId = 399297247，params.body.identityEntryId = 3 → 医保卡数据
- eventId = 399297247，params.body.identityEntryId = 4 → 身份证数据

### 约束
- params 传入时是 JSON 字符串，需解析后匹配
- 使用 JSON Path 表达式匹配（如 `body.identityEntryId`）
- 多个 params 条件需全部满足才匹配成功

## 架构设计

### 设计方案

**方案 A：扩展现有架构**

在现有 Context 模式基础上扩展，改动最小：
- UI 层改为折叠卡片
- 数据结构增加 paramsConditions 字段
- 执行逻辑改为 eventId + params 双重匹配
- 新增 presets 模块管理预设

### 文件结构

```
event-mock1/
├── core/
│   └── context.ts        # 修改：execute 增加 params 匹配逻辑
├── storage/
│   ├── config.ts         # 不变
│   └── template.ts       # 不变
├── presets/              # 新增
│   ├── index.ts          # 预设管理：eventId 预设 + 预制数据导入
│   ├── eventIds.ts       # eventId 预设列表
│   └── data/             # 预制 JSON 数据
│       ├── 丽水市中心医院测试.json
│       ├── gcp成功.json
│       └── gcp失败.json
├── ui/
│   └── event-mock.vue    # 修改：折叠卡片 + params 条件配置
├── index.ts              # 修改：初始化时导入预制数据
└── types.ts              # 修改：新增 ParamsCondition、EventIdPreset
```

## 组件详细设计

### types.ts - 类型定义扩展

```typescript
// 新增：params 条件定义
export interface ParamsCondition {
  path: string       // JSON Path，如 "body.identityEntryId"
  value: any         // 匹配值，如 3
}

// 修改：EventItem 增加 paramsConditions
export interface EventItem {
  id: string                    // eventId
  title: string                 // 显示名称
  data: any                     // 返回的静态数据
  paramsConditions?: ParamsCondition[]  // 可选：params 匹配条件
}

// 新增：eventId 预设
export interface EventIdPreset {
  id: string        // eventId
  name: string      // 中文名称，如 "读卡事件"
  description?: string  // 可选描述
}
```

### core/context.ts - 执行逻辑修改

**params 匹配流程**：
1. 按 eventId 筛选出所有匹配的事件
2. 解析 params JSON 字符串
3. 按 paramsConditions 匹配每个候选事件
4. 匹配成功返回对应事件数据
5. 无匹配返回 fallback（无 paramsConditions 的事件）

```typescript
execute(eventId: string, params: string, cb: (result: string) => void): string {
  // 1. 按 eventId 筛选
  const candidates = this.config.events.filter(e => e.id === eventId)
  if (candidates.length === 0) {
    cb('{}')
    return '{}'
  }

  // 2. 解析 params JSON
  let paramsObj: any = {}
  try {
    paramsObj = JSON.parse(params)
  } catch (e) {
    // params 解析失败
  }

  // 3. 按 paramsConditions 匹配
  for (const event of candidates) {
    if (this.matchParams(paramsObj, event.paramsConditions)) {
      const result = JSON.stringify(event.data)
      cb(result)
      return result
    }
  }

  // 4. 无匹配，返回 fallback
  const fallback = candidates.find(e => !e.paramsConditions) || candidates[0]
  const result = JSON.stringify(fallback?.data || {})
  cb(result)
  return result
}

// JSON Path 匹配：所有条件需满足
private matchParams(paramsObj: any, conditions?: ParamsCondition[]): boolean {
  if (!conditions || conditions.length === 0) return true
  return conditions.every(cond => {
    const actualValue = this.getValueByPath(paramsObj, cond.path)
    return actualValue === cond.value
  })
}

// 按 JSON Path 获取值
private getValueByPath(obj: any, path: string): any {
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current == null) return undefined
    current = current[key]
  }
  return current
}
```

### presets/eventIds.ts - eventId 预设列表

```typescript
import type { EventIdPreset } from '../types'

export const eventIdPresets: EventIdPreset[] = [
  { id: '399297247', name: '读卡事件', description: '医保卡/身份证读卡' },
  { id: '399563027', name: '打印机列表', description: '获取打印机列表' },
  // 按需添加其他常用 eventId
]
```

### presets/index.ts - 预制数据导入

```typescript
import type { TemplateItem } from '../types'
import type { TemplateStorage } from '../storage/template'
import { eventIdPresets } from './eventIds'

export { eventIdPresets }

// 预制数据文件配置
interface PresetDataFile {
  filename: string
  eventId: string
  paramsConditions?: ParamsCondition[]  // 可选：预制 params 条件
}

const presetDataFiles: PresetDataFile[] = [
  { filename: '丽水市中心医院测试.json', eventId: '399297247' },
  { filename: 'gcp成功.json', eventId: '399297247' },
  { filename: 'gcp失败.json', eventId: '399297247' },
]

// 导入预制数据到 TemplateStorage
export async function importPresetData(templateStorage: TemplateStorage): Promise<void> {
  for (const file of presetDataFiles) {
    try {
      const data = await import(`./data/${file.filename}`)
      const template: TemplateItem = {
        id: `preset_${file.filename}`,
        eventId: file.eventId,
        name: file.filename.replace('.json', ''),
        data: data.default || data
      }
      const existing = templateStorage.getAll()
      if (!existing.find(t => t.id === template.id)) {
        templateStorage.add(template)
      }
    } catch (e) {
      console.warn(`Failed to import preset data: ${file.filename}`, e)
    }
  }
}
```

### ui/event-mock.vue - 折叠卡片 UI

使用 `el-collapse` 组件：

```vue
<template>
  <div class="event-mock">
    <div class="header">
      <el-switch v-model="config.enable" active-text="启用" inactive-text="禁用" />
      <el-button type="primary" size="small" @click="save">保存配置</el-button>
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
            <span class="event-id">{{ event.id }}</span>
            <span class="event-title">{{ event.title }}</span>
            <el-button type="danger" size="small" @click.stop="removeEvent(index)">删除</el-button>
          </div>
        </template>

        <div class="event-config">
          <!-- eventId：预设下拉 + 自定义 -->
          <div class="config-row">
            <label>eventId:</label>
            <el-select v-model="event.id" placeholder="选择预设" size="small" filterable allow-create>
              <el-option v-for="preset in eventIdPresets" :key="preset.id" :label="preset.name" :value="preset.id" />
            </el-select>
          </div>

          <!-- title -->
          <div class="config-row">
            <label>标题:</label>
            <el-input v-model="event.title" size="small" />
          </div>

          <!-- params 匹配条件 -->
          <div class="config-section">
            <div class="section-header">
              <span>params 匹配条件</span>
              <el-button size="small" @click="addCondition(index)">+ 添加条件</el-button>
            </div>
            <div v-for="(cond, condIndex) in event.paramsConditions" :key="condIndex" class="condition-row">
              <el-input v-model="cond.path" placeholder="路径(如 body.identityEntryId)" size="small" />
              <el-input v-model="cond.value" placeholder="值" size="small" />
              <el-button size="small" @click="removeCondition(index, condIndex)">删除</el-button>
            </div>
          </div>

          <!-- 模板选择 -->
          <div class="config-row">
            <label>模板:</label>
            <el-select placeholder="选择模板" size="small" clearable @change="applyTemplate(index, $event)">
              <el-option v-for="t in templates.filter(t => t.eventId === event.id)" :key="t.id" :label="t.name" :value="t.id" />
            </el-select>
            <el-button size="small" @click="saveAsTemplate(event)">保存模板</el-button>
          </div>

          <!-- JSON 数据 -->
          <JsonEditor v-model="event.data" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { context } from '../core/context'
import { ConfigStorage } from '../storage/config'
import { TemplateStorage } from '../storage/template'
import { eventIdPresets } from '../presets'
import type { TemplateItem, ParamsCondition } from '../types'
import JsonEditor from '~/components/jsonEditor.vue'

const configStorage = new ConfigStorage()
const templateStorage = new TemplateStorage()
const config = context.getConfig()
const templates = ref<TemplateItem[]>([])
const activeNames = ref<number[]>([])

onMounted(() => {
  configStorage.load()
  templates.value = templateStorage.getAll()
})

function addCondition(eventIndex: number) {
  if (!config.events[eventIndex].paramsConditions) {
    config.events[eventIndex].paramsConditions = []
  }
  config.events[eventIndex].paramsConditions!.push({ path: '', value: '' })
}

function removeCondition(eventIndex: number, condIndex: number) {
  config.events[eventIndex].paramsConditions?.splice(condIndex, 1)
}

// ... 其他方法保持不变
</script>
```

### index.ts - 模块初始化修改

```typescript
import { importPresetData } from './presets'

function init() {
  const configStorage = new ConfigStorage()
  const templateStorage = new TemplateStorage()
  
  configStorage.load()
  
  // 自动导入预制数据
  importPresetData(templateStorage)
}
```

## 数据流

### params 匹配流程

```
winning.dispatchEvent('399297247', '{"body":{"identityEntryId":3}}', cb)
→ context.execute()
→ 解析 params: { body: { identityEntryId: 3 } }
→ 筛选 eventId=399297247 的候选事件
→ 匹配 paramsConditions:
   - 事件1: paramsConditions=[{path:"body.identityEntryId", value:3}] → 匹配成功
   - 事件2: paramsConditions=[{path:"body.identityEntryId", value:4}] → 匹配失败
→ 返回事件1.data
```

### 预制数据导入流程

```
init() → importPresetData(templateStorage)
→ 遍历 presetDataFiles
→ import('./data/xxx.json')
→ 创建 TemplateItem
→ templateStorage.add()
→ 用户可在 UI 模板下拉中选择
```

## 存储结构

| 存储键 | 内容 | 变化 |
|--------|------|------|
| `event-mock-config` | `{ enable, events: EventItem[] }` | EventItem 增加 paramsConditions |
| `event-mock-templates` | `TemplateItem[]` | 包含预制数据导入的模板 |

## UI 交互

| 功能 | 操作 |
|------|------|
| 查看事件列表 | 默认折叠，点击展开 |
| 添加事件 | 点击"+ 添加事件"，新增折叠卡片 |
| 选择 eventId | 下拉选择预设或自定义输入 |
| 配置 params 条件 | 点击"+ 添加条件"，输入 path 和 value |
| 应用模板 | 下拉选择模板，数据自动填充 |
| 保存配置 | 点击"保存配置"，写入 GM 存储 |

## 与原有代码对比

| 原设计 | 新设计 |
|--------|--------|
| 平铺列表 | 折叠卡片 |
| 无预制数据导入 | 启动时自动导入 |
| 只按 eventId 匹配 | eventId + params 双重匹配 |
| eventId 手动输入 | 预设下拉选择 |

## 设计亮点

1. **折叠卡片** - 大量事件时可折叠查看，默认只显示 eventId + title
2. **预制数据自动导入** - 常用测试数据作为模板自动加载
3. **params 参数匹配** - 同一 eventId 支持多条规则，按 params 区分
4. **eventId 预设** - 常用 eventId 下拉选择，减少手动输入