// 运维平台登录页面优化
// 目标网址: http://172.16.7.77:8089/cluster/action/login/login

export const storageKey = `${__namespace}运维平台登录`
export const url = 'http://172.16.7.77:8089/cluster/action/login/login'

export default function () {
  let storage = GM_getValue(storageKey, {
    enable: false
  })

  if (location.href.includes(url) && storage.enable) {
    const handleLoginPage = () => {
      const sleepWellCheckbox = document.querySelector('#sleep_well') as HTMLInputElement | null
      sleepWellCheckbox?.remove()

      const agreeCheckbox = document.querySelector('#agreeCheckbox') as HTMLInputElement | null
      if (agreeCheckbox) {
        agreeCheckbox.checked = true
      }

      const spanElements = document.querySelectorAll('div > label > span');
      spanElements.forEach(span => {
        span.parentElement?.parentElement?.remove()
      })
    }

    document.addEventListener('DOMContentLoaded', handleLoginPage)

    handleLoginPage()
  }
}
