/**
 * 工具模块注册机制
 */

import type { Component } from 'vue'
import { log } from '~/utils/log'

export interface ToolModule {
  /** 工具名称 */
  name: string
  /** 存储键 */
  storageKey: string
  /** 初始化函数 */
  init: () => void
  /** Vue 组件 */
  component?: Component
  /** 菜单图标 */
  icon?: string
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
  log('开始初始化工具...')
  registry.forEach((tool) => {
    log(`初始化工具: ${tool.name}`)
    tool.init()
  })
  log('工具初始化完成')
}
