/**
 * 请求修改工具 Composable
 * 提取业务逻辑，实现 UI 与逻辑分离
 */

import type { HeaderOperation, RequestModifyGroup, RequestModifyRule, ResponseModify } from '~/types'
import { useGMStorage } from '~/composables/useGMStorage'
import { storageKey } from '~/tools/request-modify/request-modify'

export const URL_MATCH_TYPE_OPTIONS = [
  { label: '包含', value: 'contains' },
  { label: '正则', value: 'regex' },
  { label: '精确', value: 'exact' },
] as const

export const HEADER_OP_TYPE_OPTIONS = [
  { label: '设置', value: 'set' },
  { label: '追加', value: 'append' },
  { label: '删除', value: 'delete' },
] as const

export const RESPONSE_OP_TYPE_OPTIONS = [
  { label: '替换字段', value: 'replace' },
  { label: '合并数据', value: 'merge' },
  { label: '整体替换', value: 'full' },
] as const

export const MODIFY_TYPE_OPTIONS = [
  { label: '静态修改', value: 'static' },
  { label: '动态脚本', value: 'script' },
] as const

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

export type HttpMethod = typeof HTTP_METHODS[number]

export function useRequestModify() {
  const { data: storage, save } = useGMStorage<RequestModifyStorage>(storageKey, {
    enable: false,
    groups: [],
  }, { autoSave: false })

  const dialogVisible = ref(false)
  const editingGroupId = ref<string>('')
  const editingRule = ref<RequestModifyRule | null>(null)

  const enableModify = computed({
    get: () => storage.value.enable,
    set: (val) => {
      storage.value.enable = val
      save()
    },
  })

  const groups = computed(() => storage.value.groups)

  function createEmptyGroup(): RequestModifyGroup {
    return {
      id: Date.now().toString(),
      name: `分组 ${groups.value.length + 1}`,
      enabled: true,
      rules: [],
    }
  }

  function createEmptyRule(): RequestModifyRule {
    return {
      id: Date.now().toString(),
      enabled: true,
      urlPattern: '',
      urlMatchType: 'contains',
      methods: [],
      headerOps: [],
      responseModify: undefined,
      remark: '',
    }
  }

  function createEmptyHeaderOp(): HeaderOperation {
    return { key: '', value: '', opType: 'set' }
  }

  function createEmptyResponseModify(): ResponseModify {
    return {
      modifyType: 'static',
      responseOps: [],
      statusCode: undefined,
      delayMs: undefined,
    }
  }

  function createEmptyResponseOp(): ResponseOp {
    return { key: '', value: '', opType: 'replace' }
  }

  function addGroup() {
    groups.value.push(createEmptyGroup())
    save()
  }

  function deleteGroup(id: string) {
    storage.value.groups = groups.value.filter(g => g.id !== id)
    save()
  }

  function addRule(groupId: string) {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    group.rules.push(createEmptyRule())
    save()
  }

  function deleteRule(groupId: string, ruleId: string) {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    group.rules = group.rules.filter(r => r.id !== ruleId)
    save()
  }

  function editRule(groupId: string, rule: RequestModifyRule) {
    editingGroupId.value = groupId
    editingRule.value = JSON.parse(JSON.stringify(rule))
    dialogVisible.value = true
  }

  function addHeaderOp() {
    if (!editingRule.value) return
    editingRule.value.headerOps.push(createEmptyHeaderOp())
  }

  function deleteHeaderOp(index: number) {
    if (!editingRule.value) return
    editingRule.value.headerOps.splice(index, 1)
  }

  function enableResponseModify() {
    if (!editingRule.value) return
    editingRule.value.responseModify = createEmptyResponseModify()
  }

  function disableResponseModify() {
    if (!editingRule.value) return
    editingRule.value.responseModify = undefined
  }

  function addResponseOp() {
    if (!editingRule.value?.responseModify) return
    editingRule.value.responseModify.responseOps?.push(createEmptyResponseOp())
  }

  function deleteResponseOp(index: number) {
    if (!editingRule.value?.responseModify?.responseOps) return
    editingRule.value.responseModify.responseOps.splice(index, 1)
  }

  function saveRule() {
    if (!editingRule.value) return
    const group = groups.value.find(g => g.id === editingGroupId.value)
    if (!group) return

    const ruleIndex = group.rules.findIndex(r => r.id === editingRule.value!.id)
    if (ruleIndex !== -1) {
      group.rules[ruleIndex] = editingRule.value
    }

    save()
    dialogVisible.value = false
    editingRule.value = null
  }

  function closeDialog() {
    dialogVisible.value = false
    editingRule.value = null
  }

  function getMethodDisplay(methods: RequestModifyRule['methods']): string {
    if (!methods || methods.length === 0) return '全部'
    return methods.join(', ')
  }

  function getHeaderOpsCount(headerOps: HeaderOperation[]): string {
    if (!headerOps || headerOps.length === 0) return '0个'
    return `${headerOps.length}个`
  }

  function getUrlMatchTypeLabel(type: RequestModifyRule['urlMatchType']): string {
    const option = URL_MATCH_TYPE_OPTIONS.find(o => o.value === type)
    return option?.label ?? type
  }

  function getResponseModifyInfo(responseModify?: ResponseModify): string {
    if (!responseModify) return ''
    const parts: string[] = []
    if (responseModify.statusCode) parts.push(`状态码:${responseModify.statusCode}`)
    if (responseModify.delayMs) parts.push(`延迟:${responseModify.delayMs}ms`)
    if (responseModify.responseOps?.length) parts.push(`${responseModify.responseOps.length}个操作`)
    return parts.join(', ')
  }

  return {
    // 状态
    storage,
    groups,
    enableModify,
    dialogVisible,
    editingRule,

    // 操作
    save,
    addGroup,
    deleteGroup,
    addRule,
    deleteRule,
    editRule,
    saveRule,
    closeDialog,
    addHeaderOp,
    deleteHeaderOp,
    enableResponseModify,
    disableResponseModify,
    addResponseOp,
    deleteResponseOp,

    // 显示辅助
    getMethodDisplay,
    getHeaderOpsCount,
    getUrlMatchTypeLabel,
    getResponseModifyInfo,
  }
}