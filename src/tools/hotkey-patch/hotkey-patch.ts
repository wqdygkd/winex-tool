import type { FieldConfig, SqlConfig } from '~/types'

export const storageKey = `${__namespace}hotkey-patch`

/** 生成 INSERT SQL */
function generateInsertSql(config: SqlConfig): string {
  const enabledFields = config.fields.filter(f => f.enabled && f.fieldName)
  if (!config.tableName || enabledFields.length === 0) {
    return ''
  }

  const columns = enabledFields.map(f => f.fieldName).join(', ')
  const values = enabledFields.map((f) => {
    if (f.value === '' || f.value === 'NULL' || f.value === 'null') {
      return 'NULL'
    }
    if (/^\d+$/.test(f.value) || /^[\d.]+$/.test(f.value)) {
      return f.value
    }
    return `'${f.value.replace(/'/g, '\'\'')}'`
  }).join(', ')

  return `INSERT INTO ${config.tableName} (${columns}) VALUES (${values});`
}

/** 生成批量 INSERT SQL */
function generateBatchInsertSql(config: SqlConfig): string {
  const enabledFields = config.fields.filter(f => f.enabled && f.fieldName)
  if (!config.tableName || enabledFields.length === 0) {
    return ''
  }

  const columns = enabledFields.map(f => f.fieldName).join(', ')
  const values = enabledFields.map((f) => {
    if (f.value === '' || f.value === 'NULL' || f.value === 'null') {
      return 'NULL'
    }
    if (/^\d+$/.test(f.value) || /^[\d.]+$/.test(f.value)) {
      return f.value
    }
    return `'${f.value.replace(/'/g, '\'\'')}'`
  }).join(', ')

  return `INSERT INTO ${config.tableName} (${columns}) VALUES\n(${values});`
}

interface HotkeyPatchStorage {
  configs: SqlConfig[]
}

export { generateBatchInsertSql, generateInsertSql }

export type { FieldConfig, SqlConfig, HotkeyPatchStorage as StorageData }
