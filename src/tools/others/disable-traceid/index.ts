/**
 * 禁用请求添加traceid
 */

import { init, storageKey } from './disable-traceid.ts'
import DisableTraceid from './disable-traceid.vue'

DisableTraceid.storageKey = storageKey
DisableTraceid.init = init

export default DisableTraceid
