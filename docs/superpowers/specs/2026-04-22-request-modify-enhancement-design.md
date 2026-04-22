# 请求修改工具增强设计文档

日期：2026-04-22

## 概述

将现有的 header-modify 工具重命名为 request-modify，并新增响应修改功能。支持静态修改响应体、响应状态码、响应延迟，为后续动态脚本功能预留扩展点。

## 重命名方案

**文件重命名：**
- `src/tools/header-modify/` → `src/tools/request-modify/`
- `header-modify.ts` → `request-modify.ts`
- `header-modify.vue` → `request-modify.vue`

**存储 Key：**
- 旧 key: `${__namespace}header-modify`
- 新 key: `${__namespace}request-modify`
- **不迁移旧数据**，用户需要重新配置

**显示名称：**
- Tab 名称：`请求头修改` → `请求修改`
- Icon 保持：📝

## 数据结构

```typescript
/** 响应操作 */
export interface ResponseOp {
  key: string              // JSON path，如 'data.status'、'data.items[0].name'
  value?: string           // 替换值/合并值（JSON字符串）
  opType: 'replace' | 'merge' | 'full'  // replace替换字段，merge合并，full替换整个响应体
}

/** 响应修改配置 */
export interface ResponseModify {
  modifyType: 'static' | 'script'  // 静态修改 或 动态脚本（后续扩展）
  responseOps?: ResponseOp[]       // 静态操作列表（modifyType='static'时使用）
  script?: string                  // JS脚本代码（modifyType='script'时使用，后续扩展）
  statusCode?: number              // 修改响应状态码，如 404、500
  delayMs?: number                 // 响应延迟时间（毫秒），模拟慢接口
}

/** 请求修改规则 */
export interface RequestModifyRule {
  id: string
  enabled: boolean
  urlPattern: string
  urlMatchType: 'exact' | 'regex' | 'contains'
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[]
  headerOps: HeaderOperation[]     // 请求头操作
  responseModify?: ResponseModify  // 响应修改配置（可选）
  remark: string
}

/** 请求修改分组 */
export interface RequestModifyGroup {
  id: string
  name: string
  enabled: boolean
  rules: RequestModifyRule[]
}

/** 请求修改存储 */
export interface RequestModifyStorage extends BaseStorageData {
  groups: RequestModifyGroup[]
}
```

**保留现有类型：**
- `HeaderOperation` 保持不变

## 功能特性

### 响应体修改操作类型

| 操作类型 | 说明 | 示例 |
|---------|------|------|
| `replace` | 替换指定字段值 | `data.status` → `"success"` |
| `merge` | 合并数据到指定字段 | `data.items` 合并新数组项 |
| `full` | 替换整个响应体 | 用 `{"code":0,"data":{}}` 替换 |

### 响应状态码修改

- 可将任意状态码修改为指定值
- 常用场景：模拟 404、500、403 等错误响应

### 响应延迟

- 设置延迟毫秒数，模拟慢接口
- 常用场景：测试加载状态、超时处理

### URL匹配方式（复用现有）

| 匹配类型 | 说明 |
|---------|------|
| `contains` | URL包含匹配值即匹配 |
| `regex` | 正则表达式匹配 |
| `exact` | 精确匹配完整URL |

### HTTP方法匹配（复用现有）

支持多选：GET、POST、PUT、DELETE、PATCH。不选择表示匹配所有方法。

## 核心实现逻辑

### 拦截机制

```typescript
proxy({
  onRequest: (request, handler) => {
    const matchedRules = collectMatchedRules(request)
    applyHeaders(request.headers, matchedRules)
    handler.next(request)
  },
  onResponse: (response, handler) => {
    const matchedRules = collectMatchedRules(response.config || {})
    
    // 响应延迟处理
    const maxDelay = getMaxDelay(matchedRules)
    if (maxDelay > 0) {
      await sleep(maxDelay)
    }
    
    applyResponseModify(response, matchedRules)
    handler.next(response)
  },
}, unsafeWindow)
```

### 响应修改实现

