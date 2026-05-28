import type { UserScriptMetadata } from './types'

const devMeta: Partial<UserScriptMetadata> = {
  name: 'Winex助手 (开发版)',
  match: [
    'http://*/*',
    'https://*/*',
  ],
  grant: [
    'GM_addElement',
    'GM_notification',
  ],
}

export default devMeta