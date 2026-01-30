import { proxy } from 'ajax-hook'

import getAppMenuByUserAndCollectResponse from './getAppMenuByUserAndCollectResponse'
import getUserInfoResponse from './getUserInfoResponse'

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
          data.appMenu = getAppMenuByUserAndCollectResponse(data.appMenu)
        }

        if (response.config.url === '/api/v1/cop/portal/getUserInfo') {
          const { role, appConfigList } = getUserInfoResponse()
          data.role = role
          data.appConfigList = appConfigList
        }

        responseObj.data = data
        response.response = JSON.stringify(responseObj)
        handler.next(response)
      },
    }, unsafeWindow)
  }
}
