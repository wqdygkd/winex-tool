# Header Modify Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a request header modification tool with group-based rule management for debugging and environment switching.

**Architecture:** Plugin-based tool following existing registry pattern. Uses ajax-hook to intercept requests and apply configured headers. Storage via useGMStorage composable with Vue settings UI.

**Tech Stack:** Vue 3 + TypeScript, Element Plus, ajax-hook, GM storage APIs

---

## File Structure

```
src/tools/header-modify/
├── index.ts           # Tool registration (registerTool)
├── header-modify.ts   # Core logic: init, proxy, matchUrl, applyHeaders
├── header-modify.vue  # Vue settings UI component

src/types/index.ts     # Add HeaderModifyStorage, HeaderRule, HeaderGroup types
src/tools/index.ts     # Export HeaderModify module
```

---

### Task 1: Add Type Definitions

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add header-modify types to types/index.ts**

Add the following types at the end of `src/types/index.ts`:

```typescript
/** 请求头修改 - Header操作 */
export interface HeaderOperation {
  key: string
  value?: string
  opType: 'set' | 'append' | 'delete'
}

/** 请求头修改 - 规则 */
export interface HeaderRule {
  id: string
  enabled: boolean
  urlPattern: string
  urlMatchType: 'exact' | 'regex' | 'contains'
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[]
  headerOps: HeaderOperation[]
  remark: string
}

/** 请求头修改 - 分组 */
export interface HeaderGroup {
  id: string
  name: string
  enabled: boolean
  rules: HeaderRule[]
}

/** 请求头修改 - 存储数据 */
export interface HeaderModifyStorage extends BaseStorageData {
  groups: HeaderGroup[]
}
```

- [ ] **Step 2: Verify types compile correctly**

Run: `pnpm build`
Expected: Build succeeds without type errors

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add header-modify type definitions"
```

---

### Task 2: Create Core Logic

**Files:**
- Create: `src/tools/header-modify/header-modify.ts`

- [ ] **Step 1: Create header-modify.ts with init function**

Create file `src/tools/header-modify/header-modify.ts`:

```typescript
import type { HeaderModifyStorage, HeaderOperation, HeaderRule } from '~/types'
import { proxy } from 'ajax-hook'

export const storageKey = `${__namespace}header-modify`

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

/** 初始化请求头修改工具 */
export function init() {
  const storage = GM_getValue<HeaderModifyStorage>(storageKey, {
    enable: false,
    groups: [],
  })

  if (!storage.enable) return

  proxy({
    onRequest: (request, handler) => {
      try {
        const matchedOps = collectMatchedOps(request)
        applyHeaders(request.headers, matchedOps)
      } catch (error) {
        console.error('Error applying header modifications:', error)
      }
      handler.next(request)
    },
  }, unsafeWindow)
}

/** 收集匹配的Header操作 */
function collectMatchedOps(request: { url: string, method: string }): HeaderOperation[] {
  const ops: HeaderOperation[] = []
  const latestStorage = GM_getValue<HeaderModifyStorage>(storageKey, {
    enable: false,
    groups: [],
  })

  latestStorage.groups
    .filter(g => g.enabled)
    .forEach((group) => {
      group.rules
        .filter(r => r.enabled)
        .filter(r => matchUrl(request.url, r))
        .filter(r => matchMethod(request.method, r.methods))
        .forEach(r => ops.push(...r.headerOps))
    })

  return ops
}

/** URL匹配 */
function matchUrl(url: string, rule: HeaderRule): boolean {
  if (!rule.urlPattern) return false

  try {
    switch (rule.urlMatchType) {
      case 'contains':
        return url.includes(rule.urlPattern)
      case 'regex':
        return new RegExp(rule.urlPattern).test(url)
      case 'exact':
        return url === rule.urlPattern
      default:
        return false
    }
  } catch {
    return false
  }
}

/** 请求方法匹配 */
function matchMethod(method: string, methods: HeaderRule['methods']): boolean {
  if (!methods || methods.length === 0) return true
  return methods.includes(method.toUpperCase() as typeof httpMethods[number])
}

/** 应用Header操作 */
function applyHeaders(headers: Record<string, string>, ops: HeaderOperation[]): void {
  ops.forEach((op) => {
    switch (op.opType) {
      case 'set':
        if (op.value !== undefined) {
          headers[op.key] = op.value
        }
        break
      case 'append':
        if (op.value !== undefined) {
          const existing = headers[op.key]
          headers[op.key] = existing ? `${existing}, ${op.value}` : op.value
        }
        break
      case 'delete':
        delete headers[op.key]
        break
    }
  })
}
```

- [ ] **Step 2: Verify file compiles**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/tools/header-modify/header-modify.ts
git commit -m "feat: add header-modify core logic"
```

---

### Task 3: Create Vue Settings Component

**Files:**
- Create: `src/tools/header-modify/header-modify.vue`

- [ ] **Step 1: Create header-modify.vue component**

Create file `src/tools/header-modify/header-modify.vue`:

