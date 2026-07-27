# Event Mock Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `event-mock` into a reliable Winning SDK mock and a usable rule/template editor.

**Architecture:** Split the module into testable pure matching logic, a small runtime that owns `unsafeWindow.winning`, focused storage helpers, preset template import, and a rebuilt Vue panel. The runtime depends on matcher outputs; the UI depends on storage helpers and mutates only the new `EventMockConfig` model.

**Tech Stack:** TypeScript, Vue 3, Element Plus, Tampermonkey GM storage, Node built-in test runner with `ts-node/esm`, Vite userscript build.

## Global Constraints

- Do not migrate old `event-mock-config` data.
- Do not support plain script mode.
- Do not redesign unrelated tools or shared application shell behavior.
- Keep changes inside `src/tools/event-mock` plus minimal test/package configuration needed to verify it.
- `dispatchEvent` must accept string params, object params, empty params, and optional callback.
- `dispatchEvent` must return the same JSON string passed to the callback.

---

## File Structure

- `src/tools/event-mock/types.ts`: new rule, condition, config, template, and dispatch types.
- `src/tools/event-mock/core/matcher.ts`: pure params parsing, path lookup, condition matching, rule selection, and response serialization.
- `src/tools/event-mock/core/matcher.test.ts`: Node tests for matcher behavior.
- `src/tools/event-mock/core/runtime.ts`: mount/unmount `unsafeWindow.winning`, dispatch calls through matcher, protect callbacks.
- `src/tools/event-mock/core/runtime.test.ts`: Node tests for runtime behavior with a stub unsafe window.
- `src/tools/event-mock/storage/config.ts`: load/save new config only.
- `src/tools/event-mock/storage/template.ts`: load/save templates with preset markers.
- `src/tools/event-mock/presets/eventIds.ts`: keep event ID presets.
- `src/tools/event-mock/presets/templates.ts`: import preset JSON as templates.
- `src/tools/event-mock/presets/index.ts`: public preset exports.
- `src/tools/event-mock/ui/event-mock.vue`: rebuilt panel.
- `src/tools/event-mock/index.ts`: initialize config, runtime, and preset templates.
- `package.json`: add `test:event-mock` script if no suitable test script exists.

---

### Task 1: Matcher Core

**Files:**
- Modify: `src/tools/event-mock/types.ts`
- Create: `src/tools/event-mock/core/matcher.ts`
- Create: `src/tools/event-mock/core/matcher.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces:
  - `parseParams(params: DispatchParams): Record<string, unknown>`
  - `getValueByPath(source: unknown, path: string): unknown`
  - `matchesConditions(params: unknown, conditions: MockCondition[]): boolean`
  - `selectRule(rules: MockRule[], eventId: string, params: DispatchParams): MockRule | null`
  - `serializeResponse(response: unknown): string`
  - `createDispatchResult(rule: MockRule | null): string`

- [ ] **Step 1: Write the failing matcher tests**

Create `src/tools/event-mock/core/matcher.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createDispatchResult,
  getValueByPath,
  matchesConditions,
  parseParams,
  selectRule,
  serializeResponse,
} from './matcher.ts'
import type { MockRule } from '../types.ts'

const rules: MockRule[] = [
  {
    id: 'rule-default',
    enabled: true,
    eventId: '399297247',
    title: 'default reader',
    conditions: [],
    response: { source: 'default' },
  },
  {
    id: 'rule-card',
    enabled: true,
    eventId: '399297247',
    title: 'card reader',
    conditions: [{ path: 'body.cardType', value: '医保卡' }],
    response: { source: 'card' },
  },
  {
    id: 'rule-disabled',
    enabled: false,
    eventId: '399297247',
    title: 'disabled',
    conditions: [{ path: 'body.cardType', value: '身份证' }],
    response: { source: 'disabled' },
  },
]

