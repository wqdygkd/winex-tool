/**
 * 工具模块统一导出
 * 根据构建模式条件性注册模块（tree-shaking）
 */

// 静态导入所有模块（rollup 会根据 __FEATURE_*__ 条件进行 tree-shaking）
import { EventMockModule } from './event-mock'
import { OthersModule } from './others'
import { ParamMockModule } from './param-mock'
import { registerTool } from './registry'
import { RequestModifyModule } from './request-modify'
import { StorageCopyModule } from './storage-copy'

// 根据功能标志注册启用的模块
if (__FEATURE_EVENT_MOCK__) {
  registerTool(EventMockModule)
}

if (__FEATURE_STORAGE_COPY__) {
  registerTool(StorageCopyModule)
}

if (__FEATURE_OTHERS__) {
  registerTool(OthersModule)
}

if (__FEATURE_PARAM_MOCK__) {
  registerTool(ParamMockModule)
}

if (__FEATURE_REQUEST_MODIFY__) {
  registerTool(RequestModifyModule)
}

// 导出 Vue 组件
export const EventMock = __FEATURE_EVENT_MOCK__ ? EventMockModule.component! : null
export const Others = __FEATURE_OTHERS__ ? OthersModule.component! : null
export const ParamMock = __FEATURE_PARAM_MOCK__ ? ParamMockModule.component! : null
export const RequestModify = __FEATURE_REQUEST_MODIFY__ ? RequestModifyModule.component! : null
export const StorageCopy = __FEATURE_STORAGE_COPY__ ? StorageCopyModule.component! : null

export { getTools, initAllTools } from './registry'