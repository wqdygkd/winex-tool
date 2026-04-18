import EventMock from './handle'

export const storageKey = `${__namespace}event-mock`

export function init() {
  EventMock.register('399563027', () => {
    return `{"success":true,"data":["Microsoft Print to PDF"]}`
  })

  const storage = GM_getValue(storageKey, { enable: false })
  if (!storage.enable) return

  unsafeWindow.winning = {
    ...unsafeWindow.winning,
    dispatchEvent(eventId: string, params: string, cb: (result: string) => void) {
      return EventMock.execute(eventId, params, cb)
    },
    getMacadress() { return '00:00:00:00:00:00' },
    getPcName() { return '-' },
    getIP() { return '0.0.0.0' },
    deltaResult() { return true },
    showMsg() {},
    postMessage() {},
  }
}