describe('event-mock matcher', () => {
  it('parses string, object, and empty params safely', () => {
    assert.deepEqual(parseParams('{"body":{"cardType":"医保卡"}}'), { body: { cardType: '医保卡' } })
    assert.deepEqual(parseParams({ body: { cardType: '医保卡' } }), { body: { cardType: '医保卡' } })
    assert.deepEqual(parseParams('not-json'), {})
    assert.deepEqual(parseParams(undefined), {})
  })

  it('reads nested values by dot path', () => {
    assert.equal(getValueByPath({ body: { cardType: '医保卡' } }, 'body.cardType'), '医保卡')
    assert.equal(getValueByPath({ body: null }, 'body.cardType'), undefined)
    assert.equal(getValueByPath({ body: { cardType: '医保卡' } }, ''), undefined)
  })

  it('matches all configured conditions with loose string equivalence', () => {
    assert.equal(matchesConditions({ body: { code: 1 } }, [{ path: 'body.code', value: '1' }]), true)
    assert.equal(matchesConditions({ body: { code: 2 } }, [{ path: 'body.code', value: '1' }]), false)
  })

  it('selects a conditioned rule before the default fallback', () => {
    const selected = selectRule(rules, '399297247', '{"body":{"cardType":"医保卡"}}')
    assert.equal(selected?.id, 'rule-card')
  })

  it('uses the first unconditioned enabled rule as fallback', () => {
    const selected = selectRule(rules, '399297247', '{"body":{"cardType":"其他"}}')
    assert.equal(selected?.id, 'rule-default')
  })

  it('ignores disabled rules and unknown event ids', () => {
    assert.equal(selectRule(rules, '399297247', '{"body":{"cardType":"身份证"}}')?.id, 'rule-default')
    assert.equal(selectRule(rules, 'unknown', '{}'), null)
  })

  it('serializes responses and falls back to an empty object string', () => {
    assert.equal(serializeResponse({ ok: true }), '{"ok":true}')
    const circular: Record<string, unknown> = {}
    circular.self = circular
    assert.equal(serializeResponse(circular), '{}')
    assert.equal(createDispatchResult(null), '{}')
  })
})
```

- [ ] **Step 2: Add a test script**

Modify `package.json` scripts:

```json
"test:event-mock": "node --loader ts-node/esm --test src/tools/event-mock/core/*.test.ts"
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test:event-mock`

Expected: FAIL because `core/matcher.ts` and the new exported types do not exist.

- [ ] **Step 4: Implement matcher types and functions**

Replace `src/tools/event-mock/types.ts` with the new model:

```ts
export type DispatchParams = string | Record<string, unknown> | null | undefined
export type DispatchCallback = (result: string) => void

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
  response: unknown
  remark?: string
}

export interface EventMockConfig {
  enabled: boolean
  rules: MockRule[]
}

export interface MockTemplate {
  id: string
  eventId: string
  name: string
  response: unknown
  preset?: boolean
}

