import type { EnableStorage } from '~/types'
import { urls } from '~/constants'
import { log } from '~/utils/log'

export const storageKey = `${__namespace}devops-login`

const allUrls = [urls.devopsLogin, ...urls.devopsLoginAlternatives]

export function init() {
  const storage = GM_getValue<EnableStorage>(storageKey, { enable: false })

  if (!allUrls.some(url => location.href.includes(url)) || !storage.enable) return

  log('关闭SleepWell登录 - 已加载')

  function handleLoginPage() {
    // 运维平台
    const sleepWellCheckbox = document.querySelector('#sleep_well') as HTMLInputElement | null
    sleepWellCheckbox?.remove()

    const agreeCheckbox = document.querySelector('#agreeCheckbox') as HTMLInputElement | null
    if (agreeCheckbox) {
      agreeCheckbox.checked = true
    }

    const spanElements = document.querySelectorAll('.user-info > div > label > span')
    spanElements.forEach((span) => {
      span.parentElement?.parentElement?.remove()
    })

    // 运营中心
    const SleepWellBox = document.querySelector('#SleepWellBox') as HTMLInputElement | null
    SleepWellBox?.remove()
    const checkboxForSleepWell = document.querySelector('#checkboxForSleepWell') as HTMLInputElement | null
    checkboxForSleepWell?.remove()

    const passwordInput = document.querySelector('#password') as HTMLInputElement | null

    if (passwordInput) {
      passwordInput.type = 'password'
    }
  }

  document.addEventListener('DOMContentLoaded', handleLoginPage)
  handleLoginPage()
}
