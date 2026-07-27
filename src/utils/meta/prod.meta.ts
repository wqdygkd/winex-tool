import type { UserScriptMetadata } from './types'

const prodMeta: Partial<UserScriptMetadata> = {
  match: [
    'http://localhost:*/*',
    'http*://127.0.0.1:*/*',
    'http://172.16.7.60:*/*',
    'http://172.16.7.105:*/*',
    'http://172.17.1.126:*/*',
    'http://172.17.1.102:*/*',
    'http://172.16.9.84:*/*',
    'http://172.16.0.197:8089/*',
    'http*://172.16.7.77:*/*',
    'http*://172.16.7.47:*/*',
    'http://wxp.cpp.iwincloud.com:8089/*',
    'http://tfs2018-web.winning.com.cn:8080/*',
  ],
}

export default prodMeta
