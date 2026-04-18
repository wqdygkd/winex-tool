import type { ParamMockStorage } from '~/types'
import { proxy } from 'ajax-hook'
import { apiPaths, matchUrl } from '~/constants'

export const storageKey = `${__namespace}param-mock`

export function init() {
  const storage = GM_getValue<ParamMockStorage>(storageKey, {
    enable: false,
    rules: [],
  })

  if (!storage.enable) return

  proxy({
    onResponse: (response, handler) => {
      try {
        const url = response.config.url

        if (!matchUrl(url, apiPaths.paramQuery)) {
          handler.next(response)
          return
        }

        const latestStorage = GM_getValue<ParamMockStorage>(storageKey, {
          enable: false,
          rules: [],
        })

        const responseObj = JSON.parse(response.response)

        if (responseObj && Array.isArray(responseObj.data)) {
          latestStorage.rules
            .filter(rule => rule.enabled && rule.paramNo && rule.mockValue?.length > 0)
            .forEach((rule) => {
              responseObj.data.forEach((item: any) => {
                if (item.paramNo === rule.paramNo) {
                  item.paramConfigs = rule.mockValue.map(value => ({
                    value,
                    endValue: null,
                  }))
                }
              })
            })

          response.response = JSON.stringify(responseObj)
        }
      } catch (error) {
        console.error('Error processing param mock:', error)
      }

      handler.next(response)
    },
  }, unsafeWindow)
}
