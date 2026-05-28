/**
 * 工具模块统一导出
 */

import { EventMockModule } from './event-mock'
import { OthersModule } from './others'
import { ParamMockModule } from './param-mock'
import { registerTool } from './registry'
import { RequestModifyModule } from './request-modify'
import { StorageCopyModule } from './storage-copy'

const toolModules = [
  // EventMockModule,
  StorageCopyModule,
  OthersModule,
  ParamMockModule,
  RequestModifyModule,
]

toolModules.forEach(registerTool)

export const EventMock = EventMockModule.component!
export const Others = OthersModule.component!
export const ParamMock = ParamMockModule.component!
export const RequestModify = RequestModifyModule.component!
export const StorageCopy = StorageCopyModule.component!

export { getTools, initAllTools } from './registry'
