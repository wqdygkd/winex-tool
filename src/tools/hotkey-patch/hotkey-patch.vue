<script setup lang="ts">
import type { FieldConfig, SqlConfig } from '~/types'
import { useGMStorage } from '~/composables/useGMStorage'
import { generateInsertSql, storageKey } from './hotkey-patch'

const { data: storage, save } = useGMStorage<{ configs: SqlConfig[] }>(storageKey, { configs: [] }, { autoSave: false })

const configs = computed(() => storage.value.configs)
const selectedConfigId = ref<string | null>(null)
const generatedSql = ref('')

const currentConfig = computed(() =>
  configs.value.find(c => c.id === selectedConfigId.value),
)

onMounted(() => {
  if (configs.value.length > 0) {
    selectedConfigId.value = configs.value[0].id
  }
})

function addConfig() {
  const newConfig: SqlConfig = {
    id: Date.now().toString(),
    name: `配置${configs.value.length + 1}`,
    tableName: '',
    fields: [],
  }
  configs.value.push(newConfig)
  selectedConfigId.value = newConfig.id
  save()
}

function deleteConfig(id: string) {
  configs.value = configs.value.filter(c => c.id !== id)
  if (selectedConfigId.value === id) {
    selectedConfigId.value = configs.value[0]?.id || null
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

watch([selectedConfigId, configs], updateSql, { deep: true })
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
      <el-select v-model="selectedConfigId" placeholder="选择配置" style="width: 200px">
        <el-option v-for="config in configs" :key="config.id" :label="config.name" :value="config.id" />
      </el-select>
      <el-button v-if="selectedConfigId" type="danger" size="small" style="margin-left: 10px" @click="deleteConfig(selectedConfigId)">
        删除配置
      </el-button>
    </div>

    <div v-if="currentConfig" class="config-editor">
      <div class="table-name-row">
        <el-input v-model="currentConfig.name" placeholder="配置名称" style="width: 150px" @change="save" />
        <el-input v-model="currentConfig.tableName" placeholder="表名" style="width: 200px; margin-left: 10px" @change="save(); updateSql()" />
      </div>

      <div class="field-actions" style="margin-top: 15px">
        <el-button type="primary" size="small" @click="addField">
          添加字段
        </el-button>
      </div>

      <el-table :data="currentConfig.fields" style="margin-top: 10px" max-height="300px">
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

<style scoped>
.hotkey-patch-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header h3 {
  margin: 0;
}

.config-list {
  margin-bottom: 15px;
}

.table-name-row {
  display: flex;
  align-items: center;
}
</style>
