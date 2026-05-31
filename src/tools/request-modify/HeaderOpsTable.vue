<script setup lang="ts">
import type { HeaderOperation } from '~/types'
import { HEADER_OP_TYPE_OPTIONS } from '~/composables/useRequestModify'

defineProps<{
  headerOps: HeaderOperation[]
}>()

const emit = defineEmits<{
  add: []
  delete: [index: number]
}>()
</script>

<template>
  <div class="header-ops-table">
    <div class="ops-header">
      <span class="section-label">请求头操作</span>
      <el-button type="primary" size="small" @click="emit('add')">
        添加Header
      </el-button>
    </div>

    <el-table v-if="headerOps.length > 0" :data="headerOps" border size="small">
      <el-table-column label="Header名称" width="180">
        <template #default="{ row }">
          <el-input v-model="row.key" placeholder="Header名" />
        </template>
      </el-table-column>
      <el-table-column label="操作类型" width="120">
        <template #default="{ row }">
          <el-select v-model="row.opType">
            <el-option
              v-for="item in HEADER_OP_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="值">
        <template #default="{ row }">
          <el-input
            v-model="row.value"
            placeholder="Header值"
            :disabled="row.opType === 'delete'"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="70">
        <template #default="{ $index }">
          <el-button type="danger" size="small" link @click="emit('delete', $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-else class="empty-ops">
      暂无Header操作，点击"添加Header"开始配置
    </div>
  </div>
</template>

<style scoped lang="scss">
.header-ops-table {
  margin-top: 20px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.ops-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.empty-ops {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 13px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #e2e8f0;
}

:deep(.wqdy-table) {
  border-radius: 8px;
  overflow: hidden;

  .wqdy-table__header-wrapper th {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    color: #334155;
    font-weight: 600;
  }

  .wqdy-table__row:hover {
    background: #f8fafc;
  }

  .wqdy-input__wrapper,
  .wqdy-select__wrapper {
    border-radius: 6px;
  }
}
</style>
