/**
 * 工具模块统一导出
 * 集中注册所有工具模块
 */

import { EventMockModule } from './eventMock'
import { OthersModule } from './others'
import { ParamMockModule } from './param-mock'
import { registerTool } from './registry'
import { RequestModifyModule } from './request-modify'
import { StorageCopyModule } from './storage-copy'

// 集中注册所有工具模块
const toolModules = [
  EventMockModule,
  OthersModule,
  ParamMockModule,
  RequestModifyModule,
  StorageCopyModule,
]

toolModules.forEach(registerTool)

// 导出 Vue 组件（供 ToolContent.vue 使用）
export const EventMock = EventMockModule.component!
export const Others = OthersModule.component!
export const ParamMock = ParamMockModule.component!
export const RequestModify = RequestModifyModule.component!
export const StorageCopy = StorageCopyModule.component!

// 导出初始化函数和工具列表（供 main.ts 和 ToolContent.vue 使用）
export { initAllTools, getTools } from './registry'