```typescript
function applyResponseModify(response: any, rules: RequestModifyRule[]): void {
  rules.forEach(rule => {
    if (!rule.responseModify) return
    const config = rule.responseModify
    
    // 修改响应状态码
    if (config.statusCode) {
      response.status = config.statusCode
      response.statusCode = config.statusCode
    }
    
    // 静态响应体修改
    if (config.modifyType === 'static' && config.responseOps) {
      config.responseOps.forEach(op => {
        try {
          if (op.opType === 'full') {
            response.response = op.value || ''
          } else {
            const body = JSON.parse(response.response)
            
            if (op.opType === 'replace') {
              setByPath(body, op.key, JSON.parse(op.value || 'null'))
            } else if (op.opType === 'merge') {
              const existing = getByPath(body, op.key)
              const toMerge = JSON.parse(op.value || '{}')
              setByPath(body, op.key, mergeDeep(existing, toMerge))
            }
            
            response.response = JSON.stringify(body)
          }
        } catch (e) {
          console.error('Response modify error:', e)
        }
      })
    }
  })
}

// JSON path 操作工具函数
function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

function setByPath(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((acc, key) => {
    if (acc[key] === undefined) acc[key] = {}
    return acc[key]
  }, obj)
  target[lastKey] = value
}

function mergeDeep(target: any, source: any): any {
  if (typeof target !== 'object' || typeof source !== 'object') return source
  return { ...target, ...source }
}
```

### 响应延迟实现

```typescript
function getMaxDelay(rules: RequestModifyRule[]): number {
  let maxDelay = 0
  rules.forEach(rule => {
    if (rule.responseModify?.delayMs && rule.responseModify.delayMs > maxDelay) {
      maxDelay = rule.responseModify.delayMs
    }
  })
  return maxDelay
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

## UI设计

### 规则编辑弹窗新增区域

在"Header操作"区域下方添加"响应修改"区域：

```
┌─────────────────────────────────────────────────────────────┐
│ ──────────── 响应修改 ────────────                          │
│ ☐ 启用响应修改                                               │
│                                                             │
│ 响应状态码: [      ] (留空保持原状态)                        │
│ 响应延迟:   [      ] ms (留空不延迟)                         │
│                                                             │
│ 响应体修改类型: [静态修改 ▼]                                  │
│ [添加响应操作]                                               │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ 字段路径     │ 操作类型 │ 值            │ 操作       │     │
│ │ data.status  │ 替换 ▼   │ "success"     │ 删除       │     │
│ │ data.items   │ 合并 ▼   │ [{"id":1}]    │ 删除       │     │
│ │ (整个响应)   │ 整体替换 │ {"code":0}    │ 删除       │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

**当选择"动态脚本"时（后续实现）：**
- 隐藏响应操作表格
- 显示代码编辑器区域

### 规则卡片显示更新

在规则信息行新增响应修改标识：
```
方法: GET, POST | Headers: 2个 | 响应: 静态(状态码404, 延迟100ms, 3个操作)
```

## 文件结构

```
src/tools/request-modify/
├── index.ts              # 工具注册
├── request-modify.ts     # 核心逻辑：拦截、匹配、修改
├── request-modify.vue    # Vue配置组件UI

src/types/index.ts        # 更新类型定义：ResponseOp, ResponseModify, RequestModifyRule, RequestModifyGroup, RequestModifyStorage

src/tools/index.ts        # 导出名称改为 RequestModifyInit, RequestModify
src/tools/ToolContent.vue # Tab名称改为"请求修改"
```

## 依赖

- ajax-hook：已有，用于拦截请求和响应
- Element Plus：已有，用于UI组件
- useGMStorage：已有composable，用于配置存储

## 后续扩展

### 动态脚本功能（Phase 2）

- `modifyType: 'script'` 时启用
- 用户编写JS代码，接收 `response` 对象
- 代码执行环境：安全的沙箱或直接执行
- 脚本示例：
```javascript
// response 为原始响应对象
const data = JSON.parse(response.response);
data.timestamp = Date.now();
response.response = JSON.stringify(data);
return response;
```

## 实现步骤

1. 更新类型定义（types/index.ts）
2. 重命名文件夹和文件
3. 更新核心逻辑（request-modify.ts）添加 onResponse 拦截
4. 更新 Vue 组件（request-modify.vue）添加响应修改UI
5. 更新工具注册和导出
6. 更新 ToolContent.vue 的 Tab 显示名称
7. 构建验证