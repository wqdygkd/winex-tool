/**
 * 运维平台/运营平台登录页面优化
 * 1. 移除SleepWell登录框
 *
 * 目标网址: /cluster/action/login/login
 */

import { init, storageKey } from './devops-login.ts'
import DevopsLogin from './devops-login.vue'

DevopsLogin.storageKey = storageKey
DevopsLogin.init = init

export default DevopsLogin
