/**
 * 其他辅助功能工具模块
 */

import type { ToolModule } from '../registry'
import { DevopsDashboardInit } from './devops-dashboard'
import { DevopsLoginInit } from './devops-login'
import { DisableTraceidInit } from './disable-traceid'
import Others from './others.vue'

const name = '其他辅助功能'
const storageKey = 'others'

function init() {
  DevopsDashboardInit()
  DevopsLoginInit()
  DisableTraceidInit()
}

Others.name = name

export const OthersModule: ToolModule = {
  name,
  storageKey,
  init,
  component: Others,
}