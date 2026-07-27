/**
 * 其他辅助功能工具模块
 * 支持子功能独立控制
 */

import type { ToolModule } from '../registry'
import { DevopsDashboardInit } from './devops-dashboard'
import { DevopsLoginInit } from './devops-login'
import { DisableTraceidInit } from './disable-traceid'
import { ShowIdentityLabelInit } from './show-identity-label'
import Others from './others.vue'

const name = '其他辅助功能'
const storageKey = 'others'

function init() {
  if (__FEATURE_DEVOPS_DASHBOARD__) {
    DevopsDashboardInit()
  }
  if (__FEATURE_DEVOPS_LOGIN__) {
    DevopsLoginInit()
  }
  if (__FEATURE_DISABLE_TRACEID__) {
    DisableTraceidInit()
  }
  if (__FEATURE_SHOW_IDENTITY_LABEL__) {
    ShowIdentityLabelInit()
  }
}

Others.name = name

export const OthersModule: ToolModule = {
  name,
  storageKey,
  init,
  component: Others,
  icon: '🎨',
}
