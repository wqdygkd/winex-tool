# Event-Mock 模块设计文档

## 文档状态

本文档合并了 event-mock 历史重构设计、优化设计和本次全量重写设计，并以当前重写后的实现为准。

已合并的历史内容包括 winning SDK mock、GM 存储、模板持久化、启停恢复、折叠卡片、预置数据导入、eventId 预设和 params 条件匹配。旧设计中的响应式 `Context` 架构已废弃；当前实现使用纯函数 matcher、独立 runtime、独立 storage 和 Vue 配置面板。

## 目标

`event-mock` 用于在油猴脚本环境中模拟 Winning SDK 的 `winning.dispatchEvent`。启用后，模块会在页面 window 上安装一个 mock `winning` 对象，根据设置页配置的规则返回确定性的 JSON 字符串，便于本地调试和业务页面联调。

核心能力：

- 替换并恢复页面上的 `winning.dispatchEvent`。
- 根据 `eventId` 和可选 params 条件选择返回数据。
- 支持无条件默认规则作为同一 `eventId` 的 fallback。
- 支持预置模板、用户模板、按 `eventId` 过滤模板。
- 支持将模板中的完整 JSON 数据写入规则的“返回数据”。
- 未匹配到规则时返回提示文案：`未匹配到规则，请在设置页面配置`。

## 非目标

- 不迁移旧版 `event-mock-config` 数据结构。
- 不为 plain script 模式启用 event-mock。
- 不配置除 `dispatchEvent` 以外的 winning 行为；其他 winning 方法只保留最小默认值。
- 不保留备注字段。

旧数据策略：不做兼容迁移，但运行时和设置页不能因为旧的或非法 GM 数据崩溃。非法配置会被忽略并回退默认值。

## 文件结构

```text
src/tools/event-mock/
├── core/
│   ├── matcher.ts        # params 解析、路径取值、条件匹配、规则选择、结果序列化
│   ├── rules.ts          # 规则工具：模板套用、条件规范化、JSON 深拷贝
│   ├── runtime.ts        # winning 挂载、卸载、dispatchEvent mock
│   └── singleton.ts      # 油猴目标 window 解析与 runtime 单例
├── presets/
│   ├── data/             # 预置 JSON 数据
│   ├── eventIds.ts       # 常用 eventId 预设
│   ├── index.ts          # presets 对外出口
│   └── templates.ts      # 预置 JSON 转模板
├── storage/
│   ├── config.ts         # 规则配置 GM 存储
│   └── template.ts       # 模板 GM 存储
├── ui/
│   └── event-mock.vue    # 设置面板
├── index.ts              # 模块初始化
└── types.ts              # 模块类型定义
```

## 数据模型

```ts
export interface MockCondition {
  path: string
  value: unknown
}

export interface MockRule {
  id: string
  enabled: boolean
  eventId: string
  title: string
  conditions: MockCondition[]
  response: Record<string, unknown>
}

export interface EventMockConfig {
  enabled: boolean
  rules: MockRule[]
}

export interface MockTemplate {
  id: string
  eventId: string
  name: string
  response: Record<string, unknown>
  preset?: boolean
}
```

当前 GM 存储键：

| 数据 | 存储键 |
| --- | --- |
| 规则配置 | `GM_wqdy_event-mock-config` |
| 模板配置 | `GM_wqdy_event-mock-templates` |

## 初始化流程

模块入口在 `index.ts`：

```text
EventMockModule.init()
→ ConfigStorage.load()
→ runtime.update(config)
→ TemplateStorage.importPresets(getPresetTemplates())
```

初始化时会先加载配置并按 `enabled` 状态更新 runtime。随后导入预置模板。预置模板按固定 ID 导入；如果已有同 ID 预置模板但内容已变化，会刷新为最新预置数据。用户自建模板不会被预置导入覆盖。

## Runtime 设计

`core/runtime.ts` 负责所有页面对象变更。

启用时：

```text
runtime.update({ enabled: true, rules })
→ mount()
→ 保存原始 target.winning
→ 安装合并后的 winning mock
→ winning.dispatchEvent 指向 runtime.dispatchEvent
```

禁用时：

```text
runtime.update({ enabled: false, rules })
→ unmount()
→ 如果原来存在 winning，则恢复原对象
→ 如果原来不存在 winning，则删除 mock winning
```

`dispatchEvent(eventId, params?, cb?)` 支持：

- `params` 为 JSON 字符串。
- `params` 为普通对象。
- `params` 为空。
- `cb` 可选。

返回值与传给 callback 的值一致，都是 JSON 字符串。callback 抛错会被捕获并打印，不中断业务页面调用。

`core/singleton.ts` 在油猴环境中优先使用 `unsafeWindow`，没有时回退到 `window` 或 `globalThis`，避免非油猴测试环境出现 `unsafeWindow is not defined`。

## 规则匹配

`core/matcher.ts` 是纯函数层，负责：

- `parseParams`：把 string/object/empty params 统一成对象。
- `getValueByPath`：用点路径读取 params，如 `body.identityEntryId`。
- `matchesConditions`：所有有效条件都匹配才算命中。
- `selectRule`：按规则列表选择最终规则。
- `serializeResponse`：把响应对象转成 JSON 字符串。
- `createDispatchResult`：生成最终 dispatch 返回值。

