/**
 * 快捷键补丁工具模块
 */

import type { ToolModule } from '../registry'
import { storageKey } from './hotkey-patch'
import HotkeyPatch from './hotkey-patch.vue'

const name = '快捷键补丁'

HotkeyPatch.name = name

export const HotkeyPatchModule: ToolModule = {
  name,
  storageKey,
  init: () => {},
  component: HotkeyPatch,
}