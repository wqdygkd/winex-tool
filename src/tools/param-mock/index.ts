/**
 * 参数模拟工具模块
 */

import type { ToolModule } from '../registry'
import { init, storageKey } from './param-mock'
import ParamMock from './param-mock.vue'

const name = '参数模拟'

ParamMock.name = name

export const ParamMockModule: ToolModule = {
  name,
  storageKey,
  init,
  component: ParamMock,
}