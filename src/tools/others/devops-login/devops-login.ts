export const storageKey = `${__namespace}devops-login`
// export const url = 'http://172.16.7.77:8089/cluster/action/login/login'
export const url = '/cluster/action/login/login'
export const urls = [
  '/cluster/action/login/login', // 运维平台
  'http://172.16.0.197:8089/login/', // 运营中心
  'http://wxp.cpp.iwincloud.com:8089/login', // 运营中心
]

export function init() {
  const storage = GM_getValue(storageKey, {
    enable: false,
  })

  if (urls.some(url => location.href.includes(url)) && storage.enable) {
    const handleLoginPage = () => {
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
    }

    document.addEventListener('DOMContentLoaded', handleLoginPage)

    handleLoginPage()
  }
}
