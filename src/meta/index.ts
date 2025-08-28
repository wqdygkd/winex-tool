import commonMeta from './common.meta'

export default function getMetaString(meta: object): string {
  return `// ==UserScript==\n${Object.entries(Object.assign(commonMeta, meta))
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((item) => `// @${key.padEnd(20, ' ')}${item}`).join('\n')
      }
      return `// @${key.padEnd(20, ' ')}${value}`
    })
    .join('\n')}
// ==/UserScript==
`
}
