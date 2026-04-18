/**
 * 其他辅助功能工具模块
 */

import { registerTool } from '../registry'
import { DevopsDashboardInit } from './devops-dashboard'
import { DevopsLoginInit } from './devops-login'
import { DisableTraceidInit } from './disable-traceid'
import Others from './others.vue'

const name = '其他辅助功能'

function init() {
  DevopsDashboardInit()
  DevopsLoginInit()
  DisableTraceidInit()
}

registerTool({
  name,
  storageKey: 'others',
  init,
  component: Others,
})

Others.name = name

export { init as OthersInit }
export default Others
