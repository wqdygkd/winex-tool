/**
 * 请求修改工具模块
 */

import { registerTool } from '../registry'
import { init, storageKey } from './request-modify'
import RequestModify from './request-modify.vue'

const name = '请求修改'

registerTool({
  name,
  storageKey,
  init,
  component: RequestModify,
})

RequestModify.name = name

export { init as RequestModifyInit }
export default RequestModify