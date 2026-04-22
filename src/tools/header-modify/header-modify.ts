import type { HeaderModifyStorage, HeaderOperation, HeaderRule } from '~/types'
import { proxy } from 'ajax-hook'

export const storageKey = `${__namespace}header-modify`

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

/** 初始化请求头修改工具 */
export function init() {
  const storage = GM_getValue<HeaderModifyStorage>(storageKey, {
    enable: false,
    groups: [],
  })

  if (!storage.enable) return

  proxy({
    onRequest: (request, handler) => {
      try {
        const matchedOps = collectMatchedOps(request)
        applyHeaders(request.headers, matchedOps)
      } catch (error) {
        console.error('Error applying header modifications:', error)
      }
      handler.next(request)
    },
  }, unsafeWindow)
}

/** 收集匹配的Header操作 */
function collectMatchedOps(request: { url: string, method: string }): HeaderOperation[] {
  const ops: HeaderOperation[] = []
  const latestStorage = GM_getValue<HeaderModifyStorage>(storageKey, {
    enable: false,
    groups: [],
  })

  latestStorage.groups
    .filter(g => g.enabled)
    .forEach((group) => {
      group.rules
        .filter(r => r.enabled)
        .filter(r => matchUrl(request.url, r))
        .filter(r => matchMethod(request.method, r.methods))
        .forEach(r => ops.push(...r.headerOps))
    })

  return ops
}

/** URL匹配 */
function matchUrl(url: string, rule: HeaderRule): boolean {
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
function matchMethod(method: string, methods: HeaderRule['methods']): boolean {
  if (!methods || methods.length === 0) return true
  return methods.includes(method.toUpperCase() as typeof httpMethods[number])
}

/** 应用Header操作 */
function applyHeaders(headers: Record<string, string>, ops: HeaderOperation[]): void {
  ops.forEach((op) => {
    switch (op.opType) {
      case 'set':
        if (op.value !== undefined) {
          headers[op.key] = op.value
        }
        break
      case 'append':
        if (op.value !== undefined) {
          const existing = headers[op.key]
          headers[op.key] = existing ? `${existing}, ${op.value}` : op.value
        }
        break
      case 'delete':
        delete headers[op.key]
        break
    }
  })
}
