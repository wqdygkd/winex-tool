import type { HeaderOperation, RequestModifyRule, RequestModifyStorage } from '~/types'
import { proxy } from 'ajax-hook'

export const storageKey = `${__namespace}request-modify`

const _httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const
const ARRAY_INDEX_REGEX = /^(\w+)\[(\d+)\]$/

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

function collectMatchedRules(request: { url?: string, method?: string }): RequestModifyRule[] {
  const storage = GM_getValue<RequestModifyStorage>(storageKey, {
    enable: false,
    groups: [],
  })

  return storage.groups
    .filter(g => g.enabled)
    .flatMap(group => group.rules
      .filter(r => r.enabled)
      .filter(r => matchUrl(request.url || '', r))
      .filter(r => matchMethod(request.method || '', r.methods)),
    )
}

function collectHeaderOps(rules: RequestModifyRule[]): HeaderOperation[] {
  return rules.flatMap(r => r.headerOps)
}

/** URL匹配 */
function matchUrl(url: string, rule: RequestModifyRule): boolean {
  if (!rule.urlPattern) return false

  try {
    if (rule.urlMatchType === 'contains') return url.includes(rule.urlPattern)
    if (rule.urlMatchType === 'exact') return url === rule.urlPattern
    if (rule.urlMatchType === 'regex') return new RegExp(rule.urlPattern).test(url)
    return false
  } catch {
    return false
  }
}

function matchMethod(method: string, methods: RequestModifyRule['methods']): boolean {
  if (!methods || methods.length === 0) return true
  return methods.includes(method.toUpperCase() as typeof _httpMethods[number])
}

function findExistingHeaderKey(headers: Record<string, string>, key: string): string | undefined {
  const lowerKey = key.toLowerCase()
  for (const existingKey in headers) {
    if (existingKey.toLowerCase() === lowerKey) {
      return existingKey
    }
  }
  return undefined
}

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

function getMaxDelay(rules: RequestModifyRule[]): number {
  return rules.reduce((max, rule) => {
    const delay = rule.responseModify?.delayMs || 0
    return delay > max ? delay : max
  }, 0)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function applyResponseModify(response: any, rules: RequestModifyRule[]): void {
  rules.forEach((rule) => {
    if (!rule.responseModify) return
    const config = rule.responseModify

    // 修改响应状态码
    if (config.statusCode) {
      response.status = config.statusCode
      response.statusCode = config.statusCode
    }

    // 静态响应体修改
    if (config.modifyType === 'static' && config.responseOps) {
      config.responseOps.forEach((op) => {
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

function getByPath(obj: any, path: string): any {
  if (!path) return obj
  return path.split('.').reduce((acc, key) => {
    if (acc === null || acc === undefined) return undefined
    // 处理数组索引，如 items[0]
    const arrayMatch = ARRAY_INDEX_REGEX.exec(key)
    if (arrayMatch) {
      const arrKey = arrayMatch[1]
      const idx = Number.parseInt(arrayMatch[2])
      return acc[arrKey]?.[idx]
    }
    return acc[key]
  }, obj)
}

function setByPath(obj: any, path: string, value: any): void {
  if (!path) return
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((acc, key) => {
    if (acc[key] === undefined) acc[key] = {}
    // 处理数组索引
    const arrayMatch = ARRAY_INDEX_REGEX.exec(key)
    if (arrayMatch) {
      const arrKey = arrayMatch[1]
      const idx = Number.parseInt(arrayMatch[2])
      if (acc[arrKey] === undefined) acc[arrKey] = []
      return acc[arrKey][idx] || (acc[arrKey][idx] = {})
    }
    return acc[key]
  }, obj)
  // 处理最后一个 key 的数组索引
  const lastArrayMatch = ARRAY_INDEX_REGEX.exec(lastKey)
  if (lastArrayMatch) {
    const arrKey = lastArrayMatch[1]
    const idx = Number.parseInt(lastArrayMatch[2])
    if (target[arrKey] === undefined) target[arrKey] = []
    target[arrKey][idx] = value
  } else {
    target[lastKey] = value
  }
}

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
