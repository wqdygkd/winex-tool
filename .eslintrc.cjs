module.exports = {
  root: true,
  extends: ['@wqdy/eslint-config'],
  rules: {
    'arrow-parens': [2, 'as-needed'],
    'unicorn/prevent-abbreviations': 0
    // 'no-unreachable': 1,
    // 'no-unused-vars': 1,
    // 'no-debugger': 1
  },
  globals: {
    unsafeWindow: 'writable',
    GM_getValue: 'readonly',
    GM_setValue: 'readonly',
    GM_cookie: 'readonly',
    GM_addElement: 'readonly',
    GM_registerMenuCommand: 'readonly',
    cookieStore: 'readonly',
    $: 'readonly'
  }
}
