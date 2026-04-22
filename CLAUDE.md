# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Winex Tool is a Tampermonkey userscript built with Vue 3 + Vite. It provides development assistant tools for Winex internal systems, including event mocking, parameter mocking, storage copying, and other DevOps utilities.

## Commands

```bash
pnpm dev        # Development server with hot reload
pnpm build      # Build userscript (outputs dist/index.user.js)
pnpm build:watch # Build with watch mode
```

Linting uses `@antfu/eslint-config` - run via IDE integration or `pnpm eslint`.

## Architecture

### Plugin-based Tool Registration

Tools use a registry pattern (`src/tools/registry.ts`). Each tool module:

1. **index.ts** - Registers the tool with `registerTool({ name, storageKey, init, component })`
2. **component.vue** - Vue component for settings UI
3. **logic file** - `init()` function and business logic

To add a new tool:
- Create folder in `src/tools/your-tool/`
- Implement `index.ts` with registration, `.vue` component, and logic file
- Import in `src/main.ts`

### Key Patterns

**GM Storage**: Use `useGMStorage` composable (`src/composables/useGMStorage.ts`) for Tampermonkey storage. It provides reactive data with auto-save and reset functionality.

**Dev Environment**: `src/utils/GM.ts` mocks Tampermonkey APIs (`GM_getValue`, `GM_setValue`, `GM_registerMenuCommand`) when running locally. Production builds use real GM APIs.

**URL Matching**: Use `isCurrentPage()` from `src/constants/urls.ts` to conditionally initialize tools on specific pages.

**Element Plus**: Auto-imported via `unplugin-vue-components`. Use `el-*` components directly without manual imports. Custom namespace: `wqdy`.

### Userscript Metadata

Metadata defined in `src/utils/meta/prod.meta.ts` - sets script name and URL match patterns. Vite plugin (`src/utils/vite-plugin-inject-meta.ts`) injects metadata into build output.

## Build Output

Build produces a single IIFE userscript (`dist/index.user.js`) with CSS injected inline. No code splitting - `inlineDynamicImports: true` required for userscript format.