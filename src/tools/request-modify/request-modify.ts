import type { RequestModifyStorage, HeaderOperation, RequestModifyRule, ResponseModify } from '~/types'
import { proxy } from 'ajax-hook'

export const storageKey = `${__namespace}request-modify`

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

/** 初始化请求修改工具 */
export function init() {
  const storage = GM_getValue<RequestModifyStorage>(storageKey, {
    enable: false,
    groups: [],
  })

  if (!storage.enable) return

  proxy({
    onRequest: (request, handler) => {
      try {
        const matchedRules = collectMatchedRules(request)
        const matchedOps = collectHeaderOps(matchedRules)
        applyHeaders(request.headers, matchedOps)
      } catch (error) {
        console.error('Error applying header modifications:', error)
      }
      handler.next(request)
    },
    onResponse: async (response, handler) => {
      try {
        const matchedRules = collectMatchedRules(response.config || {})
        const maxDelay = getMaxDelay(matchedRules)
        if (maxDelay > 0) {
          await sleep(maxDelay)
        }
        applyResponseModify(response, matchedRules)
      } catch (error) {
        console.error('Error applying response modifications:', error)
      }
      handler.next(response)
    },
  }, unsafeWindow)
}

/** 收集匹配的规则 */
function collectMatchedRules(request: { url?: string, method?: string }): RequestModifyRule[] {
  const rules: RequestModifyRule[] = []
  const latestStorage = GM_getValue<RequestModifyStorage>(storageKey, {
    enable: false,
    groups: [],
  })

  latestStorage.groups
    .filter(g => g.enabled)
    .forEach((group) => {
      group.rules
        .filter(r => r.enabled)
        .filter(r => matchUrl(request.url || '', r))
        .filter(r => matchMethod(request.method || '', r.methods))
        .forEach(r => rules.push(r))
    })

  return rules
}

/** 收集Header操作 */
function collectHeaderOps(rules: RequestModifyRule[]): HeaderOperation[] {
  const ops: HeaderOperation[] = []
  rules.forEach(r => ops.push(...r.headerOps))
  return ops
}

/** URL匹配 */
function matchUrl(url: string, rule: RequestModifyRule): boolean {
  if (!rule.urlPattern) return false

  try {
    switch (rule.urlMatchType) {
      case 'contains':
        return url.includes(rule.urlPattern)
      case 'regex':
        return new RegExp(rule.urlPattern).test(url)
      case 'exact':
        return url === rule.urlPattern
      default:
        return false
    }
  } catch {
    return false
  }
}

/** 请求方法匹配 */
function matchMethod(method: string, methods: RequestModifyRule['methods']): boolean {
  if (!methods || methods.length === 0) return true
  return methods.includes(method.toUpperCase() as typeof httpMethods[number])
}

/** 查找已存在的Header key（忽略大小写） */
function findExistingHeaderKey(headers: Record<string, string>, key: string): string | undefined {
  const lowerKey = key.toLowerCase()
  for (const existingKey in headers) {
    if (existingKey.toLowerCase() === lowerKey) {
      return existingKey
    }
  }
  return undefined
}

/** 应用Header操作 */
function applyHeaders(headers: Record<string, string>, ops: HeaderOperation[]): void {
  ops.forEach((op) => {
    const existingKey = findExistingHeaderKey(headers, op.key)
    const targetKey = existingKey || op.key

    switch (op.opType) {
      case 'set':
        if (op.value !== undefined) {
          headers[targetKey] = op.value
        }
        break
      case 'append':
        if (op.value !== undefined) {
          const existing = headers[targetKey]
          headers[targetKey] = existing ? `${existing}, ${op.value}` : op.value
        }
        break
      case 'delete':
        if (existingKey) {
          delete headers[existingKey]
        }
        break
    }
  })
}

/** 获取最大延迟时间 */
function getMaxDelay(rules: RequestModifyRule[]): number {
  let maxDelay = 0
  rules.forEach(rule => {
    if (rule.responseModify?.delayMs && rule.responseModify.delayMs > maxDelay) {
      maxDelay = rule.responseModify.delayMs
    }
  })
  return maxDelay
}

/** 延迟函数 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 应用响应修改 */
function applyResponseModify(response: any, rules: RequestModifyRule[]): void {
  rules.forEach(rule => {
    if (!rule.responseModify) return
    const config = rule.responseModify

    // 修改响应状态码
    if (config.statusCode) {
      response.status = config.statusCode
      response.statusCode = config.statusCode
    }

    // 静态响应体修改
    if (config.modifyType === 'static' && config.responseOps) {
      config.responseOps.forEach(op => {
        try {
          if (op.opType === 'full') {
            response.response = op.value || ''
          } else {
            const body = JSON.parse(response.response)

            if (op.opType === 'replace') {
              setByPath(body, op.key, JSON.parse(op.value || 'null'))
            } else if (op.opType === 'merge') {
              const existing = getByPath(body, op.key)
              const toMerge = JSON.parse(op.value || '{}')
              setByPath(body, op.key, mergeDeep(existing, toMerge))
            }

            response.response = JSON.stringify(body)
          }
        } catch (e) {
          console.error('Response body modify error:', e)
        }
      })
    }
  })
}

/** JSON path 获取 */
function getByPath(obj: any, path: string): any {
  if (!path) return obj
  return path.split('.').reduce((acc, key) => {
    if (acc === null || acc === undefined) return undefined
    // 处理数组索引，如 items[0]
    const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/)
    if (arrayMatch) {
      const arrKey = arrayMatch[1]
      const idx = parseInt(arrayMatch[2])
      return acc[arrKey]?.[idx]
    }
    return acc[key]
  }, obj)
}

/** JSON path 设置 */
function setByPath(obj: any, path: string, value: any): void {
  if (!path) return
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((acc, key) => {
    if (acc[key] === undefined) acc[key] = {}
    // 处理数组索引
    const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/)
    if (arrayMatch) {
      const arrKey = arrayMatch[1]
      const idx = parseInt(arrayMatch[2])
      if (acc[arrKey] === undefined) acc[arrKey] = []
      return acc[arrKey][idx] || (acc[arrKey][idx] = {})
    }
    return acc[key]
  }, obj)
  // 处理最后一个 key 的数组索引
  const lastArrayMatch = lastKey.match(/^(\w+)\[(\d+)\]$/)
  if (lastArrayMatch) {
    const arrKey = lastArrayMatch[1]
    const idx = parseInt(lastArrayMatch[2])
    if (target[arrKey] === undefined) target[arrKey] = []
    target[arrKey][idx] = value
  } else {
    target[lastKey] = value
  }
}

/** 深度合并 */
function mergeDeep(target: any, source: any): any {
  if (typeof target !== 'object' || target === null) return source
  if (typeof source !== 'object' || source === null) return target
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...target, ...source]
  }
  const result = { ...target }
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      result[key] = mergeDeep(target[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}