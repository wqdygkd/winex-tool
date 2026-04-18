<script setup lang="ts">
import type { FieldConfig, SqlConfig } from '~/types'
import { useGMStorage } from '~/composables/useGMStorage'
import { generateInsertSql, storageKey } from './hotkey-patch'

const { data: storage, save } = useGMStorage<{ configs: SqlConfig[] }>(storageKey, { configs: [] }, { autoSave: false })

const selectedConfigId = ref<string | null>(null)
const generatedSql = ref('')

const currentConfig = computed(() =>
  storage.value.configs.find(c => c.id === selectedConfigId.value),
)

onMounted(() => {
  if (storage.value.configs.length > 0) {
    selectedConfigId.value = storage.value.configs[0].id
  }
})

function addConfig() {
  const newConfig: SqlConfig = {
    id: Date.now().toString(),
    name: `配置${storage.value.configs.length + 1}`,
    tableName: '',
    fields: [],
  }
  storage.value.configs.push(newConfig)
  selectedConfigId.value = newConfig.id
  save()
}

function deleteConfig(id: string) {
  storage.value.configs = storage.value.configs.filter(c => c.id !== id)
  if (selectedConfigId.value === id) {
    selectedConfigId.value = storage.value.configs[0]?.id || null
  }
  save()
}

function addField() {
  if (!currentConfig.value) return
  const newField: FieldConfig = {
    id: Date.now().toString(),
    fieldName: '',
    value: '',
    enabled: true,
  }
  currentConfig.value.fields.push(newField)
  save()
  updateSql()
}

function deleteField(fieldId: string) {
  if (!currentConfig.value) return
  currentConfig.value.fields = currentConfig.value.fields.filter(f => f.id !== fieldId)
  save()
  updateSql()
}

function updateSql() {
  generatedSql.value = currentConfig.value ? generateInsertSql(currentConfig.value) : ''
}

function copySql() {
  if (!generatedSql.value) return
  navigator.clipboard.writeText(generatedSql.value)
}

watch([selectedConfigId, storage], updateSql, { deep: true })
</script>

<template>
  <div class="hotkey-patch-container">
    <div class="header">
      <h3>快捷键补丁 - SQL生成器</h3>
      <el-button type="primary" size="small" @click="addConfig">
        新增配置
      </el-button>
    </div>

    <div class="config-list">
      <el-select v-model="selectedConfigId" placeholder="选择配置" class="config-select">
        <el-option v-for="config in storage.configs" :key="config.id" :label="config.name" :value="config.id" />
      </el-select>
      <el-button v-if="selectedConfigId" type="danger" size="small" @click="deleteConfig(selectedConfigId)">
        删除配置
      </el-button>
    </div>

    <div v-if="currentConfig" class="config-editor">
      <div class="table-name-row">
        <el-input v-model="currentConfig.name" placeholder="配置名称" class="name-input" @change="save" />
        <el-input v-model="currentConfig.tableName" placeholder="表名" class="table-input" @change="save(); updateSql()" />
      </div>

      <div class="field-actions">
        <el-button type="primary" size="small" @click="addField">
          添加字段
        </el-button>
      </div>

      <el-table :data="currentConfig.fields" class="fields-table" max-height="300px">
        <el-table-column prop="enabled" label="启用" width="60">
          <template #default="{ row }">
            <el-checkbox v-model="row.enabled" @change="save(); updateSql()" />
          </template>
        </el-table-column>
        <el-table-column label="字段名" width="150">
          <template #default="{ row }">
            <el-input v-model="row.fieldName" placeholder="字段名" @change="save(); updateSql()" />
          </template>
        </el-table-column>
        <el-table-column label="值">
          <template #default="{ row }">
            <el-input v-model="row.value" placeholder="值 (留空或NULL表示NULL)" @change="save(); updateSql()" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="deleteField(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="sql-preview" style="margin-top: 15px">
        <el-input
          v-model="generatedSql"
          type="textarea"
          :rows="4"
          placeholder="生成的 SQL 语句"
          readonly
        />
        <el-button type="success" size="small" style="margin-top: 10px" :disabled="!generatedSql" @click="copySql">
          复制 SQL
        </el-button>
      </div>
    </div>

    <el-empty v-else description="请先添加配置" />
  </div>
</template>

<style scoped lang="scss">
.hotkey-patch-container {
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #334155;
  }
}

.config-list {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.config-select {
  width: 200px;

  :deep(.wqdy-input__wrapper) {
    border-radius: 8px;
  }
}

.config-editor {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 20px;
}

.table-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.name-input {
  width: 150px;
}

.table-input {
  width: 200px;
}

.field-actions {
  margin-bottom: 12px;
}

.fields-table {
  margin-top: 10px;

  :deep(.wqdy-table) {
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;

    .wqdy-table__header-wrapper th {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      color: #334155;
      font-weight: 600;
    }

    .wqdy-table__row:hover {
      background: #f8fafc;
    }

    .wqdy-input__wrapper {
      border-radius: 6px;
    }
  }
}

.sql-preview {
  margin-top: 20px;

  :deep(.wqdy-textarea__inner) {
    border-radius: 8px;
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    color: #e2e8f0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
  }
}

:deep(.wqdy-empty) {
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
</style>
