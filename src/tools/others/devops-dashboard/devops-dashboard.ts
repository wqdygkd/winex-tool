import { proxy } from 'ajax-hook'

export const storageKey = `${__namespace}devops-dashboard`
export const url = '/cluster/cluster/portal'

export function init() {
  const storage = GM_getValue(storageKey, {
    enable: false,
  })
  if (location.href.includes(url) && storage.enable) {
    proxy({
      onResponse: (response, handler) => {
        const responseObj = JSON.parse(response.response)
        const data = responseObj.data
        if (response.config.url === '/api/v1/cop/portal/getAppMenuByUserAndCollect') {
          data.appMenu = data.appMenu.map((menu: { children: any[] }) => {
            menu.children = menu.children.map((child) => {
              child.enable = true
              return child
            })
            return menu
          })
          sessionStorage.setItem('appMenu', JSON.stringify(data.appMenu))
        }
        if (response.config.url === '/api/v1/cop/portal/getUserInfo') {
          data.role = {
            name: 'admin',
          }
          data.appConfigList = [] // TODO
        }

        responseObj.data = data
        response.response = JSON.stringify(responseObj)
        handler.next(response)
      },
    }, unsafeWindow)
  }
}
