/**
 * 控制台日志工具
 * 统一带样式的日志输出
 */

const prefix = '[Winex Tool]'
const baseStyle = 'color: #42b883; font-weight: bold;'

export function log(message: string, ...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(`%c${prefix}`, baseStyle, message, ...args)
}
