# Header Modify Tool 设计文档

日期：2026-04-22

## 概述

添加一个请求头修改工具，支持通过配置规则修改指定接口的请求头，主要用于调试测试和环境切换场景。

## 数据结构

```typescript
interface HeaderRule {
  id: string
  enabled: boolean
  // URL匹配配置
  urlPattern: string        // URL匹配值
  urlMatchType: 'exact' | 'regex' | 'contains'  // 匹配类型
  // 请求方法
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[]
  // Headers操作
  headerOps: HeaderOperation[]
  remark: string
}

interface HeaderOperation {
  key: string               // Header名称
  value?: string            // Header值（删除操作不需要）
  opType: 'set' | 'append' | 'delete'  // 操作类型
}

interface HeaderGroup {
  id: string
  name: string
  enabled: boolean          // 分组总开关
  rules: HeaderRule[]
}

interface HeaderModifyStorage {
  enable: boolean           // 全局总开关
  groups: HeaderGroup[]
}
```

## 功能特性

### URL匹配方式
- **contains**：URL包含匹配值即匹配
- **regex**：正则表达式匹配
- **exact**：精确匹配完整URL

### 请求方法匹配
- 支持多选：GET、POST、PUT、DELETE、PATCH
- 可全选表示匹配所有方法

### Header操作类型
- **set**：设置/覆盖 header 值
- **append**：追加 header 值（多个同名header）
- **delete**：删除指定 header

### 分组管理
- 每个分组有独立开关，可整组启用/禁用
- 分组内规则也有独立开关
- 支持分组批量操作：添加分组、删除分组、分组内添加/删除规则

## UI设计

采用扁平分组模式，参照现有 param-mock 工具风格：

```
┌─────────────────────────────────────────────────────────┐
│ 请求头修改工具                      [全局总开关]        │
├─────────────────────────────────────────────────────────┤
│ [添加分组]                                              │
├─────────────────────────────────────────────────────────┤
│ 分组1: 测试环境                         [分组开关] [删除]│
│   [添加规则]                                            │
│   ┌───────────────────────────────────────────────────┐ │
│   │ □ 规则1                    URL: /api/user/*       │ │
│   │   方法: GET, POST          [启用] [删除]          │ │
│   │   Headers: Authorization=xxx, X-Env=test         │ │
│   └───────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ 分组2: 认证相关                          [分组开关] [删除]│
│   ...                                                   │
└─────────────────────────────────────────────────────────┘
```

规则编辑通过弹窗或展开区域实现，包含：
- URL匹配类型下拉 + 输入框
- 请求方法多选复选框
- Headers列表表格（每行：key、操作类型、value）
- 备注输入框

## 核心实现逻辑

### 拦截机制
使用 ajax-hook 的 `onRequest` 拦截，在请求发出前修改 headers：

```typescript
function init() {
  if (!storage.enable) return
  
  proxy({
    onRequest: (request, handler) => {
      const matchedHeaders = collectMatchedHeaders(request)
      applyHeaders(request.headers, matchedHeaders)
      handler.next(request)
    }
  }, unsafeWindow)
}
```

### 匹配收集
遍历启用的分组和规则，收集所有匹配的 header 操作：

```typescript
function collectMatchedHeaders(request) {
  const headers = []
  const latestStorage = GM_getValue(storageKey)
  
  latestStorage.groups
    .filter(g => g.enabled)
    .forEach(group => {
      group.rules
        .filter(r => r.enabled)
        .filter(r => matchUrl(request.url, r))
        .filter(r => matchMethod(request.method, r.methods))
        .forEach(r => headers.push(...r.headerOps))
    })
  
  return headers
}
```

### URL匹配
```typescript
function matchUrl(url, rule) {
  switch(rule.urlMatchType) {
    case 'contains': return url.includes(rule.urlPattern)
    case 'regex': return new RegExp(rule.urlPattern).test(url)
    case 'exact': return url === rule.urlPattern
  }
}
```

### Header应用
多条匹配规则叠加，后者覆盖同名 header（set 操作）：

```typescript
function applyHeaders(headers, ops) {
  ops.forEach(op => {
    switch(op.opType) {
      case 'set': headers[op.key] = op.value; break
      case 'append': headers[op.key] = (headers[op.key] || '') + ', ' + op.value; break
      case 'delete': delete headers[op.key]; break
    }
  })
}
```

## 文件结构

```
src/tools/header-modify/
├── index.ts           # 工具注册
├── header-modify.ts   # 核心逻辑（init、拦截、匹配）
├── header-modify.vue  # Vue配置组件UI
└── types.ts           # 类型定义（可选，也可放types目录）
```

## 依赖

- ajax-hook：已有依赖，用于拦截请求
- Element Plus：已有，用于UI组件
- useGMStorage：已有composable，用于配置存储

## 集成方式

1. 在 `src/tools/header-modify/` 创建模块
2. 在 `src/tools/index.ts` 导入并注册
3. 在 `src/types/index.ts` 添加类型定义