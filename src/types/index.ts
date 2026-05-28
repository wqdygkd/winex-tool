/**
 * 工具模块类型定义
 */

export interface BaseStorageData {
  enable: boolean
}

export interface EventData {
  id: string
  title: string
  data: Record<string, unknown>
  isBuiltIn?: boolean
  template?: string
}

export interface EventMockStorage extends BaseStorageData {
  events?: EventData[]
}

export interface ParamMockRule {
  id: string
  enabled: boolean
  paramNo: string
  mockValue: string[]
  remark: string
}

export interface ParamMockStorage extends BaseStorageData {
  rules: ParamMockRule[]
  deletedDefaultRules?: string[]
}

export interface StorageItem {
  key: string
  value: {
    cookie: string[]
    local: Record<string, string | null>
    session: Record<string, string | null>
  }
}

export interface EnableStorage extends BaseStorageData {}

export interface ToolModule {
  name: string
  init: () => void
  storageKey: string
  routes?: string[]
}

export interface HeaderOperation {
  key: string
  value?: string
  opType: 'set' | 'append' | 'delete'
}

export interface ResponseOp {
  key: string
  value?: string
  opType: 'replace' | 'merge' | 'full'
}

export interface ResponseModify {
  modifyType: 'static' | 'script'
  responseOps?: ResponseOp[]
  script?: string
  statusCode?: number
  delayMs?: number
}

export interface RequestModifyRule {
  id: string
  enabled: boolean
  urlPattern: string
  urlMatchType: 'exact' | 'regex' | 'contains'
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[]
  headerOps: HeaderOperation[]
  responseModify?: ResponseModify
  remark: string
}

export interface RequestModifyGroup {
  id: string
  name: string
  enabled: boolean
  rules: RequestModifyRule[]
}

export interface RequestModifyStorage extends BaseStorageData {
  groups: RequestModifyGroup[]
}

// API 响应类型
export interface ParamQueryResponse {
  success: boolean
  data: ParamQueryItem[]
}

export interface ParamQueryItem {
  paramNo: string
  paramConfigs: ParamConfig[]
}

export interface ParamConfig {
  value: string
  endValue: string | null
}

// Winning SDK 类型
export interface WinningSDK {
  dispatchEvent?: (eventId: string, params: string, cb: (result: string) => void) => void
  getMacadress?: () => string
  getPcName?: () => string
  getIP?: () => string
  deltaResult?: () => boolean
  showMsg?: () => void
  postMessage?: () => void
}

// 请求修改拦截器类型
export interface ProxyRequest {
  url?: string
  method?: string
  headers?: Record<string, string>
}

export interface ProxyResponse {
  status?: number
  statusCode?: number
  response?: string
  config?: ProxyRequest
}

export interface ProxyHandler {
  next: (request: ProxyRequest | ProxyResponse) => void
}