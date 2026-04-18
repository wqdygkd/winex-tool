<script setup lang="ts">
import type { ParamMockRule, ParamMockStorage } from '~/types'
import { useGMStorage } from '~/composables/useGMStorage'
import { storageKey } from './param-mock'

const { data: storage, save } = useGMStorage<ParamMockStorage>(storageKey, {
  enable: false,
  rules: [],
}, { autoSave: false })

const enableMock = computed(() => storage.value.enable)
const rules = computed(() => storage.value.rules)
const saving = ref(false)
const selectedRules = ref<string[]>([])

function batchEnable() {
  rules.value.forEach((rule) => {
    if (selectedRules.value.includes(rule.id)) {
      rule.enabled = true
    }
  })
  save()
}

function batchDisable() {
  rules.value.forEach((rule) => {
    if (selectedRules.value.includes(rule.id)) {
      rule.enabled = false
    }
  })
  save()
}

function batchDelete() {
  storage.value.rules = rules.value.filter(rule => !selectedRules.value.includes(rule.id))
  selectedRules.value = []
  save()
}

function addRule() {
  const newRule: ParamMockRule = {
    id: Date.now().toString(),
    enabled: true,
    paramNo: '',
    mockValue: [],
    remark: '',
  }
  rules.value.push(newRule)
  save()
}

function deleteRule(id: string) {
  storage.value.rules = rules.value.filter(rule => rule.id !== id)
  save()
}

watch(enableMock, () => {
  save()
})
</script>

<template>
  <div class="param-mock-container">
    <div class="header">
      <h3>参数模拟</h3>
      <el-switch v-model="enableMock" active-text="启用" inactive-text="禁用" />
    </div>

    <div class="action-buttons">
      <el-button type="primary" :loading="saving" @click="addRule">
        添加规则
      </el-button>
      <el-button
        type="info"
        :disabled="selectedRules.length === 0"
        @click="batchEnable"
      >
        批量启用
      </el-button>
      <el-button
        type="warning"
        :disabled="selectedRules.length === 0"
        @click="batchDisable"
      >
        批量停用
      </el-button>
      <el-button
        type="danger"
        :disabled="selectedRules.length === 0"
        @click="batchDelete"
      >
        批量删除
      </el-button>
    </div>

    <el-table
      :data="rules"
      style="margin-top: 20px"
      max-height="500px"
      @selection-change="selectedRules = $event.map((item: { id: any }) => item.id)"
    >
      <el-table-column type="selection" width="35" />

      <el-table-column label="参数名称" width="150">
        <template #default="{ row }">
          <el-input v-model="row.paramNo" placeholder="输入参数名称" @change="save" />
        </template>
      </el-table-column>
      <el-table-column label="模拟值" width="300">
        <template #default="{ row }">
          <el-select
            v-model="row.mockValue"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="直接输入值并按回车创建"
            style="width: 100%"
            clearable
            no-data-text="直接输入值并按回车创建"
            @change="save"
          >
            <el-option v-for="option in row.mockValue" :key="option" :label="option" :value="option" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="备注">
        <template #default="{ row }">
          <el-input v-model="row.remark" placeholder="输入备注" @change="save" />
        </template>
      </el-table-column>
      <el-table-column prop="enabled" label="启用" width="80">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" @change="save" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="deleteRule(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
.param-mock-container {
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #334155;
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

:deep(.wqdy-table) {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;

  .wqdy-table__header-wrapper {
    th {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      color: #334155;
      font-weight: 600;
    }
  }

  .wqdy-table__row {
    transition: all 0.2s ease;

    &:hover {
      background: #f8fafc;
    }
  }

  .wqdy-input__wrapper,
  .wqdy-select__wrapper {
    border-radius: 6px;
  }
}
</style>
