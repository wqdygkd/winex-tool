/**
 * URL 和路径常量配置
 */

export const urls = {
  devopsLogin: '/cluster/action/login/login',
  devopsLoginAlternatives: [
    'http://172.16.0.197:8089/login/',
    'http://172.16.7.47:8089/login/',
    'http://wxp.cpp.iwincloud.com:8089/login',
  ],
  devopsDashboard: '/cluster/cluster/portal',
  tfs: 'http://tfs2018-web.winning.com.cn:8080/',
}

export const apiPaths = {
  paramQuery: [
    'cooperation-basic/api/v1/cooperation_basic/param/query/by_param_ids',
    'finance-mdm/api/v1/app_finance_mdm/parameter_setting/query/by_nos',
  ],
}

export function matchUrl(url: string, patterns: string | string[]): boolean {
  if (typeof patterns === 'string') return url.includes(patterns)
  return patterns.some(p => url.includes(p))
}

export function isCurrentPage(patterns: string | string[]): boolean {
  return matchUrl(location.href, patterns)
}
