// 产品构建(新)  http://172.16.0.197:8089/cloud/pango-dist/index.html

import { proxy } from 'ajax-hook'

export default function () {
  if (location.origin + location.pathname === 'http://172.16.0.197:8089/cloud/pango-dist/index.html') {
    proxy({
      onRequest: (config, handler) => {
        handler.next(config)
      },
      //请求发生错误时进入，比如超时；注意，不包括http状态码错误，如404仍然会认为请求成功
      onError: (err, handler) => {
        handler.next(err)
      },
      onResponse: (response, handler) => {
        let responseObj = JSON.parse(response.response)
        let data = responseObj.data
        if (response.config.url === '/api/v1/pub/product/queryProductWiNEXList') {
          data = data.toSorted((a: { code: string }, b: { code: string }) => {
            if (a.code === 'his') return -1
            if (b.code === 'his') return 1
          })
        }
        if (response.config.url === '/api/v1/pub/product/queryProductVersionListById') {
          data = data.toSorted((a: { pv_branch_show: string }, b: { pv_branch_show: string }) => {
            if (a.pv_branch_show === 'dev_all_his_pbc') return -1
            if (b.pv_branch_show === 'dev_all_his_pbc') return 1
            if (a.pv_branch_show === 'rc_all_his_pbc') return -1
            if (b.pv_branch_show === 'rc_all_his_pbc') return 1
          })
        }
        if (response.config.url === '/api/v1/ops/productbuild/queryProductAppListByVersionId') {
          data = data.toSorted((a: { type: string }, b: { type: string }) => {
            if (a.type === 'winning-web-his-outp-allinone') return -1
            if (b.type === 'winning-web-his-outp-allinone') return 1
            if (a.type === 'winning-web-his-basic-allinone') return -1
            if (b.type === 'winning-web-his-basic-allinone') return 1
            if (a.type === 'winning-web-his-inp-allinone') return -1
            if (b.type === 'winning-web-his-inp-allinone') return 1
            if (a.type === 'winning-web-his-config-allinone') return -1
            if (b.type === 'winning-web-his-config-allinone') return 1
          })
        }
        responseObj.data = data
        response.response = JSON.stringify(responseObj)
        handler.next(response)
      }
    })
  }
}
