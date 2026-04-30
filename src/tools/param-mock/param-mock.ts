import type { ParamMockRule, ParamMockStorage } from '~/types'
import { proxy } from 'ajax-hook'
import { apiPaths, matchUrl } from '~/constants'
import { log } from '~/utils/log'

export const storageKey = `${__namespace}param-mock`

/** 默认规则 */
const defaultRules: ParamMockRule[] = [
  {
    id: 'default-con3282',
    enabled: true,
    paramNo: 'CON3282',
    mockValue: ['2'],
    remark: '启用新版退费申请',
  },
  {
    id: 'default-con3608',
    enabled: true,
    paramNo: 'CON3608',
    mockValue: ['0'],
    remark: '关闭副屏功能',
  },
]

/** 确保默认规则存在 */
function ensureDefaultRules(storage: ParamMockStorage): ParamMockStorage {
  const deletedDefaultRules = storage.deletedDefaultRules || []
  const existingParamNos = storage.rules.map(r => r.paramNo)

  defaultRules.forEach((rule) => {
    if (!existingParamNos.includes(rule.paramNo) && !deletedDefaultRules.includes(rule.paramNo)) {
      storage.rules.push(rule)
      log(`添加默认规则: ${rule.paramNo}`)
    }
  })

  return storage
}

export function init() {
  const storage = ensureDefaultRules(GM_getValue<ParamMockStorage>(storageKey, {
    enable: false,
    rules: [],
    deletedDefaultRules: [],
  }))

  GM_setValue(storageKey, storage)

  if (!storage.enable) return

  log('参数模拟 - 已加载')

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
                  log(`参数模拟命中: ${rule.paramNo} → [${rule.mockValue.join(', ')}]`)
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
