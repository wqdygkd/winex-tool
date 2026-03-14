<script setup lang="ts">
import type { ParamMockRule, StorageData } from './param-mock'
import { storageKey } from './param-mock'

const enableMock = ref(false)
const rules = ref<ParamMockRule[]>([])
const saving = ref(false)
const selectedRules = ref<string[]>([])

function loadData() {
  try {
    const storage = GM_getValue<StorageData>(storageKey, {
      enable: false,
      rules: [],
    })
    enableMock.value = storage.enable
    rules.value = storage.rules
  } catch (error) {
    console.error('Failed to load param mock data:', error)
  }
}

function saveData() {
  saving.value = true
  try {
    const data: StorageData = {
      enable: enableMock.value,
      rules: rules.value,
    }
    GM_setValue(storageKey, data)
  } catch (error) {
    console.error('Failed to save param mock data:', error)
  } finally {
    saving.value = false
  }
}

// 批量操作函数
function batchEnable() {
  rules.value.forEach((rule) => {
    if (selectedRules.value.includes(rule.id)) {
      rule.enabled = true
    }
  })
  saveData()
}

function batchDisable() {
  rules.value.forEach((rule) => {
    if (selectedRules.value.includes(rule.id)) {
      rule.enabled = false
    }
  })
  saveData()
}

function batchDelete() {
  rules.value = rules.value.filter(rule => !selectedRules.value.includes(rule.id))
  selectedRules.value = []
  saveData()
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
  saveData()
}

function deleteRule(id: string) {
  rules.value = rules.value.filter(rule => rule.id !== id)
  saveData()
}

onMounted(() => {
  loadData()
})

// 监听 enableMock 变化，自动保存
watch(enableMock, () => {
  saveData()
})
</script>

<template>
  <div class="param-mock-container">
    <div class="header">
      <h3>参数模拟</h3>
      <el-switch v-model="enableMock" active-text="启用" inactive-text="禁用" />
    </div>

    <div>
      <el-button type="primary" :loading="saving" @click="addRule">
        添加规则
      </el-button>
      <el-button
        type="info"
        :disabled="selectedRules.length === 0"
        style="margin-left: 10px"
        @click="batchEnable"
      >
        批量启用
      </el-button>
      <el-button
        type="warning"
        :disabled="selectedRules.length === 0"
        style="margin-left: 10px"
        @click="batchDisable"
      >
        批量停用
      </el-button>
      <el-button
        type="danger"
        :disabled="selectedRules.length === 0"
        style="margin-left: 10px"
        @click="batchDelete"
      >
        批量删除
      </el-button>

      <el-table
        :data="rules"
        style="margin-top: 20px"
        max-height="500px"
        @selection-change="selectedRules = $event.map((item: { id: any }) => item.id)"
      >
        <el-table-column type="selection" width="35" />

        <el-table-column label="参数名称" width="150">
          <template #default="{ row }">
            <el-input v-model="row.paramNo" placeholder="输入参数名称" @change="saveData" />
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
              @change="saveData"
            >
              <el-option v-for="option in row.mockValue" :key="option" :label="option" :value="option" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template #default="{ row }">
            <el-input v-model="row.remark" placeholder="输入备注" @change="saveData" />
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="saveData" />
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
  </div>
</template>

<style scoped>
.param-mock-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h3 {
  margin: 0;
}
</style>
