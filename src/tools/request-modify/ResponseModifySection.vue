<script setup lang="ts">
import type { ResponseModify } from '~/types'
import { MODIFY_TYPE_OPTIONS, RESPONSE_OP_TYPE_OPTIONS } from '~/composables/useRequestModify'

const props = defineProps<{
  responseModify?: ResponseModify
}>()

const emit = defineEmits<{
  'update:responseModify': [value: ResponseModify | undefined]
  'addOp': []
  'deleteOp': [index: number]
}>()

const enabled = computed({
  get: () => props.responseModify !== undefined,
  set: (val: boolean) => {
    emit('update:responseModify', val ? createEmptyResponseModify() : undefined)
  },
})

function createEmptyResponseModify(): ResponseModify {
  return {
    modifyType: 'static',
    responseOps: [],
    statusCode: undefined,
    delayMs: undefined,
  }
}

const responseOps = computed(() => props.responseModify?.responseOps ?? [])
</script>

<template>
  <div class="response-modify-section">
    <div class="ops-header">
      <span class="section-label">响应修改</span>
      <el-switch
        v-model="enabled"
        inline-prompt
        active-text="启用"
        inactive-text="禁用"
      />
    </div>

    <!-- eslint-disable vue/no-mutating-props -->
    <template v-if="responseModify">
      <div class="response-basic">
        <div class="form-row">
          <label class="form-label">响应状态码</label>
          <el-input-number
            v-model="responseModify.statusCode"
            :min="100"
            :max="599"
            placeholder="留空保持原状态"
            style="width: 120px"
            controls-position="right"
          />
          <span class="input-hint">留空保持原状态</span>
        </div>

        <div class="form-row">
          <label class="form-label">响应延迟</label>
          <el-input-number
            v-model="responseModify.delayMs"
            :min="0"
            :max="30000"
            placeholder="留空不延迟"
            style="width: 120px"
            controls-position="right"
          />
          <span class="input-hint">ms，留空不延迟</span>
        </div>

        <div class="form-row">
          <label class="form-label">修改类型</label>
          <el-select v-model="responseModify.modifyType" style="width: 120px">
            <el-option
              v-for="item in MODIFY_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <!-- eslint-enable vue/no-mutating-props -->

      <template v-if="responseModify.modifyType === 'static'">
        <div class="ops-header sub-header">
          <span>响应体操作</span>
          <el-button type="primary" size="small" @click="emit('addOp')">
            添加操作
          </el-button>
        </div>

        <el-table v-if="responseOps.length > 0" :data="responseOps" border size="small">
          <el-table-column label="字段路径" width="180">
            <template #default="{ row }">
              <el-input v-model="row.key" placeholder="如 data.status" />
            </template>
          </el-table-column>
          <el-table-column label="操作类型" width="120">
            <template #default="{ row }">
              <el-select v-model="row.opType">
                <el-option
                  v-for="item in RESPONSE_OP_TYPE_OPTIONS"
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
                placeholder="JSON值，如 success 或对象"
                type="textarea"
                :rows="1"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70">
            <template #default="{ $index }">
              <el-button type="danger" size="small" link @click="emit('deleteOp', $index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-else class="empty-ops">
          暂无响应体操作，点击"添加操作"开始配置
        </div>
      </template>

      <template v-if="responseModify.modifyType === 'script'">
        <div class="script-placeholder">
          <el-alert type="info" :closable="false">
            动态脚本功能将在后续版本实现
          </el-alert>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
.response-modify-section {
  background: #faf5ff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  border: 1px solid #e9d5ff;
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

.sub-header {
  margin-top: 16px;
  span {
    font-size: 13px;
    color: #475569;
  }
}

.response-basic {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.form-label {
  width: 100px;
  flex-shrink: 0;
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.input-hint {
  color: #94a3b8;
  font-size: 12px;
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

.script-placeholder {
  padding: 20px;
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