export interface EventIdPreset {
  id: string
  name: string
  description?: string
}
```

Create `src/tools/event-mock/core/matcher.ts` with the interfaces listed above.

- [ ] **Step 5: Run matcher tests to verify they pass**

Run: `pnpm test:event-mock`

Expected: PASS for `matcher.test.ts`.

---

### Task 2: Runtime Core

**Files:**
- Create: `src/tools/event-mock/core/runtime.ts`
- Create: `src/tools/event-mock/core/runtime.test.ts`
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes:
  - `selectRule(rules, eventId, params)`
  - `createDispatchResult(rule)`
  - `EventMockConfig`
- Produces:
  - `createEventMockRuntime(target: { winning?: WinningSDK }): EventMockRuntime`
  - `EventMockRuntime.update(config: EventMockConfig): void`
  - `EventMockRuntime.mount(): void`
  - `EventMockRuntime.unmount(): void`
  - `EventMockRuntime.dispatchEvent(eventId: string, params?: DispatchParams, cb?: DispatchCallback): string`
  - `EventMockRuntime.isMounted(): boolean`

- [ ] **Step 1: Write the failing runtime tests**

Create tests covering mount, unmount, optional callback, object params, and callback error protection.

- [ ] **Step 2: Run runtime tests to verify they fail**

Run: `pnpm test:event-mock`

Expected: FAIL because `core/runtime.ts` does not exist.

- [ ] **Step 3: Implement runtime**

Create a runtime class that stores the current config, keeps the original `winning`, and installs a mock `winning` object with stable fallback methods.

- [ ] **Step 4: Update `WinningSDK` type**

Change `dispatchEvent` in `src/types/index.ts` so `params` and `cb` are optional-compatible and the return type may be `string | void`.

- [ ] **Step 5: Run runtime tests**

Run: `pnpm test:event-mock`

Expected: PASS for matcher and runtime tests.

---

### Task 3: Storage and Presets

**Files:**
- Modify: `src/tools/event-mock/storage/config.ts`
- Modify: `src/tools/event-mock/storage/template.ts`
- Delete: old unused preset exports from `src/tools/event-mock/presets/index.ts`
- Create: `src/tools/event-mock/presets/templates.ts`
- Modify: `src/tools/event-mock/presets/index.ts`

**Interfaces:**
- Consumes:
  - `EventMockConfig`
  - `MockTemplate`
- Produces:
  - `createDefaultConfig(): EventMockConfig`
  - `ConfigStorage.load(): EventMockConfig`
  - `ConfigStorage.save(config: EventMockConfig): void`
  - `TemplateStorage.importPresets(presets: MockTemplate[]): number`
  - `getPresetTemplates(): MockTemplate[]`

- [ ] **Step 1: Write storage tests if practical without GM globals**

Use in-memory `GM_getValue` and `GM_setValue` stubs in a test file if direct imports do not pull Vue or browser-only modules.

- [ ] **Step 2: Rewrite config storage**

Load only `{ enabled: false, rules: [] }` as the default. Save only the new data model.

- [ ] **Step 3: Rewrite template storage**

Support `getAll`, `add`, `remove`, `update`, and `importPresets`. Refuse to remove preset templates by returning `false`.

- [ ] **Step 4: Rebuild preset import**

Load the three existing JSON files as preset templates for event ID `399297247`.

- [ ] **Step 5: Run tests**

Run: `pnpm test:event-mock`

Expected: PASS.

---

### Task 4: Module Initialization

**Files:**
- Modify: `src/tools/event-mock/index.ts`
- Delete: `src/tools/event-mock/core/context.ts` after replacing all imports

**Interfaces:**
- Consumes:
  - `ConfigStorage`
  - `TemplateStorage`
  - `getPresetTemplates`
  - `createEventMockRuntime`
- Produces:
  - `runtime` singleton exported for UI use
  - `EventMockModule.init()` loads config, updates runtime, and imports preset templates

- [ ] **Step 1: Update imports**

Remove `context` usage and import the new runtime/storage APIs.

- [ ] **Step 2: Rebuild `init`**

Load config, update runtime, and import preset templates.

- [ ] **Step 3: Confirm no old context imports remain**

Run: `rg -n "core/context|context\\.getConfig|context\\.updateConfig|EventItem|TemplateItem|ConfigData|paramsConditions" src/tools/event-mock`

Expected: no old API references.

---

### Task 5: Vue Configuration Panel

**Files:**
- Replace: `src/tools/event-mock/ui/event-mock.vue`

**Interfaces:**
- Consumes:
  - `runtime`
  - `ConfigStorage`
  - `TemplateStorage`
  - `eventIdPresets`
  - `MockRule`
  - `MockTemplate`
- Produces:
  - A panel that edits `EventMockConfig` and persists it.

- [ ] **Step 1: Replace UI script**

Use local refs for `config`, `templates`, `activeRuleIds`, `selectedTemplateByRule`, `templateNameByRule`, and `saving`.

- [ ] **Step 2: Replace UI template**

Build header controls, collapse rule list, condition editor, template controls, JSON editor, and empty state.

- [ ] **Step 3: Wire save behavior**

Manual save calls `ConfigStorage.save(config)` and `runtime.update(config)`. Auto-save uses a 500ms debounce after config changes.

- [ ] **Step 4: Wire rule actions**

Add, duplicate, delete, enable, edit conditions, apply templates, save templates, and delete non-preset templates.

- [ ] **Step 5: Run event-mock tests**

Run: `pnpm test:event-mock`

Expected: PASS.

---

### Task 6: Build Verification

**Files:**
- No source changes unless verification exposes a defect in prior tasks.

**Interfaces:**
- Consumes all prior task outputs.
- Produces verified userscript build.

- [ ] **Step 1: Run focused tests**

Run: `pnpm test:event-mock`

Expected: PASS.

- [ ] **Step 2: Run userscript build**

Run: `pnpm build`

Expected: Vite produces `dist/index.user.js`.

- [ ] **Step 3: Run plain build**

Run: `pnpm build:plain`

Expected: Vite produces `dist/index.js`, and the feature filter output excludes `event-mock`.

- [ ] **Step 4: Review changed files**

Run: `git diff -- src/tools/event-mock src/types/index.ts package.json docs/superpowers/plans/2026-07-27-event-mock-rewrite.md`

Expected: Diff only contains the rewrite, tests, and plan.
