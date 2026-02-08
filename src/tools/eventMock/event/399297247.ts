import EventMock from '../handle'

export default function init() {
  EventMock.register('399297247', (params) => {
    return `{"success":true,"data":[{"id":1,"name":"${params.name}"}]}`
  })
}