```vue
<script setup lang="ts">
import type { HeaderGroup, HeaderModifyStorage, HeaderOperation, HeaderRule } from '~/types'
import { useGMStorage } from '~/composables/useGMStorage'
import { storageKey } from './header-modify'

const { data: storage, save } = useGMStorage<HeaderModifyStorage>(storageKey, {
  enable: false,
  groups: [],
}, { autoSave: false })

const enableMock = computed(() => storage.value.enable)
const groups = computed(() => storage.value.groups)

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const
const urlMatchTypes = ['contains', 'regex', 'exact'] as const
const opTypes = ['set', 'append', 'delete'] as const

// Dialog state
const dialogVisible = ref(false)
const editingRule = ref<HeaderRule | null>(null)
const editingGroupId = ref<string | null>(null)

watch(enableMock, () => save())

function addGroup() {
  const newGroup: HeaderGroup = {
    id: Date.now().toString(),
    name: '新分组',
    enabled: true,
    rules: [],
  }
  groups.value.push(newGroup)
  save()
}

function deleteGroup(groupId: string) {
  storage.value.groups = groups.value.filter(g => g.id !== groupId)
  save()
}

function addRule(groupId: string) {
  const group = groups.value.find(g => g.id === groupId)
  if (!group) return

  const newRule: HeaderRule = {
    id: Date.now().toString(),
    enabled: true,
    urlPattern: '',
    urlMatchType: 'contains',
    methods: [],
    headerOps: [],
    remark: '',
  }
  group.rules.push(newRule)
  save()
}

function deleteRule(groupId: string, ruleId: string) {
  const group = groups.value.find(g => g.id === groupId)
  if (!group) return
  group.rules = group.rules.filter(r => r.id !== ruleId)
  save()
}

function editRule(groupId: string, rule: HeaderRule) {
  editingGroupId.value = groupId
  editingRule.value = JSON.parse(JSON.stringify(rule))
  dialogVisible.value = true
}

function addHeaderOp() {
  if (!editingRule.value) return
  editingRule.value.headerOps.push({
    key: '',
    value: '',
    opType: 'set',
  })
}

function deleteHeaderOp(index: number) {
  if (!editingRule.value) return
  editingRule.value.headerOps.splice(index, 1)
}

function saveRule() {
  if (!editingRule.value || !editingGroupId.value) return
  const group = groups.value.find(g => g.id === editingGroupId.value)
  if (!group) return

  const ruleIndex = group.rules.findIndex(r => r.id === editingRule.value!.id)
  if (ruleIndex >= 0) {
    group.rules[ruleIndex] = editingRule.value
  }
  save()
  dialogVisible.value = false
  editingRule.value = null
  editingGroupId.value = null
}
</script>

<template>
  <div class="header-modify-container">
    <div class="header">
      <h3>请求头修改</h3>
      <el-switch v-model="enableMock" active-text="启用" inactive-text="禁用" />
    </div>

    <div class="action-buttons">
      <el-button type="primary" @click="addGroup">
        添加分组
      </el-button>
    </div>

    <div class="groups-list">
      <div v-for="group in groups" :key="group.id" class="group-item">
        <div class="group-header">
          <el-input
            v-model="group.name"
            placeholder="分组名称"
            style="width: 200px"
            @change="save"
          />
          <el-switch v-model="group.enabled" @change="save" />
          <el-button size="small" type="danger" @click="deleteGroup(group.id)">
            删除分组
          </el-button>
        </div>

        <div class="group-actions">
          <el-button size="small" type="primary" @click="addRule(group.id)">
            添加规则
          </el-button>
        </div>

        <div v-for="rule in group.rules" :key="rule.id" class="rule-item">
          <div class="rule-header">
            <el-switch v-model="rule.enabled" size="small" @change="save" />
            <span class="rule-url">{{ rule.urlPattern || '未设置URL' }}</span>
            <el-button size="small" @click="editRule(group.id, rule)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteRule(group.id, rule.id)">
              删除
            </el-button>
          </div>
          <div class="rule-info">
            <span>方法: {{ rule.methods.length > 0 ? rule.methods.join(', ') : '全部' }}</span>
            <span>Headers: {{ rule.headerOps.length }}条</span>
            <span v-if="rule.remark">备注: {{ rule.remark }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Rule Edit Dialog -->
    <el-dialog v-model="dialogVisible" title="编辑规则" width="600px">
      <el-form v-if="editingRule" label-width="100px">
        <el-form-item label="URL匹配类型">
          <el-select v-model="editingRule.urlMatchType" style="width: 120px">
            <el-option label="包含" value="contains" />
            <el-option label="正则" value="regex" />
            <el-option label="精确" value="exact" />
          </el-select>
        </el-form-item>
        <el-form-item label="URL匹配值">
          <el-input v-model="editingRule.urlPattern" placeholder="输入URL或正则表达式" />
        </el-form-item>
        <el-form-item label="请求方法">
          <el-checkbox-group v-model="editingRule.methods">
            <el-checkbox v-for="m in httpMethods" :key="m" :label="m" :value="m">
              {{ m }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editingRule.remark" placeholder="输入备注" />
        </el-form-item>
        <el-form-item label="Headers操作">
          <el-button size="small" type="primary" @click="addHeaderOp">
            添加Header
          </el-button>
          <el-table :data="editingRule.headerOps" style="margin-top: 10px">
            <el-table-column label="Header名称" width="150">
              <template #default="{ row }">
                <el-input v-model="row.key" placeholder="如 Authorization" />
              </template>
            </el-table-column>
            <el-table-column label="操作类型" width="100">
              <template #default="{ row }">
                <el-select v-model="row.opType" style="width: 80px">
                  <el-option label="设置" value="set" />
                  <el-option label="追加" value="append" />
                  <el-option label="删除" value="delete" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="值">
              <template #default="{ row }">
                <el-input
                  v-model="row.value"
                  placeholder="Header值"
                  :disabled="row.opType === 'delete'"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60">
              <template #default="{ $index }">
                <el-button size="small" type="danger" @click="deleteHeaderOp($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.header-modify-container {
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #334155;
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-item {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 16px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.group-actions {
  margin-bottom: 12px;
}

.rule-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  .rule-url {
    flex: 1;
    color: #334155;
    font-size: 14px;
  }
}

.rule-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #64748b;
}
</style>
```

