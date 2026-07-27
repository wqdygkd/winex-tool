# Event Mock Rewrite Design

## Goal

Rewrite the `event-mock` module so it is reliable as a Winning SDK mock and usable as a rule editor. The module should let a userscript page replace `unsafeWindow.winning.dispatchEvent` with deterministic mock responses configured from the tool panel.

## Scope

- Rebuild the runtime that mounts and restores `unsafeWindow.winning`.
- Rebuild matching as pure, testable functions.
- Rebuild the configuration model around explicit rules.
- Rebuild the UI so rules, conditions, templates, and responses are managed independently.
- Keep the work inside `src/tools/event-mock` plus any minimal test or project configuration needed to verify it.

## Non-Goals

- Do not migrate old `event-mock-config` data.
- Do not support plain script mode.
- Do not redesign unrelated tools or shared application shell behavior.

## Data Model

```ts
export interface MockRule {
  id: string
  enabled: boolean
  eventId: string
  title: string
  conditions: MockCondition[]
  response: unknown
  remark?: string
}

export interface MockCondition {
  path: string
  value: unknown
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
```

Configuration is stored at `${__namespace}event-mock-config`. Templates are stored at `${__namespace}event-mock-templates`.

## Runtime

`core/runtime.ts` owns all unsafe-window mutation. When enabled, it saves the original `unsafeWindow.winning`, installs a merged SDK object, and replaces `dispatchEvent`. When disabled, it restores the original object or deletes `winning` if none existed.

The mocked `dispatchEvent(eventId, params, cb)` accepts string params, object params, empty params, and an optional callback. It returns the same JSON string passed to the callback. Callback errors are caught and logged so business pages do not break the tool.

## Matching

`core/matcher.ts` exposes pure functions:

- `parseParams(params)` converts string/object/empty input into an object.
- `getValueByPath(obj, path)` reads dot-path values.
- `matchesConditions(params, conditions)` requires every condition to match.
- `selectRule(rules, eventId, params)` chooses the best enabled rule.
- `createDispatchResult(rule)` serializes the selected response or returns `{}`.

Selection order:

1. Ignore disabled rules.
2. Filter by exact `eventId`.
3. Prefer conditioned rules whose conditions all match.
4. Use the first unconditioned rule as fallback.
5. Return `{}` when no rule matches.

## UI

`ui/event-mock.vue` remains the module panel, but it is rebuilt around the new rule model:

- Header controls: enabled switch, add rule, import preset templates, manual save status.
- Rule list: each rule shows title, eventId, enabled state, condition count, and actions.
- Rule editor: title, eventId preset/manual input, enabled switch, conditions, JSON response, and remark.
- Conditions: add/remove path-value rows, with empty conditions meaning fallback.
- Templates: save current response as a template and apply templates filtered by the rule eventId.

Each rule owns its own UI selection state. No template selection state is shared across all rules.

## Presets

The existing preset JSON files remain available as templates. Import is idempotent by template id. Preset event IDs remain:

- `399297247`: 读卡事件
- `399563027`: 打印机列表

## Verification

Add focused tests for the pure matcher and runtime behavior:

- matching by `eventId`
- matching by params condition
- fallback rule behavior
- invalid or empty params
- optional callback
- disabled rules ignored

Run `pnpm build` for the userscript bundle. Plain script build should keep `event-mock` excluded by the existing feature flag configuration.
