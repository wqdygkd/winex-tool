/**
 * 工具模块注册机制
 * 支持插件式注册和按需初始化
 */

import type { Component } from 'vue'
import { isCurrentPage } from '~/constants'

export interface ToolModule {
  /** 工具名称 */
  name: string
  /** 存储键 */
  storageKey: string
  /** 初始化函数 */
  init: () => void
  /** Vue 组件 */
  component?: Component
  /** 匹配的 URL 模式，不设置则始终初始化 */
  routes?: string[]
  /** 是否在匹配 URL 时自动初始化 */
  autoInitOnRoute?: boolean
}

const registry: ToolModule[] = []

/** 注册工具模块 */
export function registerTool(tool: ToolModule): void {
  registry.push(tool)
}

/** 获取所有注册的工具 */
export function getTools(): ToolModule[] {
  return registry
}

/** 初始化所有工具 */
export function initAllTools(): void {
  registry.forEach((tool) => {
    const shouldInit = tool.routes
      ? isCurrentPage(tool.routes)
      : true

    if (shouldInit || !tool.autoInitOnRoute) {
      tool.init()
    }
  })
}

/** 按名称获取工具 */
export function getToolByName(name: string): ToolModule | undefined {
  return registry.find(t => t.name === name)
}
