/**
 * 参数模拟工具模块
 */

import { registerTool } from '../registry'
import { init, storageKey } from './param-mock'
import ParamMock from './param-mock.vue'

const name = '参数模拟'

registerTool({
  name,
  storageKey,
  init,
  component: ParamMock,
})

ParamMock.name = name

export { init as ParamMockInit }
export default ParamMock
