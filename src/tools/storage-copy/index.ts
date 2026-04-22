/**
 * Storage 克隆工具模块
 */

import type { ToolModule } from '../registry'
import StorageCopy from './storage-copy.vue'

const name = 'Storage克隆'
const storageKey = 'winex.storageCopy'

StorageCopy.name = name

export const StorageCopyModule: ToolModule = {
  name,
  storageKey,
  init: () => {},
  component: StorageCopy,
}