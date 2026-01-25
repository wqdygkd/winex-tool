/**
 * 运维平台首页
 * 1. 解锁权限
 *
 * 目标网址: /cluster/cluster/portal/dashboard
 */

import { init } from './devops-dashboard.ts'
import DevopsDashboard from './devops-dashboard.vue'

DevopsDashboard.init = init

export default DevopsDashboard
