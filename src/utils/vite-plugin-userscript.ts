/**
 * Vite 油猴脚本插件
 * 功能：
 * 1. 自动注入 UserScript 元数据头部
 * 2. 检测配置变更
 * 3. 构建完成后自动打开浏览器安装脚本
 */

import type { Plugin, ResolvedConfig } from 'vite'
import type { UserScriptMetadata } from './meta/types'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { calculateMetaHash, generateMetaString } from './meta'

interface UserscriptPluginOptions {
  /** 元数据配置 */
  meta: UserScriptMetadata
  /** 输出文件名 */
  outputFile?: string
  /** 是否自动打开浏览器安装 */
  autoInstall?: boolean
  /** 安装 URL（本地文件路径或远程 URL） */
  installUrl?: string
  /** hash 存储文件 */
  hashFile?: string
}

const DEFAULT_HASH_FILE = '.userscript-hash'

export default function userscriptPlugin(options: UserscriptPluginOptions): Plugin {
  const {
    meta,
    outputFile = 'index.user.js',
    autoInstall = true,
    installUrl,
    hashFile = DEFAULT_HASH_FILE,
  } = options

  let config: ResolvedConfig
  let metaString: string
  let currentHash: string
  let previousHash: string | null = null
  let isFirstBuild = true
  let outputFilePath: string

  return {
    name: 'vite-plugin-userscript',
    apply: 'build',

    configResolved(resolvedConfig) {
      config = resolvedConfig
      outputFilePath = path.resolve(config.build.outDir || 'dist', outputFile)
      metaString = generateMetaString(meta)
      currentHash = calculateMetaHash(meta)

      // 读取之前的 hash
      const hashFilePath = path.resolve(config.root, hashFile)
      if (fs.existsSync(hashFilePath)) {
        previousHash = fs.readFileSync(hashFilePath, 'utf-8').trim()
      }
    },

    async writeBundle() {
      // 在文件写入后注入元数据
      if (fs.existsSync(outputFilePath)) {
        const content = fs.readFileSync(outputFilePath, 'utf-8')
        // 只有当文件开头没有元数据时才注入
        if (!content.startsWith('// ==UserScript==')) {
          fs.writeFileSync(outputFilePath, `${metaString}${content}`)
        }
      }

      // 写入 hash 文件
      const hashFilePath = path.resolve(config.root, hashFile)
      fs.writeFileSync(hashFilePath, currentHash)

      // 检查是否需要打开浏览器安装
      const hashChanged = previousHash !== currentHash
      const shouldInstall = autoInstall && (isFirstBuild || hashChanged)

      if (shouldInstall) {
        await new Promise(resolve => setTimeout(resolve, 100))
        openBrowserForInstall(outputFilePath, installUrl)
      }

      isFirstBuild = false

      // 输出构建信息
      const status = hashChanged ? '配置已变更' : '配置未变更'
      console.log('\n')
      console.log('╔════════════════════════════════════════════╗')
      console.log('║       油猴脚本构建完成                      ║')
      console.log('╠════════════════════════════════════════════╣')
      console.log(`║ 输出文件: ${outputFile.padEnd(28)} ║`)
      console.log(`║ 元数据 Hash: ${currentHash.padEnd(26)} ║`)
      console.log(`║ 状态: ${status.padEnd(32)} ║`)
      if (shouldInstall) {
        console.log('║ ✓ 已自动打开浏览器安装脚本                 ║')
      }
      console.log('╚════════════════════════════════════════════╝')
      console.log('\n')
    },
  }
}

/** 打开浏览器安装脚本 */
function openBrowserForInstall(scriptPath: string, customUrl?: string): void {
  const url = customUrl || `file://${scriptPath}`

  // 根据平台选择命令
  const platform = process.platform
  let command: string
  let args: string[]

  if (platform === 'win32') {
    // Windows: 使用 start 命令
    command = 'cmd'
    args = ['start', '', url]
  } else if (platform === 'darwin') {
    // macOS: 使用 open 命令
    command = 'open'
    args = [url]
  } else {
    // Linux: 使用 xdg-open
    command = 'xdg-open'
    args = [url]
  }

  try {
    spawn(command, args, { stdio: 'ignore', detached: true })
  } catch (error) {
    console.warn('[vite-plugin-userscript] 无法打开浏览器:', error)
    console.log(`请手动打开以下链接安装脚本: ${url}`)
  }
}
