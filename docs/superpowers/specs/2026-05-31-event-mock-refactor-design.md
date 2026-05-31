# Event-Mock 模块重构设计

## 概述

重构 event-mock 模块，采用响应式 Context 模式实现分层解耦。核心功能保持不变：模拟 Windows 上 winning.dispatchEvent 方法，根据配置返回不同的静态数据。

## 需求

### 核心需求
- 模拟 `unsafeWindow.winning.dispatchEvent` 方法
- 外部调用该方法并传参，根据配置返回不同的静态 JSON 数据
- 其他 winning 方法保持硬编码默认值（getMacadress、getIP 等）

### 扩展需求
- 支持添加新事件处理器（eventId + 返回数据配置）
- 模板功能：保存、应用模板，按 eventId 区分，持久化存储
- 模板作为预设，应用到配置后才生效

### 约束
- 只支持静态数据返回（static 类型）
- 默认值硬编码，不需要配置其他 winning 方法
- 不需要分组，模板按 eventId 自动筛选

## 架构设计

### 设计理念

**响应式 Context 模式**：
1. **单一 Context 对象** - 统一管理配置和执行能力，各层通过它通信
2. **Vue 响应式** - 配置变化自动传播到执行层，无需手动同步
3. **存储层独立** - 只负责 GM 存储读写，通过 Context 接口更新配置
4. **Dispatcher 内联** - 不独立存在，作为 Context 的执行方法

### 文件结构

```
event-mock1/
├── core/
│   └── context.ts       # 核心上下文：配置 + 执行能力
├── storage/
│   ├── config.ts        # 配置存储读写
│   └── template.ts      # 模板存储读写
├── ui/
│   └── event-mock.vue   # 配置界面
├── index.ts             # 模块入口
└── types.ts             # 类型定义
```

### 分层职责

| 层 | 文件 | 职责 |
|----|------|------|
| **核心层** | context.ts | 响应式配置管理、事件执行、winning 挂载入口 |
| **存储层** | config.ts | GM 存储读写、配置加载保存 |
| **存储层** | template.ts | 模板 CRUD、持久化存储 |
| **UI 层** | event-mock.vue | 用户交互、直接绑定响应式配置 |

## 组件详细设计

### types.ts - 类型定义

```typescript
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
```

### core/context.ts - 核心上下文

**职责**：
- 维护响应式配置（enable + events）
- 提供 execute 方法供 winning.dispatchEvent 调用
- 通过 Vue computed 自动维护 eventId → data 映射
- 提供 mount/unmount 方法实现动态挂载/卸载（零侵入）

**关键设计**：
- `config` 使用 Vue reactive，UI 直接绑定
- `eventMap` 使用 computed，配置变化时自动重建映射
- `mount()` 挂载 winning 对象到 unsafeWindow
- `unmount()` 恢复原始 winning 对象（零侵入）
- `execute` 从 eventMap 读取数据，返回 JSON 字符串

**接口**：
```typescript
class EventMockContext {
  getConfig(): ConfigData           // 获取响应式配置
  updateConfig(config: ConfigData)  // 更新配置，自动处理挂载/卸载
  execute(eventId, params, cb)      // 执行事件分发
  mount()                           // 挂载 winning 对象
  unmount()                         // 卸载 winning 对象（恢复原始）
  isMounted(): boolean              // 是否已挂载
}
```

**updateConfig 实现**：
```typescript
updateConfig(newConfig: ConfigData) {
  const wasEnabled = this.config.enable
  this.config.enable = newConfig.enable
  this.config.events = newConfig.events

  // 动态挂载/卸载（零侵入）
  if (newConfig.enable && !wasEnabled) {
    this.mount()
  } else if (!newConfig.enable && wasEnabled) {
    this.unmount()
  }
}
```

**mount/unmount 实现**：
```typescript
private originalWinning: WinningSDK | null = null
private mounted = false

mount() {
  if (this.mounted) return
  this.originalWinning = unsafeWindow.winning  // 保存原始对象
  unsafeWindow.winning = {
    ...unsafeWindow.winning,
    dispatchEvent(eventId, params, cb) {
      return this.execute(eventId, params, cb)
    },
    getMacadress() { return '00:00:00:00:00:00' },
    getPcName() { return '-' },
    getIP() { return '0.0.0.0' },
    deltaResult() { return true },
    showMsg() {},
    postMessage() {},
  }
  this.mounted = true
}

unmount() {
  if (!this.mounted) return
  // 恢复原始 winning 对象（零侵入）
  if (this.originalWinning) {
    unsafeWindow.winning = this.originalWinning
  }
  this.mounted = false
}
```

