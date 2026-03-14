import { proxy } from 'ajax-hook'

export const storageKey = `${__namespace}param-mock`

export interface ParamMockRule {
  id: string
  enabled: boolean
  paramNo: string
  mockValue: string[]
  remark: string
}

export interface StorageData {
  enable: boolean
  rules: ParamMockRule[]
}

export function init() {
  const storage = GM_getValue<StorageData>(storageKey, {
    enable: false,
    rules: [],
  })
  if (storage.enable) {
    proxy({
      onResponse: (response, handler) => {
        try {
          // 检查 URL 是否匹配特定路径
          const url = response.config.url
          const targetPaths = [
            'cooperation-basic/api/v1/cooperation_basic/param/query/by_param_ids',
            'finance-mdm/api/v1/app_finance_mdm/parameter_setting/query/by_nos',
          ]

          const isTargetUrl = targetPaths.some(path => url.includes(path))

          if (isTargetUrl) {
            // 每次都重新获取最新的规则
            const latestStorage = GM_getValue<StorageData>(storageKey, {
              enable: false,
              rules: [],
            })

            // 解析响应内容
            const responseObj = JSON.parse(response.response)

            // 检查是否符合响应格式
            if (responseObj && Array.isArray(responseObj.data)) {
              // 遍历规则，过滤掉参数名称或模拟值为空的项
              latestStorage.rules
                .filter(rule => rule.enabled && rule.paramNo && rule.mockValue && rule.mockValue.length > 0)
                .forEach((rule) => {
                  // 查找并修改匹配的参数
                  responseObj.data.forEach((item: any) => {
                    if (item.paramNo === rule.paramNo) {
                      item.paramConfigs = rule.mockValue.map(value => ({
                        value,
                        endValue: null,
                      }))
                    }
                  })
                })

              // 重新序列化响应
              response.response = JSON.stringify(responseObj)
            }
          }
        } catch (error) {
          console.error('Error processing param mock:', error)
        }

        handler.next(response)
      },
    }, unsafeWindow)
  }
}
