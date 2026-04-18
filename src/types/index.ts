/**
 * 工具模块通用类型定义
 */

/** 存储数据基础接口 */
export interface BaseStorageData {
  enable: boolean
}

/** 事件模拟 - 事件数据 */
export interface EventData {
  id: string
  title: string
  data: any
  isBuiltIn?: boolean
  template?: string
}

/** 事件模拟 - 存储数据 */
export interface EventMockStorage extends BaseStorageData {
  events?: EventData[]
}

/** 参数模拟 - 规则 */
export interface ParamMockRule {
  id: string
  enabled: boolean
  paramNo: string
  mockValue: string[]
  remark: string
}

/** 参数模拟 - 存储数据 */
export interface ParamMockStorage extends BaseStorageData {
  rules: ParamMockRule[]
}

/** 快捷键补丁 - 字段配置 */
export interface FieldConfig {
  id: string
  fieldName: string
  value: string
  enabled: boolean
}

/** 快捷键补丁 - SQL配置 */
export interface SqlConfig {
  id: string
  name: string
  tableName: string
  fields: FieldConfig[]
}

/** 快捷键补丁 - 存储数据 */
export interface HotkeyPatchStorage {
  configs: SqlConfig[]
}

/** Storage 克隆 - 存储项 */
export interface StorageItem {
  key: string
  value: {
    cookie: string[]
    local: Record<string, string | null>
    session: Record<string, string | null>
  }
}

/** 通用启用开关存储 */
export interface EnableStorage extends BaseStorageData {}

/** 工具模块接口 */
export interface ToolModule {
  name: string
  init: () => void
  storageKey: string
  routes?: string[]
}
