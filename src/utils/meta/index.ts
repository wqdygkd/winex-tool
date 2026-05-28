/**
 * 油猴脚本元数据生成器
 * 支持 Tampermonkey / Greasemonkey / Violentmonkey
 */

import type { UserScriptMetadata } from './types'
import commonMeta from './common.meta'
import devMeta from './dev.meta'
import prodMeta from './prod.meta'

/** 生成元数据字符串 */
export function generateMetaString(meta: UserScriptMetadata): string {
  const lines: string[] = ['// ==UserScript==']

  // 按优先级排序的字段
  const orderedFields = [
    'name',
    'namespace',
    'version',
    'description',
    'author',
    'homepage',
    'homepageURL',
    'website',
    'source',
    'license',
    'icon',
    'iconURL',
    'defaulticon',
    'icon64',
    'icon64URL',
    'updateURL',
    'downloadURL',
    'installURL',
    'supportURL',
    'contributionURL',
    'match',
    'exclude',
    'include',
    'require',
    'resource',
    'connect',
    'grant',
    'run-at',
    'noframes',
    'unwrap',
  ]

  // 处理排序字段
  for (const key of orderedFields) {
    if (meta[key] !== undefined) {
      appendField(lines, key, meta[key])
    }
  }

  // 处理其他字段
  for (const [key, value] of Object.entries(meta)) {
    if (!orderedFields.includes(key) && value !== undefined) {
      appendField(lines, key, value)
    }
  }

  lines.push('// ==/UserScript==')
  lines.push('')

  return lines.join('\n')
}

function appendField(lines: string[], key: string, value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      lines.push(`// @${key.padEnd(16, ' ')}${item}`)
    }
  } else if (typeof value === 'object' && value !== null) {
    // 处理 resource 等对象类型
    for (const [subKey, subValue] of Object.entries(value as Record<string, string>)) {
      lines.push(`// @${key.padEnd(16, ' ')}${subKey} ${subValue}`)
    }
  } else {
    lines.push(`// @${key.padEnd(16, ' ')}${value}`)
  }
}

/** 合并元数据 */
export function mergeMeta(base: UserScriptMetadata, ...overrides: Partial<UserScriptMetadata>[]): UserScriptMetadata {
  const result: UserScriptMetadata = { ...base }

  for (const override of overrides) {
    for (const [key, value] of Object.entries(override)) {
      if (Array.isArray(result[key]) && Array.isArray(value)) {
        // 数组类型合并
        result[key] = [...result[key], ...(value as unknown[])]
      } else {
        result[key] = value
      }
    }
  }

  return result
}

/** 获取元数据（根据环境） */
export function getMeta(mode: 'development' | 'production' = 'production'): UserScriptMetadata {
  const baseMeta = mergeMeta(commonMeta, mode === 'development' ? devMeta : prodMeta)
  return baseMeta
}

/** 计算元数据 hash（用于检测变更） */
export function calculateMetaHash(meta: UserScriptMetadata): string {
  const metaString = generateMetaString(meta)
  // 简单 hash 实现（生产环境可用 crypto）
  let hash = 0
  for (let i = 0; i < metaString.length; i++) {
    const char = metaString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

// 默认导出
export default generateMetaString