**execute 实现**：
```typescript
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

### storage/config.ts - 配置存储

**职责**：
- 管理 GM 存储（key: `${__namespace}event-mock-config`）
- 加载配置并同步到 Context（自动触发 mount/unmount）
- 保存配置到 GM 存储 + 同步到 Context

**接口**：
```typescript
class ConfigStorage {
  load(): ConfigData                // 加载存储并同步到 Context（触发 mount/unmount）
  save(config: ConfigData)          // 保存到存储 + 同步到 Context（触发 mount/unmount）
  get(): ConfigData                 // 获取当前配置
}
```

**零侵入保证**：
- load() 时如果 config.enable 为 false，不会挂载 winning
- save() 时 enable 变化会自动触发 mount/unmount
```

### storage/template.ts - 模板存储

**职责**：
- 管理模板数据库（独立存储，key: `${__namespace}event-mock-templates`）
- 提供 CRUD 操作
- 按 eventId 筛选模板

**接口**：
```typescript
class TemplateStorage {
  getAll(): TemplateItem[]
  getByEventId(eventId: string): TemplateItem[]
  add(template: TemplateItem)
  remove(templateId: string)
  update(templateId: string, data: Partial<TemplateItem>)
}
```

### ui/event-mock.vue - 配置界面

**职责**：
- 直接绑定 Context 的响应式配置
- 提供启用开关、事件编辑、模板操作
- 保存时调用 ConfigStorage.save()

**交互**：
- 编辑事件：直接修改 config.events（响应式自动更新）
- 应用模板：从 TemplateStorage 读取，复制数据到 event.data
- 保存模板：调用 TemplateStorage.add()
- 保存配置：调用 ConfigStorage.save()

**设计特点**：
- 约 60 行代码，简洁扁平布局
- 无弹窗对话框，模板名称使用默认值 + 可编辑
- 模板下拉按 eventId 自动筛选

### index.ts - 模块入口

**职责**：
- 注册模块到 ToolRegistry
- 初始化：加载配置，仅启用时挂载 winning（零侵入）

**初始化逻辑**：
```typescript
function init() {
  const configStorage = new ConfigStorage()
  const config = configStorage.load()  // load 会自动触发 mount（如果 enable）
}
```

**零侵入原则**：
- init() 时如果 config.enable 为 false，不挂载任何对象
- 用户在 UI 中切换 enable 时，通过 context.updateConfig() 自动处理挂载/卸载

## 数据流

### 初始化流

```
init() → ConfigStorage.load()
       → GM_getValue 读取配置
       → context.updateConfig(config)
       → if enable: context.mount()（挂载 winning）
       → else: 不挂载（零侵入）
```

### 配置编辑流

```
用户编辑 → config.events 变化（响应式）
         → eventMap computed 重建
         → execute 自动使用新数据
用户点击保存 → ConfigStorage.save()
             → GM_setValue 存储
             → context.updateConfig()
             → enable 变化时自动 mount/unmount
```

### 模板操作流

```
选择模板 → TemplateStorage.getByEventId()
         → 复制 template.data 到 event.data
         → 响应式自动更新
保存模板 → TemplateStorage.add()
         → GM_setValue 存储
         → templates 列表刷新
```

### 外部调用流

```
winning.dispatchEvent('399563027', params, cb)
→ context.execute()
→ eventMap.get('399563027')
→ JSON.stringify(data)
→ cb(result)
```

## 存储结构

| 存储键 | 内容 |
|--------|------|
| `${__namespace}event-mock-config` | `{ enable: boolean, events: EventItem[] }` |
| `${__namespace}event-mock-templates` | `TemplateItem[]` |

## 错误处理

| 场景 | 处理 |
|------|------|
| eventId 未匹配 | 返回 `{}` 并调用 cb |
| JSON.stringify 失败 | 捕获异常，返回 `{}` |
| GM_getValue 解析失败 | 返回默认值 `{ enable: false, events: [] }` |

## 与原有代码对比

| 原设计 | 新设计 |
|--------|--------|
| Dispatcher 类 + 手动 register | Context + 响应式 computed |
| 存储层依赖 Dispatcher | 存储层通过 Context 接口通信 |
| UI 450+ 行 | UI 约 60 行 |
| 模板内存状态 | 模板持久化存储 |
| 手动同步配置 | Vue 响应式自动同步 |

## 设计亮点

1. **响应式同步** - Vue computed 自动维护 eventMap，配置变化无需手动同步
2. **单一 Context** - 各层通过 Context 通信，没有层间直接依赖
3. **存储层独立** - ConfigStorage/TemplateStorage 只负责 GM 读写
4. **Dispatcher 内联** - 执行逻辑在 Context 内部，不需要独立的类
5. **UI 简洁** - 直接绑定响应式配置，代码量大幅减少
6. **零侵入设计** - 未启用时不挂载 winning，启用时动态挂载，禁用时恢复原始对象