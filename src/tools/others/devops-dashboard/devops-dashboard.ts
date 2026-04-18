import type { EnableStorage } from '~/types'
import { proxy } from 'ajax-hook'
import { urls } from '~/constants'

import { mockAppMenuByUserAndCollectResponse, mockUserInfoResponse } from './mockResponse'

export const storageKey = `${__namespace}devops-dashboard`

export function init() {
  const storage = GM_getValue<EnableStorage>(storageKey, { enable: false })

  if (!location.href.includes(urls.devopsDashboard) || !storage.enable) return

  proxy({
    onResponse: (response, handler) => {
      const responseObj = JSON.parse(response.response)
      let data = responseObj.data

      if (response.config.url === '/api/v1/cop/portal/getAppMenuByUserAndCollect') {
        data = mockAppMenuByUserAndCollectResponse(data)
      }

      if (response.config.url === '/api/v1/cop/portal/getUserInfo') {
        data = mockUserInfoResponse(data)
      }

      responseObj.data = data
      response.response = JSON.stringify(responseObj)
      handler.next(response)
    },
  }, unsafeWindow)
}
