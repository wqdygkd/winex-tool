// 新制品管理-产品制品  http://172.16.0.197:8089/login/app/win/products

import { proxy } from 'ajax-hook'

export default function () {
  if (location.origin + location.pathname === 'http://172.16.0.197:8089/login/app/win/products') {
    proxy({
      onRequest: (config, handler) => {

        handler.next(config)
        if (window.hack) return
        window.hack = true
        const replaceComboData = window.$.viewpart.prototype.replaceComboData

        window.$.viewpart.prototype.replaceComboData = function (...args) {
          console.log(args)
          console.log("拦截器：函数即将执行");
          const result = replaceComboData.apply(this, args);
          console.log("拦截器：函数已执行");
          return result;
        };
      },
      onError: (err, handler) => {
        handler.next(err)
      }
    })
  }
}
