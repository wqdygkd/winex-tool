/**
 * Storage 克隆工具模块
 */

import { registerTool } from '../registry'
import StorageCopy from './storage-copy.vue'

const name = 'Storage克隆'
const storageKey = 'winex.storageCopy'

registerTool({
  name,
  storageKey,
  init: () => {},
  component: StorageCopy,
})

StorageCopy.name = name

export default StorageCopy