- [ ] **Step 2: Verify component compiles**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/tools/header-modify/header-modify.vue
git commit -m "feat: add header-modify Vue settings component"
```

---

### Task 4: Create Tool Registration

**Files:**
- Create: `src/tools/header-modify/index.ts`

- [ ] **Step 1: Create index.ts for tool registration**

Create file `src/tools/header-modify/index.ts`:

```typescript
/**
 * 请求头修改工具模块
 */

import { registerTool } from '../registry'
import { init, storageKey } from './header-modify'
import HeaderModify from './header-modify.vue'

const name = '请求头修改'

registerTool({
  name,
  storageKey,
  init,
  component: HeaderModify,
})

HeaderModify.name = name

export { init as HeaderModifyInit }
export default HeaderModify
```

- [ ] **Step 2: Verify registration compiles**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/tools/header-modify/index.ts
git commit -m "feat: add header-modify tool registration"
```

---

### Task 5: Integrate into Tools Index

**Files:**
- Modify: `src/tools/index.ts`

- [ ] **Step 1: Add header-modify exports to tools/index.ts**

Modify `src/tools/index.ts` to add the following exports:

```typescript
export { HeaderModifyInit } from './header-modify'
export { default as HeaderModify } from './header-modify'
```

Full file content after modification:

```typescript
/**
 * 工具模块统一导出
 */

// 导出各工具模块
export { EventMockInit } from './eventMock'

// 导出工具组件
export { default as EventMock } from './eventMock'
export { default as HotkeyPatch } from './hotkey-patch'
export { OthersInit } from './others'

export { default as Others } from './others'
export { ParamMockInit } from './param-mock'
export { default as ParamMock } from './param-mock'
export { HeaderModifyInit } from './header-modify'
export { default as HeaderModify } from './header-modify'
export { getTools, initAllTools, registerTool } from './registry'
export { default as StorageCopy } from './storage-copy'
```

- [ ] **Step 2: Verify integration compiles**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/tools/index.ts
git commit -m "feat: integrate header-modify tool into tools index"
```

---

### Task 6: Final Build and Test

- [ ] **Step 1: Run final build**

Run: `pnpm build`
Expected: Build succeeds, output `dist/index.user.js`

- [ ] **Step 2: Start dev server for manual testing**

Run: `pnpm dev`
Expected: Dev server starts, open browser to test UI

Manual test checklist:
1. Open tool settings panel
2. Verify global enable/disable switch works
3. Add a new group, verify it appears
4. Add a rule to group, verify it appears
5. Edit rule, set URL pattern and methods
6. Add header operations (set/append/delete)
7. Save rule, verify settings persist
8. Disable group, verify rules don't apply
9. Delete rule and group, verify removed

- [ ] **Step 3: Final commit if needed**

```bash
git status
# If any changes, commit them
git add -A && git commit -m "feat: complete header-modify tool implementation"
```

---

## Spec Coverage Verification

| Spec Requirement | Task Coverage |
|------------------|---------------|
| Type definitions (HeaderRule, HeaderGroup, HeaderModifyStorage) | Task 1 |
| URL matching (contains/regex/exact) | Task 2 (matchUrl) |
| Method matching | Task 2 (matchMethod) |
| Header operations (set/append/delete) | Task 2 (applyHeaders), Task 3 UI |
| Group-based management | Task 3 UI (groups, group switch) |
| Rule enable/disable | Task 3 UI (rule switch) |
| GM storage integration | Task 2, Task 3 (useGMStorage) |
| Tool registration | Task 4, Task 5 |