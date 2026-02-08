import EventMock from './handle'

export const storageKey = `${__namespace}event-mock`
// export const url = 'http://172.16.7.77:8089/cluster/action/login/login'
export const url = '/cluster/action/login/login'
export const urls = [
  '/cluster/action/login/login', // 运维平台
  'http://172.16.0.197:8089/login/', // 运营中心
  'http://wxp.cpp.iwincloud.com:8089/login', // 运营中心
]
export function init() {
  EventMock.register('399563027', (params) => {
    return `{"success":true,"data":["Microsoft Print to PDF"]}`
  })
  const storage = GM_getValue(storageKey, {
    enable: false,
  })
  if (!storage.enable) return
  unsafeWindow.winning = {
    ...unsafeWindow.winning,
    dispatchEvent(eventId: string, params: string, cb: (result: string) => void) {
      return EventMock.execute(eventId, params, cb)
      // if (unsafeWindow.enablePrinter && eventId === '399563027') {
      //   return cb(`{"success":true,"data":["Microsoft Print to PDF"]}`)
      // }
      // if (eventId === '399696844') {
      //   return cb(`{"success":true}`)
      // }
      // if (eventId === '399696845') {
      //   return cb(`{"success":true}`)
      // }
      // const paramsObj = typeof params === 'string' ? JSON.parse(params) : params
      // console.warn('dispatchEvent', `事件id${eventId}`, '入参:', paramsObj?.body)
      // const identityTypeCode = paramsObj.body?.identityTypeCode?.[0]
      // if (!identityTypeCode) cb('"{}"')
      // const storageKey = `${__namespace}${identityTypeCode}`
      // const data: any = GM_getValue(storageKey, {
      //   enable: false,
      // })
      // if (data.enable) {
      //   console.warn('dispatchEvent', `事件id${eventId}`, '出参:', data.current?.json)
      //   cb(JSON.stringify(data.current?.json || '请设置读卡出参'))
      // }
      // else {
      //   cb('"读卡模拟未启用"')
      // }
    },
    getMacadress() { return '00:00:00:00:00:00' },
    getPcName() { return '-' },
    getIP() { return '0.0.0.0' },
    deltaResult() { return true },
    showMsg() {},
    postMessage() {},
  }
}