选择顺序：

1. 忽略禁用规则。
2. 精确匹配 `eventId`。
3. 优先选择有有效 params 条件且全部命中的规则。
4. 未命中条件规则时，使用第一条无有效条件规则作为 fallback。
5. 仍未找到时返回：`{"message":"未匹配到规则，请在设置页面配置"}`。

params 条件规范化规则：

- 只过滤 `path` 为空或全空格的条件。
- `value` 可以为空字符串，空值会保留并参与匹配。
- 字符串类型的 `path` 和 `value` 会 trim 后保存和匹配。
- 条件值使用严格相等或字符串等价匹配，例如 `1` 可匹配 `"1"`。

## UI 设计

`ui/event-mock.vue` 是设置面板，使用折叠规则列表。

页面能力：

- 顶部启用开关。
- 启用规则数量和规则总数展示。
- 添加规则、复制规则、删除规则。
- 手动保存配置，并支持配置变更后的 500ms debounce 自动保存。
- 规则标题、eventId 预设选择和自定义输入。
- params 匹配条件增删。
- 模板选择、保存为模板、删除用户模板。
- 返回数据 JSON 编辑器。

界面约束：

- 模板下拉按当前规则 `eventId` 过滤。
- 每条规则有独立的模板选择状态。
- “返回数据”编辑区最大高度为 `200px`，超出后内部滚动。
- 不展示备注字段。

## 模板与预置数据

模板数据模型使用 `response` 字段，表示可以直接写入规则 `response` 的完整 JSON 对象。

模板应用流程：

```text
用户选择模板
→ applyTemplate(rule, templateId)
→ 从 templates 中找到 MockTemplate
→ applyTemplateResponse(rule, template.response)
→ JsonEditor 通过 v-model 展示新的 rule.response
```

注意：预置 JSON 的完整对象就是返回数据，不再额外读取 `data` 字段。

预置模板来源：

- `src/tools/event-mock/presets/data/丽水市中心医院测试.json`
- `src/tools/event-mock/presets/data/gcp成功.json`
- `src/tools/event-mock/presets/data/gcp失败.json`

当前预置 eventId：

| eventId | 名称 | 说明 |
| --- | --- | --- |
| `399297247` | 读卡事件 | 医保卡/身份证读卡 |
| `399563027` | 打印机列表 | 获取打印机列表 |

## 存储设计

`ConfigStorage`：

- `load()`：读取 GM 配置，只接受新模型 `{ enabled, rules }`。
- `save(config)`：保存新模型，并在保存前过滤空 path 条件。
- 非法旧数据回退到 `{ enabled: false, rules: [] }`。

`TemplateStorage`：

- `getAll()`：读取所有合法模板。
- `getByEventId(eventId)`：按 eventId 查询模板。
- `add(template)`：新增用户模板。
- `update(templateId, data)`：只允许更新非预置模板。
- `remove(templateId)`：只允许删除非预置模板。
- `importPresets(presets)`：新增缺失预置；刷新内容变化的已有预置；保持无变化导入幂等。

非法模板存储会被忽略并按空数组处理。

## 数据流

配置编辑流：

```text
用户编辑规则
→ Vue config ref 变化
→ watch 触发 debounce
→ ConfigStorage.save(config)
→ runtime.update(config)
→ winning.dispatchEvent 使用最新规则
```

外部调用流：

```text
业务页面调用 winning.dispatchEvent(eventId, params, cb)
→ runtime.dispatchEvent(eventId, params, cb)
→ parseParams(params)
→ selectRule(rules, eventId, params)
→ createDispatchResult(rule)
→ cb(result)
→ return result
```

模板流：

```text
初始化或手动导入预置
→ TemplateStorage.importPresets(getPresetTemplates())
→ UI 读取 templates
→ 按 rule.eventId 展示模板
→ 选择模板后完整 response 写入 rule.response
```

## 错误处理

| 场景 | 处理 |
| --- | --- |
| 没有匹配规则 | 返回配置提示文案 |
| params 不是合法 JSON 字符串 | 按空对象 `{}` 匹配 |
| response 无法 JSON.stringify | 返回 `{}` |
| callback 抛错 | 捕获并打印错误 |
| `unsafeWindow` 不存在 | 回退 `window` 或 `globalThis` |
| GM 配置是旧结构或非法结构 | 忽略并使用默认配置 |
| GM 模板是非法结构 | 忽略并使用空模板列表 |

## 验证

当前模块有聚焦测试脚本：

```bash
pnpm test:event-mock
```

覆盖范围：

- params 解析和 dot-path 取值。
- 条件匹配、空 path 过滤、空 value 匹配。
- 条件规则优先和无条件 fallback。
- 未匹配提示文案。
- runtime 挂载、卸载、callback、对象 params。
- 无 `unsafeWindow` 环境导入。
- 配置和模板 GM 存储。
- 预置模板导入、幂等刷新、完整 response 保留。

构建验证：

```bash
pnpm build
```

plain script 构建应继续通过功能过滤排除 `event-mock`。
