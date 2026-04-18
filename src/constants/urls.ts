/**
 * URL 和路径常量配置
 */

/** 页面 URL */
export const urls = {
  /** 运维平台登录页 */
  devopsLogin: '/cluster/action/login/login',
  /** 运营中心登录页列表 */
  devopsLoginAlternatives: [
    'http://172.16.0.197:8089/login/',
    'http://wxp.cpp.iwincloud.com:8089/login',
  ],
  /** 运维平台首页 */
  devopsDashboard: '/cluster/cluster/portal',
}

/** API 路径 */
export const apiPaths = {
  /** 参数查询接口 */
  paramQuery: [
    'cooperation-basic/api/v1/cooperation_basic/param/query/by_param_ids',
    'finance-mdm/api/v1/app_finance_mdm/parameter_setting/query/by_nos',
  ],
}

/** 检查 URL 是否匹配 */
export function matchUrl(url: string, patterns: string | string[]): boolean {
  if (typeof patterns === 'string') {
    return url.includes(patterns)
  }
  return patterns.some(p => url.includes(p))
}

/** 检查当前页面是否匹配 */
export function isCurrentPage(patterns: string | string[]): boolean {
  return matchUrl(location.href, patterns)
}
