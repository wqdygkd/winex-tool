import { DevopsDashboardInit } from './devops-dashboard'
import { DevopsLoginInit } from './devops-login'
import { DisableTraceidInit } from './disable-traceid'

import Others from './others.vue'

Others.name = '其他辅助功能'

export function OthersInit() {
  DevopsDashboardInit()
  DevopsLoginInit()
  DisableTraceidInit()
}

export default Others
