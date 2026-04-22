/**
 * 工具模块统一导出
 */

// 导出各工具模块
export { EventMockInit } from './eventMock'

// 导出工具组件
export { default as EventMock } from './eventMock'
export { HeaderModifyInit } from './header-modify'
export { default as HeaderModify } from './header-modify'
export { default as HotkeyPatch } from './hotkey-patch'
export { OthersInit } from './others'

export { default as Others } from './others'
export { ParamMockInit } from './param-mock'
export { default as ParamMock } from './param-mock'
export { getTools, initAllTools, registerTool } from './registry'
export { default as StorageCopy } from './storage-copy'
