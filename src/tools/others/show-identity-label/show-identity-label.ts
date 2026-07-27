import { isCurrentPage, urls } from '~/constants'
import type { EnableStorage } from '~/types'
import { log } from '~/utils/log'

export const storageKey = `${__namespace}ShowIdentityLabel`

/**
 * 为 IdentityImage 图片添加标签
 */
function processIdentityImages() {
  const images = document.querySelectorAll('.links-control-container img')

  images.forEach((img) => {
    const imgElement = img as HTMLImageElement

    // 过滤 src 中包含 IdentityImage 的图片
    if (!imgElement.src || !imgElement.src.includes('IdentityImage')) {
      return
    }

    // 检查是否已经添加过 span
    if (imgElement.dataset.spanAdded) {
      return
    }

    // 创建 span 标签
    const span = document.createElement('span')

    // 提取并清理 alt 文本（移除 HTML 标签）
    const cleanAlt = imgElement.alt.replace(/<[^>]*>/g, '')
    span.textContent = cleanAlt

    // 添加样式
    span.style.cssText = `
      display: inline-block;
      margin-left: 8px;
      padding: 2px 6px;
      color: #333;
      font-size: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
    `

    // 在 img 后面插入 span
    imgElement.insertAdjacentElement('afterend', span)

    // 标记已处理
    imgElement.dataset.spanAdded = 'true'
  })
}

/**
 * 初始化 MutationObserver 监听容器变化
 */
function setupObserver() {
  const container = document.querySelector('.links-control-container')

  if (!container) {
    // 如果容器不存在，稍后重试
    log('show-identity-label: 容器元素未找到，等待 DOM 加载完成')
    setTimeout(setupObserver, 1000)
    return
  }

  const observer = new MutationObserver((mutations) => {
    // 检查是否有新增节点
    const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0)

    if (hasAddedNodes) {
      log('show-identity-label: 容器内容发生变化，重新处理')
      processIdentityImages()
    }
  })

  observer.observe(container, {
    childList: true,    // 监听子节点变化
    subtree: true,      // 监听所有后代节点
  })

  log('show-identity-label: MutationObserver 已启动')

  // 立即执行一次处理
  processIdentityImages()
}

export function init() {
  const storage = GM_getValue<EnableStorage>(storageKey, {
    enable: false,
  })

  if (!storage.enable) {
    return
  }

  // 检查 URL 是否匹配
  if (!isCurrentPage(urls.tfs)) {
    log('show-identity-label: URL 不匹配，跳过加载')
    return
  }

  log('show-identity-label: 已加载')

  // 页面加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupObserver)
  } else {
    setupObserver()
  }
}