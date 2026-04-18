/**
 * 快捷键补丁工具模块
 */

import { registerTool } from '../registry'
import { storageKey } from './hotkey-patch'
import HotkeyPatch from './hotkey-patch.vue'

const name = '快捷键补丁'

registerTool({
  name,
  storageKey,
  init: () => {},
  component: HotkeyPatch,
})

HotkeyPatch.name = name

export default HotkeyPatch
