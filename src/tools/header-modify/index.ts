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
